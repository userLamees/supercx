"""Endpoints added for the v2 design: FAQ, unanswered questions, phone verification."""
from app.agent import TIER_AFFILIATE, TIER_AMBASSADOR
from app.redact import redact

AUTH = {"X-Support-Token": "test-token"}


def test_tiers_carry_last_checked_date(client):
    assert all(t["checked_at"] for t in client.get("/api/memberships").json())


# Support cases: optional contact and short reference
def test_anonymous_case_allowed_and_has_reference(client):
    r = client.post("/api/support-cases", json={
        "question": "سؤال", "language": "ar", "anonymous": True, "summary": "راسلني test@example.com أو 0500000099"})
    assert r.status_code == 201 and r.json()["reference"].startswith("CX-")
    case = client.get("/api/support-cases", headers=AUTH).json()[0]
    assert case["contact"] == "" and "test@example.com" not in case["summary"] and "0500000099" not in case["summary"]


def test_redact_removes_email_and_phone():
    assert redact("بريدي x.y@example.com وجوالي +966 50 000 0099") == "بريدي [email] وجوالي [phone]"


# FAQ
def test_faq_has_six_demo_sections_with_sources(client):
    cats = client.get("/api/faq").json()
    assert [c["id"] for c in cats] == ["about", "memberships", "joining", "events", "volunteering", "support"]
    items = [i for c in cats for i in c["items"]]
    assert items and all(i["demo"] and i["source"]["title"] and i["checked_at"] for i in items)


# Unanswered questions -> FAQ
def test_escalations_are_grouped_and_need_support_token(client):
    for msg in ("هل فيه خصم للطلاب؟", "هل فيه خصم للطلاب", "Is there a refund?"):
        client.post("/api/chat", json={"message": msg})
    assert client.get("/api/unanswered").status_code == 401
    rows = client.get("/api/unanswered", headers=AUTH).json()
    assert [r["count"] for r in rows] == [2, 1]
    stats = client.get("/api/unanswered/stats", headers=AUTH).json()
    assert stats["pending"] == 2 and stats["approved_answers"] == 0


def test_promote_adds_question_to_faq(client):
    client.post("/api/chat", json={"message": "هل فيه خصم للطلاب؟"})
    qid = client.get("/api/unanswered", headers=AUTH).json()[0]["id"]
    body = {"category_id": "memberships", "question": "هل يوجد خصم للطلاب؟",
            "answer": "إجابة معتمدة من الفريق.", "source_title": "صفحة العضويات",
            "source_url": "https://cxa.sa/membership"}
    assert client.post(f"/api/unanswered/{qid}/promote", json=body).status_code == 401
    assert client.post(f"/api/unanswered/{qid}/promote", json=body, headers=AUTH).status_code == 201
    faq = {c["id"]: c for c in client.get("/api/faq").json()}
    added = faq["memberships"]["items"][-1]
    assert added["question"]["ar"] == "هل يوجد خصم للطلاب؟" and added["demo"] is False
    assert client.get("/api/unanswered", headers=AUTH).json() == []
    assert client.get("/api/unanswered/stats", headers=AUTH).json()["approved_answers"] == 1


def test_promote_rejects_unknown_category_and_question(client):
    client.post("/api/chat", json={"message": "refund?"})
    qid = client.get("/api/unanswered", headers=AUTH).json()[0]["id"]
    body = {"category_id": "nope", "question": "q?q", "answer": "aaa", "source_title": "src"}
    assert client.post(f"/api/unanswered/{qid}/promote", json=body, headers=AUTH).status_code == 422
    body["category_id"] = "support"
    assert client.post("/api/unanswered/missing/promote", json=body, headers=AUTH).status_code == 404


# Phone verification (simulated)
def test_verify_send_validates_saudi_mobile(client):
    assert client.post("/api/verify/send", json={"phone": "0500000001"}).json()["demo"] is True
    assert client.post("/api/verify/send", json={"phone": "123456789"}).status_code == 422


def test_verify_check_returns_membership_by_tier_id(client):
    r = client.post("/api/verify/check", json={"phone": "+966500000001", "code": "1234"}).json()
    assert r["registered"] and r["tier_id"] == TIER_AMBASSADOR and r["can_renew"] is False
    r = client.post("/api/verify/check", json={"phone": "0500000002", "code": "٩٨٧٦"}).json()
    assert r["tier_id"] == TIER_AFFILIATE and r["days_remaining"] <= 30 and r["can_renew"] is True


def test_verify_check_unknown_number_and_bad_code(client):
    assert client.post("/api/verify/check", json={"phone": "0599999999", "code": "0000"}).json() == {
        "registered": False, "demo": True, "tier_id": None, "tier_name": None, "active": None,
        "expires_at": None, "days_remaining": None, "period_days": None, "can_renew": None, "source": None}
    assert client.post("/api/verify/check", json={"phone": "0500000001", "code": "12"}).status_code == 422


# ---- Workshop requirements: server-side token on every staff endpoint ----
import pytest  # noqa: E402

STAFF_ENDPOINTS = [
    ("get", "/api/support-cases", None),
    ("patch", "/api/support-cases/any-id", {"status": "closed"}),
    ("get", "/api/unanswered", None),
    ("get", "/api/unanswered/stats", None),
    ("post", "/api/unanswered/any-id/promote",
     {"category_id": "support", "question": "q?q", "answer": "aaa", "source_title": "src"}),
]


@pytest.mark.parametrize("method,path,body", STAFF_ENDPOINTS)
@pytest.mark.parametrize("headers", [{}, {"X-Support-Token": "wrong"}, {"X-Support-Token": ""}],
                         ids=["missing", "wrong", "empty"])
def test_staff_endpoints_reject_without_valid_token(client, method, path, body, headers):
    r = getattr(client, method)(path, headers=headers, **({"json": body} if body else {}))
    assert r.status_code == 401


def test_unset_server_token_rejects_everyone(client, monkeypatch):
    import main
    monkeypatch.setattr(main, "SUPPORT_TOKEN", "")
    assert client.get("/api/unanswered", headers={"X-Support-Token": ""}).status_code == 401


# ---- FAQ and unanswered questions live in the database ----
def test_faq_is_read_from_database_not_json(client, monkeypatch):
    from sqlmodel import Session, select
    from app import faq
    from app.db import FaqItem, engine
    monkeypatch.setattr(faq, "SEED_FILE", faq.SEED_FILE.with_name("missing.json"))  # JSON gone
    with Session(engine) as s:
        item = s.exec(select(FaqItem).where(FaqItem.category_id == "about")).first()
        item.answer_ar = "نص معدّل في قاعدة البيانات"
        s.add(item); s.commit()
    about = next(c for c in client.get("/api/faq").json() if c["id"] == "about")
    assert about["items"][0]["answer"]["ar"] == "نص معدّل في قاعدة البيانات"


def test_unanswered_questions_are_stored_in_database(client):
    from sqlmodel import Session, select
    from app.db import UnansweredQuestion, engine
    client.post("/api/chat", json={"message": "هل فيه استرداد للرسوم؟"})
    with Session(engine) as s:
        assert [r.count for r in s.exec(select(UnansweredQuestion))] == [1]


# ---- Phone numbers are not stored ----
def test_phone_numbers_are_not_stored(client):
    from sqlmodel import Session, select
    from app.db import SupportCase, UnansweredQuestion, engine
    client.post("/api/verify/send", json={"phone": "0500000001"})
    client.post("/api/verify/check", json={"phone": "0500000001", "code": "1234"})
    client.post("/api/chat", json={"message": "هل فيه خصم؟ جوالي 0500000099"})
    client.post("/api/support-cases", json={"question": "خصم؟ جوالي 0500000099", "language": "ar", "anonymous": True})
    with Session(engine) as s:
        stored = [r.question for r in s.exec(select(UnansweredQuestion))] + \
                 [c.question for c in s.exec(select(SupportCase))]
    assert stored and not any("0500000099" in q or "500000001" in q for q in stored)


# ---- Error paths ----
@pytest.mark.parametrize("message", ["", "   "])
def test_empty_chat_message_is_rejected(client, message):
    assert client.post("/api/chat", json={"message": message}).status_code == 422


def test_case_status_save_failures(client):
    case_id = client.post("/api/support-cases", json={
        "question": "q", "language": "en", "contact": "test@example.com"}).json()["id"]
    assert client.patch(f"/api/support-cases/{case_id}", json={"status": "done"}, headers=AUTH).status_code == 422
    assert client.patch("/api/support-cases/missing", json={"status": "closed"}, headers=AUTH).status_code == 404
    assert client.get("/api/support-cases", headers=AUTH).json()[0]["status"] == "new"  # unchanged


def test_promote_rejects_empty_answer(client):
    client.post("/api/chat", json={"message": "refund?"})
    qid = client.get("/api/unanswered", headers=AUTH).json()[0]["id"]
    body = {"category_id": "support", "question": "q?q", "answer": "", "source_title": "src"}
    assert client.post(f"/api/unanswered/{qid}/promote", json=body, headers=AUTH).status_code == 422


# ---- Approved FAQ survives a restart ----
def test_promoted_faq_survives_restart(client):
    from fastapi.testclient import TestClient
    from main import app
    client.post("/api/chat", json={"message": "هل فيه استرداد؟"})
    qid = client.get("/api/unanswered", headers=AUTH).json()[0]["id"]
    client.post(f"/api/unanswered/{qid}/promote", headers=AUTH, json={
        "category_id": "support", "question": "هل يوجد استرداد للرسوم؟", "answer": "إجابة اختبار.",
        "source_title": "مرجع اختبار"})
    with TestClient(app) as restarted:  # startup runs again; the seed must not wipe or duplicate rows
        faq = {c["id"]: c for c in restarted.get("/api/faq").json()}
        questions = [i["question"]["ar"] for i in faq["support"]["items"]]
        assert questions.count("هل يوجد استرداد للرسوم؟") == 1
        assert sum(len(c["items"]) for c in faq.values()) == 7


# ---- Replit setup ----
def test_postgres_url_scheme_is_converted(monkeypatch):
    import importlib
    from app import config
    monkeypatch.setenv("DATABASE_URL", "postgres://user:pass@host:5432/db")
    try:
        assert importlib.reload(config).DATABASE_URL == "postgresql+psycopg2://user:pass@host:5432/db"
    finally:
        monkeypatch.setenv("DATABASE_URL", "sqlite:///./test_supercx.db")
        importlib.reload(config)


def test_no_support_token_default_in_code():
    from pathlib import Path
    src = (Path(__file__).resolve().parent.parent / "app" / "config.py").read_text()
    assert 'os.getenv("SUPPORT_TOKEN", "")' in src


# ---- Contact format (email or Saudi mobile) ----
@pytest.mark.parametrize("contact", ["test@example.com", "0500000099", "+966 50 000 0099", "٠٥٠٠٠٠٠٠٩٩", "500000099"])
def test_case_accepts_valid_contact(client, contact):
    r = client.post("/api/support-cases", json={"question": "q", "language": "ar", "contact": contact})
    assert r.status_code == 201


@pytest.mark.parametrize("contact", ["abc", "test@", "0400000099", "05000000", "123456789012"])
def test_case_rejects_invalid_contact(client, contact):
    r = client.post("/api/support-cases", json={"question": "q", "language": "ar", "contact": contact})
    assert r.status_code == 422


# ---- Language consistency ----
def test_faq_text_is_in_the_right_language(client):
    import re
    arabic = re.compile(r"[؀-ۿ]")
    for cat in client.get("/api/faq").json():
        assert arabic.search(cat["title"]["ar"]) and not arabic.search(cat["title"]["en"])
        for item in cat["items"]:
            assert item["langs"] == ["ar", "en"]
            for field in (item["question"], item["answer"], item["source"]["title"]):
                assert arabic.search(field["ar"]) and not arabic.search(field["en"])


def test_staff_answer_is_marked_with_its_language(client):
    client.post("/api/chat", json={"message": "هل فيه استرداد؟"})
    qid = client.get("/api/unanswered", headers=AUTH).json()[0]["id"]
    client.post(f"/api/unanswered/{qid}/promote", headers=AUTH, json={
        "category_id": "support", "question": "هل يوجد استرداد؟", "answer": "إجابة اختبار.",
        "source_title": "مرجع"})
    added = next(c for c in client.get("/api/faq").json() if c["id"] == "support")["items"][-1]
    assert added["langs"] == ["ar"]

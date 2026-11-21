"""Assistant-track features: CSV export, request types, alerts, FAQ editor, action log, real OTP."""
from datetime import datetime, timedelta, timezone
from urllib.parse import quote

import pytest
from sqlmodel import Session, select

from app.agent import TIER_AMBASSADOR

AUTH = {"X-Support-Token": "test-token"}
STAFF = {**AUTH, "X-Staff-Name": quote("نورة")}


def case(client, **extra):
    body = {"question": "سؤال", "language": "ar", "contact": "test@example.com", **extra}
    r = client.post("/api/support-cases", json=body)
    assert r.status_code == 201, r.text
    return r.json()


# ---- Every new staff endpoint needs the token ----
NEW_STAFF_ENDPOINTS = [
    ("get", "/api/unanswered/export.csv", None),
    ("get", "/api/support-cases/export.csv", None),
    ("get", "/api/staff/faq-items", None),
    ("post", "/api/staff/faq-items", {"category_id": "about", "question_ar": "س؟", "answer_ar": "ج", "source_title": "مرجع"}),
    ("put", "/api/staff/faq-items/x", {"category_id": "about", "question_ar": "س؟", "answer_ar": "ج", "source_title": "مرجع"}),
    ("delete", "/api/staff/faq-items/x", None),
    ("get", "/api/audit-log", None),
    ("get", "/api/alerts", None),
]


@pytest.mark.parametrize("method,path,body", NEW_STAFF_ENDPOINTS)
@pytest.mark.parametrize("headers", [{}, {"X-Support-Token": "wrong"}], ids=["missing", "wrong"])
def test_new_staff_endpoints_reject_without_token(client, method, path, body, headers):
    r = getattr(client, method)(path, headers=headers, **({"json": body} if body else {}))
    assert r.status_code == 401


# ---- CSV export ----
def test_unanswered_csv_export(client):
    client.post("/api/chat", json={"message": "=HYPERLINK(\"x\") هل فيه خصم؟"})
    client.post("/api/chat", json={"message": "هل فيه تقسيط؟"})
    r = client.get("/api/unanswered/export.csv", headers=STAFF)
    assert r.status_code == 200 and r.headers["content-type"].startswith("text/csv")
    assert "attachment" in r.headers["content-disposition"]
    text = r.content.decode("utf-8")
    assert text.startswith("﻿السؤال,عدد مرات التكرار")
    assert "'=HYPERLINK" in text and "بانتظار الإجابة" in text      # formula neutralised
    en = client.get("/api/unanswered/export.csv?lang=en", headers=AUTH).content.decode("utf-8")
    assert en.startswith("﻿Question,Times asked") and "Awaiting answer" in en


def test_cases_csv_export_and_audit(client):
    case(client, category="complaint", tier_id=TIER_AMBASSADOR)
    text = client.get("/api/support-cases/export.csv", headers=STAFF).content.decode("utf-8")
    assert "شكوى" in text and "سفير" in text and "test@example.com" in text and "CX-" in text
    log = client.get("/api/audit-log", headers=AUTH).json()
    assert log[0]["action"] == "export.cases" and log[0]["actor"] == "نورة"


# ---- Request types ----
def test_case_category_default_filter_and_validation(client):
    case(client)
    case(client, category="suggestion")
    assert client.post("/api/support-cases", json={"question": "q", "language": "ar", "anonymous": True,
                                                   "category": "spam"}).status_code == 422
    all_cases = client.get("/api/support-cases", headers=AUTH).json()
    assert sorted(c["category"] for c in all_cases) == ["inquiry", "suggestion"]
    only = client.get("/api/support-cases?category=suggestion", headers=AUTH).json()
    assert [c["category"] for c in only] == ["suggestion"]


# ---- Alerts ----
def test_alerts(client):
    from app.db import SupportCase, UnansweredQuestion, engine
    assert client.get("/api/alerts", headers=AUTH).json() == []
    for _ in range(3):
        case(client, category="complaint")
    with Session(engine) as s:
        old = s.exec(select(SupportCase)).first()
        old.created_at = datetime.now(timezone.utc) - timedelta(hours=72)
        s.add(old)
        s.add(UnansweredQuestion(key="k", question="سؤال متكرر", count=12))
        s.commit()
    kinds = {a["kind"]: a["count"] for a in client.get("/api/alerts", headers=AUTH).json()}
    assert kinds == {"high_frequency_unanswered": 1, "stale_cases": 1, "complaints_spike": 3}


# ---- FAQ editor + action log ----
def test_faq_editor_create_update_delete(client):
    body = {"category_id": "support", "question_ar": "هل يوجد تطبيق؟", "answer_ar": "ليس بعد.",
            "question_en": "Is there an app?", "answer_en": "Not yet.", "source_title": "فريق الجمعية"}
    item_id = client.post("/api/staff/faq-items", json=body, headers=STAFF).json()["id"]
    public = next(c for c in client.get("/api/faq").json() if c["id"] == "support")["items"]
    assert any(i["question"]["en"] == "Is there an app?" and i["langs"] == ["ar", "en"] for i in public)

    body["answer_ar"] = "قريبًا."
    assert client.put(f"/api/staff/faq-items/{item_id}", json=body, headers=STAFF).status_code == 200
    admin = {i["id"]: i for i in client.get("/api/staff/faq-items", headers=AUTH).json()}
    assert admin[item_id]["answer_ar"] == "قريبًا." and admin[item_id]["last_action"] == "faq.update"
    assert admin[item_id]["last_actor"] == "نورة"

    assert client.delete(f"/api/staff/faq-items/{item_id}", headers=STAFF).status_code == 204
    assert item_id not in {i["id"] for i in client.get("/api/staff/faq-items", headers=AUTH).json()}
    actions = [e["action"] for e in client.get(f"/api/audit-log?target_id={item_id}", headers=AUTH).json()]
    assert actions == ["faq.delete", "faq.update", "faq.create"]


def test_faq_editor_validation(client):
    bad = {"category_id": "support", "question_ar": " ", "answer_ar": "ج", "source_title": "مرجع"}
    assert client.post("/api/staff/faq-items", json=bad, headers=AUTH).status_code == 422
    bad.update(question_ar="س؟", category_id="nope")
    assert client.post("/api/staff/faq-items", json=bad, headers=AUTH).status_code == 422
    bad["category_id"] = "support"
    assert client.put("/api/staff/faq-items/missing", json=bad, headers=AUTH).status_code == 404
    assert client.delete("/api/staff/faq-items/missing", headers=AUTH).status_code == 404


def test_promote_with_english_translation(client):
    client.post("/api/chat", json={"message": "هل فيه استرداد؟"})
    qid = client.get("/api/unanswered", headers=AUTH).json()[0]["id"]
    client.post(f"/api/unanswered/{qid}/promote", headers=STAFF, json={
        "category_id": "support", "question": "هل يوجد استرداد؟", "answer": "يُراجع الفريق كل حالة.",
        "source_title": "فريق الجمعية", "question_en": "Is there a refund?",
        "answer_en": "The team reviews each case.", "source_title_en": "Association team"})
    added = next(c for c in client.get("/api/faq").json() if c["id"] == "support")["items"][-1]
    assert added["langs"] == ["ar", "en"] and added["source"]["title"]["en"] == "Association team"
    assert client.get("/api/audit-log", headers=AUTH).json()[0]["action"] == "faq.promote"


def test_case_status_change_is_logged(client):
    cid = case(client)["id"]
    client.patch(f"/api/support-cases/{cid}", json={"status": "closed"}, headers=STAFF)
    entry = client.get(f"/api/audit-log?target_id={cid}", headers=AUTH).json()[0]
    assert entry["action"] == "case.status" and "new → closed" in entry["summary"]


# ---- Verification codes ----
@pytest.fixture()
def email_otp(monkeypatch):
    """Email provider 'configured', with delivery captured instead of sent."""
    from app import config, otp
    monkeypatch.setattr(config, "SMTP_HOST", "smtp.example.com")
    monkeypatch.setattr(config, "SMTP_FROM", "noreply@example.com")
    sent = []
    monkeypatch.setitem(otp.SENDERS, "email", lambda to, code, lang: sent.append((to, code, lang)))
    return sent


def age_challenges(seconds):
    from app.db import OtpChallenge, engine
    with Session(engine) as s:
        for c in s.exec(select(OtpChallenge)):
            c.created_at = c.created_at.replace(tzinfo=timezone.utc) - timedelta(seconds=seconds)
            s.add(c)
        s.commit()


def test_channels_report_demo_when_unconfigured(client):
    assert client.get("/api/verify/channels").json() == {"email": False, "whatsapp": False, "demo": True}


def test_email_code_flow(client, email_otp):
    assert client.get("/api/verify/channels").json() == {"email": True, "whatsapp": False, "demo": False}
    r = client.post("/api/verify/send", json={"channel": "email", "email": "Ambassador@Example.com", "lang": "en"})
    assert r.status_code == 200 and r.json()["demo"] is False
    to, code, lang = email_otp[0]
    assert to == "ambassador@example.com" and len(code) == 4 and lang == "en"
    wrong = "0000" if code != "0000" else "1111"
    bad = client.post("/api/verify/check", json={"channel": "email", "email": to, "code": wrong})
    assert bad.status_code == 422 and bad.json()["detail"] == {"code": "invalid_code", "attempts_left": 4}
    ok = client.post("/api/verify/check", json={"channel": "email", "email": to, "code": code}).json()
    assert ok["registered"] and ok["tier_id"] == TIER_AMBASSADOR
    again = client.post("/api/verify/check", json={"channel": "email", "email": to, "code": code})
    assert again.json()["detail"]["code"] == "no_code"     # one use only


def test_codes_and_addresses_are_not_stored_in_plain_text(client, email_otp):
    from app.db import OtpChallenge, engine
    client.post("/api/verify/send", json={"email": "person@example.com"})
    code = email_otp[0][1]
    with Session(engine) as s:
        row = s.exec(select(OtpChallenge)).one()
    dump = " ".join(str(v) for v in row.model_dump().values())
    assert "person@example.com" not in dump and code not in (row.code_hash, row.target_hash)


def test_too_many_wrong_attempts(client, email_otp):
    client.post("/api/verify/send", json={"email": "person@example.com"})
    code = email_otp[0][1]
    wrong = "0000" if code != "0000" else "1111"
    for _ in range(4):
        client.post("/api/verify/check", json={"email": "person@example.com", "code": wrong})
    last = client.post("/api/verify/check", json={"email": "person@example.com", "code": wrong})
    assert last.status_code == 429 and last.json()["detail"]["code"] == "too_many_attempts"
    locked = client.post("/api/verify/check", json={"email": "person@example.com", "code": code})
    assert locked.status_code == 429   # even the right code no longer works


def test_expired_code(client, email_otp):
    from app.db import OtpChallenge, engine
    client.post("/api/verify/send", json={"email": "person@example.com"})
    with Session(engine) as s:
        row = s.exec(select(OtpChallenge)).one()
        row.expires_at = datetime.now(timezone.utc) - timedelta(seconds=1)
        s.add(row); s.commit()
    r = client.post("/api/verify/check", json={"email": "person@example.com", "code": email_otp[0][1]})
    assert r.json()["detail"]["code"] == "expired"


def test_resend_cooldown_and_rate_limit(client, email_otp):
    body = {"email": "person@example.com"}
    assert client.post("/api/verify/send", json=body).status_code == 200
    cool = client.post("/api/verify/send", json=body)
    assert cool.status_code == 429 and cool.json()["detail"]["code"] == "cooldown" and "Retry-After" in cool.headers
    for _ in range(2):
        age_challenges(31)
        assert client.post("/api/verify/send", json=body).status_code == 200
    age_challenges(31)
    limited = client.post("/api/verify/send", json=body)
    assert limited.status_code == 429 and limited.json()["detail"]["code"] == "rate_limited"
    # only the newest code works
    old, new = email_otp[0][1], email_otp[-1][1]
    if old != new:
        assert client.post("/api/verify/check", json={**body, "code": old}).status_code == 422
    assert client.post("/api/verify/check", json={**body, "code": new}).status_code == 200


def test_delivery_failure_and_unavailable_channel(client, email_otp, monkeypatch):
    from app import otp
    def boom(*_):
        raise OSError("smtp down")
    monkeypatch.setitem(otp.SENDERS, "email", boom)
    r = client.post("/api/verify/send", json={"email": "person@example.com"})
    assert r.status_code == 502 and r.json()["detail"]["code"] == "delivery_failed"
    wa = client.post("/api/verify/send", json={"channel": "whatsapp", "phone": "0500000001"})
    assert wa.status_code == 422   # WhatsApp not configured while email is


def test_whatsapp_code_flow(client, monkeypatch):
    from app import config, otp
    for name, value in {"TWILIO_ACCOUNT_SID": "AC1", "TWILIO_AUTH_TOKEN": "t",
                        "TWILIO_WHATSAPP_FROM": "whatsapp:+10000000000"}.items():
        monkeypatch.setattr(config, name, value)
    sent = []
    monkeypatch.setitem(otp.SENDERS, "whatsapp", lambda to, code, lang: sent.append((to, code)))
    assert client.post("/api/verify/send", json={"phone": "0500000002"}).json()["channel"] == "whatsapp"
    assert sent[0][0] == "+966500000002"
    r = client.post("/api/verify/check", json={"phone": "0500000002", "code": sent[0][1]}).json()
    assert r["registered"] and r["can_renew"] is True


def test_invalid_email_rejected(client):
    assert client.post("/api/verify/send", json={"channel": "email", "email": "not-an-email"}).status_code == 422
    assert client.post("/api/verify/send", json={"channel": "email"}).status_code == 422

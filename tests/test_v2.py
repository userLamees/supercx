"""Endpoints added for the v2 design: FAQ, unanswered questions, phone verification."""
from app.agent import TIER_AFFILIATE, TIER_AMBASSADOR
from app.redact import redact

AUTH = {"X-Support-Token": "test-token"}


def test_tiers_carry_last_checked_date(client):
    assert all(t["checked_at"] for t in client.get("/api/memberships").json())


# Support cases: optional contact and short reference
def test_anonymous_case_allowed_and_has_reference(client):
    r = client.post("/api/support-cases", json={
        "question": "سؤال", "language": "ar", "anonymous": True, "summary": "راسلني a@b.com أو 0551234567"})
    assert r.status_code == 201 and r.json()["reference"].startswith("CX-")
    case = client.get("/api/support-cases", headers=AUTH).json()[0]
    assert case["contact"] == "" and "a@b.com" not in case["summary"] and "0551234567" not in case["summary"]


def test_redact_removes_email_and_phone():
    assert redact("بريدي x.y@mail.com وجوالي +966 55 123 4567") == "بريدي [email] وجوالي [phone]"


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

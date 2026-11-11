"""Covers the success/error cases and permission checks from the problem card."""
from app.agent import TIER_AMBASSADOR, TIER_SUPPORTER

AUTH = {"X-Support-Token": "test-token"}


def test_memberships_are_normalized_and_ordered(client):
    tiers = client.get("/api/memberships").json()
    assert [t["code"] for t in tiers] == [1, 2, 3]
    assert tiers[0]["name"] == {"ar": "منتسب", "en": "Affiliate"}
    assert tiers[2]["price_sar"] == 100000
    assert client.get("/api/health").json()["memberships_origin"] == "fixture"


# Story 1: choosing a membership
def test_recommends_one_tier_with_source(client):
    r = client.post("/api/chat", json={"message": "أبغى عضوية تعطيني حق التصويت"}).json()
    assert r["action"] == "recommend" and r["tier_id"] == TIER_SUPPORTER
    assert r["lang"] == "ar" and r["sources"][0]["url"].startswith("https://cxa.sa")


def test_replies_in_english(client):
    r = client.post("/api/chat", json={"message": "Which tier has exclusive events?"}).json()
    assert r["lang"] == "en" and r["tier_id"] == TIER_AMBASSADOR


def test_unpublished_condition_is_not_invented(client):
    r = client.post("/api/chat", json={"message": "هل فيه خصم للطلاب؟"}).json()
    assert r["action"] == "escalate" and r["needs_contact"] is True and r["tier_id"] is None


# Story 2 + 3: escalation creates a complete case for support
def test_escalation_creates_case_visible_to_support(client):
    created = client.post("/api/support-cases", json={
        "question": "هل فيه خصم للطلاب؟", "language": "ar", "contact": "a@b.com"})
    assert created.status_code == 201
    cases = client.get("/api/support-cases", headers=AUTH).json()
    assert len(cases) == 1 and cases[0]["status"] == "new"


def test_case_requires_contact(client):
    r = client.post("/api/support-cases", json={"question": "سؤال", "language": "ar"})
    assert r.status_code == 422


def test_case_rejects_unknown_tier(client):
    r = client.post("/api/support-cases", json={
        "question": "q", "language": "en", "contact": "a@b.com", "tier_id": "not-a-tier"})
    assert r.status_code == 422


# Permission checks
def test_visitor_cannot_read_or_update_cases(client):
    case_id = client.post("/api/support-cases", json={
        "question": "q", "language": "en", "contact": "a@b.com"}).json()["id"]
    assert client.get("/api/support-cases").status_code == 401
    assert client.patch(f"/api/support-cases/{case_id}", json={"status": "closed"}).status_code == 401


def test_support_can_update_status(client):
    case_id = client.post("/api/support-cases", json={
        "question": "q", "language": "en", "contact": "a@b.com"}).json()["id"]
    r = client.patch(f"/api/support-cases/{case_id}", json={"status": "in_progress"}, headers=AUTH)
    assert r.status_code == 200 and r.json()["status"] == "in_progress"

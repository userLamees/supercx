"""Connectors: member registry (demo, file, API), cases sent to the association's system
(demo, webhook, email), and the admin integrations status."""
import hashlib
import hmac
import json
from datetime import date, timedelta

import pytest

from app import config
from app.integrations import case_sync, members
from app.rules_agent import TIER_AMBASSADOR, TIER_SUPPORTER

TOKEN = {"X-Support-Token": "test-token", "X-Staff-Name": "admin-script"}


class FakeResponse:
    def __init__(self, data, status=200):
        self._data, self.status_code = data, status

    def raise_for_status(self):
        if self.status_code >= 400:
            import httpx
            raise httpx.HTTPStatusError("error", request=None, response=None)

    def json(self):
        return self._data


def check(client, phone="0500000001"):
    return client.post("/api/verify/check", json={"phone": phone, "code": "1234"})


def make_case(client, contact=None, category="complaint"):
    body = {"question": "تأخر وصول بطاقة العضوية", "language": "ar", "category": category}
    body.update({"contact": contact} if contact else {"anonymous": True})
    r = client.post("/api/support-cases", json=body)
    assert r.status_code == 201, r.text
    return r.json()


def syncs(client, case_id):
    r = client.get(f"/api/support-cases/{case_id}/syncs", headers=TOKEN)
    assert r.status_code == 200, r.text
    return r.json()


# ================= Member registry =================
def test_demo_registry_is_the_default(client):
    assert members.mode() == "demo"
    r = check(client).json()
    assert r["registered"] and r["demo"] is True and r["source"] == "members_demo"


def test_file_registry_with_absolute_expiry(client, monkeypatch, tmp_path):
    path = tmp_path / "members.json"
    expires = (date.today() + timedelta(days=10)).isoformat()
    path.write_text(json.dumps({"members": [{"phone": "500000077", "tier_id": TIER_SUPPORTER, "expires_at": expires}]}))
    monkeypatch.setattr(config, "MEMBER_REGISTRY", "file")
    monkeypatch.setattr(config, "MEMBERS_FILE", str(path))
    r = check(client, "0500000077").json()
    assert r["registered"] and r["demo"] is False and r["source"] == "members_file"
    assert r["tier_id"] == TIER_SUPPORTER and r["expires_at"] == expires and r["days_remaining"] == 10 and r["can_renew"]


@pytest.fixture()
def api_registry(monkeypatch):
    monkeypatch.setattr(config, "MEMBER_REGISTRY", "api")
    monkeypatch.setattr(config, "MEMBER_REGISTRY_URL", "https://registry.example.org/lookup")
    monkeypatch.setattr(config, "MEMBER_REGISTRY_TOKEN", "registry-token")
    calls = []

    def answer(data):
        def post(url, json=None, headers=None, timeout=None):
            calls.append({"url": url, "json": json, "headers": headers})
            if isinstance(data, Exception):
                raise data
            return FakeResponse(data)
        monkeypatch.setattr(members.httpx, "post", post)
    return calls, answer


def test_api_registry_found(client, api_registry):
    calls, answer = api_registry
    answer({"found": True, "tier_id": TIER_AMBASSADOR, "expires_at": "2099-01-01"})
    r = check(client).json()
    assert r["registered"] and r["demo"] is False and r["source"] == "member_registry" and r["tier_id"] == TIER_AMBASSADOR
    assert calls[0]["json"] == {"phone": "+966500000001"}
    assert calls[0]["headers"]["Authorization"] == "Bearer registry-token"


def test_api_registry_by_email_and_not_found(client, api_registry):
    calls, answer = api_registry
    answer({"found": False})
    r = client.post("/api/verify/check", json={"email": "Someone@Example.com", "code": "1234"}).json()
    assert r["registered"] is False and r["demo"] is False
    assert calls[0]["json"] == {"email": "someone@example.com"}


def test_api_registry_unknown_tier_is_not_registered(client, api_registry):
    _, answer = api_registry
    answer({"found": True, "tier_id": "no-such-tier", "expires_at": "2099-01-01"})
    assert check(client).json()["registered"] is False


@pytest.mark.parametrize("failure", ["network", "bad_answer"])
def test_api_registry_failure_shows_nothing(client, api_registry, failure):
    import httpx
    _, answer = api_registry
    answer(httpx.ConnectError("down") if failure == "network"
           else {"found": True, "tier_id": TIER_AMBASSADOR})  # bad answer: no expires_at
    r = check(client)
    assert r.status_code == 503 and r.json()["detail"] == "registry_unavailable"


def test_api_registry_without_settings_is_unavailable(client, monkeypatch):
    monkeypatch.setattr(config, "MEMBER_REGISTRY", "api")
    assert check(client).status_code == 503


# ================= Cases to the association's system =================
def test_new_case_goes_to_the_demo_outbox(client):
    case = make_case(client, contact="member1@example.com")
    [row] = syncs(client, case["id"])
    assert row["event"] == "case.created" and row["target"] == "demo" and row["status"] == "simulated" and row["demo"]
    data = json.loads(row["payload"])
    assert data["case"]["reference"] == case["reference"] and data["case"]["category"] == "complaint"
    assert data["case"]["contact"] == "member1@example.com"
    assert case["tracking_code"] not in row["payload"]


def test_anonymous_case_has_no_contact_in_the_payload(client):
    case = make_case(client)
    data = json.loads(syncs(client, case["id"])[0]["payload"])
    assert data["case"]["contact"] is None


def test_case_sync_can_be_turned_off(client, monkeypatch):
    monkeypatch.setattr(config, "CASE_SYNC", "off")
    case = make_case(client)
    assert syncs(client, case["id"]) == []
    assert client.post(f"/api/support-cases/{case['id']}/sync", headers=TOKEN).status_code == 409


def test_reply_and_status_changes_are_sent(client):
    case = make_case(client)
    client.post(f"/api/support-cases/{case['id']}/reply", json={"reply": "نعتذر، أُرسلت البطاقة اليوم."}, headers=TOKEN)
    client.patch(f"/api/support-cases/{case['id']}", json={"status": "closed"}, headers=TOKEN)
    client.patch(f"/api/support-cases/{case['id']}", json={"status": "closed"}, headers=TOKEN)  # no change: no event
    rows = syncs(client, case["id"])
    assert [r["event"] for r in rows] == ["case.status", "case.replied", "case.created"]
    replied = json.loads(rows[1]["payload"])["case"]
    assert replied["reply"].startswith("نعتذر") and replied["status"] == "replied"


@pytest.fixture()
def webhook(monkeypatch):
    monkeypatch.setattr(config, "CASE_SYNC", "webhook")
    monkeypatch.setattr(config, "CASE_WEBHOOK_URL", "https://crm.example.org/hooks/supercx")
    monkeypatch.setattr(config, "CASE_WEBHOOK_SECRET", "hook-secret")


def test_webhook_is_signed_and_keeps_the_external_id(client, webhook, monkeypatch):
    sent = {}

    def post(url, content=None, headers=None, timeout=None):
        sent.update(url=url, body=content, headers=headers)
        return FakeResponse({"external_id": "CRM-42"})
    monkeypatch.setattr(case_sync.httpx, "post", post)
    case = make_case(client)
    [row] = syncs(client, case["id"])
    assert row["status"] == "sent" and row["target"] == "webhook" and row["external_id"] == "CRM-42" and not row["demo"]
    expected = "sha256=" + hmac.new(b"hook-secret", sent["body"], hashlib.sha256).hexdigest()
    assert sent["headers"]["X-SuperCX-Signature"] == expected
    assert sent["headers"]["X-SuperCX-Event"] == "case.created" and sent["headers"]["X-SuperCX-Delivery"] == row["id"]
    assert json.loads(sent["body"])["case"]["reference"] == case["reference"]


def test_failed_webhook_keeps_the_case_and_can_be_sent_again(client, webhook, monkeypatch):
    def down(*a, **k):
        raise ConnectionError("crm down")
    monkeypatch.setitem(case_sync.SENDERS, "webhook", down)
    case = make_case(client)
    [row] = syncs(client, case["id"])
    assert row["status"] == "failed" and row["error"] == "ConnectionError" and row["attempts"] == 1
    assert client.get("/api/support-cases", headers=TOKEN).json()[0]["id"] == case["id"]  # case is safe

    monkeypatch.setitem(case_sync.SENDERS, "webhook", lambda body, event, delivery: "CRM-7")
    r = client.post(f"/api/support-cases/{case['id']}/sync", headers=TOKEN)
    assert r.status_code == 200
    [row] = syncs(client, case["id"])  # same row retried
    assert row["status"] == "sent" and row["attempts"] == 2 and row["external_id"] == "CRM-7"
    log = client.get(f"/api/audit-log?target_id={case['id']}", headers=TOKEN).json()
    assert any(e["action"] == "case.sync" for e in log)


def test_email_mode_sends_a_readable_message(client, monkeypatch):
    monkeypatch.setattr(config, "CASE_SYNC", "email")
    monkeypatch.setattr(config, "CASE_EMAIL_TO", "care@example.org")
    monkeypatch.setattr(config, "SMTP_HOST", "smtp.example.org")
    monkeypatch.setattr(config, "SMTP_FROM", "noreply@example.org")
    mails = []
    monkeypatch.setitem(case_sync.SENDERS, "email", lambda subject, text: mails.append((subject, text)))
    case = make_case(client, contact="0551234567")
    assert syncs(client, case["id"])[0]["status"] == "sent"
    subject, text = mails[0]
    assert case["reference"] in subject and "شكوى" in subject and "0551234567" in text


def test_live_mode_without_settings_falls_back_to_demo(client, monkeypatch):
    monkeypatch.setattr(config, "CASE_SYNC", "webhook")  # no URL or secret
    case = make_case(client)
    assert syncs(client, case["id"])[0]["target"] == "demo"


def test_case_sync_endpoints_need_staff(client):
    case = make_case(client)
    assert client.get(f"/api/support-cases/{case['id']}/syncs").status_code == 401
    assert client.post(f"/api/support-cases/{case['id']}/sync").status_code == 401
    assert client.get("/api/support-cases/nope/syncs", headers=TOKEN).status_code == 404


# ================= Integrations status =================
def test_status_lists_every_connector(client):
    items = {i["key"]: i for i in client.get("/api/integrations", headers=TOKEN).json()}
    assert set(items) == {"ai_agent", "memberships", "member_registry", "case_sync", "email", "whatsapp",
                          "notifications", "database", "staff_accounts", "secrets"}
    assert items["member_registry"]["state"] == "demo" and items["case_sync"]["state"] == "demo"
    assert items["ai_agent"]["state"] == "demo" and "OPENAI_API_KEY" in items["ai_agent"]["needs"]
    assert items["database"]["version"]  # migration version


def test_status_shows_missing_settings_and_never_secrets(client, monkeypatch):
    monkeypatch.setattr(config, "MEMBER_REGISTRY", "api")
    monkeypatch.setattr(config, "CASE_SYNC", "webhook")
    monkeypatch.setattr(config, "CASE_WEBHOOK_URL", "https://crm.example.org/hook")
    monkeypatch.setattr(config, "CASE_WEBHOOK_SECRET", "very-secret-value")
    r = client.get("/api/integrations", headers=TOKEN)
    items = {i["key"]: i for i in r.json()}
    assert items["member_registry"]["state"] == "missing" and items["case_sync"]["state"] == "live"
    assert "very-secret-value" not in r.text and "test-token" not in r.text


def test_status_is_for_admins_only(client):
    assert client.get("/api/integrations").status_code == 401
    client.post("/api/staff/users", json={"email": "s@example.com", "name": "سعد", "password": "Temp-pass-2026"}, headers=TOKEN)
    token = client.post("/api/staff/login", json={"email": "s@example.com", "password": "Temp-pass-2026"}).json()["token"]
    h = {"Authorization": f"Bearer {token}"}
    client.post("/api/staff/me/password", json={"current_password": "Temp-pass-2026", "new_password": "New-pass-2026!"}, headers=h)
    assert client.get("/api/integrations", headers=h).status_code == 403

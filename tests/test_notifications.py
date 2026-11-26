"""Notifications: the visitor is told the team replied, by email or WhatsApp, or in the demo outbox."""
import pytest

from app import config, notify

STAFF = {"X-Support-Token": "test-token", "X-Staff-Name": "%D8%B3%D8%A7%D8%B1%D8%A9"}  # "سارة"
REPLY = "نعم، يمكن ذلك عبر صفحة العضويات."


def make_case(client, contact=None, language="ar"):
    body = {"question": "هل يمكن تقسيط رسوم العضوية؟", "language": language, "category": "inquiry"}
    body.update({"contact": contact} if contact else {"anonymous": True})
    r = client.post("/api/support-cases", json=body)
    assert r.status_code == 201, r.text
    return r.json()


def reply(client, case_id, text=REPLY):
    r = client.post(f"/api/support-cases/{case_id}/reply", json={"reply": text}, headers=STAFF)
    assert r.status_code == 200, r.text
    return r.json()


def notes(client, case_id):
    r = client.get(f"/api/support-cases/{case_id}/notifications", headers=STAFF)
    assert r.status_code == 200, r.text
    return r.json()


@pytest.fixture()
def providers(monkeypatch):
    """Pretend SMTP and Twilio are configured and capture what would be sent."""
    sent = []
    monkeypatch.setattr(config, "SMTP_HOST", "smtp.example.com")
    monkeypatch.setattr(config, "SMTP_FROM", "noreply@example.com")
    monkeypatch.setattr(config, "TWILIO_ACCOUNT_SID", "AC_test")
    monkeypatch.setattr(config, "TWILIO_AUTH_TOKEN", "test")
    monkeypatch.setattr(config, "TWILIO_WHATSAPP_FROM", "whatsapp:+10000000000")
    monkeypatch.setitem(notify.SENDERS, "email", lambda to, subject, body: sent.append(("email", to, subject, body)))
    monkeypatch.setitem(notify.SENDERS, "whatsapp", lambda to, body, ref, link: sent.append(("whatsapp", to, body, link)))
    return sent


# ---------- Demo outbox (no provider) ----------
def test_reply_without_provider_goes_to_the_demo_outbox(client):
    case = make_case(client, contact="member7@example.com")
    reply(client, case["id"])
    [n] = notes(client, case["id"])
    assert n["status"] == "simulated" and n["demo"] is True and n["channel"] == "email"
    assert n["recipient"] == "m***@example.com"  # masked for staff
    assert case["reference"] in n["subject"] and case["reference"] in n["body"]
    assert f"/?track={case['reference']}#requests" in n["body"]


def test_message_never_contains_the_reply_or_the_tracking_code(client):
    case = make_case(client, contact="0551234567")
    reply(client, case["id"])
    [n] = notes(client, case["id"])
    assert n["channel"] == "whatsapp" and n["recipient"] == "+9665******67"
    assert REPLY not in n["body"] and case["tracking_code"] not in n["body"]


def test_anonymous_case_is_skipped(client):
    case = make_case(client)
    reply(client, case["id"])
    [n] = notes(client, case["id"])
    assert n["status"] == "skipped" and n["error"] == "no_contact" and n["channel"] == "none"


def test_message_follows_the_case_language(client):
    case = make_case(client, contact="someone@example.com", language="en")
    reply(client, case["id"], "Yes, you can.")
    [n] = notes(client, case["id"])
    assert n["subject"].startswith("The Customer Experience Association replied")


def test_updating_the_reply_sends_an_update(client):
    case = make_case(client, contact="someone@example.com")
    reply(client, case["id"])
    reply(client, case["id"], "تحديث: نعم.")
    kinds = [n["kind"] for n in notes(client, case["id"])]
    assert kinds == ["case.reply_update", "case.reply"]


def test_notifications_can_be_turned_off(client, monkeypatch):
    monkeypatch.setattr(config, "NOTIFY_ON_REPLY", False)
    case = make_case(client, contact="someone@example.com")
    reply(client, case["id"])
    assert notes(client, case["id"]) == []
    r = client.post(f"/api/support-cases/{case['id']}/notify", headers=STAFF)
    assert r.status_code == 409


def test_public_base_url_is_used_in_the_link(client, monkeypatch):
    monkeypatch.setattr(config, "PUBLIC_BASE_URL", "https://supercx.example.org")
    case = make_case(client, contact="someone@example.com")
    reply(client, case["id"])
    [n] = notes(client, case["id"])
    assert f"https://supercx.example.org/?track={case['reference']}#requests" in n["body"]


# ---------- Real providers ----------
def test_email_is_sent_when_smtp_is_configured(client, providers):
    case = make_case(client, contact="Member7@Example.com")
    reply(client, case["id"])
    [n] = notes(client, case["id"])
    assert n["status"] == "sent" and n["demo"] is False and n["sent_at"]
    assert providers == [("email", "member7@example.com", n["subject"], n["body"])]


def test_whatsapp_is_sent_in_international_format(client, providers):
    case = make_case(client, contact="05 5123 4567")
    reply(client, case["id"])
    [n] = notes(client, case["id"])
    assert n["status"] == "sent"
    channel, to, body, link = providers[0]
    assert channel == "whatsapp" and to == "+966551234567" and link.endswith("#requests")


def test_whatsapp_template_is_used_when_configured(monkeypatch):
    calls = {}
    monkeypatch.setattr(config, "TWILIO_REPLY_TEMPLATE_SID", "HX_template")
    monkeypatch.setattr(notify.httpx, "post", lambda url, **kw: calls.update(kw) or type("R", (), {"raise_for_status": lambda self: None})())
    notify.send_whatsapp("+966551234567", "body", "CX-ABC123", "https://x/?track=CX-ABC123#requests")
    assert calls["data"]["ContentSid"] == "HX_template" and "Body" not in calls["data"]
    assert '"1": "CX-ABC123"' in calls["data"]["ContentVariables"]


def test_failed_send_keeps_the_reply_and_can_be_sent_again(client, providers, monkeypatch):
    def boom(*a):
        raise ConnectionError("smtp down")
    monkeypatch.setitem(notify.SENDERS, "email", boom)
    case = make_case(client, contact="someone@example.com")
    saved = reply(client, case["id"])
    assert saved["status"] == "replied" and saved["reply"] == REPLY  # the reply is not undone
    [n] = notes(client, case["id"])
    assert n["status"] == "failed" and n["error"] == "ConnectionError" and n["attempts"] == 1

    monkeypatch.setitem(notify.SENDERS, "email", lambda to, subject, body: providers.append(to))
    r = client.post(f"/api/support-cases/{case['id']}/notify", headers=STAFF)
    assert r.status_code == 200
    [n] = notes(client, case["id"])  # same row retried, not a duplicate
    assert n["status"] == "sent" and n["attempts"] == 2
    log = client.get(f"/api/audit-log?target_id={case['id']}", headers=STAFF).json()
    assert any(e["action"] == "case.notify" for e in log)


# ---------- Access ----------
def test_staff_endpoints_need_the_token(client):
    case = make_case(client, contact="someone@example.com")
    assert client.get(f"/api/support-cases/{case['id']}/notifications").status_code == 401
    assert client.post(f"/api/support-cases/{case['id']}/notify").status_code == 401


def test_resend_needs_a_reply_first(client):
    case = make_case(client, contact="someone@example.com")
    assert client.post(f"/api/support-cases/{case['id']}/notify", headers=STAFF).status_code == 409
    assert client.get("/api/support-cases/nope/notifications", headers=STAFF).status_code == 404


# ---------- Helpers ----------
@pytest.mark.parametrize("contact,expected", [
    ("a@b.co", ("email", "a@b.co")), ("+966 55 123 4567", ("whatsapp", "+966551234567")),
    ("٠٥٥١٢٣٤٥٦٧", ("whatsapp", "+966551234567")), ("", ("none", None)), ("12345", ("none", None)),
])
def test_route(contact, expected):
    assert notify.route(contact) == expected


# ---------- Demo data ----------
def test_seed_adds_simulated_notifications_for_demo_replies(client):
    from sqlmodel import Session, select
    from app.db import Notification, SupportCase, engine
    from app.seed_demo import seed_activity
    for _ in range(2):  # running it again replaces, never duplicates
        with Session(engine) as s:
            seed_activity(s)
            s.commit()
    with Session(engine) as s:
        replied = s.exec(select(SupportCase).where(SupportCase.demo == True, SupportCase.reply != None)).all()  # noqa: E711,E712
        rows = s.exec(select(Notification)).all()
        assert replied and len(rows) == len(replied)
        ids = {c.id for c in replied}
        assert all(n.case_id in ids for n in rows)
        with_contact = [n for n in rows if n.channel == "email"]
        assert with_contact and all(n.status == "simulated" and n.demo for n in with_contact)
        assert all(n.status == "skipped" for n in rows if n.channel == "none")

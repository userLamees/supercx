"""The assistant on WhatsApp: same agent and rules as the website, through Twilio or the staff simulator."""
import json
from datetime import datetime, timedelta, timezone

import pytest
from sqlmodel import Session, select

from app import config, whatsapp
from app.db import CaseSync, ChatEvent, SupportCase, WhatsAppConversation, engine
from app.rules_agent import TIER_AMBASSADOR

TOKEN = {"X-Support-Token": "test-token", "X-Staff-Name": "admin-script"}
MEMBER = "0500000001"        # demo registry: Ambassador, 365 days left
STRANGER = "0599999999"      # not a member


@pytest.fixture(autouse=True)
def _fresh_limiter():
    whatsapp.limiter.reset()
    yield
    whatsapp.limiter.reset()


def say(client, text, phone=MEMBER):
    r = client.post("/api/whatsapp/simulate", json={"phone": phone, "text": text}, headers=TOKEN)
    assert r.status_code == 200, r.text
    return r.json()["messages"]


def last(client, text, phone=MEMBER):
    return say(client, text, phone)[-1]


# ---------- Conversation ----------
def test_first_message_gets_a_welcome_with_the_assistant_name(client):
    messages = say(client, "السلام عليكم")
    assert len(messages) == 1 and "مشاري" in messages[0] and "طلباتي" in messages[0]


def test_comparison_lists_every_tier_from_the_membership_data(client):
    tiers = client.get("/api/memberships").json()
    text = last(client, "ما الفرق بين العضويات؟")
    for tier in tiers:
        assert f"*{tier['name']['ar']}*" in text and f"{int(tier['price_sar']):,}" in text
    assert "الأكثر شعبية" in text and "آخر تحقق" in text and "شروط الأهلية" in text
    assert text.count(f"{int(tiers[0]['price_sar']):,} ريال") == 1  # the agent's own price list was dropped


def test_recommendation_shows_one_tier_marked_best(client):
    text = last(client, "أريد عضوية تمنحني حق التصويت")
    assert "الأنسب لك" in text and "للتسجيل:" in text
    assert text.count("✓") >= 1 and text.count(" · ") == 2  # one tier card: name · price · badge


def test_answers_carry_their_source(client, monkeypatch):
    from app.schemas import ChatAction, ChatResponse, Source
    monkeypatch.setattr("app.agent.run_agent", lambda text, history: ChatResponse(
        answer="الدعم متاح من الأحد إلى الخميس.", lang="ar", action=ChatAction.answer,
        sources=[Source(title="صفحة الدعم", url="https://cxa.sa/support")]))
    text = last(client, "متى تردون؟")
    assert text.startswith("الدعم متاح") and "المصدر: صفحة الدعم\nhttps://cxa.sa/support" in text


def test_english_conversation(client):
    say(client, "hello")
    text = last(client, "What's the difference between the memberships?")
    assert "SAR per year" in text and "Most popular" in text


# ---------- Personal information: only for the number that writes ----------
def test_membership_status_for_the_sender_only(client):
    text = last(client, "حالة عضويتي")
    assert "سفير" in text and "نشطة" in text and "بيانات تجريبية" in text
    assert "غير مسجل" in last(client, "حالة عضويتي", STRANGER)


def test_status_for_a_non_saudi_number_shows_nothing(client):
    assert "غير مسجل" in last(client, "حالة عضويتي", "+447700900123")


def test_status_when_the_registry_is_down(client, monkeypatch):
    monkeypatch.setattr(config, "MEMBER_REGISTRY", "api")  # no URL: unavailable
    assert "لا يرد" in last(client, "حالة عضويتي")


# ---------- Handing over to the team, with consent ----------
QUESTION = "هل يمكن تقسيط رسوم العضوية على دفعات شهرية؟"


def test_nothing_is_sent_before_consent(client):
    text = last(client, QUESTION)
    assert "اكتب 1 للموافقة" in text and "بريدك" not in text
    assert "لم نرسل شيئًا" in last(client, "2")
    with Session(engine) as s:
        assert s.exec(select(SupportCase)).all() == []


def test_consent_creates_a_case_with_this_number(client):
    say(client, QUESTION)
    text = last(client, "1")
    assert "رقم الحالة: CX-" in text and "رمز المتابعة:" in text
    with Session(engine) as s:
        case = s.exec(select(SupportCase)).one()
        assert case.contact == "+966500000001" and case.category == "unanswered" and case.demo
        assert s.exec(select(CaseSync).where(CaseSync.case_id == case.id)).one().event == "case.created"
        event = s.exec(select(ChatEvent).where(ChatEvent.channel == "whatsapp", ChatEvent.action == "escalate")).one()
        assert event.case_created
    staff = client.get("/api/support-cases", headers=TOKEN).json()
    assert staff[0]["contact"] == "+966500000001"
    # The visitor's tracking code works on the website too.
    code = text.split("رمز المتابعة: ")[1].split("\n")[0]
    ref = text.split("رقم الحالة: ")[1].split("\n")[0]
    assert client.post("/api/track", json={"reference": ref, "code": code}).status_code == 200


def test_my_requests_shows_only_this_numbers_cases(client):
    say(client, QUESTION, STRANGER)
    say(client, "1", STRANGER)
    assert "لا توجد طلبات" in last(client, "طلباتي")
    text = last(client, "طلباتي", STRANGER)
    assert "CX-" in text and "تم الاستلام" in text


def test_team_reply_shows_in_my_requests(client):
    say(client, QUESTION)
    say(client, "1")
    case_id = client.get("/api/support-cases", headers=TOKEN).json()[0]["id"]
    client.post(f"/api/support-cases/{case_id}/reply", json={"reply": "لا يتوفر التقسيط حاليًا."}, headers=TOKEN)
    text = last(client, "طلباتي")
    assert "تم الرد" in text and "لا يتوفر التقسيط" in text


# ---------- Privacy and limits ----------
def test_number_is_stored_only_as_a_hash_and_context_expires(client):
    say(client, "ما الفرق بين العضويات؟")
    with Session(engine) as s:
        conv = s.exec(select(WhatsAppConversation)).one()
        assert "500000001" not in conv.id and "500000001" not in conv.history
        assert len(json.loads(conv.history)) == 2
        conv.updated_at = datetime.now(timezone.utc) - timedelta(minutes=config.WHATSAPP_SESSION_MINUTES + 1)
        s.add(conv)
        s.commit()
    messages = say(client, "ما الفرق بين العضويات؟")
    assert "مشاري" in messages[0]  # a new session starts with the welcome
    with Session(engine) as s:
        assert whatsapp.forget_expired(s) == 0


def test_too_many_messages_are_slowed_down(client, monkeypatch):
    monkeypatch.setattr(config, "WHATSAPP_MAX_PER_5MIN", 2)
    say(client, "مرحبا")
    say(client, "مرحبا")
    assert "رسائل كثيرة" in last(client, "مرحبا")


def test_long_text_is_split_under_the_whatsapp_limit():
    text = ("سطر طويل " * 40 + "\n") * 10
    parts = whatsapp.split(text)
    assert len(parts) > 1 and all(len(p) <= whatsapp.MAX_CHARS for p in parts)
    assert "".join(parts).replace(" ", "").replace("\n", "") == text.replace(" ", "").replace("\n", "")


def test_simulator_needs_staff(client):
    assert client.post("/api/whatsapp/simulate", json={"phone": MEMBER, "text": "hi"}).status_code == 401


# ---------- Twilio webhook ----------
@pytest.fixture()
def twilio(monkeypatch):
    monkeypatch.setattr(config, "TWILIO_ACCOUNT_SID", "AC_test")
    monkeypatch.setattr(config, "TWILIO_AUTH_TOKEN", "twilio-secret")
    monkeypatch.setattr(config, "TWILIO_WHATSAPP_FROM", "whatsapp:+10000000000")
    monkeypatch.setattr(config, "PUBLIC_BASE_URL", "https://supercx.example.org")


def signed(params, token="twilio-secret"):
    from main import twilio_signature
    return {"X-Twilio-Signature": twilio_signature("https://supercx.example.org/api/whatsapp/webhook", params, token)}


def test_webhook_is_off_without_twilio(client):
    assert client.post("/api/whatsapp/webhook", data={"From": "whatsapp:+966500000001", "Body": "hi"}).status_code == 503


def test_webhook_rejects_a_bad_signature(client, twilio):
    params = {"From": "whatsapp:+966500000001", "Body": "مرحبا"}
    assert client.post("/api/whatsapp/webhook", data=params, headers={"X-Twilio-Signature": "forged"}).status_code == 403
    assert client.post("/api/whatsapp/webhook", data=params, headers=signed(params, "other")).status_code == 403


def test_webhook_answers_in_twiml(client, twilio):
    params = {"From": "whatsapp:+966500000001", "Body": "حالة عضويتي", "MessageSid": "SM1"}
    r = client.post("/api/whatsapp/webhook", data=params, headers=signed(params))
    assert r.status_code == 200 and r.headers["content-type"].startswith("application/xml")
    assert r.text.startswith('<?xml') and "<Message>" in r.text and "سفير" in r.text


def test_webhook_escapes_xml(client, twilio, monkeypatch):
    from app.schemas import ChatAction, ChatResponse
    monkeypatch.setattr("app.agent.run_agent", lambda text, history: ChatResponse(answer="A < B & C", lang="en", action=ChatAction.answer))
    params = {"From": "whatsapp:+966500000001", "Body": "what is x?"}
    r = client.post("/api/whatsapp/webhook", data=params, headers=signed(params))
    assert "A &lt; B &amp; C" in r.text


def test_status_page_lists_the_whatsapp_assistant(client):
    items = {i["key"]: i for i in client.get("/api/integrations", headers=TOKEN).json()}
    assert items["whatsapp_assistant"]["state"] == "demo" and items["whatsapp_assistant"]["detail"] == "simulator"

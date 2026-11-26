"""Staff overview: chat_events, numbers on known data, date filters, token checks."""
from datetime import datetime, timedelta, timezone

import pytest
from sqlmodel import Session, select

from app import cases
from app.db import ChatEvent, SupportCase, UnansweredQuestion, engine

STAFF = {"X-Support-Token": "test-token"}
NOW = datetime.now(timezone.utc)


@pytest.fixture(autouse=True)
def _fresh_limiter():
    cases.limiter.reset()


def add(*rows):
    with Session(engine) as s:
        for r in rows:
            s.add(r)
        s.commit()


def ev(action, days_ago=0, **kw):
    return ChatEvent(at=NOW - timedelta(days=days_ago), lang="ar", action=action, **kw)


def day(days_ago=0):
    from app.overview import today
    return (today() - timedelta(days=days_ago)).isoformat()


# ---------- chat_events ----------
def test_chat_records_an_event_without_the_message_text(client):
    secret = "سؤال سري جدًا عن رسوم الاشتراك 0551234567"
    r = client.post("/api/chat", json={"message": secret})
    assert r.status_code == 200
    event_id = r.json()["chat_event_id"]
    with Session(engine) as s:
        rows = s.exec(select(ChatEvent)).all()
    assert len(rows) == 1 and rows[0].id == event_id
    dumped = str(rows[0].model_dump())
    assert "سري" not in dumped and "0551234567" not in dumped
    assert set(ChatEvent.model_fields) == {"id", "at", "lang", "action", "from_faq", "sourced", "tier_id",
                                           "register_clicked", "case_created", "demo"}


def test_recommendation_and_register_click(client):
    r = client.post("/api/chat", json={"message": "أريد عضوية تمنحني حق التصويت"}).json()
    assert r["action"] == "recommend"
    assert client.post(f"/api/chat-events/{r['chat_event_id']}/register").status_code == 204
    assert client.post("/api/chat-events/unknown/register").status_code == 204  # silent, no info leak
    with Session(engine) as s:
        event = s.get(ChatEvent, r["chat_event_id"])
    assert event.register_clicked and event.tier_id == r["tier_id"] and event.sourced


def test_escalation_then_case_marks_successful_handoff(client):
    r = client.post("/api/chat", json={"message": "هل يمكن تقسيط رسوم العضوية على دفعات شهرية؟"}).json()
    assert r["action"] == "escalate"
    client.post("/api/support-cases", json={"question": "x", "language": "ar", "anonymous": True,
                                            "category": "unanswered", "chat_event_id": r["chat_event_id"]})
    with Session(engine) as s:
        assert s.get(ChatEvent, r["chat_event_id"]).case_created


# ---------- Numbers on known data ----------
def test_overview_numbers(client):
    add(ev("answer", sourced=True, from_faq=True), ev("answer", sourced=True), ev("answer"),
        ev("recommend", sourced=True, register_clicked=True), ev("recommend", sourced=True),
        ev("escalate", case_created=True), ev("escalate"), ev("escalate"),
        ev("verify"), ev("answer", days_ago=20, sourced=True))  # outside the default 7 days
    add(SupportCase(question="q", language="ar", contact="", status="new"),
        SupportCase(question="q", language="ar", contact="", status="new", created_at=NOW - timedelta(days=6)),
        SupportCase(question="q", language="ar", contact="", status="in_progress"),
        SupportCase(question="q", language="ar", contact="", status="closed"))
    o = client.get("/api/overview", headers=STAFF).json()
    assert o["questions"] == 9 and o["questions_today"] == 9
    assert o["answered"] == {"value": 55.6, "numerator": 5, "denominator": 9}
    assert o["escalated"] == {"value": 33.3, "numerator": 3, "denominator": 9}
    assert o["verified_answers"]["numerator"] == 4
    assert o["handoff_success"] == {"value": 33.3, "numerator": 1, "denominator": 3}
    assert o["register_after_recommend"] == {"value": 50.0, "numerator": 1, "denominator": 2}
    assert o["open_cases"] == 3 and o["overdue_cases"] == 1
    assert len(o["daily"]) == 14 and o["daily"][-1] == {"date": day(), "total": 9, "escalated": 3}
    assert len(o["recent_cases"]) == 4


def test_empty_overview_has_no_division_by_zero(client):
    o = client.get("/api/overview", headers=STAFF).json()
    assert o["questions"] == 0 and o["answered"]["value"] is None and o["handoff_success"]["value"] is None


def test_top_unanswered_is_limited_to_five_by_count(client):
    add(*[UnansweredQuestion(key=f"k{i}", question=f"سؤال {i}", count=i) for i in range(1, 8)])
    top = client.get("/api/overview", headers=STAFF).json()["top_unanswered"]
    assert [q["count"] for q in top] == [7, 6, 5, 4, 3]


# ---------- Date filter ----------
def test_date_filter_changes_overview(client):
    add(ev("answer"), ev("escalate", days_ago=3), ev("answer", days_ago=10))
    today_only = client.get(f"/api/overview?date_from={day()}&date_to={day()}", headers=STAFF).json()
    week = client.get(f"/api/overview?date_from={day(6)}&date_to={day()}", headers=STAFF).json()
    month = client.get(f"/api/overview?date_from={day(29)}&date_to={day()}", headers=STAFF).json()
    assert (today_only["questions"], week["questions"], month["questions"]) == (1, 2, 3)
    assert today_only["escalated"]["numerator"] == 0 and week["escalated"]["numerator"] == 1


def test_date_filter_on_cases_unanswered_and_csv(client):
    add(SupportCase(question="جديد", language="ar", contact=""),
        SupportCase(question="قديم", language="ar", contact="", created_at=NOW - timedelta(days=12)),
        UnansweredQuestion(key="a", question="حديث", count=2),
        UnansweredQuestion(key="b", question="قديم جدًا", count=9, last_seen=NOW - timedelta(days=12)))
    q = f"date_from={day(6)}&date_to={day()}"
    assert [c["question"] for c in client.get(f"/api/support-cases?{q}", headers=STAFF).json()] == ["جديد"]
    assert len(client.get("/api/support-cases", headers=STAFF).json()) == 2
    assert [u["question"] for u in client.get(f"/api/unanswered?{q}", headers=STAFF).json()] == ["حديث"]
    assert client.get(f"/api/unanswered/stats?{q}", headers=STAFF).json()["pending"] == 1
    csv_cases = client.get(f"/api/support-cases/export.csv?{q}", headers=STAFF).text
    assert "جديد" in csv_cases and "قديم" not in csv_cases
    csv_q = client.get(f"/api/unanswered/export.csv?{q}", headers=STAFF).text
    assert "حديث" in csv_q and "قديم جدًا" not in csv_q


def test_bad_date_range_is_rejected(client):
    assert client.get(f"/api/overview?date_from={day()}&date_to={day(3)}", headers=STAFF).status_code == 422
    assert client.get("/api/overview?date_from=not-a-date", headers=STAFF).status_code == 422


# ---------- Token ----------
@pytest.mark.parametrize("path", ["/api/overview", "/api/staff/counts", "/api/overview?date_from=2026-11-01"])
def test_overview_endpoints_require_token(client, path):
    assert client.get(path).status_code == 401
    assert client.get(path, headers={"X-Support-Token": "wrong"}).status_code == 401


def test_staff_counts(client):
    add(SupportCase(question="q", language="ar", contact=""),
        SupportCase(question="q", language="ar", contact="", status="closed"))
    assert client.get("/api/staff/counts", headers=STAFF).json() == {"new_cases": 1}

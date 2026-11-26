"""Request loop: tracking code, public tracking, staff reply, next-step text, overdue flag."""
from datetime import datetime, timedelta, timezone

import pytest

from app import cases
from app.db import SupportCase

STAFF = {"X-Support-Token": "test-token", "X-Staff-Name": "%D8%B3%D8%A7%D8%B1%D8%A9"}  # "سارة"


@pytest.fixture(autouse=True)
def _fresh_limiter():
    cases.limiter.reset()
    yield
    cases.limiter.reset()


def make_case(client, **extra):
    body = {"question": "هل يمكن تقسيط رسوم العضوية؟", "language": "ar", "anonymous": True,
            "category": "unanswered", **extra}
    r = client.post("/api/support-cases", json=body)
    assert r.status_code == 201, r.text
    return r.json()


def track(client, reference, code):
    return client.post("/api/track", json={"reference": reference, "code": code})


# ---------- Creation ----------
def test_create_returns_tracking_code_once_and_stores_only_a_hash(client):
    data = make_case(client)
    code = data["tracking_code"]
    assert len(code) == 9 and code[4] == "-"
    assert data["reference"].startswith("CX-") and data["reply_within_days"] == 2
    from sqlmodel import Session
    from app.db import engine
    with Session(engine) as s:
        row = s.get(SupportCase, data["id"])
        assert code not in row.tracking_hash and row.tracking_hash.startswith("pbkdf2$")
    staff = client.get("/api/support-cases", headers=STAFF).json()
    assert "tracking_hash" not in staff[0] and code not in str(staff)


# ---------- Public tracking ----------
def test_track_with_correct_code(client):
    data = make_case(client)
    r = track(client, data["reference"], data["tracking_code"])
    assert r.status_code == 200
    body = r.json()
    assert body["reference"] == data["reference"] and body["status"] == "new"
    assert body["category"] == "unanswered" and body["reply"] is None


def test_track_accepts_lowercase_and_no_dash(client):
    data = make_case(client)
    r = track(client, data["reference"].lower().replace("-", ""), data["tracking_code"].lower().replace("-", ""))
    assert r.status_code == 200


def test_track_rejects_wrong_code_and_unknown_case_the_same_way(client):
    data = make_case(client)
    wrong = track(client, data["reference"], "AAAA-AAAA")
    unknown = track(client, "CX-000000", data["tracking_code"])
    assert wrong.status_code == unknown.status_code == 404
    assert wrong.json() == unknown.json()


def test_track_limits_failed_attempts(client):
    data = make_case(client)
    for _ in range(5):
        assert track(client, data["reference"], "AAAA-AAAA").status_code == 404
    r = track(client, data["reference"], data["tracking_code"])  # even the right code waits now
    assert r.status_code == 429 and int(r.headers["Retry-After"]) > 0


def test_track_response_has_no_personal_data(client):
    data = make_case(client, anonymous=False, contact="visitor@example.com",
                     question="طلب اختبار نصه خاص", summary="ملخص خاص", category="complaint")
    client.post(f"/api/support-cases/{data['id']}/reply", json={"reply": "تمت معالجة شكواك."}, headers=STAFF)
    body = track(client, data["reference"], data["tracking_code"]).json()
    text = str(body)
    for private in ("visitor@example.com", "طلب اختبار نصه خاص", "ملخص خاص", "سارة"):
        assert private not in text
    assert set(body) == {"reference", "category", "status", "created_at", "updated_at",
                         "replied_at", "reply", "due_at"}


# ---------- Staff reply ----------
def test_staff_reply_reaches_the_visitor(client):
    data = make_case(client)
    r = client.post(f"/api/support-cases/{data['id']}/reply", json={"reply": "  نعم، يمكن التقسيط على دفعتين.  "},
                    headers=STAFF)
    assert r.status_code == 200
    staff_view = r.json()
    assert staff_view["status"] == "replied" and staff_view["replied_by"] == "سارة"
    body = track(client, data["reference"], data["tracking_code"]).json()
    assert body["status"] == "replied" and body["reply"] == "نعم، يمكن التقسيط على دفعتين."
    assert body["replied_at"]
    log = client.get(f"/api/audit-log?target_id={data['id']}", headers=STAFF).json()
    assert log[0]["action"] == "case.reply" and log[0]["actor"] == "سارة"


def test_reply_endpoint_requires_support_token(client):
    data = make_case(client)
    for headers in ({}, {"X-Support-Token": "wrong"}):
        r = client.post(f"/api/support-cases/{data['id']}/reply", json={"reply": "رد"}, headers=headers)
        assert r.status_code == 401
    assert client.get(f"/api/support-cases/{data['id']}").status_code == 401
    assert track(client, data["reference"], data["tracking_code"]).json()["reply"] is None


def test_reply_validation_and_missing_case(client):
    data = make_case(client)
    assert client.post(f"/api/support-cases/{data['id']}/reply", json={"reply": "  "}, headers=STAFF).status_code == 422
    assert client.post("/api/support-cases/nope/reply", json={"reply": "رد كافٍ"}, headers=STAFF).status_code == 404


def test_staff_case_detail(client):
    data = make_case(client, anonymous=False, contact="0551234567")
    r = client.get(f"/api/support-cases/{data['id']}", headers=STAFF)
    assert r.status_code == 200 and r.json()["contact"] == "0551234567" and r.json()["overdue"] is False


# ---------- Next-step text per type ----------
EXPECTED = {
    ("unanswered", True): "سيراجع فريق الدعم سؤالك ويرد عليك خلال يومي عمل عبر وسيلة التواصل التي زوّدتنا بها، ويظهر الرد أيضًا في «طلباتي».",
    ("unanswered", False): "سيراجع فريق الدعم سؤالك ويضيف إجابته إلى الأسئلة الشائعة. تابع الرد خلال يومي عمل في «طلباتي» أو برقم الحالة ورمز المتابعة.",
    ("inquiry", True): "سيجيب فريق الجمعية عن استفسارك خلال يومي عمل عبر وسيلة التواصل التي زوّدتنا بها، ويظهر الرد أيضًا في «طلباتي».",
    ("inquiry", False): "سيجيب فريق الجمعية عن استفسارك خلال يومي عمل. تابع الرد في «طلباتي» أو برقم الحالة ورمز المتابعة.",
    ("complaint", True): "ستُحال شكواك إلى المختص لدراستها، وسيتواصل معك الفريق خلال يومي عمل لإبلاغك بالإجراء المتخذ.",
    ("complaint", False): "ستُحال شكواك إلى المختص لدراستها، ويُنشر الإجراء المتخذ خلال يومي عمل في «طلباتي». لن نتمكن من التواصل معك مباشرة لأنك لم تترك وسيلة تواصل.",
    ("suggestion", True): "سيدرس فريق الجمعية مقترحك ويرد عليك خلال يومي عمل عبر وسيلة التواصل التي زوّدتنا بها، وقد يتواصل معك للاستيضاح.",
    ("suggestion", False): "سيدرس فريق الجمعية مقترحك، ويظهر رده خلال يومي عمل في «طلباتي».",
    ("service", True): "سيتولى فريق الجمعية طلبك ويتواصل معك خلال يومي عمل لإكماله، وقد يطلب منك معلومات إضافية.",
    ("service", False): "سيراجع فريق الجمعية طلبك ويرد عليه خلال يومي عمل في «طلباتي». قد يتعذر إكمال بعض الخدمات دون وسيلة تواصل.",
}


@pytest.mark.parametrize("category,has_contact", list(EXPECTED))
def test_confirmation_text_per_type(client, category, has_contact):
    extra = {"anonymous": False, "contact": "visitor@example.com"} if has_contact else {}
    data = make_case(client, category=category, **extra)
    assert data["category"] == category
    assert data["next_step"]["ar"] == EXPECTED[(category, has_contact)]
    assert "within 2 business days" in data["next_step"]["en"]


def test_reply_time_phrases():
    assert cases.reply_time("ar", 1) == "خلال يوم عمل واحد"
    assert cases.reply_time("ar", 3) == "خلال 3 أيام عمل"
    assert cases.reply_time("en", 1) == "within 1 business day"


# ---------- Overdue ("reply needed") ----------
def test_due_date_skips_the_saudi_weekend():
    thursday = datetime(2026, 11, 26, 9, 0, tzinfo=timezone.utc)  # Thursday
    assert cases.due_at(thursday).weekday() == 0  # Fri and Sat skipped: Sun (1), Mon (2)


def test_overdue_flag_on_old_new_cases_only(client):
    old = make_case(client)
    fresh = make_case(client)
    from sqlmodel import Session
    from app.db import engine
    with Session(engine) as s:
        row = s.get(SupportCase, old["id"])
        row.created_at = datetime.now(timezone.utc) - timedelta(days=6)
        s.add(row)
        s.commit()
    flags = {c["id"]: c["overdue"] for c in client.get("/api/support-cases", headers=STAFF).json()}
    assert flags == {old["id"]: True, fresh["id"]: False}
    client.post(f"/api/support-cases/{old['id']}/reply", json={"reply": "تم الرد على طلبك."}, headers=STAFF)
    flags = {c["id"]: c["overdue"] for c in client.get("/api/support-cases", headers=STAFF).json()}
    assert flags[old["id"]] is False

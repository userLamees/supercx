"""Demo data for showing the staff dashboard. Run: python -m app.seed_demo

- The sample unanswered questions from the v2 design (left as they are if present).
- Chat events and support requests spread over the last 14 days, so the overview chart
  and numbers have something to show. These rows are marked demo=True and are replaced
  on every run (real rows are never touched). No real people: contacts use example.com.
"""
import random
from datetime import datetime, timedelta, timezone

from sqlmodel import Session, delete, select

from . import config, notify
from .cases import hash_code, new_tracking_code
from .db import ChatEvent, Notification, SupportCase, UnansweredQuestion, engine, init_db
from .redact import normalize_key
from .rules_agent import TIER_AFFILIATE, TIER_AMBASSADOR, TIER_SUPPORTER

SAMPLES = [  # (question, times asked, hours ago) from the design
    ("كيف أجدد عضويتي بعد انتهائها؟", 24, 1),
    ("هل تتوفر عضوية للجهات والشركات؟", 18, 3),
    ("كيف أحصل على شهادة حضور فعالية؟", 12, 20),
    ("ما شروط المشاركة في التطوع؟", 9, 22),
    ("كيف أحدّث رقم الجوال المسجّل؟", 6, 140),
]

DEMO_CASES = [  # (category, language, question)
    ("unanswered", "ar", "هل يمكن تقسيط رسوم العضوية على دفعات؟"),
    ("inquiry", "ar", "متى يبدأ التسجيل في المؤتمر السنوي؟"),
    ("complaint", "ar", "لم تصلني بطاقة العضوية بعد التسجيل."),
    ("suggestion", "ar", "أقترح إضافة جلسات إرشاد مهني شهرية للأعضاء."),
    ("service", "ar", "أرغب في تحديث اسم الجهة في شهادة العضوية."),
    ("unanswered", "en", "Do you offer a discount for teams of five or more?"),
    ("inquiry", "en", "Are the workshops recorded for members who can't attend?"),
    ("complaint", "ar", "رابط الدفع لا يعمل من الجوال."),
    ("suggestion", "en", "Please add an English version of the monthly newsletter."),
    ("service", "ar", "أحتاج خطاب تعريف بالعضوية لجهة عملي."),
]
REPLIES = {"ar": "شكرًا لتواصلك. تمت مراجعة طلبك وسيصلك التحديث عبر «طلباتي».",
           "en": "Thank you for reaching out. We reviewed your request; updates will appear in My requests."}
TIERS = [TIER_AFFILIATE, TIER_AMBASSADOR, TIER_SUPPORTER]
DEMO_BASE_URL = config.PUBLIC_BASE_URL or "http://localhost:8000"  # link inside demo messages


def seed_questions(session: Session) -> int:
    existing = set(session.exec(select(UnansweredQuestion.key)).all())
    now = datetime.now(timezone.utc)
    added = 0
    for question, count, hours in SAMPLES:
        key = normalize_key(question)
        if key in existing:
            continue
        session.add(UnansweredQuestion(key=key, question=question, count=count, last_seen=now - timedelta(hours=hours)))
        added += 1
    return added


def seed_activity(session: Session, days: int = 14, seed: int = 7) -> tuple[int, int]:
    """Replaces previous demo chat events and demo requests with fresh ones over `days` days."""
    rng = random.Random(seed)
    session.exec(delete(ChatEvent).where(ChatEvent.demo == True))  # noqa: E712
    demo_cases = select(SupportCase.id).where(SupportCase.demo == True)  # noqa: E712
    session.exec(delete(Notification).where(Notification.case_id.in_(demo_cases)))
    session.exec(delete(SupportCase).where(SupportCase.demo == True))  # noqa: E712
    now = datetime.now(timezone.utc)
    events = cases = 0
    for day in range(days):
        start = now - timedelta(days=day)
        for _ in range(rng.randint(8, 28) + (days - day) // 3):  # gentle growth towards today
            at = start - timedelta(minutes=rng.randint(0, 600))
            action = rng.choices(["answer", "recommend", "escalate", "verify"], [45, 20, 25, 10])[0]
            answered = action in ("answer", "recommend")
            session.add(ChatEvent(
                at=at, lang=rng.choices(["ar", "en"], [80, 20])[0], action=action, demo=True,
                sourced=answered and rng.random() < 0.88,
                from_faq=action == "answer" and rng.random() < 0.55,
                tier_id=rng.choice(TIERS) if action == "recommend" else None,
                register_clicked=action == "recommend" and rng.random() < 0.35,
                case_created=action == "escalate" and rng.random() < 0.55))
            events += 1
        for _ in range(rng.choices([0, 1, 2, 3], [20, 40, 30, 10])[0]):
            category, lang, question = rng.choice(DEMO_CASES)
            created = start - timedelta(minutes=rng.randint(0, 600))
            if day <= 1:
                status = "new"
            else:
                status = rng.choices(["new", "in_progress", "replied", "closed"], [15, 20, 45, 20])[0]
            replied = status in ("replied", "closed")
            case = SupportCase(
                question=question, summary=question, language=lang, category=category, demo=True,
                contact=rng.choice(["", f"member{rng.randint(1, 99)}@example.com"]),
                created_at=created, updated_at=created + timedelta(hours=rng.randint(2, 40)) if status != "new" else created,
                status=status, tracking_hash=hash_code(new_tracking_code()),
                reply=REPLIES[lang] if replied else None,
                replied_at=created + timedelta(hours=rng.randint(3, 40)) if replied else None,
                replied_by="فريق الدعم (تجريبي)" if replied else None)
            session.add(case)
            if replied:  # the user was told by email: kept in the demo outbox, nothing is sent
                note = notify.queue_reply(session, case, DEMO_BASE_URL)
                if note is not None and note.status == "pending":
                    note.status, note.demo, note.attempts = "simulated", True, 1
                    note.created_at = note.sent_at = case.replied_at
            cases += 1
    return events, cases


def main() -> None:
    init_db()
    with Session(engine) as session:
        added = seed_questions(session)
        events, cases = seed_activity(session)
        session.commit()
    print(f"Added {added} demo questions, {events} demo chat events and {cases} demo requests (last 14 days).")


if __name__ == "__main__":
    main()

"""Loads the sample unanswered questions from the v2 design into the dev database.

Demo data only, for showing the staff dashboard. Run: python -m app.seed_demo
Questions that are already present are left as they are.
"""
from datetime import datetime, timedelta, timezone

from sqlmodel import Session, select

from .db import UnansweredQuestion, engine, init_db
from .redact import normalize_key

SAMPLES = [  # (question, times asked, hours ago) from the design
    ("كيف أجدد عضويتي بعد انتهائها؟", 24, 1),
    ("هل تتوفر عضوية للجهات والشركات؟", 18, 3),
    ("كيف أحصل على شهادة حضور فعالية؟", 12, 20),
    ("ما شروط المشاركة في التطوع؟", 9, 22),
    ("كيف أحدّث رقم الجوال المسجّل؟", 6, 140),
]


def main() -> None:
    init_db()
    with Session(engine) as session:
        existing = set(session.exec(select(UnansweredQuestion.key)).all())
        now = datetime.now(timezone.utc)
        added = 0
        for question, count, hours in SAMPLES:
            key = normalize_key(question)
            if key in existing:
                continue
            session.add(UnansweredQuestion(key=key, question=question, count=count,
                                           last_seen=now - timedelta(hours=hours)))
            added += 1
        session.commit()
        print(f"Added {added} demo questions.")


if __name__ == "__main__":
    main()

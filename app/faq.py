"""FAQ: demo content from data/faq.json plus entries approved by staff. No agent calls."""
import json
from pathlib import Path

from sqlmodel import Session, select

from .db import FaqEntry
from .schemas import FaqCategory, FaqItem, Localized, Source

FAQ_FILE = Path(__file__).resolve().parent.parent / "data" / "faq.json"


def _base() -> list[dict]:
    return json.loads(FAQ_FILE.read_text(encoding="utf-8"))["categories"]


def category_ids() -> set[str]:
    return {c["id"] for c in _base()}


def get_faq(session: Session) -> list[FaqCategory]:
    categories = [FaqCategory(**c) for c in _base()]
    by_id = {c.id: c for c in categories}
    for e in session.exec(select(FaqEntry).order_by(FaqEntry.created_at)):
        if e.category_id not in by_id:
            continue
        by_id[e.category_id].items.append(FaqItem(
            id=e.id,
            # Staff write in one language; both slots carry it and the UI sets dir="auto".
            question=Localized(ar=e.question, en=e.question),
            answer=Localized(ar=e.answer, en=e.answer),
            source=Source(title=e.source_title, url=e.source_url or ""),
            checked_at=e.created_at.date().isoformat(),
            demo=False,
        ))
    return categories


def approved_count(session: Session) -> int:
    return len(session.exec(select(FaqEntry.id)).all())

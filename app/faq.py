"""FAQ stored in the database (faq_categories, faq_items). No agent calls.

data/faq.json is only the initial content: it is loaded once, when the
tables are empty. Staff-approved answers are added as new rows.
"""
import json
import re
from datetime import date
from pathlib import Path

from sqlmodel import Session, func, select

from .db import FaqCategory as CategoryRow, FaqItem as ItemRow
from .schemas import FaqCategory, FaqItem, Localized, Source

SEED_FILE = Path(__file__).resolve().parent.parent / "data" / "faq.json"
_ARABIC = re.compile(r"[\u0600-\u06FF]")


def seed_faq(session: Session) -> None:
    if session.exec(select(CategoryRow.id)).first():
        return
    data = json.loads(SEED_FILE.read_text(encoding="utf-8"))
    for position, cat in enumerate(data["categories"]):
        session.add(CategoryRow(id=cat["id"], title_ar=cat["title"]["ar"],
                                title_en=cat["title"]["en"], position=position))
        for item in cat["items"]:
            session.add(ItemRow(
                category_id=cat["id"],
                question_ar=item["question"]["ar"], question_en=item["question"]["en"],
                answer_ar=item["answer"]["ar"], answer_en=item["answer"]["en"],
                source_title=item["source"]["title"], source_url=item["source"]["url"] or None,
                checked_at=date.fromisoformat(item["checked_at"]), demo=item.get("demo", True)))
    session.commit()


def _localized(ar: str | None, en: str | None) -> Localized:
    # Staff write in one language; the other slot falls back to it (the UI sets dir="auto").
    return Localized(ar=ar or en or "", en=en or ar or "")


def category_ids(session: Session) -> set[str]:
    return set(session.exec(select(CategoryRow.id)).all())


def get_faq(session: Session) -> list[FaqCategory]:
    cats = session.exec(select(CategoryRow).order_by(CategoryRow.position)).all()
    items = session.exec(select(ItemRow).order_by(ItemRow.created_at)).all()
    return [FaqCategory(
        id=c.id, title=Localized(ar=c.title_ar, en=c.title_en),
        items=[FaqItem(id=i.id, question=_localized(i.question_ar, i.question_en),
                       answer=_localized(i.answer_ar, i.answer_en),
                       source=Source(title=i.source_title, url=i.source_url or ""),
                       checked_at=i.checked_at.isoformat(), demo=i.demo)
               for i in items if i.category_id == c.id],
    ) for c in cats]


def add_approved(session: Session, *, category_id: str, question: str, answer: str,
                 source_title: str, source_url: str | None, unanswered_id: str) -> ItemRow:
    lang = "ar" if _ARABIC.search(question + answer) else "en"
    item = ItemRow(category_id=category_id, source_title=source_title, source_url=source_url,
                   checked_at=date.today(), demo=False, unanswered_id=unanswered_id,
                   **{f"question_{lang}": question, f"answer_{lang}": answer})
    session.add(item)
    return item


def approved_count(session: Session) -> int:
    return session.exec(select(func.count()).select_from(ItemRow).where(ItemRow.demo == False)).one()  # noqa: E712

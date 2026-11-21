"""Database models and session handling (SQLite locally, Postgres on Replit)."""
from datetime import date, datetime, timezone
from typing import Optional
from uuid import uuid4

from sqlmodel import Field, Session, SQLModel, create_engine

from .config import DATABASE_URL
from .schemas import CaseStatus


def _now() -> datetime:
    return datetime.now(timezone.utc)


class SupportCase(SQLModel, table=True):
    __tablename__ = "support_cases"

    id: str = Field(default_factory=lambda: str(uuid4()), primary_key=True)
    created_at: datetime = Field(default_factory=_now, index=True)
    updated_at: datetime = Field(default_factory=_now)
    question: str
    language: str
    contact: str
    tier_id: Optional[str] = Field(default=None, index=True)
    summary: Optional[str] = None
    status: CaseStatus = Field(default=CaseStatus.new, index=True)


class UnansweredQuestion(SQLModel, table=True):
    """Questions the agent escalated, grouped by normalized text for the staff dashboard."""
    __tablename__ = "unanswered_questions"

    id: str = Field(default_factory=lambda: str(uuid4()), primary_key=True)
    key: str = Field(index=True, unique=True)
    question: str
    count: int = 1
    first_seen: datetime = Field(default_factory=_now)
    last_seen: datetime = Field(default_factory=_now, index=True)
    resolved: bool = Field(default=False, index=True)


class FaqCategory(SQLModel, table=True):
    __tablename__ = "faq_categories"

    id: str = Field(primary_key=True)          # stable slug, e.g. "memberships"
    title_ar: str
    title_en: str
    position: int = 0


class FaqItem(SQLModel, table=True):
    """One FAQ entry. Seeded from data/faq_seed.json, then added to by staff."""
    __tablename__ = "faq_items"

    id: str = Field(default_factory=lambda: str(uuid4()), primary_key=True)
    created_at: datetime = Field(default_factory=_now, index=True)
    category_id: str = Field(foreign_key="faq_categories.id", index=True)
    question_ar: Optional[str] = None
    question_en: Optional[str] = None
    answer_ar: Optional[str] = None
    answer_en: Optional[str] = None
    source_title: str
    source_url: Optional[str] = None
    checked_at: date
    demo: bool = True                          # not yet approved by the association
    unanswered_id: Optional[str] = None        # set when promoted from an unanswered question


_connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
engine = create_engine(DATABASE_URL, connect_args=_connect_args)


def init_db() -> None:
    SQLModel.metadata.create_all(engine)


def get_session():
    with Session(engine) as session:
        yield session

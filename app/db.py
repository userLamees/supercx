"""Database models and session handling (SQLite locally, Postgres on Replit)."""
from datetime import datetime, timezone
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


_connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
engine = create_engine(DATABASE_URL, connect_args=_connect_args)


def init_db() -> None:
    SQLModel.metadata.create_all(engine)


def get_session():
    with Session(engine) as session:
        yield session

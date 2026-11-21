"""Staff action log (idea 66). The dashboard uses one shared token, so `actor` is the
name the staff member typed at sign-in; it identifies, it does not authenticate."""
import re

from fastapi import Header
from sqlmodel import Session, select

from .db import AuditEntry
from .schemas import AuditOut


def staff_name(x_staff_name: str = Header(default="")) -> str:
    # Header values are latin-1; the dashboard sends the name URI-encoded.
    from urllib.parse import unquote
    return re.sub(r"[\x00-\x1f]", "", unquote(x_staff_name)).strip()[:80]


def log(session: Session, actor: str, action: str, target_type: str = "", target_id: str = "",
        summary: str = "") -> None:
    session.add(AuditEntry(actor=actor, action=action, target_type=target_type,
                           target_id=target_id, summary=summary[:300]))


def entries(session: Session, target_id: str | None = None, limit: int = 100) -> list[AuditOut]:
    query = select(AuditEntry).order_by(AuditEntry.at.desc()).limit(limit)
    if target_id:
        query = query.where(AuditEntry.target_id == target_id)
    return [AuditOut(at=e.at.isoformat(), actor=e.actor, action=e.action, target_type=e.target_type,
                     target_id=e.target_id, summary=e.summary) for e in session.exec(query)]


def last_by_target(session: Session, target_type: str) -> dict[str, AuditEntry]:
    rows = session.exec(select(AuditEntry).where(AuditEntry.target_type == target_type)
                        .order_by(AuditEntry.at)).all()
    return {r.target_id: r for r in rows}  # later rows overwrite earlier ones

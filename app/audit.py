"""Staff action log (idea 66). `actor` is the signed-in staff account (its name, plus its id),
or, with the shared SUPPORT_TOKEN, the name typed at sign-in."""
from fastapi import Depends
from sqlmodel import Session, select

from . import staff as staff_accounts
from .db import AuditEntry
from .schemas import AuditOut


class Actor(str):
    """The staff name as a string (used as "replied by"), carrying the account id for the log."""
    id: str | None = None


def staff_name(who: staff_accounts.Staff = Depends(staff_accounts.current)) -> Actor:
    actor = Actor(who.name)
    actor.id = who.id
    return actor


def log(session: Session, actor: str, action: str, target_type: str = "", target_id: str = "",
        summary: str = "") -> None:
    session.add(AuditEntry(actor=str(actor), actor_id=getattr(actor, "id", None), action=action,
                           target_type=target_type, target_id=target_id, summary=summary[:300]))


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

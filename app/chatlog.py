"""What the assistant did, for the staff dashboard; shared by the website chat and WhatsApp.
Never stores the message text, except unanswered questions (redacted) for the FAQ learning list."""
from datetime import datetime, timezone

from sqlmodel import Session, select

from . import overview
from .db import ChatEvent, UnansweredQuestion
from .redact import normalize_key, redact
from .schemas import ChatAction, ChatResponse


def record_unanswered(session: Session, message: str) -> None:
    question = redact(message)[:500]
    key = normalize_key(question)
    if not key:
        return
    row = session.exec(select(UnansweredQuestion).where(UnansweredQuestion.key == key)).first()
    if row:
        row.count += 1
        row.last_seen = datetime.now(timezone.utc)
        row.resolved = False
    else:
        row = UnansweredQuestion(key=key, question=question)
    session.add(row)
    session.commit()


def record_chat_event(session: Session, reply: ChatResponse, channel: str = "web") -> str:
    """Overview numbers. Stores what the agent did, never the message text."""
    titles = overview.faq_source_titles(session) if reply.sources else set()
    event = ChatEvent(lang=reply.lang, action=reply.action.value, tier_id=reply.tier_id, channel=channel,
                      sourced=bool(reply.sources) and reply.action != ChatAction.escalate,
                      from_faq=any(src.title in titles for src in reply.sources))
    session.add(event)
    session.commit()
    return event.id

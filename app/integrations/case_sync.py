"""Support cases sent on to the association's system, so the team can work from there too.

Events: case.created (new request), case.replied (the team replied), case.status (status changed).

Modes (CASE_SYNC):
- off      nothing is sent; cases live in this app only
- demo     the default: the exact payload is kept in an outbox that staff can read, nothing leaves
- webhook  JSON POST to CASE_WEBHOOK_URL, signed with CASE_WEBHOOK_SECRET:
               X-SuperCX-Event: case.created
               X-SuperCX-Signature: sha256=<hex HMAC-SHA256 of the raw body>
               X-SuperCX-Delivery: <unique id, for de-duplication>
           A 2xx answer counts as delivered; {"external_id": "..."} in the answer is kept.
- email    a plain-text message to CASE_EMAIL_TO through the SMTP settings

Privacy: the request text is already redacted when saved (no phone numbers or emails), the
contact is included only because the visitor gave it with consent to be contacted, and the
tracking code is never sent. Sending runs after the response; a failure never loses the case.
"""
import hashlib
import hmac
import json
import logging
import smtplib
from datetime import datetime, timezone
from email.message import EmailMessage
from typing import Optional

import httpx
from sqlmodel import Session, select

from .. import cases, config, otp
from ..db import CaseSync, SupportCase, engine

log = logging.getLogger(__name__)

MODES = ("off", "demo", "webhook", "email")
MAX_ATTEMPTS = 5
_CATEGORY_AR = {"unanswered": "سؤال غير مجاب", "inquiry": "استفسار", "complaint": "شكوى",
                "suggestion": "مقترح", "service": "طلب خدمة"}
_STATUS_AR = {"new": "جديد", "in_progress": "قيد المعالجة", "replied": "تم الرد", "closed": "مغلق"}


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _iso(dt: Optional[datetime]) -> Optional[str]:
    if dt is None:
        return None
    return (dt if dt.tzinfo else dt.replace(tzinfo=timezone.utc)).isoformat()


def mode() -> str:
    return config.CASE_SYNC if config.CASE_SYNC in MODES else "demo"


def configured() -> bool:
    m = mode()
    if m == "webhook":
        return bool(config.CASE_WEBHOOK_URL and config.CASE_WEBHOOK_SECRET)
    if m == "email":
        return bool(config.CASE_EMAIL_TO) and otp.email_configured()
    return True


def target() -> str:
    """Where an event goes now: webhook | email | demo (a live mode without its settings is demo)."""
    m = mode()
    return m if m in ("webhook", "email") and configured() else "demo"


def payload(case: SupportCase, event: str) -> dict:
    status = case.status.value if hasattr(case.status, "value") else str(case.status)
    data = {
        "event": event,
        "case": {
            "id": case.id,
            "reference": cases.case_reference(case.id),
            "category": case.category or "inquiry",
            "status": status,
            "language": case.language,
            "question": case.question,          # redacted when saved
            "summary": case.summary,
            "contact": case.contact or None,    # only given with consent to be contacted
            "tier_id": case.tier_id,
            "created_at": _iso(case.created_at),
            "updated_at": _iso(case.updated_at),
            "due_at": _iso(cases.due_at(case.created_at)),
        },
    }
    if event == "case.replied":
        data["case"]["reply"] = case.reply
        data["case"]["replied_at"] = _iso(case.replied_at)
    return data


def sign(body: bytes) -> str:
    return "sha256=" + hmac.new(config.CASE_WEBHOOK_SECRET.encode(), body, hashlib.sha256).hexdigest()


# ---------- senders (tests replace these) ----------
def send_webhook(body: bytes, event: str, delivery_id: str) -> Optional[str]:
    response = httpx.post(config.CASE_WEBHOOK_URL, content=body, timeout=15, headers={
        "Content-Type": "application/json", "X-SuperCX-Event": event,
        "X-SuperCX-Delivery": delivery_id, "X-SuperCX-Signature": sign(body)})
    response.raise_for_status()
    try:
        return (response.json() or {}).get("external_id")
    except ValueError:
        return None


def send_email(subject: str, text: str) -> None:
    msg = EmailMessage()
    msg["Subject"], msg["From"], msg["To"] = subject, config.SMTP_FROM, config.CASE_EMAIL_TO
    msg.set_content(text)
    smtp_cls = smtplib.SMTP_SSL if config.SMTP_SSL else smtplib.SMTP
    with smtp_cls(config.SMTP_HOST, config.SMTP_PORT, timeout=15) as smtp:
        if not config.SMTP_SSL:
            smtp.starttls()
        if config.SMTP_USERNAME:
            smtp.login(config.SMTP_USERNAME, config.SMTP_PASSWORD)
        smtp.send_message(msg)


SENDERS = {"webhook": send_webhook, "email": send_email}


def email_text(data: dict) -> tuple[str, str]:
    c = data["case"]
    kind = {"case.created": "طلب جديد", "case.replied": "رد على طلب", "case.status": "تغيّر حالة طلب"}[data["event"]]
    subject = f"{kind} {c['reference']} · {_CATEGORY_AR.get(c['category'], c['category'])}"
    lines = [f"رقم الحالة: {c['reference']}", f"النوع: {_CATEGORY_AR.get(c['category'], c['category'])}",
             f"الحالة: {_STATUS_AR.get(c['status'], c['status'])}", f"اللغة: {c['language']}",
             f"وسيلة التواصل: {c['contact'] or 'لم يترك وسيلة تواصل'}", f"الرد المتوقع قبل: {c['due_at']}",
             "", "نص الطلب:", c["question"]]
    if c.get("summary") and c["summary"] != c["question"]:
        lines += ["", "الملخص:", c["summary"]]
    if c.get("reply"):
        lines += ["", "رد الفريق:", c["reply"]]
    lines += ["", "أُرسلت هذه الرسالة آليًا من SuperCX."]
    return subject, "\n".join(lines)


# ---------- queue and deliver ----------
def queue(session: Session, case: SupportCase, event: str) -> Optional[CaseSync]:
    """Adds a CaseSync for the event (not committed). None when syncing is off."""
    if mode() == "off":
        return None
    where = target()
    row = CaseSync(case_id=case.id, event=event, target=where, demo=where == "demo",
                   payload=json.dumps(payload(case, event), ensure_ascii=False))
    session.add(row)
    return row


def deliver(sync_id: str) -> None:
    """Sends one queued event in its own session (runs after the response)."""
    with Session(engine) as session:
        row = session.get(CaseSync, sync_id)
        if row is None or row.status not in ("pending", "failed"):
            return
        row.attempts += 1
        if row.target == "demo":
            row.status, row.sent_at, row.error = "simulated", _now(), None
        else:
            try:
                if row.target == "webhook":
                    external = SENDERS["webhook"](row.payload.encode(), row.event, row.id)
                    row.external_id = external or row.external_id
                else:
                    SENDERS["email"](*email_text(json.loads(row.payload)))
                row.status, row.sent_at, row.error = "sent", _now(), None
            except Exception as exc:  # noqa: BLE001 (any delivery error is recorded, never raised)
                log.warning("case sync %s failed: %s", row.id, type(exc).__name__)
                row.status, row.error = "failed", type(exc).__name__[:80]
        session.add(row)
        session.commit()


def retry(session: Session, case: SupportCase) -> Optional[CaseSync]:
    """Staff "send again": retries the last failed event, or sends the case again as created."""
    last = session.exec(select(CaseSync).where(CaseSync.case_id == case.id)
                        .order_by(CaseSync.created_at.desc())).first()
    if last is not None and last.status == "failed" and last.attempts < MAX_ATTEMPTS:
        last.status = "pending"
        session.add(last)
        return last
    return queue(session, case, "case.created")


def for_case(session: Session, case_id: str) -> list[CaseSync]:
    return list(session.exec(select(CaseSync).where(CaseSync.case_id == case_id)
                             .order_by(CaseSync.created_at.desc())))

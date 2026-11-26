"""Tell the visitor that the team replied to their case, by email (SMTP) or WhatsApp (Twilio).

- The channel follows the contact the visitor gave with consent: an email address or a Saudi mobile.
- The message carries the case number and a link to "My requests" only. The reply itself stays
  behind the tracking code, and the tracking code is never sent (only its hash is stored).
- With a provider configured the message is sent for real. Without one, it is kept in a demo
  outbox (status "simulated") that staff can read, so the whole flow works with demo data.
- Every attempt is a Notification row: staff see whether it was sent, simulated, skipped or failed,
  and can send it again. A failed send never undoes the reply.
"""
import json
import logging
import smtplib
from datetime import datetime, timezone
from email.message import EmailMessage
from typing import Optional
from urllib.parse import quote

import httpx
from sqlmodel import Session, select

from . import config, otp
from .cases import case_reference
from .db import Notification, SupportCase, engine
from .verify import normalize_email, normalize_phone

log = logging.getLogger(__name__)

MAX_ATTEMPTS = 5

_TEXT = {
    "ar": {
        "subject": "رد فريق جمعية تجربة العميل على طلبك {ref}",
        "body": ("مرحبًا،\n\nرد فريق جمعية تجربة العميل على طلبك رقم {ref}.\n"
                 "لقراءة الرد افتح الرابط وأدخل رمز المتابعة الذي ظهر لك عند الإرسال:\n{link}\n\n"
                 "لا تشارك رمز المتابعة مع أحد. هذه رسالة آلية من SuperCX."),
        "whatsapp": "رد فريق جمعية تجربة العميل على طلبك رقم {ref}. اقرأ الرد برمز المتابعة: {link}",
    },
    "en": {
        "subject": "The Customer Experience Association replied to your request {ref}",
        "body": ("Hello,\n\nThe Customer Experience Association team replied to your request {ref}.\n"
                 "To read the reply, open the link and enter the tracking code you were given when you sent it:\n{link}\n\n"
                 "Don't share your tracking code with anyone. This is an automated message from SuperCX."),
        "whatsapp": "The Customer Experience Association replied to your request {ref}. Read it with your tracking code: {link}",
    },
}


def _now() -> datetime:
    return datetime.now(timezone.utc)


# ---------- channel and recipient ----------
def route(contact: str) -> tuple[str, Optional[str]]:
    """('email', address) | ('whatsapp', '+9665XXXXXXXX') | ('none', None)."""
    contact = (contact or "").strip()
    if not contact:
        return "none", None
    if "@" in contact:
        email = normalize_email(contact)
        return ("email", email) if email else ("none", None)
    phone = normalize_phone(contact)
    return ("whatsapp", f"+966{phone}") if phone else ("none", None)


def mask(channel: str, to: Optional[str]) -> str:
    if not to:
        return ""
    if channel == "email":
        name, _, domain = to.partition("@")
        return f"{name[:1]}***@{domain}"
    return f"{to[:5]}{'*' * (len(to) - 7)}{to[-2:]}"


def provider_ready(channel: str) -> bool:
    return {"email": otp.email_configured, "whatsapp": otp.whatsapp_configured}.get(channel, lambda: False)()


def status_link(base_url: str, ref: str) -> str:
    base = (config.PUBLIC_BASE_URL or base_url or "").rstrip("/")
    return f"{base}/?track={quote(ref)}#requests"


# ---------- senders (tests replace these) ----------
def send_email(to: str, subject: str, body: str) -> None:
    msg = EmailMessage()
    msg["Subject"], msg["From"], msg["To"] = subject, config.SMTP_FROM, to
    msg.set_content(body)
    smtp_cls = smtplib.SMTP_SSL if config.SMTP_SSL else smtplib.SMTP
    with smtp_cls(config.SMTP_HOST, config.SMTP_PORT, timeout=15) as smtp:
        if not config.SMTP_SSL:
            smtp.starttls()
        if config.SMTP_USERNAME:
            smtp.login(config.SMTP_USERNAME, config.SMTP_PASSWORD)
        smtp.send_message(msg)


def send_whatsapp(to: str, body: str, ref: str, link: str) -> None:
    url = f"https://api.twilio.com/2010-04-01/Accounts/{config.TWILIO_ACCOUNT_SID}/Messages.json"
    data = {"From": config.TWILIO_WHATSAPP_FROM, "To": f"whatsapp:{to}"}
    if config.TWILIO_REPLY_TEMPLATE_SID:  # approved template: works outside the 24-hour window
        data["ContentSid"] = config.TWILIO_REPLY_TEMPLATE_SID
        data["ContentVariables"] = json.dumps({"1": ref, "2": link}, ensure_ascii=False)
    else:
        data["Body"] = body
    response = httpx.post(url, auth=(config.TWILIO_ACCOUNT_SID, config.TWILIO_AUTH_TOKEN), timeout=15, data=data)
    response.raise_for_status()


SENDERS = {"email": send_email, "whatsapp": send_whatsapp}


# ---------- queue and deliver ----------
def queue_reply(session: Session, case: SupportCase, base_url: str, update: bool = False) -> Optional[Notification]:
    """Adds a Notification for a reply (not committed). Returns None when notifications are off."""
    if not config.NOTIFY_ON_REPLY:
        return None
    channel, to = route(case.contact)
    lang = case.language if case.language in _TEXT else "ar"
    ref = case_reference(case.id)
    link = status_link(base_url, ref)
    text = _TEXT[lang]
    note = Notification(case_id=case.id, kind="case.reply_update" if update else "case.reply",
                        channel=channel, recipient=mask(channel, to),
                        subject=text["subject"].format(ref=ref) if channel == "email" else "",
                        body=(text["whatsapp"] if channel == "whatsapp" else text["body"]).format(ref=ref, link=link),
                        link=link,
                        demo=channel != "none" and not provider_ready(channel))
    if channel == "none":
        note.status, note.body, note.link = "skipped", "", ""
        note.error = "no_contact" if not (case.contact or "").strip() else "unsupported_contact"
    session.add(note)
    return note


def deliver(notification_id: str) -> None:
    """Sends one queued notification in its own session (runs after the response)."""
    with Session(engine) as session:
        note = session.get(Notification, notification_id)
        if note is None or note.status not in ("pending", "failed"):
            return
        case = session.get(SupportCase, note.case_id)
        _, to = route(case.contact if case else "")
        note.attempts += 1
        if to is None:
            note.status, note.error = "skipped", "no_contact"
        elif not provider_ready(note.channel):
            note.status, note.demo, note.error = "simulated", True, None  # demo outbox: nothing leaves the app
            note.sent_at = _now()
        else:
            try:
                if note.channel == "email":
                    SENDERS["email"](to, note.subject, note.body)
                else:
                    SENDERS["whatsapp"](to, note.body, case_reference(note.case_id), note.link)
                note.status, note.demo, note.error, note.sent_at = "sent", False, None, _now()
            except Exception as exc:  # noqa: BLE001 (any provider error is recorded, never raised)
                log.warning("notification %s failed: %s", note.id, type(exc).__name__)
                note.status, note.error = "failed", type(exc).__name__[:80]
        session.add(note)
        session.commit()


def retry(session: Session, case: SupportCase, base_url: str) -> Optional[Notification]:
    """Staff "send again": retries the last failed attempt, or queues a new message.
    Returns None when notifications are turned off."""
    last = session.exec(select(Notification).where(Notification.case_id == case.id)
                        .order_by(Notification.created_at.desc())).first()
    if last is not None and last.status == "failed" and last.attempts < MAX_ATTEMPTS:
        last.status = "pending"
        session.add(last)
        return last
    return queue_reply(session, case, base_url, update=True)


def for_case(session: Session, case_id: str) -> list[Notification]:
    return list(session.exec(select(Notification).where(Notification.case_id == case_id)
                             .order_by(Notification.created_at.desc())))

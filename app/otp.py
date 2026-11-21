"""One-time verification codes by email (SMTP) or WhatsApp (Twilio).

- Neither the code nor the phone/email is stored in plain text (HMAC hashes only).
- A code expires after CODE_TTL, allows MAX_ATTEMPTS wrong tries, and a target can
  request at most MAX_SENDS codes per SEND_WINDOW, with RESEND_COOLDOWN between sends.
- If no provider is configured at all, the app runs a labeled simulation: nothing is
  sent and any 4-digit code is accepted (demo data only).
"""
import hashlib
import hmac
import secrets
import smtplib
from datetime import datetime, timedelta, timezone
from email.message import EmailMessage

import httpx
from sqlmodel import Session, delete, select

from . import config
from .db import OtpChallenge

CODE_LENGTH = 4
CODE_TTL = timedelta(minutes=5)
MAX_ATTEMPTS = 5
RESEND_COOLDOWN = timedelta(seconds=30)
SEND_WINDOW = timedelta(minutes=15)
MAX_SENDS = 3

_SECRET = (config.OTP_SECRET or secrets.token_hex(32)).encode()


class OtpError(Exception):
    def __init__(self, code: str, status: int, retry_after: int | None = None, attempts_left: int | None = None):
        super().__init__(code)
        self.code, self.status, self.retry_after, self.attempts_left = code, status, retry_after, attempts_left


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _aware(dt: datetime) -> datetime:
    return dt if dt.tzinfo else dt.replace(tzinfo=timezone.utc)  # SQLite returns naive datetimes


def _hash(value: str) -> str:
    return hmac.new(_SECRET, value.encode(), hashlib.sha256).hexdigest()


# ---------- providers ----------
def email_configured() -> bool:
    return bool(config.SMTP_HOST and config.SMTP_FROM)


def whatsapp_configured() -> bool:
    return bool(config.TWILIO_ACCOUNT_SID and config.TWILIO_AUTH_TOKEN and config.TWILIO_WHATSAPP_FROM)


def channels() -> dict:
    email, whatsapp = email_configured(), whatsapp_configured()
    return {"email": email, "whatsapp": whatsapp, "demo": not (email or whatsapp)}


_TEXT = {
    "ar": ("رمز التحقق من SuperCX", "رمز التحقق الخاص بك هو {code}. صالح لمدة 5 دقائق. لا تشاركه مع أحد."),
    "en": ("Your SuperCX verification code", "Your verification code is {code}. It is valid for 5 minutes. Don't share it with anyone."),
}


def send_email(to: str, code: str, lang: str) -> None:
    subject, body = _TEXT[lang]
    msg = EmailMessage()
    msg["Subject"], msg["From"], msg["To"] = subject, config.SMTP_FROM, to
    msg.set_content(body.format(code=code))
    smtp_cls = smtplib.SMTP_SSL if config.SMTP_SSL else smtplib.SMTP
    with smtp_cls(config.SMTP_HOST, config.SMTP_PORT, timeout=15) as smtp:
        if not config.SMTP_SSL:
            smtp.starttls()
        if config.SMTP_USERNAME:
            smtp.login(config.SMTP_USERNAME, config.SMTP_PASSWORD)
        smtp.send_message(msg)


def send_whatsapp(to_e164: str, code: str, lang: str) -> None:
    url = f"https://api.twilio.com/2010-04-01/Accounts/{config.TWILIO_ACCOUNT_SID}/Messages.json"
    response = httpx.post(url, auth=(config.TWILIO_ACCOUNT_SID, config.TWILIO_AUTH_TOKEN), timeout=15, data={
        "From": config.TWILIO_WHATSAPP_FROM, "To": f"whatsapp:{to_e164}", "Body": _TEXT[lang][1].format(code=code)})
    response.raise_for_status()


# Tests replace these to capture codes instead of sending.
SENDERS = {"email": send_email, "whatsapp": send_whatsapp}


# ---------- challenges ----------
def _target_hash(channel: str, target: str) -> str:
    return _hash(f"{channel}:{target.lower()}")


def send_code(session: Session, channel: str, target: str, deliver_to: str, lang: str) -> None:
    """Creates a challenge and delivers the code. `target` is the normalized identity
    (9-digit mobile or lowercased email); `deliver_to` is the address the provider needs."""
    now = _now()
    session.exec(delete(OtpChallenge).where(OtpChallenge.created_at < now - timedelta(days=1)))
    key = _target_hash(channel, target)
    recent = session.exec(select(OtpChallenge).where(OtpChallenge.target_hash == key,
                                                     OtpChallenge.created_at > now - SEND_WINDOW)
                          .order_by(OtpChallenge.created_at.desc())).all()
    if recent:
        wait = RESEND_COOLDOWN - (now - _aware(recent[0].created_at))
        if wait.total_seconds() > 0:
            raise OtpError("cooldown", 429, retry_after=int(wait.total_seconds()) + 1)
    if len(recent) >= MAX_SENDS:
        oldest = min(_aware(r.created_at) for r in recent)
        raise OtpError("rate_limited", 429, retry_after=int((oldest + SEND_WINDOW - now).total_seconds()) + 1)

    code = f"{secrets.randbelow(10 ** CODE_LENGTH):0{CODE_LENGTH}d}"
    try:
        SENDERS[channel](deliver_to, code, lang)
    except Exception as exc:  # provider down or rejected the address
        session.rollback()
        raise OtpError("delivery_failed", 502) from exc
    # Only the newest code is valid: older pending codes for this target stop working.
    for old in recent:
        old.expires_at = now
        session.add(old)
    session.add(OtpChallenge(target_hash=key, channel=channel, code_hash=_hash(f"{key}:{code}"),
                             expires_at=now + CODE_TTL))
    session.commit()


def check_code(session: Session, channel: str, target: str, code: str) -> None:
    """Raises OtpError unless `code` matches the newest live challenge. Deletes it on success."""
    now = _now()
    key = _target_hash(channel, target)
    challenge = session.exec(select(OtpChallenge).where(OtpChallenge.target_hash == key)
                             .order_by(OtpChallenge.created_at.desc())).first()
    if challenge is None:
        raise OtpError("no_code", 422)
    if _aware(challenge.expires_at) <= now:
        raise OtpError("expired", 422)
    if challenge.attempts >= MAX_ATTEMPTS:
        raise OtpError("too_many_attempts", 429)
    if not hmac.compare_digest(challenge.code_hash, _hash(f"{key}:{code}")):
        challenge.attempts += 1
        session.add(challenge)
        session.commit()
        left = MAX_ATTEMPTS - challenge.attempts
        raise OtpError("too_many_attempts" if left <= 0 else "invalid_code", 429 if left <= 0 else 422,
                       attempts_left=max(left, 0))
    session.exec(delete(OtpChallenge).where(OtpChallenge.target_hash == key))
    session.commit()

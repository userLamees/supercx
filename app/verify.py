"""Membership lookup after verification, plus phone/email/code normalization.

The registry is data/members_demo.json (simulated members) unless MEMBERS_FILE
points to another file with the same shape. Code delivery lives in app/otp.py.
"""
import json
import re
from datetime import date, timedelta
from pathlib import Path

from . import config
from .memberships import get_tier
from .schemas import MembershipStatus

DEMO_MEMBERS_FILE = Path(__file__).resolve().parent.parent / "data" / "members_demo.json"
_EMAIL = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]{2,}$")
RENEW_WINDOW_DAYS = 30
_ARABIC_DIGITS = str.maketrans("٠١٢٣٤٥٦٧٨٩", "0123456789")


def normalize_phone(raw: str) -> str | None:
    """Returns the 9-digit Saudi mobile number (5XXXXXXXX) or None."""
    digits = re.sub(r"\D", "", raw.translate(_ARABIC_DIGITS))
    for prefix in ("00966", "966", "0"):
        if digits.startswith(prefix) and len(digits) - len(prefix) == 9:
            digits = digits[len(prefix):]
            break
    return digits if re.fullmatch(r"5\d{8}", digits) else None


def normalize_email(raw: str) -> str | None:
    email = raw.strip().lower()
    return email if _EMAIL.match(email) else None


def normalize_code(code: str) -> str:
    return code.strip().translate(_ARABIC_DIGITS)


def valid_code(code: str) -> bool:
    return re.fullmatch(r"\d{4}", normalize_code(code)) is not None


def members_file() -> Path:
    return Path(config.MEMBERS_FILE) if config.MEMBERS_FILE else DEMO_MEMBERS_FILE


def lookup(phone: str | None = None, email: str | None = None, today: date | None = None) -> MembershipStatus:
    today = today or date.today()
    members = json.loads(members_file().read_text(encoding="utf-8"))["members"]
    record = next((m for m in members
                   if (phone and m.get("phone") == phone) or (email and (m.get("email") or "").lower() == email)), None)
    tier = record and get_tier(record["tier_id"])
    if not record or not tier:
        return MembershipStatus(registered=False)
    remaining = int(record["expires_in_days"])
    return MembershipStatus(
        registered=True,
        tier_id=tier.id,
        tier_name=tier.name,
        active=remaining > 0,
        expires_at=(today + timedelta(days=remaining)).isoformat(),
        days_remaining=max(remaining, 0),
        period_days=365 * tier.period_years,
        can_renew=remaining <= RENEW_WINDOW_DAYS,
        source="members_demo" if members_file() == DEMO_MEMBERS_FILE else "members_file",
    )

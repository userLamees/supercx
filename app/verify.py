"""Simulated phone verification and membership lookup (demo data only).

No SMS is sent. Any 4-digit code is accepted. Replace with the association's
member registry and an OTP provider before production.
"""
import json
import re
from datetime import date, timedelta
from pathlib import Path

from .memberships import get_tier
from .schemas import MembershipStatus

MEMBERS_FILE = Path(__file__).resolve().parent.parent / "data" / "members_demo.json"
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


def valid_code(code: str) -> bool:
    return re.fullmatch(r"\d{4}", code.translate(_ARABIC_DIGITS)) is not None


def lookup(phone: str, today: date | None = None) -> MembershipStatus:
    today = today or date.today()
    members = json.loads(MEMBERS_FILE.read_text(encoding="utf-8"))["members"]
    record = next((m for m in members if m["phone"] == phone), None)
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
        source="members_demo",
    )

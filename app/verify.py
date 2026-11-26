"""Phone/email/code normalization for verification. The member lookup itself is in
app/integrations/members.py; code delivery is in app/otp.py."""
import re

_EMAIL = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]{2,}$")
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


# The registry lookup lives in app/integrations/members.py (demo, file or the association's API).
from .integrations.members import lookup, members_file  # noqa: E402,F401 (kept for existing imports)

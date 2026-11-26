"""Request loop: case numbers, one-time tracking codes, expected reply time, the
"next step" text shown after sending, and the attempt limit on public tracking."""
import hashlib
import hmac
import re
import secrets
import threading
import time
from collections import defaultdict, deque
from datetime import datetime, timedelta, timezone
from zoneinfo import ZoneInfo

from .config import REPLY_BUSINESS_DAYS, TRACK_MAX_FAILURES_PER_CASE, TRACK_MAX_FAILURES_PER_IP
from .schemas import CaseStatus

RIYADH = ZoneInfo("Asia/Riyadh")
WEEKEND = {4, 5}  # Friday, Saturday (Python weekday numbers)

# ---------- Case number ----------

def case_reference(case_id: str) -> str:
    """Short, human-friendly case number derived from the id (no schema change)."""
    return "CX-" + case_id.replace("-", "")[:6].upper()


def reference_prefix(reference: str) -> str | None:
    """'cx-1a2b3c' / 'CX 1A2B3C' / '1a2b3c' -> '1a2b3c' (the start of the case id), else None."""
    value = re.sub(r"[\s-]", "", reference.strip().lower())
    value = value[2:] if value.startswith("cx") else value
    return value if re.fullmatch(r"[0-9a-f]{6}", value) else None


# ---------- Tracking code: shown once, stored as a salted hash ----------
_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"  # no 0/O, 1/I
_ITERATIONS = 60_000
_ARABIC_DIGITS = str.maketrans("٠١٢٣٤٥٦٧٨٩", "0123456789")


def new_tracking_code() -> str:
    raw = "".join(secrets.choice(_ALPHABET) for _ in range(8))
    return f"{raw[:4]}-{raw[4:]}"


def normalize_code(code: str) -> str:
    return re.sub(r"[\s-]", "", code.translate(_ARABIC_DIGITS)).upper()


def hash_code(code: str) -> str:
    salt = secrets.token_bytes(16)
    digest = hashlib.pbkdf2_hmac("sha256", normalize_code(code).encode(), salt, _ITERATIONS)
    return f"pbkdf2${_ITERATIONS}${salt.hex()}${digest.hex()}"


def check_code(code: str, stored: str) -> bool:
    try:
        _, iterations, salt, digest = stored.split("$")
        candidate = hashlib.pbkdf2_hmac("sha256", normalize_code(code).encode(),
                                        bytes.fromhex(salt), int(iterations))
    except (ValueError, TypeError):
        return False  # cases created before tracking codes existed
    return hmac.compare_digest(candidate.hex(), digest)


# ---------- Expected reply time ----------

def _aware(dt: datetime) -> datetime:
    return dt if dt.tzinfo else dt.replace(tzinfo=timezone.utc)


def due_at(created_at: datetime, days: int = REPLY_BUSINESS_DAYS) -> datetime:
    """created_at plus `days` business days (Sunday to Thursday, Riyadh time)."""
    local = _aware(created_at).astimezone(RIYADH)
    added = 0
    while added < days:
        local += timedelta(days=1)
        if local.weekday() not in WEEKEND:
            added += 1
    return local.astimezone(timezone.utc)


def is_overdue(created_at: datetime, case_status, now: datetime | None = None) -> bool:
    """A "new" case nobody has picked up within the expected reply time."""
    status = getattr(case_status, "value", case_status)
    return status == CaseStatus.new.value and (now or datetime.now(timezone.utc)) > due_at(created_at)


def reply_time(lang: str, days: int = REPLY_BUSINESS_DAYS) -> str:
    if lang == "en":
        return f"within {days} business day{'s' if days != 1 else ''}"
    if days == 1:
        return "خلال يوم عمل واحد"
    if days == 2:
        return "خلال يومي عمل"
    if 3 <= days % 100 <= 10:
        return f"خلال {days} أيام عمل"
    return f"خلال {days} يوم عمل"


# ---------- "Next step" text after sending, per request type and whether a contact was left ----------
NEXT_STEP = {
    "unanswered": {
        "contact": {"ar": "سيراجع فريق الدعم سؤالك ويرد عليك {time} عبر وسيلة التواصل التي زوّدتنا بها، ويظهر الرد أيضًا في «طلباتي».",
                    "en": "The support team will review your question and reply {time} using the contact details you provided. The reply will also appear in My requests."},
        "anon": {"ar": "سيراجع فريق الدعم سؤالك ويضيف إجابته إلى الأسئلة الشائعة. تابع الرد {time} في «طلباتي» أو برقم الحالة ورمز المتابعة.",
                 "en": "The support team will review your question and add the answer to the FAQ. Check for a reply {time} in My requests, or with your case number and tracking code."},
    },
    "inquiry": {
        "contact": {"ar": "سيجيب فريق الجمعية عن استفسارك {time} عبر وسيلة التواصل التي زوّدتنا بها، ويظهر الرد أيضًا في «طلباتي».",
                    "en": "The association team will answer your inquiry {time} using the contact details you provided. The reply will also appear in My requests."},
        "anon": {"ar": "سيجيب فريق الجمعية عن استفسارك {time}. تابع الرد في «طلباتي» أو برقم الحالة ورمز المتابعة.",
                 "en": "The association team will answer your inquiry {time}. Check for the reply in My requests, or with your case number and tracking code."},
    },
    "complaint": {
        "contact": {"ar": "ستُحال شكواك إلى المختص لدراستها، وسيتواصل معك الفريق {time} لإبلاغك بالإجراء المتخذ.",
                    "en": "Your complaint will be passed to the responsible team for review. They will contact you {time} to tell you what action was taken."},
        "anon": {"ar": "ستُحال شكواك إلى المختص لدراستها، ويُنشر الإجراء المتخذ {time} في «طلباتي». لن نتمكن من التواصل معك مباشرة لأنك لم تترك وسيلة تواصل.",
                 "en": "Your complaint will be passed to the responsible team for review. The action taken will be posted in My requests {time}. We can't contact you directly because you didn't leave contact details."},
    },
    "suggestion": {
        "contact": {"ar": "سيدرس فريق الجمعية مقترحك ويرد عليك {time} عبر وسيلة التواصل التي زوّدتنا بها، وقد يتواصل معك للاستيضاح.",
                    "en": "The association team will consider your suggestion and reply {time} using the contact details you provided. They may contact you for more details."},
        "anon": {"ar": "سيدرس فريق الجمعية مقترحك، ويظهر رده {time} في «طلباتي».",
                 "en": "The association team will consider your suggestion. Their reply will appear in My requests {time}."},
    },
    "service": {
        "contact": {"ar": "سيتولى فريق الجمعية طلبك ويتواصل معك {time} لإكماله، وقد يطلب منك معلومات إضافية.",
                    "en": "The association team will take up your request and contact you {time} to complete it. They may ask you for more information."},
        "anon": {"ar": "سيراجع فريق الجمعية طلبك ويرد عليه {time} في «طلباتي». قد يتعذر إكمال بعض الخدمات دون وسيلة تواصل.",
                 "en": "The association team will review your request and reply in My requests {time}. Some services can't be completed without contact details."},
    },
}


def next_step(category: str, has_contact: bool, days: int = REPLY_BUSINESS_DAYS) -> dict[str, str]:
    texts = NEXT_STEP.get(category, NEXT_STEP["inquiry"])["contact" if has_contact else "anon"]
    return {lang: text.replace("{time}", reply_time(lang, days)) for lang, text in texts.items()}


# ---------- Attempt limit on public tracking (failures only, in memory) ----------
WINDOW_SECONDS = 15 * 60


class TrackLimiter:
    def __init__(self) -> None:
        self._failures: dict[str, deque] = defaultdict(deque)
        self._lock = threading.Lock()

    def _recent(self, key: str, now: float) -> deque:
        q = self._failures[key]
        while q and now - q[0] > WINDOW_SECONDS:
            q.popleft()
        return q

    def retry_after(self, ip: str, prefix: str) -> int | None:
        """Seconds to wait if this IP or this case number used up its failed attempts."""
        now = time.monotonic()
        with self._lock:
            for key, limit in ((f"ip:{ip}", TRACK_MAX_FAILURES_PER_IP), (f"case:{prefix}", TRACK_MAX_FAILURES_PER_CASE)):
                q = self._recent(key, now)
                if len(q) >= limit:
                    return max(1, int(WINDOW_SECONDS - (now - q[0])))
        return None

    def fail(self, ip: str, prefix: str) -> None:
        now = time.monotonic()
        with self._lock:
            self._failures[f"ip:{ip}"].append(now)
            self._failures[f"case:{prefix}"].append(now)

    def reset(self) -> None:
        with self._lock:
            self._failures.clear()


limiter = TrackLimiter()

"""Staff accounts: sign-in, sessions, roles.

- Each staff member signs in with their email and password. Passwords are stored as scrypt hashes.
- Sign-in returns a random session token (sent as `Authorization: Bearer ...`); only its SHA-256
  hash is stored, it expires after STAFF_SESSION_HOURS, and signing out revokes it.
- Roles: `admin` manages accounts and can do everything; `staff` does the daily work.
- Every staff endpoint resolves the signed-in person on the server (`current`), so the action log
  and "replied by" show who really did it.
- The shared SUPPORT_TOKEN still works as an admin key (first setup, scripts) unless
  ALLOW_SUPPORT_TOKEN=false. With it, the name comes from the X-Staff-Name header, as before.
- Failed sign-ins are limited per email and per IP (in memory).
"""
import hashlib
import hmac
import re
import secrets
import threading
import time
from collections import defaultdict, deque
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from typing import Optional
from urllib.parse import unquote

from fastapi import Depends, Header, HTTPException, status
from sqlmodel import Session, select

from . import config
from .db import StaffSession, StaffUser, engine, get_session

ROLES = ("admin", "staff")
_EMAIL = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]{2,}$")


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _aware(dt: datetime) -> datetime:
    return dt if dt.tzinfo else dt.replace(tzinfo=timezone.utc)  # SQLite returns naive datetimes


# ---------- passwords ----------
_N, _R, _P = 2 ** 14, 8, 1


def hash_password(password: str) -> str:
    salt = secrets.token_bytes(16)
    digest = hashlib.scrypt(password.encode(), salt=salt, n=_N, r=_R, p=_P, dklen=32)
    return f"scrypt${_N}${_R}${_P}${salt.hex()}${digest.hex()}"


def check_password(password: str, stored: str) -> bool:
    try:
        _, n, r, p, salt, digest = stored.split("$")
        test = hashlib.scrypt(password.encode(), salt=bytes.fromhex(salt), n=int(n), r=int(r), p=int(p), dklen=32)
        return hmac.compare_digest(test.hex(), digest)
    except (ValueError, TypeError):
        return False


_DUMMY_HASH = hash_password(secrets.token_hex(8))  # same work for unknown emails (no timing hint)


def password_problem(password: str) -> Optional[str]:
    """None if acceptable, else a short code the dashboard translates."""
    if len(password) < config.STAFF_MIN_PASSWORD:
        return "too_short"
    if password.isdigit() or password.isalpha():
        return "too_simple"  # needs letters and digits/symbols
    return None


def normalize_email(email: str) -> Optional[str]:
    email = (email or "").strip().lower()
    return email if _EMAIL.match(email) else None


# ---------- sign-in limiter ----------
WINDOW_SECONDS = 15 * 60
MAX_FAILURES_PER_EMAIL = 5
MAX_FAILURES_PER_IP = 20


class LoginLimiter:
    def __init__(self) -> None:
        self._failures: dict[str, deque] = defaultdict(deque)
        self._lock = threading.Lock()

    def _recent(self, key: str, now: float) -> deque:
        q = self._failures[key]
        while q and now - q[0] > WINDOW_SECONDS:
            q.popleft()
        return q

    def retry_after(self, ip: str, email: str) -> Optional[int]:
        now = time.monotonic()
        with self._lock:
            for key, limit in ((f"ip:{ip}", MAX_FAILURES_PER_IP), (f"email:{email}", MAX_FAILURES_PER_EMAIL)):
                q = self._recent(key, now)
                if len(q) >= limit:
                    return max(1, int(WINDOW_SECONDS - (now - q[0])))
        return None

    def fail(self, ip: str, email: str) -> None:
        now = time.monotonic()
        with self._lock:
            self._failures[f"ip:{ip}"].append(now)
            self._failures[f"email:{email}"].append(now)

    def clear(self, email: str) -> None:
        with self._lock:
            self._failures.pop(f"email:{email}", None)

    def reset(self) -> None:
        with self._lock:
            self._failures.clear()


limiter = LoginLimiter()


# ---------- sessions ----------
def _token_hash(token: str) -> str:
    return hashlib.sha256(token.encode()).hexdigest()


def authenticate(session: Session, email: str, password: str) -> Optional[StaffUser]:
    user = session.exec(select(StaffUser).where(StaffUser.email == email)).first()
    if user is None or not user.active:
        check_password(password, _DUMMY_HASH)
        return None
    return user if check_password(password, user.password_hash) else None


def start_session(session: Session, user: StaffUser) -> tuple[str, datetime]:
    token = secrets.token_urlsafe(32)
    expires = _now() + timedelta(hours=config.STAFF_SESSION_HOURS)
    session.add(StaffSession(token_hash=_token_hash(token), user_id=user.id, expires_at=expires))
    user.last_login_at = _now()
    session.add(user)
    return token, expires


def end_session(session: Session, token: str) -> None:
    row = session.exec(select(StaffSession).where(StaffSession.token_hash == _token_hash(token))).first()
    if row is not None:
        row.revoked = True
        session.add(row)


def end_all_sessions(session: Session, user_id: str) -> None:
    for row in session.exec(select(StaffSession).where(StaffSession.user_id == user_id, StaffSession.revoked == False)):  # noqa: E712
        row.revoked = True
        session.add(row)


# ---------- who is calling ----------
@dataclass
class Staff:
    id: Optional[str]           # None for the shared token
    name: str
    role: str
    email: str = ""
    via: str = "account"        # account | token
    must_change_password: bool = False

    @property
    def is_admin(self) -> bool:
        return self.role == "admin"


def _bearer(authorization: str) -> str:
    scheme, _, value = (authorization or "").partition(" ")
    return value.strip() if scheme.lower() == "bearer" else ""


def current(authorization: str = Header(default=""), x_support_token: str = Header(default=""),
            x_staff_name: str = Header(default=""), session: Session = Depends(get_session)) -> Staff:
    """The signed-in staff member, checked on the server for every staff endpoint. 401 otherwise."""
    token = _bearer(authorization)
    if token:
        row = session.exec(select(StaffSession).where(StaffSession.token_hash == _token_hash(token))).first()
        if row is not None and not row.revoked and _aware(row.expires_at) > _now():
            user = session.get(StaffUser, row.user_id)
            if user is not None and user.active:
                return Staff(id=user.id, name=user.name, role=user.role, email=user.email,
                             must_change_password=user.must_change_password)
    elif config.ALLOW_SUPPORT_TOKEN and config.SUPPORT_TOKEN and x_support_token and \
            secrets.compare_digest(x_support_token.encode(), config.SUPPORT_TOKEN.encode()):
        name = re.sub(r"[\x00-\x1f]", "", unquote(x_staff_name)).strip()[:80]
        return Staff(id=None, name=name, role="admin", via="token")
    raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Sign in required")


def admin(staff: Staff = Depends(current)) -> Staff:
    if not staff.is_admin:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Admins only")
    return staff


# ---------- first admin ----------
def ensure_first_admin() -> Optional[str]:
    """Creates the first admin from STAFF_ADMIN_EMAIL / STAFF_ADMIN_PASSWORD when there is no account.
    Returns the email created, if any. The password must be changed at first sign-in."""
    email = normalize_email(config.STAFF_ADMIN_EMAIL)
    if not email or not config.STAFF_ADMIN_PASSWORD:
        return None
    with Session(engine) as session:
        if session.exec(select(StaffUser)).first() is not None:
            return None
        session.add(StaffUser(email=email, name=config.STAFF_ADMIN_NAME, role="admin",
                              password_hash=hash_password(config.STAFF_ADMIN_PASSWORD), must_change_password=True))
        session.commit()
    return email

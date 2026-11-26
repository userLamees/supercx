"""Member registry: after the visitor verifies their phone or email, who are they as a member?

Modes (MEMBER_REGISTRY):
- demo  data/members_demo.json, simulated members (the default; labeled "demo data" in the UI)
- file  MEMBERS_FILE, same shape as the demo file (e.g. an export from the association)
- api   the association's lookup endpoint (MEMBER_REGISTRY_URL + MEMBER_REGISTRY_TOKEN)

API contract (what SuperCX sends and expects; `_from_api` is the one place to adapt it):

    POST {MEMBER_REGISTRY_URL}
    Authorization: Bearer {MEMBER_REGISTRY_TOKEN}
    {"phone": "+9665XXXXXXXX"}   or   {"email": "name@example.com"}

    200 {"found": true, "tier_id": "<tier id from the public memberships API>",
         "expires_at": "2027-05-01"}
    200 {"found": false}

Only the tier and expiry come back: SuperCX never stores or shows other member data, and the
phone or email is not kept after the lookup.
"""
import json
from datetime import date, timedelta
from pathlib import Path
from typing import Optional

import httpx

from .. import config
from ..memberships import get_tier
from ..schemas import MembershipStatus

DEMO_MEMBERS_FILE = Path(__file__).resolve().parent.parent.parent / "data" / "members_demo.json"
RENEW_WINDOW_DAYS = 30
MODES = ("demo", "file", "api")


class RegistryUnavailable(Exception):
    """The registry could not answer (network, timeout, bad response). Shown as "try again later"."""


def mode() -> str:
    return config.MEMBER_REGISTRY if config.MEMBER_REGISTRY in MODES else "demo"


def configured() -> bool:
    """Whether the chosen mode has what it needs."""
    m = mode()
    if m == "api":
        return bool(config.MEMBER_REGISTRY_URL and config.MEMBER_REGISTRY_TOKEN)
    if m == "file":
        return bool(config.MEMBERS_FILE) and Path(config.MEMBERS_FILE).is_file()
    return DEMO_MEMBERS_FILE.is_file()


def members_file() -> Path:
    return Path(config.MEMBERS_FILE) if mode() == "file" and config.MEMBERS_FILE else DEMO_MEMBERS_FILE


def _status(tier_id: Optional[str], expires_at: Optional[date], source: str, demo: bool, today: date) -> MembershipStatus:
    tier = get_tier(tier_id) if tier_id else None
    if tier is None or expires_at is None:
        return MembershipStatus(registered=False, demo=demo)
    remaining = (expires_at - today).days
    return MembershipStatus(
        registered=True, demo=demo, source=source,
        tier_id=tier.id, tier_name=tier.name,
        active=remaining > 0,
        expires_at=expires_at.isoformat(),
        days_remaining=max(remaining, 0),
        period_days=365 * tier.period_years,
        can_renew=remaining <= RENEW_WINDOW_DAYS,
    )


def _from_file(phone: Optional[str], email: Optional[str], today: date) -> MembershipStatus:
    path = members_file()
    members = json.loads(path.read_text(encoding="utf-8"))["members"]
    record = next((m for m in members
                   if (phone and m.get("phone") == phone) or (email and (m.get("email") or "").lower() == email)), None)
    demo = path == DEMO_MEMBERS_FILE
    source = "members_demo" if demo else "members_file"
    if record is None:
        return MembershipStatus(registered=False, demo=demo)
    if record.get("expires_at"):
        expires = date.fromisoformat(record["expires_at"])
    else:  # demo file: relative to today so the demo never goes stale
        expires = today + timedelta(days=int(record["expires_in_days"]))
    return _status(record.get("tier_id"), expires, source, demo, today)


def _from_api(phone: Optional[str], email: Optional[str], today: date) -> MembershipStatus:
    body = {"phone": f"+966{phone}"} if phone else {"email": email}
    try:
        response = httpx.post(config.MEMBER_REGISTRY_URL, json=body, timeout=config.MEMBER_REGISTRY_TIMEOUT,
                              headers={"Authorization": f"Bearer {config.MEMBER_REGISTRY_TOKEN}",
                                       "Accept": "application/json"})
        response.raise_for_status()
        data = response.json()
        if not data.get("found"):
            return MembershipStatus(registered=False, demo=False)
        return _status(data.get("tier_id"), date.fromisoformat(str(data["expires_at"])[:10]),
                       "member_registry", False, today)
    except (httpx.HTTPError, ValueError, KeyError, TypeError) as exc:
        raise RegistryUnavailable(type(exc).__name__) from exc


def lookup(phone: Optional[str] = None, email: Optional[str] = None, today: Optional[date] = None) -> MembershipStatus:
    """phone: 9-digit Saudi mobile (5XXXXXXXX); email: lower-case. Raises RegistryUnavailable."""
    today = today or date.today()
    if mode() == "api":
        if not configured():
            raise RegistryUnavailable("not_configured")
        return _from_api(phone, email, today)
    return _from_file(phone, email, today)

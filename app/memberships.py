"""Fetches tiers from the association's public API and normalizes them.

Falls back to the last good copy, then to the bundled fixture, so the demo
keeps working if cxa.sa is slow or unreachable.
"""
import json
import time
from pathlib import Path

import httpx

from .config import MEMBERSHIP_API_URL, MEMBERSHIP_CACHE_SECONDS, MEMBERSHIP_PAGE_URL
from .schemas import Localized, LocalizedList, Tier

FIXTURE = Path(__file__).resolve().parent.parent / "data" / "memberships_fixture.json"

_cache: dict = {"tiers": None, "fetched_at": 0.0, "origin": None}


def normalize(payload: dict) -> list[Tier]:
    if not payload.get("succeeded"):
        raise ValueError("Membership API returned succeeded=false")
    tiers = [
        Tier(
            id=item["id"],
            code=item["code"],
            name=Localized(ar=item["titleAr"], en=item["title"]),
            features=LocalizedList(ar=item.get("featuresAr") or [], en=item.get("featuresEn") or []),
            price_sar=float(item["price"]),
            period_years=int(item.get("membershipPeriod") or 1),
            is_most_common=bool(item.get("isMostCommon")),
            display_order=int(item.get("displayOrder") or 0),
            source_url=MEMBERSHIP_PAGE_URL,
        )
        for item in payload.get("data", [])
        if item.get("isActive")
    ]
    return sorted(tiers, key=lambda t: t.display_order)


def _fetch_live() -> list[Tier]:
    response = httpx.get(MEMBERSHIP_API_URL, timeout=8.0)
    response.raise_for_status()
    return normalize(response.json())


def _load_fixture() -> list[Tier]:
    return normalize(json.loads(FIXTURE.read_text(encoding="utf-8")))


def get_tiers(force_refresh: bool = False) -> list[Tier]:
    fresh = time.time() - _cache["fetched_at"] < MEMBERSHIP_CACHE_SECONDS
    if _cache["tiers"] and fresh and not force_refresh:
        return _cache["tiers"]
    try:
        tiers, origin = _fetch_live(), "live"
    except (httpx.HTTPError, ValueError, KeyError):
        if _cache["tiers"]:
            return _cache["tiers"]
        tiers, origin = _load_fixture(), "fixture"
    _cache.update(tiers=tiers, fetched_at=time.time(), origin=origin)
    return tiers


def get_tier(tier_id: str) -> Tier | None:
    return next((t for t in get_tiers() if t.id == tier_id), None)


def data_origin() -> str | None:
    return _cache["origin"]

"""Runtime settings, read from environment variables (Replit Secrets)."""
import os

MEMBERSHIP_API_URL = os.getenv("MEMBERSHIP_API_URL", "https://cxa.sa/api/MemberShip/public")
MEMBERSHIP_PAGE_URL = os.getenv("MEMBERSHIP_PAGE_URL", "https://cxa.sa/membership")
MEMBERSHIP_CACHE_SECONDS = int(os.getenv("MEMBERSHIP_CACHE_SECONDS", "3600"))
# Date the bundled fixture copy was taken from the live API (shown as "last verified").
FIXTURE_CHECKED_AT = os.getenv("FIXTURE_CHECKED_AT", "2026-11-11")

# Replit Postgres sets DATABASE_URL automatically; SQLite is the local fallback.
# SQLAlchemy needs the "postgresql://" scheme; Replit/Heroku-style URLs use "postgres://".
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./supercx.db")
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = "postgresql://" + DATABASE_URL[len("postgres://"):]

# Shared token for the staff dashboard. Set it in Replit Secrets; there is no
# default in code. If unset, every staff endpoint returns 401.
SUPPORT_TOKEN = os.getenv("SUPPORT_TOKEN", "")

# Unanswered questions asked at least this many times count as "high frequency".
HIGH_FREQUENCY_THRESHOLD = int(os.getenv("HIGH_FREQUENCY_THRESHOLD", "10"))

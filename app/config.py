"""Runtime settings, read from environment variables (Replit Secrets)."""
import os

MEMBERSHIP_API_URL = os.getenv("MEMBERSHIP_API_URL", "https://cxa.sa/api/MemberShip/public")
MEMBERSHIP_PAGE_URL = os.getenv("MEMBERSHIP_PAGE_URL", "https://cxa.sa/membership")
MEMBERSHIP_CACHE_SECONDS = int(os.getenv("MEMBERSHIP_CACHE_SECONDS", "3600"))

# Replit Postgres sets DATABASE_URL automatically; SQLite is the local fallback.
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./supercx.db")

# Shared token for the support dashboard (set it in Replit Secrets).
SUPPORT_TOKEN = os.getenv("SUPPORT_TOKEN", "dev-support-token")

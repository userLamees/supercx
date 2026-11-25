"""Runtime settings, read from environment variables (Replit Secrets)."""
import os
from dotenv import load_dotenv

load_dotenv()  # reads .env locally; on Replit the values come from Secrets

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

# Staff dashboard alerts.
ALERT_CASE_AGE_HOURS = int(os.getenv("ALERT_CASE_AGE_HOURS", "48"))          # "new" requests waiting longer than this
ALERT_COMPLAINTS_PER_WEEK = int(os.getenv("ALERT_COMPLAINTS_PER_WEEK", "3"))  # complaints in 7 days that trigger an alert

# Verification codes (OTP). With no provider configured the app runs a labeled simulation.
OTP_SECRET = os.getenv("OTP_SECRET", "")            # HMAC key for stored hashes; random per process if unset
SMTP_HOST = os.getenv("SMTP_HOST", "")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USERNAME = os.getenv("SMTP_USERNAME", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
SMTP_FROM = os.getenv("SMTP_FROM", "") or SMTP_USERNAME
SMTP_SSL = os.getenv("SMTP_SSL", "false").lower() == "true"  # true for port 465; otherwise STARTTLS
TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID", "")
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN", "")
TWILIO_WHATSAPP_FROM = os.getenv("TWILIO_WHATSAPP_FROM", "")  # e.g. whatsapp:+14155238886

# Member registry used after verification (demo file by default).
MEMBERS_FILE = os.getenv("MEMBERS_FILE", "")

# AI agent settings
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
LLM_MODEL = os.getenv("LLM_MODEL", "gpt-4.1-mini")
EMBEDDING_MODEL = os.getenv("EMBEDDING_MODEL", "text-embedding-3-small")
CHROMA_DIR = os.getenv("CHROMA_DIR", "./chroma_db")
RAG_TOP_K = int(os.getenv("RAG_TOP_K", "4"))              # FAQ entries retrieved per question
RAG_MIN_SCORE = float(os.getenv("RAG_MIN_SCORE", "0.45"))  # below this similarity a match is ignored (tuned in evaluation)

# Without a key, the app falls back to the rule-based agent (tests and offline demo).
AGENT_ENABLED = bool(OPENAI_API_KEY)
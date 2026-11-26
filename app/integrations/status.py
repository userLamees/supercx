"""What is live and what is still demo, for the admin "التكاملات" page and the move to Replit.

Each item: key, state (live | demo | off | missing), the settings (Replit Secrets) it needs, and a
short machine-readable detail the dashboard translates. Never returns a secret's value.
"""
from sqlalchemy import func
from sqlmodel import Session, select

from .. import config, otp
from ..db import StaffUser, engine, schema_version
from ..memberships import data_origin, get_tiers
from . import case_sync, members


def _item(key: str, state: str, needs: list[str], detail: str = "", **extra) -> dict:
    return {"key": key, "state": state, "needs": needs, "detail": detail, **extra}


def report(session: Session) -> list[dict]:
    items = []

    items.append(_item("ai_agent", "live" if config.AGENT_ENABLED else "demo", ["OPENAI_API_KEY"],
                       "llm" if config.AGENT_ENABLED else "rules", model=config.LLM_MODEL))

    get_tiers()  # loads (or reuses) the tier data, so its source is known
    origin = data_origin()
    items.append(_item("memberships", "live" if origin == "live" else "demo", ["MEMBERSHIP_API_URL"],
                       origin or "not_loaded"))

    m = members.mode()
    reg_needs = {"api": ["MEMBER_REGISTRY", "MEMBER_REGISTRY_URL", "MEMBER_REGISTRY_TOKEN"],
                 "file": ["MEMBER_REGISTRY", "MEMBERS_FILE"]}.get(m, ["MEMBER_REGISTRY", "MEMBER_REGISTRY_URL", "MEMBER_REGISTRY_TOKEN"])
    items.append(_item("member_registry", "demo" if m == "demo" else "live" if members.configured() else "missing",
                       reg_needs, m))

    c = case_sync.mode()
    sync_needs = {"webhook": ["CASE_SYNC", "CASE_WEBHOOK_URL", "CASE_WEBHOOK_SECRET"],
                  "email": ["CASE_SYNC", "CASE_EMAIL_TO", "SMTP_HOST", "SMTP_FROM"]}.get(c, ["CASE_SYNC", "CASE_WEBHOOK_URL", "CASE_WEBHOOK_SECRET"])
    items.append(_item("case_sync", "off" if c == "off" else "demo" if c == "demo" else
                       "live" if case_sync.configured() else "missing", sync_needs, c))

    email = otp.email_configured()
    items.append(_item("email", "live" if email else "demo",
                       ["SMTP_HOST", "SMTP_PORT", "SMTP_USERNAME", "SMTP_PASSWORD", "SMTP_FROM"],
                       "smtp" if email else "simulated"))

    whatsapp = otp.whatsapp_configured()
    items.append(_item("whatsapp", "live" if whatsapp else "demo",
                       ["TWILIO_ACCOUNT_SID", "TWILIO_AUTH_TOKEN", "TWILIO_WHATSAPP_FROM", "TWILIO_REPLY_TEMPLATE_SID"],
                       ("template" if config.TWILIO_REPLY_TEMPLATE_SID else "no_template") if whatsapp else "simulated"))

    items.append(_item("notifications", "off" if not config.NOTIFY_ON_REPLY else
                       "live" if (email or whatsapp) else "demo", ["NOTIFY_ON_REPLY", "PUBLIC_BASE_URL"],
                       "base_url" if config.PUBLIC_BASE_URL else "no_base_url"))

    postgres = engine.dialect.name == "postgresql"
    with engine.connect() as conn:
        version = schema_version(conn)
    items.append(_item("database", "live" if postgres else "demo", ["DATABASE_URL"],
                       engine.dialect.name, version=version))

    admins = session.exec(select(func.count()).select_from(StaffUser)
                          .where(StaffUser.role == "admin", StaffUser.active == True)).one()  # noqa: E712
    items.append(_item("staff_accounts", "live" if admins else "missing",
                       ["STAFF_ADMIN_EMAIL", "STAFF_ADMIN_PASSWORD", "ALLOW_SUPPORT_TOKEN"],
                       "token_on" if config.ALLOW_SUPPORT_TOKEN and config.SUPPORT_TOKEN else "token_off",
                       admins=admins))

    items.append(_item("secrets", "live" if config.OTP_SECRET else "missing", ["OTP_SECRET"],
                       "set" if config.OTP_SECRET else "random_per_start"))
    return items

# SuperCX on Replit

## Run

- Existing stack: Python 3.12, FastAPI, static HTML/CSS/JavaScript, SQLModel and Alembic.
- Install base dependencies with `python -m pip install -r requirements.txt`.
- Press **Run** to start the **Start application** workflow:
  `python -m uvicorn main:app --host 0.0.0.0 --port 5000 --proxy-headers --forwarded-allow-ips='*'`
- Routes: `/` chat, `/faq` questions, `/support` staff sign-in, `/docs` API documentation.
- Startup applies existing migrations and seeds the FAQ. Use the existing managed
  `DATABASE_URL`; do not replace it or copy its value into code.

## Optional services and credentials

The base installation uses the project's existing rule-based assistant when
`OPENAI_API_KEY` is absent. Membership lookup and message delivery remain in their
existing demo modes until their providers are configured.

`langchain-chroma` is in `requirements-ai.txt`: its Chroma dependency was rejected
by Replit's package registry during import setup, including with the latest
available parent package. Nothing bypasses the registry. Before enabling OpenAI,
install `python -m pip install -r requirements-ai.txt` successfully and configure
the deployment build to install that file too. Do not treat semantic search as
verified until this succeeds.

Staff access requires `STAFF_ADMIN_EMAIL` and `STAFF_ADMIN_PASSWORD` in Secrets
(or the existing `SUPPORT_TOKEN` mechanism). Set `OTP_SECRET` in Secrets to
preserve pending verification hashes across restarts. Never put credentials in
source, chat, or documentation. No demo staff accounts are seeded automatically.
See `docs/REPLIT.md` and `.env.example` for the remaining provider settings.

## Checks

- `python -m pytest -q --ignore=tests/test_knowledge.py`: base regression suite
  (uses an isolated SQLite database, not the running database).
- `python -m pytest -q`: full suite; requires optional Chroma dependencies.
- `python -m app.preflight`: launch-readiness report; missing optional/launch
  credentials do not prevent the public preview from starting.

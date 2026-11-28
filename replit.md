# SuperCX on Replit

## Run

- Existing stack: Python 3.12, FastAPI, static HTML/CSS/JavaScript, SQLModel and Alembic.
- Install dependencies with `pip install -r requirements.txt`.
- Press **Run** to start the **Start application** workflow:
  `uvicorn main:app --host 0.0.0.0 --port 8000 --proxy-headers --forwarded-allow-ips='*'`
- Routes: `/` chat, `/faq` questions, `/support` staff sign-in, `/docs` API documentation.
- Startup applies existing migrations and seeds the FAQ. Use the existing managed
  `DATABASE_URL`; do not replace it or copy its value into code.

## Optional services and credentials

The base installation uses the project's existing rule-based assistant when
`OPENAI_API_KEY` is absent. Membership lookup and message delivery remain in their
existing demo modes until their providers are configured.

The FAQ search index uses Chroma when `langchain-chroma` is installed, and an in-memory
store otherwise. Replit's package registry rejects `chromadb` (HTTP 403), so
`langchain-chroma` is not in `requirements.txt`: on Replit the in-memory store is used and
the index is rebuilt from the FAQ table at startup (the log shows `Knowledge index: memory`).
Results are the same with either store. For a persistent local index, install it separately:
`pip install langchain-chroma==1.2.0`.

Staff access requires `STAFF_ADMIN_EMAIL` and `STAFF_ADMIN_PASSWORD` in Secrets
(or the existing `SUPPORT_TOKEN` mechanism). Set `OTP_SECRET` in Secrets to
preserve pending verification hashes across restarts. Never put credentials in
source, chat, or documentation. No demo staff accounts are seeded automatically.
See `docs/REPLIT.md` and `.env.example` for the remaining provider settings.

## Checks

- `python -m pytest -q`: full suite; requires the dependencies above.
- `python -m app.preflight`: launch-readiness report; missing optional/launch
  credentials do not prevent the public preview from starting.
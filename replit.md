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

The required `langchain-chroma==1.2.0` dependency pulls `chromadb`. Replit's
package registry rejected downloads of `chromadb` 1.5.9 and 1.5.8 with HTTP 403
during setup. The complete dependency install therefore remains blocked unless
the registry allows that package. No workaround or replacement library was added.

Staff access requires `STAFF_ADMIN_EMAIL` and `STAFF_ADMIN_PASSWORD` in Secrets
(or the existing `SUPPORT_TOKEN` mechanism). Set `OTP_SECRET` in Secrets to
preserve pending verification hashes across restarts. Never put credentials in
source, chat, or documentation. No demo staff accounts are seeded automatically.
See `docs/REPLIT.md` and `.env.example` for the remaining provider settings.

## Checks

- `python -m pytest -q`: full suite; requires the dependencies above.
- `python -m app.preflight`: launch-readiness report; missing optional/launch
  credentials do not prevent the public preview from starting.

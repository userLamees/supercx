# SuperCX

AI membership assistant for the Saudi CX Association (CX Hackathon, Track 1).

## Run

Locally (SQLite is created automatically; the FAQ seed loads on first start):

```bash
pip install -r requirements.txt
export SUPPORT_TOKEN=demo-support-token   # any value; there is no default in code
uvicorn main:app --reload --port 8000
python -m app.seed_demo                   # optional: sample unanswered questions for the dashboard
```

On Replit: add **Replit Postgres** (sets `DATABASE_URL`; `postgres://` URLs are
converted to `postgresql://` automatically) and set `SUPPORT_TOKEN` in **Secrets**,
then press Run. `psycopg2-binary` is in `requirements.txt`.

### Staff access for testing

There are no staff accounts. The dashboard at `/support` asks for the shared
`SUPPORT_TOKEN`: enter the same value you set in the environment
(`demo-support-token` in the example above). Every staff endpoint checks it on the
server; if `SUPPORT_TOKEN` is not set, all staff requests get 401.

### Demo data (simulated, no real people)

- Verification (simulation mode, when no email/WhatsApp provider is set): mobile
  `500000001` or email `ambassador@example.com` (Ambassador, 365 days left), mobile
  `500000002` or `affiliate@example.com` (Affiliate, 21 days left: shows "Renew").
  Any 4-digit code works. Anything else shows "not registered".

### Real verification codes (email and WhatsApp)

With a provider configured, the code is real: 4 digits, valid 5 minutes, 5 wrong
tries, 30 s between sends, at most 3 codes per 15 minutes. Codes and phone numbers
or emails are stored only as HMAC hashes and deleted after use.

- **Email (SMTP)**, e.g. Gmail: turn on 2-step verification, create an
  [app password](https://myaccount.google.com/apppasswords), then set
  `SMTP_HOST=smtp.gmail.com`, `SMTP_PORT=587`, `SMTP_USERNAME=<address>`,
  `SMTP_PASSWORD=<app password>`.
- **WhatsApp (Twilio)**: create a Twilio account, open the WhatsApp sandbox
  (each tester sends the join code to the sandbox number once), then set
  `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_WHATSAPP_FROM=whatsapp:+1415…`.
  Production needs an approved WhatsApp Business sender.
- Set `OTP_SECRET` to a long random value so pending codes survive restarts.

Membership data after verification still comes from `data/members_demo.json`.
To try a real code with your own address, copy that file outside the repo, add
yourself (`phone` as 9 digits `5XXXXXXXX`, and/or `email`), and set `MEMBERS_FILE`
to its path. The association's real member registry is not connected yet.

- Chat: `http://localhost:8000/` (also `#verify` and `#status` for the membership lookup)
- FAQ: `http://localhost:8000/faq`
- Staff dashboard: `http://localhost:8000/support`
- API docs: `http://localhost:8000/docs`
- Tests: `python -m pytest -q`

## Environment (Replit Secrets)

| Variable | Default | Purpose |
|---|---|---|
| `DATABASE_URL` | `sqlite:///./supercx.db` | Set automatically by Replit Postgres |
| `SUPPORT_TOKEN` | *(none)* | Staff dashboard token. **Required**; unset = staff endpoints return 401 |
| `MEMBERSHIP_API_URL` | `https://cxa.sa/api/MemberShip/public` | Live tier data |
| `MEMBERSHIP_CACHE_SECONDS` | `3600` | Tier cache lifetime |
| `HIGH_FREQUENCY_THRESHOLD` | `10` | Times asked before a question counts as "high frequency" |
| `FIXTURE_CHECKED_AT` | `2026-11-11` | "Last verified" date shown when the bundled tier copy is used |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USERNAME`, `SMTP_PASSWORD`, `SMTP_FROM`, `SMTP_SSL` | *(none)* | Email verification codes. `SMTP_SSL=true` for port 465 |
| `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_WHATSAPP_FROM` | *(none)* | WhatsApp verification codes |
| `OTP_SECRET` | random per start | Key for hashing codes and addresses |
| `MEMBERS_FILE` | `data/members_demo.json` | Member registry used after verification |
| `ALERT_CASE_AGE_HOURS` | `48` | Alert when "new" requests wait longer than this |
| `ALERT_COMPLAINTS_PER_WEEK` | `3` | Alert when this many complaints arrive in 7 days |

If the membership API is unreachable, the app falls back to the last good copy,
then to `data/memberships_fixture.json`. `/api/health` reports which one is in use.

## Structure

```
main.py              routes
app/schemas.py       API contract (shared with the agent)
app/agent.py         run_agent(): rule-based stub, replaced by the LLM agent
app/memberships.py   fetch + normalize + cache tiers
app/db.py            tables: support_cases, unanswered_questions, faq_categories, faq_items
app/faq.py           FAQ in the DB (faq_categories/faq_items), seeded once from data/faq.json
app/verify.py        member lookup (phone or email) + normalization
app/otp.py           verification codes: email (SMTP) / WhatsApp (Twilio), limits, hashing
app/audit.py         staff action log
app/export.py        CSV exports (UTF-8 BOM, formula-safe)
app/redact.py        strips emails/phone numbers from summaries
app/seed_demo.py     loads the design's sample unanswered questions (dev only)
static/tokens.css    design tokens (Figma "Screens v2"); styles use variables only
static/              chat, FAQ and staff dashboard (AR/RTL default, EN toggle)
tests/               success, error and permission tests
```

## v2 additions

| Endpoint | Access | Purpose |
|---|---|---|
| `GET /api/faq` | public | FAQ sections. Read from the DB. Seed items (`data/faq.json`) are `demo: true` |
| `GET /api/unanswered?sort=count\|recent` | support token | Escalated questions grouped by text, with count and last seen |
| `GET /api/unanswered/stats` | support token | Pending, high-frequency (`HIGH_FREQUENCY_THRESHOLD`, default 10), approved |
| `POST /api/unanswered/{id}/promote` | support token | Adds the (edited) question + answer + source to the FAQ |
| `GET /api/verify/channels` | public | Which channels are live (`email`, `whatsapp`) or `demo` |
| `POST /api/verify/send`, `POST /api/verify/check` | public | `{channel, phone \| email, code}`. Real codes when a provider is set; simulation otherwise |
| `GET /api/unanswered/export.csv`, `GET /api/support-cases/export.csv` | support token | CSV export (`?lang=ar\|en`) |
| `GET/POST /api/staff/faq-items`, `PUT/DELETE /api/staff/faq-items/{id}` | support token | FAQ editor |
| `GET /api/audit-log` | support token | Who did what and when (name typed at sign-in) |
| `GET /api/alerts` | support token | Frequent unanswered questions, stale requests, complaint spikes |

Support cases have a `category` (`inquiry`, `complaint`, `suggestion`, `service`),
set in the chat's request card or the "contact the team" page (`/#contact`), and
filterable in the dashboard.

Other changes: `POST /api/support-cases` accepts `anonymous: true` without `contact`
(visitor consented to the summary only) and returns a short `reference` (`CX-XXXXXX`).
`Tier` has `checked_at` (last verified date). Every escalation from `/api/chat` is
logged (redacted) in `unanswered_questions`.

Demo data for the dashboard: `python -m app.seed_demo`.

## Agent contract (for the AI agent)

Replace the body of `run_agent(message, history)` in `app/agent.py`. Keep the
signature and return a `ChatResponse`:

| Field | Type | Rule |
|---|---|---|
| `answer` | str | Same language as the user |
| `lang` | `"ar"` / `"en"` | Language of the answer |
| `action` | `answer` / `recommend` / `escalate` | |
| `sources` | `[{title, url}]` | Required for `answer` and `recommend` |
| `tier_id` | str or null | Tier `id` from `get_tiers()`. Required for `recommend`. Never a display name |
| `needs_contact` | bool | `true` on `escalate`, so the UI asks for email/phone |
| `summary` | str or null | Case summary for support on `escalate` |

Available helpers: `get_tiers()`, `get_tier(id)`. The UI creates the support case
(`POST /api/support-cases`) after the user leaves contact details.

## Live vs. simulated

| Part | Status | Notes |
|---|---|---|
| Membership tiers (names, prices, benefits) | **Live** | Public API `cxa.sa/api/MemberShip/public`, read only; falls back to the bundled copy |
| Registration / renewal | **Link only** | Buttons open `cxa.sa/membership`; no enrollment or payment here (Track 2) |
| Support cases | **Live in this app** | Stored in this app's database, not yet in the association's system |
| Unanswered questions, FAQ | **Live in this app** | Database tables; FAQ content itself is demo (marked "تجريبي") until approved |
| Verification codes (OTP) | **Live when configured** | Email via SMTP, WhatsApp via Twilio; labeled simulation until a provider is set |
| Member records (type, expiry) | **Simulated** | `data/members_demo.json`, not the association's member registry |
| AI answers | **Stub** | `app/agent.py` is rule-based until the LLM agent replaces it |

## Still to do

- Connect the member registry so verified users see their real membership (needs the association).
- WhatsApp Business sender approval for production WhatsApp codes.
- Approved FAQ content and sources from the association; replace the demo answers.
- Send support cases to the association's system and confirm response times.
- Staff accounts per person (currently one shared token; the action log uses the name typed at sign-in).
- Database migrations (tables are created with `create_all`; schema changes need a migration tool).

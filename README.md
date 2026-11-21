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

- Phone verification: `500000001` (Ambassador, 365 days left) and `500000002`
  (Affiliate, 21 days left: shows "Renew"). Any 4-digit code works. Any other
  number shows "not registered". Numbers are not stored.

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
app/verify.py        SIMULATED phone verification + demo member lookup
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
| `POST /api/verify/send`, `POST /api/verify/check` | public | **Simulation**: no SMS; any 4-digit code works. Demo numbers in `data/members_demo.json` |

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
| Phone verification (OTP) | **Simulated** | No SMS is sent; any 4-digit code is accepted |
| Member records (type, expiry) | **Simulated** | `data/members_demo.json`, not the association's member registry |
| AI answers | **Stub** | `app/agent.py` is rule-based until the LLM agent replaces it |

## Still to do

- Connect phone verification to a real OTP provider and the member registry (needs the association).
- Approved FAQ content and sources from the association; replace the demo answers.
- Send support cases to the association's system and confirm response times.
- Staff accounts per person (currently one shared token).
- Database migrations (tables are created with `create_all`; schema changes need a migration tool).

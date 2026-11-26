# SuperCX

AI membership assistant for the Saudi CX Association (CX Hackathon, Track 1).

## Run

Locally (SQLite is created automatically; the FAQ seed loads on first start):

```bash
pip install -r requirements.txt
export SUPPORT_TOKEN=demo-support-token   # any value; there is no default in code
uvicorn main:app --reload --port 8000
python -m app.seed_demo                   # optional: demo questions, requests and two demo staff accounts
```

On Replit: add **Replit Postgres** (sets `DATABASE_URL`; `postgres://` URLs are
converted to `postgresql://` automatically) and set `SUPPORT_TOKEN`, `STAFF_ADMIN_EMAIL` and
`STAFF_ADMIN_PASSWORD` in **Secrets**, then press Run. `psycopg2-binary` is in `requirements.txt`.

### Staff access for testing

Each staff member signs in at `/support` with their own email and password
(`app/staff.py`). Every staff endpoint resolves the signed-in person on the server, so the
action log and "replied by" show who really did it.

- **First admin:** set `STAFF_ADMIN_EMAIL` and `STAFF_ADMIN_PASSWORD`; the account is created at
  startup when no account exists yet, and must change its password at first sign-in.
- **Demo accounts:** `python -m app.seed_demo` creates `admin@example.com` (admin) and
  `staff@example.com` (staff) once. The password is `DEMO_STAFF_PASSWORD`, or a random one printed
  by the command; no password is written in the code.
- **Team page** (admins): add accounts with a temporary password, change role, deactivate
  (signs the person out), or set a new temporary password. The last admin is protected.
- **Passwords:** scrypt hashes; at least `STAFF_MIN_PASSWORD` characters (default 10) mixing
  letters with digits or symbols. Sessions are random tokens stored as hashes, expire after
  `STAFF_SESSION_HOURS` (default 12), and are revoked on sign-out or password change. Failed
  sign-ins are limited (5 per email, 20 per IP, per 15 minutes).
- **Shared token:** `SUPPORT_TOKEN` still works as an admin key (first setup, scripts) from
  "الدخول برمز الفريق" on the sign-in page, with the typed name in the log. Set
  `ALLOW_SUPPORT_TOKEN=false` to allow personal accounts only.

| Endpoint | Access | Purpose |
|---|---|---|
| `POST /api/staff/login` | public, attempt-limited | `{email, password}` → `{token, expires_at, user}`; send `Authorization: Bearer <token>` |
| `POST /api/staff/logout` | session | Revokes the session |
| `GET /api/staff/me` | session or token | Who is signed in (name, role, must change password) |
| `POST /api/staff/me/password` | session | `{current_password, new_password}`; signs out other devices |
| `GET/POST /api/staff/users`, `PATCH /api/staff/users/{id}`, `POST /api/staff/users/{id}/password` | admin | Manage accounts |

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
| `SUPPORT_TOKEN` | *(none)* | Shared admin key (first setup, scripts). Unset = only personal accounts work |
| `ALLOW_SUPPORT_TOKEN` | `true` | `false` turns the shared token off |
| `STAFF_ADMIN_EMAIL`, `STAFF_ADMIN_PASSWORD`, `STAFF_ADMIN_NAME` | *(none)*, *(none)*, `مدير النظام` | First admin, created at startup when there is no account |
| `STAFF_SESSION_HOURS` | `12` | How long a staff sign-in lasts |
| `STAFF_MIN_PASSWORD` | `10` | Minimum staff password length |
| `DEMO_STAFF_PASSWORD` | random | Password of the demo accounts made by `app.seed_demo` |
| `MEMBERSHIP_API_URL` | `https://cxa.sa/api/MemberShip/public` | Live tier data |
| `MEMBERSHIP_CACHE_SECONDS` | `3600` | Tier cache lifetime |
| `HIGH_FREQUENCY_THRESHOLD` | `10` | Times asked before a question counts as "high frequency" |
| `FIXTURE_CHECKED_AT` | `2026-11-11` | "Last verified" date shown when the bundled tier copy is used |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USERNAME`, `SMTP_PASSWORD`, `SMTP_FROM`, `SMTP_SSL` | *(none)* | Email verification codes. `SMTP_SSL=true` for port 465 |
| `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_WHATSAPP_FROM` | *(none)* | WhatsApp verification codes and reply notifications |
| `NOTIFY_ON_REPLY` | `true` | Tell the visitor (email/WhatsApp) when the team replies |
| `PUBLIC_BASE_URL` | address of the staff request | Public address used in the notification link, e.g. `https://supercx.replit.app` |
| `TWILIO_REPLY_TEMPLATE_SID` | *(none)* | Meta-approved WhatsApp template (Twilio Content SID; variables 1 = case number, 2 = link). Needed to message outside the 24-hour window |
| `OTP_SECRET` | random per start | Key for hashing codes and addresses |
| `MEMBER_REGISTRY` | `demo` (`file` if `MEMBERS_FILE` is set) | Member registry: `demo`, `file` or `api` |
| `MEMBERS_FILE` | `data/members_demo.json` | Member file for `MEMBER_REGISTRY=file` (same shape as the demo file; `expires_at` or `expires_in_days`) |
| `MEMBER_REGISTRY_URL`, `MEMBER_REGISTRY_TOKEN`, `MEMBER_REGISTRY_TIMEOUT` | *(none)*, *(none)*, `10` | The association's lookup endpoint for `MEMBER_REGISTRY=api` |
| `CASE_SYNC` | `demo` | Send requests to the association's system: `off`, `demo`, `webhook` or `email` |
| `CASE_WEBHOOK_URL`, `CASE_WEBHOOK_SECRET` | *(none)* | Webhook address and HMAC key (`X-SuperCX-Signature`) |
| `CASE_EMAIL_TO` | *(none)* | Team inbox for `CASE_SYNC=email` (uses the SMTP settings) |
| `ALERT_CASE_AGE_HOURS` | `48` | Alert when "new" requests wait longer than this |
| `ALERT_COMPLAINTS_PER_WEEK` | `3` | Alert when this many complaints arrive in 7 days |
| `REPLY_BUSINESS_DAYS` | `2` | Expected reply time shown to visitors; "reply needed" flag after this (Fri/Sat not counted). Demo assumption |
| `TRACK_MAX_FAILURES_PER_IP`, `TRACK_MAX_FAILURES_PER_CASE` | `10`, `5` | Wrong tracking attempts allowed per 15 minutes |
| `OPENAI_API_KEY` | *(none)* | Turns on the AI agent. Without it the rule-based agent answers |
| `LLM_MODEL` | `gpt-4.1-mini` | Model used by the agent |
| `EMBEDDING_MODEL` | `text-embedding-3-small` | Model for the FAQ search index |
| `CHROMA_DIR` | `./chroma_db` | Folder of the search index (rebuilt from the FAQ table if deleted) |
| `RAG_TOP_K`, `RAG_MIN_SCORE` | `4`, `0.30` | Entries retrieved per question; weaker matches are ignored (chosen by evaluation) |
| `OPENAI_STT_MODEL`, `OPENAI_TTS_MODEL`, `OPENAI_TTS_VOICE` | `gpt-4o-mini-transcribe`, `gpt-4o-mini-tts`, `coral` | Voice: microphone input and "Listen" under replies |

If the membership API is unreachable, the app falls back to the last good copy,
then to `data/memberships_fixture.json`. `/api/health` reports which one is in use.

## Structure

```
main.py              routes
app/schemas.py       API contract (shared with the agent)
app/agent.py         run_agent(): LangGraph AI agent (classify, retrieve, generate, check)
app/rules_agent.py   keyword fallback: used without an API key or if the LLM fails
app/knowledge.py     FAQ search index (Chroma), kept in sync with the FAQ table
app/speech.py        speech-to-text and text-to-speech (OpenAI)
app/evaluate.py      agent evaluation: python -m app.evaluate, reports in reports/
docs/AGENT.md        how the AI agent works, safety rules, evaluation results
app/memberships.py   fetch + normalize + cache tiers
app/db.py            tables (SQLModel) and init_db(): runs the migrations at startup
migrations/          Alembic migrations (versions/0001_baseline_schema.py, ...)
app/staff.py         staff accounts: sign-in, sessions, roles
app/notify.py        reply notifications: email / WhatsApp / demo outbox
app/integrations/    connectors: member registry, requests to the association's system, status
app/faq.py           FAQ in the DB (faq_categories/faq_items), seeded once from data/faq.json
app/verify.py        member lookup (phone or email) + normalization
app/otp.py           verification codes: email (SMTP) / WhatsApp (Twilio), limits, hashing
app/audit.py         staff action log
app/export.py        CSV exports (UTF-8 BOM, formula-safe)
app/redact.py        strips emails/phone numbers from summaries
app/seed_demo.py     demo questions, requests, notifications and staff accounts (dev only)
static/tokens.css    design tokens (Figma "Screens v2"); styles use variables only
static/              chat, FAQ and staff dashboard (AR/RTL default, EN toggle)
tests/               success, error and permission tests
```

## Integrations (connectors to the association's systems)

Each connector lives in one file under `app/integrations/`, works with demo data today, and goes
live by settings only. Admins see the state of every connector, and the settings it needs, on
**التكاملات** (`/support#integrations`, `GET /api/integrations`); secret values are never shown.

**Member registry** (`members.py`, `MEMBER_REGISTRY`): after verification, who is a member.
`demo` reads `data/members_demo.json`, `file` reads `MEMBERS_FILE`, `api` asks the association:

```
POST {MEMBER_REGISTRY_URL}            Authorization: Bearer {MEMBER_REGISTRY_TOKEN}
{"phone": "+9665XXXXXXXX"}  or  {"email": "name@example.com"}
→ 200 {"found": true, "tier_id": "<id from the public memberships API>", "expires_at": "2027-05-01"}
→ 200 {"found": false}
```

Only the tier and expiry come back; nothing else about the member is stored or shown. If the
registry doesn't answer, the visitor sees "try again shortly" (503 `registry_unavailable`).
`_from_api` is the one place to adapt if the association's API differs.

**Requests to the association's system** (`case_sync.py`, `CASE_SYNC`): `case.created`,
`case.replied` and `case.status` are sent after the response (a failure never loses the request).

- `webhook`: JSON POST to `CASE_WEBHOOK_URL` with `X-SuperCX-Event`, `X-SuperCX-Delivery` (unique,
  for de-duplication) and `X-SuperCX-Signature: sha256=<HMAC-SHA256 of the body with
  CASE_WEBHOOK_SECRET>`. A 2xx answer is delivered; `{"external_id": "..."}` in it is kept.
- `email`: a readable Arabic message to `CASE_EMAIL_TO`.
- `demo` (default): the exact payload is kept in an outbox; staff read it in the case panel
  ("نظام الجمعية") and can send again. A live mode without its settings falls back to demo.
- The payload has the redacted request text, the contact only if the visitor gave it with
  consent, and never the tracking code. Every attempt is a `case_syncs` row (migration `0002`).

## Database migrations

The schema is managed with **Alembic** (`migrations/`). At every start the app runs
`upgrade head` (`app/db.py: init_db`), so a new deploy brings the database up to date by itself,
on SQLite locally and Postgres on Replit.

- **Changing a model:** edit `app/db.py`, then create the migration and review it:

```bash
alembic revision --autogenerate -m "add phone to staff_users"
```

  Commit the new file in `migrations/versions/`. `tests/test_migrations.py` fails if a model
  changed without a migration.
- **Useful commands:** `alembic current` (version of this database), `alembic history`,
  `alembic upgrade head --sql` (print the SQL without running it), `alembic downgrade -1`.
- **Databases from before migrations** (made by `create_all`): on first start they get the
  columns they lacked, the baseline creates only the tables they don't have, and they are marked
  as version `0001`. Data is kept.
- On Postgres, back up before a release that adds a migration (Replit: database → backups).

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

Demo data for the dashboard: `python -m app.seed_demo`. It adds the design's sample unanswered
questions, plus chat events and requests spread over the last 14 days (marked `demo`, replaced on
every run, real rows untouched) so the overview chart has data.

## Brand and assistant

- Design v3: always light (no dark mode). Blue `#3040D0` buttons, links and the user's bubble,
  `#5A62F5` badges and the recommended card, `#ECEEFC` soft backgrounds, text `#14152B`. Defined
  once in `static/tokens.css`. Fonts: IBM Plex Sans Arabic for text, Inter for numbers and the logo.
- SuperCX logo: temporary text logo ("Super" + blue "CX") made by one function, `Brand.logo()` in
  `static/brand.js`; pages hold a `data-brand-logo` placeholder, so swapping the logo is one edit.
  Favicon: `static/favicon.svg`.
- The assistant's photo is `static/img/mishari.png`, shown by `Brand.avatar()` (96px on the start
  screen, 32px beside messages on phones, 40px on laptops).
- The assistant is called **مشاري / Mishari**; the persona is only the name and avatar, the agent's
  wording is unchanged. Change it with `ASSISTANT_NAME_AR` / `ASSISTANT_NAME_EN`.
- Membership questions that compare tiers (or replies naming two or more) show three cards built
  in the browser from `/api/memberships` only, matched by `tier_id`: "Most popular" on the tier the
  API marks `is_most_common`, and "Best for you" with a frame on the recommended tier. Phones
  scroll the cards sideways with position dots; laptops show three columns.
- Screenshots: `docs/screenshots/`.

## Staff overview

The dashboard opens on **Overview** (`/support#overview`). Every number is counted from the
database, with a line under it saying how:

| Number | How it is counted |
|---|---|
| Questions today | `chat_events` since midnight Riyadh time (the period total is shown under it) |
| Answered by the assistant | `answer` + `recommend` ÷ all chat events in the period |
| Passed to support | `escalate` ÷ all chat events in the period |
| Open / overdue requests | `new` + `in_progress` now; overdue = `new` past `REPLY_BUSINESS_DAYS` |
| Verified answer rate | answers/recommendations that cite an approved source ÷ all chat events |
| Successful handoff rate | escalations the visitor sent on as a request ÷ all escalations |
| Registration after a recommendation | recommendations followed by "Go to the registration page" ÷ all recommendations |

`chat_events` stores time, language, the agent's action, whether the answer cited the FAQ /
any source, the recommended tier, and two follow-up flags. **No message text, no personal data.**
It is written in `main.py` around `run_agent` (the agent itself is unchanged); `/api/chat`
returns its `chat_event_id` so a later request or registration click can be linked to it.

| Endpoint | Access | Purpose |
|---|---|---|
| `GET /api/overview?date_from&date_to` | support token | All overview numbers (default: last 7 days) |
| `GET /api/staff/counts` | support token | New-request badge in the sidebar |
| `POST /api/chat-events/{id}/register` | public | Visitor opened the registration page from a recommendation (flag only) |

Date filter (today, 7 days, 30 days, custom) on Overview, Unanswered questions and Support cases:
sent to the server as `date_from`/`date_to` (Riyadh calendar days, inclusive), honored by the CSV
exports, and kept in the URL hash (`#cases?period=7d`) so it survives a reload.

## Request loop (visitor ↔ staff)

1. After sending (chat request card or `/#contact`), a confirmation card appears **inside the chat**:
   case number, type, status, the next step for that type (with and without contact details,
   `app/cases.py: NEXT_STEP`), and a **tracking code shown once** (stored only as a salted hash).
2. "طلباتي" (inbox icon, `/#requests`) keeps only case numbers and tracking codes in the
   browser's `localStorage`, polls their status, shows a timeline and the team's reply, and puts a
   dot on the icon when a new reply arrives. "تابع طلبك" adds a request from any device.
3. Staff open a case's details (side panel), see the full text, contact, summary and history,
   and send a reply; the status becomes "تم الرد". New cases past `REPLY_BUSINESS_DAYS` are
   flagged "رد جديد مطلوب".
4. **Notification** (`app/notify.py`): if the visitor left contact details, they are told a reply
   is ready, by email (SMTP) or WhatsApp (Twilio), in the case's language. The message holds the
   case number and a link `/?track=CX-…#requests` that opens "تابع طلبك" with the number filled
   in; the visitor still enters the tracking code. The reply text and the tracking code are never
   in the message. Sending runs after the response, so a provider failure never undoes the reply.
   - Without a provider, the message goes to a **demo outbox**: status "تجريبي: لم يُرسل فعليًا",
     and staff can read the exact text in the case panel. Setting the SMTP or Twilio secrets
     switches to real sending with no code change.
   - Each attempt is a `notifications` row (sent, simulated, failed, skipped), shown in the case
     panel with the masked recipient; "إعادة الإرسال" retries a failure (logged in the history).

| Endpoint | Access | Purpose |
|---|---|---|
| `POST /api/support-cases` | public | Returns `reference`, `tracking_code` (once), `next_step`, `due_at` |
| `POST /api/track` | public, attempt-limited | `{reference, code}` → status, dates and reply only. No request text, contact or staff name. Wrong code and unknown case both give 404; too many → 429 |
| `GET /api/support-cases/{id}` | support token | Case details (no tracking hash) |
| `POST /api/support-cases/{id}/reply` | support token | `{reply}` → saves reply, time and staff name (staff-only), status `replied`, and notifies the visitor |
| `GET /api/support-cases/{id}/notifications` | support token | Messages for the case, newest first (recipient masked) |
| `POST /api/support-cases/{id}/notify` | support token | Send again (retries a failed attempt, or sends a reminder); 409 if no reply yet or notifications are off |

Case types: `unanswered` (a question the assistant couldn't answer), `inquiry`, `complaint`,
`suggestion`, `service`. Statuses: `new`, `in_progress`, `replied`, `closed`.

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

The `action` can also be `verify`: a personal question (own status, expiry, renewal).
The UI shows the verification button; the agent never receives member data.

| `summary` | str or null | Case summary for support on `escalate` |

Available helpers: `get_tiers()`, `get_tier(id)`. The UI creates the support case
(`POST /api/support-cases`) after the user leaves contact details.

## Live vs. simulated

| Part | Status | Notes |
|---|---|---|
| Membership tiers (names, prices, benefits) | **Live** | Public API `cxa.sa/api/MemberShip/public`, read only; falls back to the bundled copy |
| Registration / renewal | **Link only** | Buttons open `cxa.sa/membership`; no enrollment or payment here (Track 2) |
| Support cases | **Live in this app** | Stored in this app's database; also sent to the association's system when `CASE_SYNC` is live |
| Staff reply and tracking | **Live in this app** | Visitors read the reply in "طلباتي" or by tracking code |
| Reply notifications | **Live when configured** | Email via SMTP, WhatsApp via Twilio; demo outbox (readable by staff) until a provider is set |
| Reply time ("within two business days") | **Assumption** | `REPLY_BUSINESS_DAYS`, labeled as an estimate until the association confirms it |
| Unanswered questions, FAQ | **Live in this app** | Database tables; FAQ content itself is demo (marked "تجريبي") until approved |
| Verification codes (OTP) | **Live when configured** | Email via SMTP, WhatsApp via Twilio; labeled simulation until a provider is set |
| Member records (type, expiry) | **Demo, ready for live** | `data/members_demo.json` until `MEMBER_REGISTRY=api` (or `file`) is set |
| Requests in the association's system | **Demo, ready for live** | Demo outbox until `CASE_SYNC=webhook` or `email` is set |
| AI answers | **Live with `OPENAI_API_KEY`** | LangGraph agent over the FAQ (Chroma) and live tier data; rule-based fallback without a key |

## Still to do

- From the association: the member registry endpoint and token (`MEMBER_REGISTRY=api`), and where requests should go (a webhook URL, or a team inbox).
- WhatsApp Business sender approval for production WhatsApp codes.
- Approved FAQ content and sources from the association; replace the demo answers.
- Confirm the expected reply time with the association (`REPLY_BUSINESS_DAYS`).
- Choose the email/WhatsApp provider and get the WhatsApp reply template approved by Meta (notifications run in the demo outbox until then).
- Sign in with the association's identity provider (SSO), if they have one; today staff accounts live in this app.

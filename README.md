# SuperCX

AI membership assistant for the Saudi CX Association (CX Hackathon, Track 1).

## Run

```bash
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

- Chat: `http://localhost:8000/`
- Support dashboard: `http://localhost:8000/support`
- API docs: `http://localhost:8000/docs`
- Tests: `python -m pytest -q`

## Environment (Replit Secrets)

| Variable | Default | Purpose |
|---|---|---|
| `DATABASE_URL` | `sqlite:///./supercx.db` | Set automatically by Replit Postgres |
| `SUPPORT_TOKEN` | `dev-support-token` | Support dashboard access. **Change in production** |
| `MEMBERSHIP_API_URL` | `https://cxa.sa/api/MemberShip/public` | Live tier data |
| `MEMBERSHIP_CACHE_SECONDS` | `3600` | Tier cache lifetime |

If the membership API is unreachable, the app falls back to the last good copy,
then to `data/memberships_fixture.json`. `/api/health` reports which one is in use.

## Structure

```
main.py              routes
app/schemas.py       API contract (shared with the agent)
app/agent.py         run_agent(): rule-based stub, replaced by the LLM agent
app/memberships.py   fetch + normalize + cache tiers
app/db.py            support_cases table
static/              chat UI and support dashboard
tests/               success, error and permission tests
```

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

## Integration limits (current)

- Tier data: **live** from `cxa.sa/api/MemberShip/public` (read only).
- Support cases: stored in this app's database, not yet in the association's system.
- Registration: links to `cxa.sa/membership`; enrollment stays in Track 2.

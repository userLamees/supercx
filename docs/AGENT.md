# SuperCX AI agent

The assistant inside the Saudi Customer Experience Association website (Track 1: member and
digital-service experience). It answers from the association's approved content, recommends a
membership, sends personal questions to identity verification, and hands everything it cannot
answer reliably to the support team with a ready summary. Users can type or speak, and listen
to any reply.

This document covers how the agent works, how it connects to the rest of SuperCX, how it was
tested, and what is left to finish.

## What the hackathon asked for, and where it is

| Requirement (hackathon guide) | How SuperCX does it |
|---|---|
| Answer from the association's approved information (services, FAQ, news, events) | RAG over the FAQ table (`app/knowledge.py`) and live membership data from cxa.sa |
| Give general information directly | `answer` replies with the source link and the date it was last checked |
| Verify the user before personal membership information | Personal questions return `verify`; the UI starts the email or WhatsApp code flow. The agent never receives member data |
| Link membership information to the association's record | After verification, `/api/verify/check` reads the member registry (`app/verify.py`) |
| Route to the right channel when there is no reliable answer | `escalate` with a redacted summary and request type, saved as a support case |
| Classify the request and hand it over with a summary (idea 35) | The router sets the category (inquiry, complaint, suggestion, service) and writes the summary |
| Learn from unanswered questions (idea 38) | Unanswered questions are logged; staff turn them into FAQ entries, and the search index updates at once |

## How it works

`app/agent.py` is a LangGraph workflow. Every message goes through the same steps:

```
classify ──► personal ─────────────► verify     (identity check first)
         ├─► greeting / off-topic ─► reply
         ├─► request / complaint ──► escalate   (case summary for support)
         └─► faq / membership / recommend
                ──► retrieve (FAQ search + live tier data)
                ──► generate (LLM answers from that context only)
                ──► check    (sources, tier id, "not found") ──► escalate if anything fails
```

1. **Classify.** One LLM call returns the intent, the question rewritten to stand alone
   ("how much is it?" becomes "how much is the Supporter membership?"), the request category,
   and a one-sentence summary for staff.
2. **Retrieve.** The FAQ index is searched with both the rewritten question and the user's own
   words, and each FAQ entry is kept once with its best score. Membership prices and benefits
   come from the live cxa.sa API, not from RAG, so numbers are always current.
3. **Generate.** A second LLM call answers only from that context, in the user's language,
   and returns structured output: `found`, the answer, the FAQ and tier ids it used, and the
   recommended tier.
4. **Check.** Code turns that output into the reply, or escalates (see the safety rules below).

If there is no `OPENAI_API_KEY`, or the LLM call fails, `app/rules_agent.py` (keyword rules)
answers instead, so the chat never stops during a demo.

### Knowledge base

`app/knowledge.py` indexes the FAQ table in Chroma:

- One document per FAQ entry and language. Arabic and English are indexed separately, and the
  search matches across languages (an Arabic question finds the English entry and the reverse).
- Arabic is normalized before embedding: diacritics, tatweel and alef forms
  (إ أ آ ٱ → ا), so spelling variants match.
- Each document keeps its source title, link, last-checked date and demo flag as metadata.
- **Sync:** the index is rebuilt at startup and after every FAQ change in the staff dashboard.
  A content hash means only new or edited entries are embedded again, and deleted entries are
  removed. The database stays the source of truth; deleting `chroma_db/` is always safe.

## Safety rules enforced in code

These do not depend on the prompt, so a confused or manipulated LLM cannot break them:

- **Sources come from our data, never from the LLM.** Links are read from the FAQ table and the
  tier API by id. An id the LLM invents is ignored.
- **No source, no answer.** A reply that cites nothing we retrieved is escalated.
- **Recommendations must be real tiers.** A tier id that does not exist means escalation.
- **Personal questions never reach the LLM with member data.** The agent only returns
  `verify`; data is shown by the verification flow after the code is confirmed.
- **Summaries are redacted** (emails and phone numbers removed) before they reach staff.
- **The chat always answers.** Any agent error falls back to the rule-based agent.

## Voice

Users can ask by voice and listen to any reply, using the same OpenAI key
(adapted from Afaq's `speech_tools.py`):

- **Microphone** in the composer records up to 60 seconds. While it records, the message box
  turns red and shows "Listening…" with a timer, so users know when to speak.
  `POST /api/speech/transcribe` (`gpt-4o-mini-transcribe`) turns it into text, which is placed
  in the message box so the user can check or fix it before sending.
- **Unclear audio is rejected, not guessed.** The language is detected from the speech (not
  from the interface language), a short context prompt helps with Saudi dialect, and a
  transcript that is neither Arabic nor English (speech models can "hear" another language in
  silence or noise) returns "couldn't understand, try again". Taps shorter than 0.8 s are ignored.
- **Listen** under each reply calls `POST /api/speech/synthesize` (`gpt-4o-mini-tts`, voice
  `coral`) and plays the MP3. Audio is generated once per reply and replayed from memory.
- Both buttons appear only when `GET /api/speech` reports voice is enabled and the browser can
  record. Limits: 5 MB per recording, 1,500 characters per reply.

## Connection to the rest of SuperCX

| Part | File | How the agent uses it |
|---|---|---|
| Chat API | `main.py` `POST /api/chat` | Calls `run_agent(message, history)`; the `ChatResponse` contract is unchanged |
| Chat contract | `app/schemas.py` | Added `action: "verify"` and optional `category` |
| Chat UI | `static/chat.js` | Shows the verify button, preselects the request type, microphone and Listen buttons |
| FAQ (staff editor) | `app/faq.py`, `/api/staff/faq-items` | Source of the knowledge base; every change re-syncs the index |
| Membership data | `app/memberships.py` | Live prices and benefits for comparisons and recommendations |
| Verification | `app/verify.py`, `/api/verify/*` | Handles personal questions after `verify` |
| Support cases | `/api/support-cases` | Escalations become cases with the agent's summary |
| Unanswered log | `main.py` | Questions without an answer are logged; requests (complaints etc.) are not |

## Evaluation

`python -m app.evaluate` runs the real agent on `data/eval_questions.json` (34 questions in
Arabic, Saudi dialect and English) and writes a report to `reports/`. Retrieval and answers are
evaluated separately, and every check is done in code, without an LLM judge, so results are
cheap and repeatable.

| Question type | Count | Expected behaviour |
|---|---|---|
| Answerable (formal, dialect, English) | 10 | Answer with the right FAQ source |
| Membership prices and benefits | 4 | Correct live figures |
| Recommendations, including a follow-up "how much is it?" | 4 | The right tier |
| Ambiguous ("is it worth it?") | 2 | No guessed recommendation |
| Not in the sources (discounts, installments, refunds) | 5 | Escalate, never guess |
| Personal (expiry, status) | 3 | Ask for verification |
| Complaint and suggestion | 2 | Escalate with the right category |
| Off-topic and prompt injection | 4 | Polite refusal, no sources |

### Results and what changed

| Run | Passed | Change before the run |
|---|---|---|
| 1 | 28/34 (82%) | First version, similarity threshold 0.45 |
| 2 | 32/34 (94%) | Threshold lowered to 0.30; volunteering and joining treated as questions, not requests; no recommendation without a stated need |
| 3 | **34/34 (100%)** | Questions about the association itself are never treated as off-topic |

Model `gpt-4.1-mini`, embeddings `text-embedding-3-small`, top k 4. Average 2 to 4 seconds per
question. Full reports are in `reports/`.

**The key finding:** similarity scores of answerable and unanswerable questions overlap. The
lowest answerable question scored 0.302 ("I want to volunteer"), while an unanswerable one
scored 0.588 ("can I get a refund?", close to "membership fees"). No single threshold can
separate them, so the threshold is kept low (0.30) to let real answers through, and the LLM's
`found=false` check, followed by the source check in code, rejects the rest. All five
unanswerable questions were escalated in every run.

**Limits of these numbers:** the FAQ currently has six demo entries, so 34 questions cover a
small knowledge base. The checks verify the decision, sources, language and key facts, not the
quality of the wording, so the replies in the report should also be read. Results can vary
slightly between runs even at temperature 0.

## Run it

```bash
pip install -r requirements.txt
cp .env.example .env              # then set OPENAI_API_KEY and SUPPORT_TOKEN
uvicorn main:app --reload --port 8000

python -m pytest -q               # all tests, offline (no API calls)
python -m app.knowledge "كيف أنضم للجمعية؟"   # rebuild the index and show search scores
python -m app.agent "أبغى عضوية أقدر أصوّت فيها"  # trace one question step by step
python -m app.evaluate            # full evaluation with the real model
python -m app.evaluate --model gpt-6-luna      # compare another model
```

On Replit, add `OPENAI_API_KEY` and `SUPPORT_TOKEN` in Secrets. The search index is built
from the FAQ table when the app starts.

### Settings

| Variable | Default | Purpose |
|---|---|---|
| `OPENAI_API_KEY` | none | Turns on the AI agent and voice; without it the rule-based agent answers |
| `LLM_MODEL` | `gpt-4.1-mini` | Model for routing and answers |
| `EMBEDDING_MODEL` | `text-embedding-3-small` | Model for the FAQ index |
| `CHROMA_DIR` | `./chroma_db` | Index folder (rebuilt from the database if deleted) |
| `RAG_TOP_K` | `4` | FAQ entries retrieved per question |
| `RAG_MIN_SCORE` | `0.30` | Weaker matches are ignored (chosen by evaluation) |
| `OPENAI_STT_MODEL` | `gpt-4o-mini-transcribe` | Speech to text |
| `OPENAI_TTS_MODEL` | `gpt-4o-mini-tts` | Text to speech |
| `OPENAI_TTS_VOICE` | `coral` | Voice for replies |

## What is left to finish

- **Content.** Replace the six demo FAQ entries with the association's approved content, and add
  services, news and events pages to the knowledge base (the indexer already handles more
  sources; only loaders are needed).
- **Eligibility conditions and documents** are not published, so the agent escalates those
  questions. Once the association confirms them, add them to the FAQ.
- **Events by chat.** Answer "what events are coming up?" with dates from an events feed,
  not only a link to the events page.
- **Clarifying questions.** Ambiguous questions are answered with all options or escalated;
  asking "which membership do you mean?" would be better.
- **Production limits.** Add rate limiting on chat and voice endpoints, and monitor API cost.
- **Grow the evaluation.** Add a case to `data/eval_questions.json` whenever a real question
  goes wrong, and rerun before each release.

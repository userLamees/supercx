"""Evaluates the AI agent on data/eval_questions.json and writes a report.

Run (uses the real API key; about 70 short LLM calls, a few cents):

    python -m app.evaluate
    python -m app.evaluate --model gpt-6-luna          # compare another model
    python -m app.evaluate --min-score 0.40            # try another similarity threshold

Retrieval and answers are evaluated separately (as in the RAG workshop), and every
metric is computed in code, without an LLM judge, so results are cheap and repeatable:

- Retrieval: did the search find the expected FAQ entry (recall@k), and how far apart
  are the scores of answerable and unanswerable questions (to choose RAG_MIN_SCORE).
- Decision: did the agent answer, recommend, escalate or ask for verification as expected.
- Recommendation: the right tier. Requests: the right category.
- Grounding: every answer cites a source; facts like prices appear when expected.
- Language: the reply is in the user's language.

The report is saved in reports/ (one Markdown file per run) for the submission.
"""
import argparse
import json
import re
import time
from collections import defaultdict
from datetime import datetime
from pathlib import Path

from sqlmodel import Session, select

from . import config
from .db import FaqItem, engine, init_db
from .rules_agent import TIER_AFFILIATE, TIER_AMBASSADOR, TIER_SUPPORTER, detect_lang
from .schemas import ChatTurn

ROOT = Path(__file__).resolve().parent.parent
CASES_FILE = ROOT / "data" / "eval_questions.json"
REPORTS_DIR = ROOT / "reports"
TIERS = {"affiliate": TIER_AFFILIATE, "ambassador": TIER_AMBASSADOR, "supporter": TIER_SUPPORTER}
ACTIONS = {"answer", "recommend", "escalate", "verify"}
_ARABIC = re.compile(r"[؀-ۿ]")
_DIGITS = str.maketrans("٠١٢٣٤٥٦٧٨٩", "0123456789")


def load_cases(path: Path = CASES_FILE) -> list[dict]:
    cases = json.loads(path.read_text(encoding="utf-8"))["cases"]
    for c in cases:  # fail early on a typo in the file
        assert set(c["actions"]) <= ACTIONS, c["id"]
        assert c.get("tier") in (None, *TIERS), c["id"]
    return cases


def _plain(text: str) -> str:
    """Digits and text compared without separators: 100,000 / 100000 / ١٠٠٬٠٠٠ all match."""
    return re.sub(r"[,٬\s]", "", text.translate(_DIGITS))


def reply_language_ok(answer: str, lang: str) -> bool:
    letters = [ch for ch in answer if ch.isalpha()]
    if not letters:
        return True
    arabic = sum(bool(_ARABIC.match(ch)) for ch in letters) / len(letters)
    return arabic > 0.5 if lang == "ar" else arabic < 0.2


def check(case: dict, reply) -> dict[str, bool]:
    """Pass/fail for every check that applies to this case. `reply` is a ChatResponse."""
    lang = detect_lang(case["question"])
    action = reply.action.value
    result = {"decision": action in case["actions"], "language": reply.lang == lang and reply_language_ok(reply.answer, lang)}
    if action in ("answer", "recommend") and not case.get("no_sources"):
        result["sources"] = bool(reply.sources)
    if case.get("no_sources"):
        result["no_sources"] = not reply.sources and reply.tier_id is None
    if case.get("tier"):
        result["tier"] = reply.tier_id == TIERS[case["tier"]]
    if case.get("not_tier"):
        result["no_guess"] = action != "recommend"
    if case.get("category"):
        result["category"] = getattr(reply, "category", None) == case["category"]
    for text in case.get("must_include", []):
        result[f"has {text}"] = _plain(text) in _plain(reply.answer)
    return result


def _faq_ids_by_question() -> dict[str, set[str]]:
    with Session(engine) as session:
        items = session.exec(select(FaqItem)).all()
    ids = defaultdict(set)
    for item in items:
        ids[item.question_ar or item.question_en].add(item.id)
    return ids


def evaluate_retrieval(cases: list[dict]) -> dict:
    """Search only (embeddings, no LLM). Recall@k with and without the threshold, and the
    best score of each answerable and unanswerable question."""
    from .knowledge import search

    faq_ids = _faq_ids_by_question()
    rows, top_answerable, top_unanswerable = [], [], []
    for case in cases:
        hits = search(case["question"], min_score=0.0)
        top = hits[0].score if hits else 0.0
        if case["type"] == "unanswerable":
            top_unanswerable.append((top, case["id"]))
        if not case.get("faq"):
            continue
        expected = faq_ids.get(case["faq"], set())
        rank = next((i + 1 for i, h in enumerate(hits) if h.item_id in expected), None)
        score = next((h.score for h in hits if h.item_id in expected), None)
        rows.append({"id": case["id"], "rank": rank, "score": score,
                     "kept": score is not None and score >= config.RAG_MIN_SCORE})
        if score is not None:
            top_answerable.append((score, case["id"]))
    return {"rows": rows, "answerable": sorted(top_answerable), "unanswerable": sorted(top_unanswerable, reverse=True)}


def run_case(case: dict):
    """Runs the full agent graph. Errors are reported, not hidden by the rule-based fallback."""
    from .agent import get_graph

    history = [ChatTurn(**turn) for turn in case.get("history", [])]
    start = time.perf_counter()
    try:
        state = get_graph().invoke({"message": case["question"], "history": history,
                                    "lang": detect_lang(case["question"])})
        reply, error = state["reply"], None
    except Exception as exc:  # noqa: BLE001
        reply, error = None, f"{type(exc).__name__}: {exc}"[:200]
    return reply, error, time.perf_counter() - start


def _pct(part: int, whole: int) -> str:
    return f"{part}/{whole} ({100 * part / whole:.0f}%)" if whole else "n/a"


def build_report(cases, results, retrieval, started: datetime) -> str:
    lines = [f"# SuperCX agent evaluation, {started:%Y-%m-%d %H:%M}", "",
             f"Model `{config.LLM_MODEL}` · embeddings `{config.EMBEDDING_MODEL}` · "
             f"top k {config.RAG_TOP_K} · min score {config.RAG_MIN_SCORE} · {len(cases)} questions", ""]

    passed = sum(1 for r in results if r["checks"] and all(r["checks"].values()))
    lines += ["## Summary", "", "| Metric | Result |", "|---|---|",
              f"| All checks passed | {_pct(passed, len(results))} |"]
    totals = defaultdict(lambda: [0, 0])
    for r in results:
        for name, ok in r["checks"].items():
            key = "must include" if name.startswith("has ") else name
            totals[key][0] += ok
            totals[key][1] += 1
    for name, (ok, n) in totals.items():
        lines.append(f"| {name} | {_pct(ok, n)} |")
    rr = retrieval["rows"]
    lines.append(f"| retrieval recall@{config.RAG_TOP_K} (expected FAQ found, any score) | "
                 f"{_pct(sum(1 for r in rr if r['rank']), len(rr))} |")
    lines.append(f"| retrieval kept by threshold {config.RAG_MIN_SCORE} | {_pct(sum(1 for r in rr if r['kept']), len(rr))} |")
    errors = sum(1 for r in results if r["error"])
    times = [r["seconds"] for r in results if not r["error"]]
    lines.append(f"| errors | {errors} |")
    if times:
        lines.append(f"| average time per question | {sum(times) / len(times):.1f} s |")

    by_type = defaultdict(lambda: [0, 0])
    for r in results:
        by_type[r["case"]["type"]][0] += bool(r["checks"]) and all(r["checks"].values())
        by_type[r["case"]["type"]][1] += 1
    lines += ["", "## By question type", "", "| Type | Passed |", "|---|---|"]
    lines += [f"| {t} | {_pct(ok, n)} |" for t, (ok, n) in by_type.items()]

    lines += ["", "## Similarity threshold", "",
              "Score of the expected FAQ entry for answerable questions, and the best score for questions "
              "that have no answer. A good threshold sits between the two groups.", ""]
    if retrieval["answerable"]:
        low = retrieval["answerable"][0]
        lines.append(f"- Lowest answerable: **{low[0]:.3f}** ({low[1]})")
    if retrieval["unanswerable"]:
        high = retrieval["unanswerable"][0]
        lines.append(f"- Highest unanswerable: **{high[0]:.3f}** ({high[1]})")
    if retrieval["answerable"] and retrieval["unanswerable"]:
        low, high = retrieval["answerable"][0][0], retrieval["unanswerable"][0][0]
        lines.append(f"- {'Separated: any threshold between them works' if low > high else 'Overlap: the threshold alone cannot separate them; the LLM check (found=false) is needed'}")

    lines += ["", "## Every question", "", "| Result | Id | Type | Question | Action | Failed checks | Reply |", "|---|---|---|---|---|---|---|"]
    for r in results:
        ok = bool(r["checks"]) and all(r["checks"].values())
        failed = ", ".join(k for k, v in r["checks"].items() if not v) or ("error" if r["error"] else "")
        reply = r["error"] or (r["reply"].answer if r["reply"] else "")
        reply = reply.replace("\n", " ").replace("|", "/")[:140]
        action = r["reply"].action.value if r["reply"] else "-"
        lines.append(f"| {'✅' if ok else '❌'} | {r['case']['id']} | {r['case']['type']} | {r['case']['question']} | {action} | {failed} | {reply} |")

    lines += ["", "## Retrieval per question", "", "| Id | Rank of expected FAQ | Score | Kept |", "|---|---|---|---|"]
    for row in rr:
        score = f"{row['score']:.3f}" if row["score"] is not None else "-"
        lines.append(f"| {row['id']} | {row['rank'] or 'not found'} | {score} | {'yes' if row['kept'] else 'no'} |")
    return "\n".join(lines) + "\n"


def main() -> None:
    parser = argparse.ArgumentParser(description="Evaluate the SuperCX agent")
    parser.add_argument("--model", help="LLM model (default: LLM_MODEL from .env)")
    parser.add_argument("--min-score", type=float, help="similarity threshold (default: RAG_MIN_SCORE)")
    parser.add_argument("--only", help="comma-separated case ids, to rerun a few")
    args = parser.parse_args()

    if not config.AGENT_ENABLED:
        raise SystemExit("Set OPENAI_API_KEY in .env first: the evaluation runs the real agent.")
    if args.model:
        config.LLM_MODEL = args.model
    if args.min_score is not None:
        config.RAG_MIN_SCORE = args.min_score

    from .faq import seed_faq
    from .knowledge import refresh_index
    init_db()
    with Session(engine) as session:
        seed_faq(session)
    refresh_index()

    cases = load_cases()
    if args.only:
        wanted = set(args.only.split(","))
        cases = [c for c in cases if c["id"] in wanted]
    started = datetime.now()

    print(f"Retrieval: {len(cases)} questions…")
    retrieval = evaluate_retrieval(cases)

    results = []
    for i, case in enumerate(cases, 1):
        reply, error, seconds = run_case(case)
        checks = check(case, reply) if reply else {}
        ok = bool(checks) and all(checks.values())
        print(f"{i:>2}/{len(cases)} {'PASS' if ok else 'FAIL'}  {case['id']:<18} "
              f"{reply.action.value if reply else 'ERROR':<10} {', '.join(k for k, v in checks.items() if not v) or error or ''}")
        results.append({"case": case, "reply": reply, "error": error, "seconds": seconds, "checks": checks})

    REPORTS_DIR.mkdir(exist_ok=True)
    path = REPORTS_DIR / f"eval-{started:%Y%m%d-%H%M}-{config.LLM_MODEL}.md"
    path.write_text(build_report(cases, results, retrieval, started), encoding="utf-8")
    passed = sum(1 for r in results if r["checks"] and all(r["checks"].values()))
    print(f"\nPassed {passed}/{len(results)}. Report: {path}")


if __name__ == "__main__":
    main()

"""The evaluation script: the question file is valid and the checks score replies correctly."""
import json
from datetime import datetime

from app import evaluate
from app.evaluate import check, load_cases, reply_language_ok
from app.rules_agent import TIER_SUPPORTER
from app.schemas import ChatAction, ChatResponse, Source

SOURCE = [Source(title="صفحة العضويات", url="https://cxa.sa/membership")]


def test_question_file_is_valid_and_faq_targets_exist():
    cases = load_cases()
    assert len({c["id"] for c in cases}) == len(cases) >= 30
    seed = json.loads((evaluate.ROOT / "data" / "faq.json").read_text(encoding="utf-8"))
    questions = {i["question"]["ar"] for cat in seed["categories"] for i in cat["items"]}
    assert all(c["faq"] in questions for c in cases if c.get("faq"))
    assert {c["type"] for c in cases} >= {"answerable", "ambiguous", "unanswerable", "personal"}


def test_language_check():
    assert reply_language_ok("الرسوم 750 ريال سنويًا", "ar")
    assert reply_language_ok("The fee is SAR 750 per year", "en")
    assert not reply_language_ok("The fee is SAR 750 per year", "ar")


def test_correct_recommendation_passes_every_check():
    case = {"id": "x", "type": "recommend", "question": "كم سعرها؟", "actions": ["recommend"],
            "tier": "supporter", "must_include": ["100,000"]}
    reply = ChatResponse(answer="عضوية داعم بسعر 100000 ريال سنويًا", lang="ar", action=ChatAction.recommend,
                         tier_id=TIER_SUPPORTER, sources=SOURCE)
    assert all(check(case, reply).values())


def test_wrong_decision_and_missing_source_fail():
    case = {"id": "x", "type": "unanswerable", "question": "هل يوجد خصم للطلاب؟", "actions": ["escalate"]}
    reply = ChatResponse(answer="نعم يوجد خصم 50%", lang="ar", action=ChatAction.answer)
    result = check(case, reply)
    assert result["decision"] is False and result["sources"] is False


def test_request_category_is_checked():
    case = {"id": "x", "type": "request", "question": "عندي شكوى", "actions": ["escalate"], "category": "complaint"}
    reply = ChatResponse(answer="سأحوّل طلبك", lang="ar", action=ChatAction.escalate, category="inquiry")
    assert check(case, reply)["category"] is False


def test_report_is_built(client):
    cases = load_cases()[:3]
    reply = ChatResponse(answer="جواب", lang="ar", action=ChatAction.answer, sources=SOURCE)
    results = [{"case": c, "reply": reply, "error": None, "seconds": 1.0, "checks": check(c, reply)} for c in cases]
    retrieval = {"rows": [{"id": "join-ar", "rank": 1, "score": 0.6, "kept": True}],
                 "answerable": [(0.6, "join-ar")], "unanswerable": [(0.3, "salary")]}
    report = evaluate.build_report(cases, results, retrieval, datetime(2026, 11, 25, 9, 0))
    assert "## Summary" in report and "Separated" in report and "join-ar" in report

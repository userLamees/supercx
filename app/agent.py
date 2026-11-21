"""Agent entry point used by POST /chat.

TEMPORARY rule-based stub so the full journey works end to end.
Noura replaces the body of `run_agent` with the LLM agent; the signature and
the ChatResponse contract must stay the same.
"""
import re

from .memberships import get_tiers
from .schemas import ChatAction, ChatResponse, ChatTurn, Lang, Source, Tier

# Stable tier ids from cxa.sa/api/MemberShip/public (never match on display names).
TIER_AFFILIATE = "f1aecbd7-45e8-4438-919d-45a41b5d54f5"
TIER_AMBASSADOR = "5c54d2bc-2d3c-41e7-949c-62d45c22093b"
TIER_SUPPORTER = "85eb5afe-b4df-436d-b153-d2daa4acb6ce"

_ARABIC = re.compile(r"[\u0600-\u06FF]")

# Intent keywords (stub only).
_UNPUBLISHED = ("شرط", "شروط", "خصم", "تقسيط", "استرداد", "condition", "eligib", "discount", "refund", "installment")
_VOTE = ("تصويت", "الجمعية العمومية", "vote", "general assembly")
_EXCLUSIVE = ("حصري", "حصرية", "ترحيب", "exclusive", "welcome")
_BASIC = ("ارخص", "أرخص", "أقل", "اقل", "بسيط", "cheapest", "basic", "lowest")
_MEMBERSHIP = ("عضوي", "اشتراك", "انضم", "فئ", "member", "join", "tier", "fee", "price")

_SOURCE = {"ar": "صفحة العضويات", "en": "Memberships page"}


def detect_lang(text: str) -> Lang:
    return "ar" if _ARABIC.search(text) else "en"


def _has(text: str, words: tuple[str, ...]) -> bool:
    lowered = text.lower()
    return any(w in lowered for w in words)


def _price(tier: Tier, lang: Lang) -> str:
    amount = f"{tier.price_sar:,.0f}"
    return f"{amount} ريال سنويًا" if lang == "ar" else f"SAR {amount} per year"


def _source(tier: Tier, lang: Lang) -> Source:
    return Source(title=_SOURCE[lang], url=tier.source_url)


def _recommend(tier: Tier, lang: Lang, reason: str) -> ChatResponse:
    features = "\n".join(f"• {f}" for f in getattr(tier.features, lang))
    if lang == "ar":
        answer = f"أنصحك بعضوية {tier.name.ar} ({_price(tier, lang)})، لأنها {reason}.\n\nمزاياها:\n{features}"
    else:
        answer = f"I recommend the {tier.name.en} membership ({_price(tier, lang)}) because it {reason}.\n\nBenefits:\n{features}"
    return ChatResponse(answer=answer, lang=lang, action=ChatAction.recommend,
                        tier_id=tier.id, sources=[_source(tier, lang)])


def _escalate(message: str, lang: Lang) -> ChatResponse:
    answer = (
        "لا أجد هذه المعلومة في المحتوى المعتمد للجمعية، ولا أريد أن أخمّن. يمكنني تحويل سؤالك إلى فريق الدعم."
        if lang == "ar" else
        "I can't find this in the association's approved content, and I won't guess. I can pass your question to the support team."
    )
    return ChatResponse(answer=answer, lang=lang, action=ChatAction.escalate,
                        needs_contact=True, summary=f"[{lang}] {message.strip()[:300]}")


def run_agent(message: str, history: list[ChatTurn]) -> ChatResponse:
    lang = detect_lang(message)
    tiers = {t.id: t for t in get_tiers()}

    if _has(message, _UNPUBLISHED):
        return _escalate(message, lang)
    if _has(message, _VOTE) and TIER_SUPPORTER in tiers:
        reason = "الوحيدة التي تمنح حق الحضور والتصويت في الجمعية العمومية" if lang == "ar" else "is the only tier with the right to attend and vote in the General Assembly"
        return _recommend(tiers[TIER_SUPPORTER], lang, reason)
    if _has(message, _EXCLUSIVE) and TIER_AMBASSADOR in tiers:
        reason = "تضيف الفعاليات الحصرية والترحيب الشخصي في قنوات الجمعية" if lang == "ar" else "adds exclusive events and a personal welcome on the association's channels"
        return _recommend(tiers[TIER_AMBASSADOR], lang, reason)
    if _has(message, _BASIC) and TIER_AFFILIATE in tiers:
        reason = "تغطي البطاقة والفعاليات وخصومات الشركاء بأقل رسوم" if lang == "ar" else "covers the card, events and partner discounts at the lowest fee"
        return _recommend(tiers[TIER_AFFILIATE], lang, reason)
    if _has(message, _MEMBERSHIP):
        lines = "\n".join(f"• {getattr(t.name, lang)}: {_price(t, lang)}" for t in tiers.values())
        answer = (
            f"لدى الجمعية {len(tiers)} عضويات:\n{lines}\n\nهل تهمك الفعاليات الحصرية، أو التصويت في الجمعية العمومية، أو تبحث عن الأساسيات بأقل رسوم؟"
            if lang == "ar" else
            f"The association offers {len(tiers)} memberships:\n{lines}\n\nDo you care about exclusive events, voting in the General Assembly, or just the essentials at the lowest fee?"
        )
        source = next(iter(tiers.values()))
        return ChatResponse(answer=answer, lang=lang, action=ChatAction.answer, sources=[_source(source, lang)])
    return _escalate(message, lang)

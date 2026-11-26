"""The assistant on WhatsApp (idea 39): the same agent and the same rules as the website chat.

- Answers come from run_agent() with the approved sources written under each answer.
- Personal information (membership status) is shown only for the number that is writing:
  WhatsApp has already verified that the sender holds that number, which is what the website's
  verification code proves. No other member's data can be asked for.
- When the agent can't answer, nothing is sent to the team until the visitor agrees ("1").
  The case then has this number as its contact, a case number and a tracking code, exactly like
  the website, and it goes on to the association's system (case_sync) and the notifications.
- The number is stored only as a hash; recent turns (redacted) are kept for
  WHATSAPP_SESSION_MINUTES to keep context, then forgotten.

Transport: Twilio's WhatsApp webhook (main.py) or the staff simulator (demo). Both call handle().
"""
import json
import re
import threading
import time
from collections import defaultdict, deque
from dataclasses import dataclass, field
from datetime import date, datetime, timedelta, timezone
from typing import Callable, Optional

from sqlmodel import Session, select

from . import cases, config, otp
from .chatlog import record_chat_event, record_unanswered
from .db import ChatEvent, SupportCase, WhatsAppConversation
from .integrations import case_sync
from .integrations.members import RegistryUnavailable, lookup
from .memberships import get_tier, get_tiers
from .redact import redact
from .rules_agent import detect_lang
from .schemas import ChatAction, ChatResponse, ChatTurn
from .verify import normalize_phone

MAX_CHARS = 1500           # WhatsApp/Twilio allow 1600 per message; keep a margin
HISTORY_TURNS = 6
STATUS = re.compile(r"حالة عضويتي|متى تنتهي عضويتي|تجديد عضويتي|عضويتي سارية|membership status|renew my membership|when does my membership", re.I)
MY_REQUESTS = re.compile(r"^\s*(طلباتي|حالة طلبي|my requests|request status)\s*[؟?]?\s*$", re.I)
HELP = re.compile(r"^\s*(مساعدة|القائمة|ابدأ|help|menu|start)\s*$", re.I)
# A greeting alone gets the welcome (people often open a WhatsApp chat with one).
GREETING = re.compile(r"^\s*(السلام عليكم( ورحمة الله( وبركاته)?)?|سلام|مرحبا|مرحبًا|أهلا|أهلًا|اهلا|هلا|صباح الخير|مساء الخير|"
                      r"hi|hello|hey|good (morning|evening))\s*[!.؟?،,]*\s*$", re.I)
YES = re.compile(r"^\s*(1|١|نعم|موافق|أوافق|اوافق|yes|ok|okay|sure)\s*[.!]?\s*$", re.I)
NO = re.compile(r"^\s*(2|٢|لا|لا شكرا|لا شكرًا|no|no thanks)\s*[.!]?\s*$", re.I)
COMPARE = re.compile(r"الفرق بين|قارن|مقارنة|العضويات المتاحة|أنواع العضوي|ما هي العضويات|كل العضويات|compare|comparison|difference between|membership (types|options|levels)", re.I)

_MONTHS_AR = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"]
_MONTHS_EN = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]

T = {
    "ar": {
        "welcome": "أهلًا، أنا {name}، مساعدك في جمعية تجربة العميل. اسألني عن العضويات والفعاليات والتسجيل.\nاكتب «حالة عضويتي» لمعرفة عضويتك، أو «طلباتي» لمتابعة طلباتك.",
        "source": "المصدر: {title}\n{url}",
        "checked": "آخر تحقق: {date}",
        "per_year": "ريال سنويًا",
        "per_years": "ريال لكل {n} سنوات",
        "best": "الأنسب لك",
        "popular": "الأكثر شعبية",
        "register": "للتسجيل: {url}",
        "pending_terms": "شروط الأهلية والمستندات بانتظار تأكيد الجمعية.",
        "consent": "{answer}\n\nهل توافق على إرسال ملخص سؤالك إلى فريق الجمعية؟ سيتواصلون معك على هذا الرقم.\nاكتب 1 للموافقة، أو 2 للإلغاء.",
        "not_found": "لا أجد هذه المعلومة في مصادر الجمعية المعتمدة، ولن أخمّن.",
        "request_intro": "يمكنني إيصال طلبك إلى فريق الجمعية.",
        "consent_no": "حسنًا، لم نرسل شيئًا. اسألني عن أي شيء آخر.",
        "case_sent": "أُرسل طلبك إلى فريق الجمعية.\nرقم الحالة: {ref}\nرمز المتابعة: {code}\n(احتفظ به، لا يظهر مرة أخرى)\n\n{next}\n\nتابع طلبك في أي وقت بكتابة «طلباتي».",
        "on_site": "أو من الموقع: {url}",
        "status_on": "عضويتك: {tier}، نشطة.\nتنتهي في {date} (بقي {days}).",
        "status_off": "عضويتك: {tier}، منتهية منذ {date}.",
        "renew": "يمكنك التجديد من: {url}",
        "status_none": "رقمك غير مسجل لدينا كعضو. للتعرف على العضويات اكتب: قارن بين العضويات",
        "status_demo": "(بيانات تجريبية)",
        "registry_down": "سجل الأعضاء لا يرد الآن. حاول بعد قليل.",
        "no_requests": "لا توجد طلبات مرسلة من هذا الرقم.",
        "requests_head": "طلباتك:",
        "request_line": "• {ref} · {category} · {status}",
        "request_reply": "  رد الفريق: {reply}",
        "too_fast": "رسائل كثيرة في وقت قصير. انتظر قليلًا ثم أعد المحاولة.",
        "text_only": "أرسل سؤالك نصًا من فضلك.",
        "days": lambda n: "يوم واحد" if n == 1 else "يومان" if n == 2 else f"{n} أيام" if 3 <= n % 100 <= 10 else f"{n} يومًا",
        "category": {"unanswered": "سؤال", "inquiry": "استفسار", "complaint": "شكوى", "suggestion": "مقترح", "service": "طلب خدمة"},
        "status": {"new": "تم الاستلام", "in_progress": "قيد المعالجة", "replied": "تم الرد", "closed": "مغلق"},
    },
    "en": {
        "welcome": "Hi, I'm {name}, your assistant at the Customer Experience Association. Ask me about memberships, events and joining.\nType \"membership status\" to check your membership, or \"my requests\" to follow your requests.",
        "source": "Source: {title}\n{url}",
        "checked": "Last verified: {date}",
        "per_year": "SAR per year",
        "per_years": "SAR per {n} years",
        "best": "Best for you",
        "popular": "Most popular",
        "register": "Register: {url}",
        "pending_terms": "Eligibility conditions and documents await the association's confirmation.",
        "consent": "{answer}\n\nMay we send a summary of your question to the association team? They will contact you on this number.\nReply 1 to agree, or 2 to cancel.",
        "not_found": "I can't find this in the association's approved sources, and I won't guess.",
        "request_intro": "I can pass your request to the association team.",
        "consent_no": "OK, nothing was sent. Ask me anything else.",
        "case_sent": "Your request was sent to the association team.\nCase number: {ref}\nTracking code: {code}\n(keep it; it won't be shown again)\n\n{next}\n\nFollow it any time by typing \"my requests\".",
        "on_site": "Or on the website: {url}",
        "status_on": "Your membership: {tier}, active.\nExpires on {date} ({days} left).",
        "status_off": "Your membership: {tier}, expired on {date}.",
        "renew": "You can renew at: {url}",
        "status_none": "This number isn't registered as a member. To see the memberships, type: compare the memberships",
        "status_demo": "(demo data)",
        "registry_down": "The member registry isn't answering right now. Please try again shortly.",
        "no_requests": "No requests were sent from this number.",
        "requests_head": "Your requests:",
        "request_line": "• {ref} · {category} · {status}",
        "request_reply": "  Team reply: {reply}",
        "too_fast": "Too many messages in a short time. Please wait a moment and try again.",
        "text_only": "Please send your question as text.",
        "days": lambda n: f"{n} day" if n == 1 else f"{n} days",
        "category": {"unanswered": "Question", "inquiry": "Inquiry", "complaint": "Complaint", "suggestion": "Suggestion", "service": "Service request"},
        "status": {"new": "Received", "in_progress": "In progress", "replied": "Replied", "closed": "Closed"},
    },
}


@dataclass
class Result:
    messages: list[str]
    tasks: list[Callable[[], None]] = field(default_factory=list)  # run after the answer is sent


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _aware(dt: datetime) -> datetime:
    return dt if dt.tzinfo else dt.replace(tzinfo=timezone.utc)


def fmt_date(value: str | date, lang: str) -> str:
    d = date.fromisoformat(str(value)[:10]) if not isinstance(value, date) else value
    months = _MONTHS_AR if lang == "ar" else _MONTHS_EN
    return f"{d.day} {months[d.month - 1]} {d.year}"


def split(text: str, limit: int = MAX_CHARS) -> list[str]:
    """Splits at paragraph, then line, then word boundaries so no message passes the limit."""
    text = text.strip()
    if len(text) <= limit:
        return [text]
    parts, current = [], ""
    for para in re.split(r"(\n\n)", text):
        if len(current) + len(para) <= limit:
            current += para
            continue
        if current.strip():
            parts.append(current.strip())
        while len(para) > limit:
            cut = para.rfind("\n", 0, limit)
            cut = cut if cut > 0 else para.rfind(" ", 0, limit)
            cut = cut if cut > 0 else limit
            parts.append(para[:cut].strip())
            para = para[cut:]
        current = para
    if current.strip():
        parts.append(current.strip())
    return parts


# ---------- per-number limit (in memory) ----------
class SenderLimiter:
    def __init__(self) -> None:
        self._hits: dict[str, deque] = defaultdict(deque)
        self._lock = threading.Lock()

    def allow(self, key: str) -> bool:
        now = time.monotonic()
        with self._lock:
            q = self._hits[key]
            while q and now - q[0] > 300:
                q.popleft()
            if len(q) >= config.WHATSAPP_MAX_PER_5MIN:
                return False
            q.append(now)
            return True

    def reset(self) -> None:
        with self._lock:
            self._hits.clear()


limiter = SenderLimiter()


# ---------- pieces of an answer ----------
def sender(raw: str) -> tuple[str, Optional[str]]:
    """'whatsapp:+966551234567' -> ('+966551234567', '551234567'); the second is the Saudi
    mobile used for membership and contact, or None for other numbers."""
    number = re.sub(r"^whatsapp:", "", (raw or "").strip())
    digits = re.sub(r"\D", "", number)
    phone = normalize_phone(digits)
    return (f"+966{phone}" if phone else f"+{digits}"), phone


def sources_text(reply: ChatResponse, lang: str, checked_at: Optional[str] = None) -> str:
    t = T[lang]
    lines = [t["source"].format(title=s.title, url=s.url) for s in reply.sources[:2]]
    if checked_at:
        lines.append(t["checked"].format(date=fmt_date(checked_at, lang)))
    return "\n".join(lines)


def tier_block(tier, lang: str, badge: Optional[str] = None) -> str:
    t = T[lang]
    unit = t["per_years"].format(n=tier.period_years) if tier.period_years > 1 else t["per_year"]
    price = f"{int(tier.price_sar):,}" if float(tier.price_sar).is_integer() else f"{tier.price_sar:,}"
    head = f"*{getattr(tier.name, lang)}* · {price} {unit}" + (f" · {t[badge]}" if badge else "")
    benefits = "\n".join(f"✓ {f}" for f in getattr(tier.features, lang))
    return f"{head}\n{benefits}"


def tiers_text(reply: ChatResponse, question: str, lang: str) -> Optional[str]:
    """The membership cards as text: one for a recommendation, all for a comparison question."""
    tiers = sorted(get_tiers(), key=lambda x: x.display_order)
    if not tiers:
        return None
    if reply.action == ChatAction.recommend and reply.tier_id and get_tier(reply.tier_id):
        tier = get_tier(reply.tier_id)
        block = tier_block(tier, lang, "best")
    elif reply.action == ChatAction.answer and COMPARE.search(question or ""):
        block = "\n\n".join(tier_block(x, lang, "popular" if x.is_most_common else None) for x in tiers)
        tier = tiers[0]
    else:
        return None
    t = T[lang]
    tail = [t["register"].format(url=tier.source_url)]
    if tier.checked_at:
        tail.append(t["checked"].format(date=fmt_date(tier.checked_at, lang)))
    tail.append(t["pending_terms"])
    return f"{block}\n\n" + "\n".join(tail)


def status_text(phone: Optional[str], lang: str) -> str:
    t = T[lang]
    if not phone:
        return t["status_none"]
    try:
        s = lookup(phone=phone)
    except RegistryUnavailable:
        return t["registry_down"]
    if not s.registered:
        return t["status_none"]
    tier = getattr(s.tier_name, lang)
    if s.active:
        text = t["status_on"].format(tier=tier, date=fmt_date(s.expires_at, lang), days=t["days"](s.days_remaining))
    else:
        text = t["status_off"].format(tier=tier, date=fmt_date(s.expires_at, lang))
    if s.can_renew:
        tier_row = get_tier(s.tier_id)
        text += "\n" + t["renew"].format(url=tier_row.source_url if tier_row else "https://cxa.sa/membership")
    if s.demo:
        text += "\n" + t["status_demo"]
    return text


def requests_text(session: Session, contact: str, lang: str) -> str:
    t = T[lang]
    rows = session.exec(select(SupportCase).where(SupportCase.contact == contact)
                        .order_by(SupportCase.created_at.desc()).limit(3)).all()
    if not rows:
        return t["no_requests"]
    lines = [t["requests_head"]]
    for c in rows:
        status = c.status.value if hasattr(c.status, "value") else str(c.status)
        lines.append(t["request_line"].format(ref=cases.case_reference(c.id), category=t["category"].get(c.category, c.category),
                                              status=t["status"].get(status, status)))
        if c.reply:
            lines.append(t["request_reply"].format(reply=c.reply[:400]))
    return "\n".join(lines)


def _site_link(ref: str) -> Optional[str]:
    """The website's "track your request" page with the case number filled in, if the public
    address is known."""
    return f"{config.PUBLIC_BASE_URL}/?track={ref}#requests" if config.PUBLIC_BASE_URL else None


def create_case(session: Session, conv: WhatsAppConversation, contact: str, pending: dict) -> tuple[str, Callable]:
    lang = pending["lang"]
    code = cases.new_tracking_code()
    category = pending.get("category") or "unanswered"
    case = SupportCase(question=redact(pending["question"])[:2000], language=lang, contact=contact,
                       category=category, summary=redact(pending.get("summary") or pending["question"])[:2000],
                       tracking_hash=cases.hash_code(code), demo=conv.demo)
    session.add(case)
    if pending.get("event_id"):
        event = session.get(ChatEvent, pending["event_id"])
        if event is not None:
            event.case_created = True
            session.add(event)
    sync = case_sync.queue(session, case, "case.created")
    session.commit()
    nxt = cases.next_step(category, True)[lang]
    ref = cases.case_reference(case.id)
    text = T[lang]["case_sent"].format(ref=ref, code=code, next=nxt)
    link = _site_link(ref)
    if link:
        text += "\n" + T[lang]["on_site"].format(url=link)
    task = (lambda sync_id=sync.id: case_sync.deliver(sync_id)) if sync is not None else None
    return text, task


# ---------- conversation ----------
def _conversation(session: Session, key: str, demo: bool) -> tuple[WhatsAppConversation, bool]:
    conv = session.get(WhatsAppConversation, key)
    fresh = conv is None or _now() - _aware(conv.updated_at) > timedelta(minutes=config.WHATSAPP_SESSION_MINUTES)
    if conv is None:
        conv = WhatsAppConversation(id=key, demo=demo)
    if fresh:
        conv.history, conv.pending = "[]", None
    return conv, fresh


def handle(session: Session, raw_from: str, text: str, demo: bool = False) -> Result:
    contact, phone = sender(raw_from)
    key = otp._hash(f"wa:{contact}")
    lang_guess = detect_lang(text or "")
    if not limiter.allow(key):
        return Result([T[lang_guess]["too_fast"]])
    text = (text or "").strip()[:2000]
    if not text:
        return Result([T[lang_guess]["text_only"]])

    conv, fresh = _conversation(session, key, demo)
    lang = detect_lang(text) if re.search(r"[A-Za-z؀-ۿ]", text) else conv.lang
    conv.lang = lang
    t = T[lang]
    out: list[str] = []
    tasks: list[Callable] = []
    if fresh:
        out.append(t["welcome"].format(name=config.ASSISTANT_NAME_AR if lang == "ar" else config.ASSISTANT_NAME_EN))

    pending = json.loads(conv.pending) if conv.pending else None
    history = [ChatTurn(**turn) for turn in json.loads(conv.history)]
    answer_for_history: Optional[str] = None

    if pending and YES.match(text):
        msg, task = create_case(session, conv, contact, pending)
        out.append(msg)
        if task:
            tasks.append(task)
        conv.pending = None
    elif pending and NO.match(text):
        out.append(t["consent_no"])
        conv.pending = None
    elif HELP.match(text) or GREETING.match(text):
        if not fresh:
            out.append(t["welcome"].format(name=config.ASSISTANT_NAME_AR if lang == "ar" else config.ASSISTANT_NAME_EN))
    elif MY_REQUESTS.match(text):
        out.append(requests_text(session, contact, lang))
    elif STATUS.search(text):
        out.append(status_text(phone, lang))
    else:
        conv.pending = None
        reply = _agent(text, history)
        if reply.action == ChatAction.escalate and reply.category is None:
            record_unanswered(session, text)
        try:
            event_id = record_chat_event(session, reply, channel="whatsapp")
        except Exception:  # noqa: BLE001 - the overview must never break the conversation
            session.rollback()
            event_id = None
        rl = reply.lang if reply.lang in T else lang
        if reply.action == ChatAction.verify:
            out.append(status_text(phone, rl))
        elif reply.action == ChatAction.escalate and reply.needs_contact:
            conv.pending = json.dumps({"question": text, "summary": reply.summary, "category": reply.category,
                                       "lang": rl, "event_id": event_id}, ensure_ascii=False)
            # The agent's own text asks for an email or phone; on WhatsApp we already have the number.
            lead = T[rl]["request_intro"] if reply.category else T[rl]["not_found"]
            out.append(T[rl]["consent"].format(answer=lead))
        else:
            cards = tiers_text(reply, text, rl)
            body = reply.answer
            if cards and reply.action == ChatAction.recommend:
                body = reply.answer.split("\n\n")[0]
            elif cards:  # the cards carry prices and benefits: drop list lines, as the website does
                body = re.sub(r"\n{3,}", "\n\n", "\n".join(l for l in reply.answer.split("\n")
                                                         if not re.match(r"^\s*([•\-*]|\d+[.)])\s", l))).strip()
            parts = [body]
            if cards:
                parts.append(cards)
            elif reply.sources:
                parts.append(sources_text(reply, rl))
            out.append("\n\n".join(p for p in parts if p))
        answer_for_history = reply.answer

    if answer_for_history is not None:
        history += [ChatTurn(role="user", content=redact(text)), ChatTurn(role="assistant", content=answer_for_history)]
        conv.history = json.dumps([h.model_dump() for h in history[-HISTORY_TURNS:]], ensure_ascii=False)
    conv.updated_at = _now()
    session.add(conv)
    session.commit()
    messages = [chunk for m in out for chunk in split(m)]
    return Result(messages, tasks)


def _agent(text: str, history: list[ChatTurn]) -> ChatResponse:
    from .agent import run_agent  # imported here so tests can replace it on app.agent
    return run_agent(text, history)


def forget_expired(session: Session) -> int:
    """Deletes conversations idle longer than the session window (called at startup)."""
    cutoff = _now() - timedelta(minutes=config.WHATSAPP_SESSION_MINUTES)
    rows = session.exec(select(WhatsAppConversation).where(WhatsAppConversation.updated_at < cutoff)).all()
    for row in rows:
        session.delete(row)
    session.commit()
    return len(rows)

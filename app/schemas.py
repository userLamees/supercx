"""API contract shared by the backend, the agent and the frontend."""
import re
from enum import Enum
from typing import Annotated, Literal, Optional

from pydantic import BaseModel, Field, StringConstraints, model_validator

Lang = Literal["ar", "en"]


class Localized(BaseModel):
    ar: str
    en: str


class LocalizedList(BaseModel):
    ar: list[str]
    en: list[str]


class Tier(BaseModel):
    """Normalized membership tier. `id` is the stable key used everywhere."""
    id: str
    code: int
    name: Localized
    features: LocalizedList
    price_sar: float
    period_years: int
    is_most_common: bool
    display_order: int
    source_url: str
    checked_at: Optional[str] = None  # ISO date the tier data was last fetched/verified


class Source(BaseModel):
    title: str
    url: str


class ChatTurn(BaseModel):
    role: Literal["user", "assistant"]
    content: str


class ChatRequest(BaseModel):
    # Whitespace-only messages are rejected (422) like empty ones.
    message: Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=2000)]
    history: list[ChatTurn] = []


class ChatAction(str, Enum):
    answer = "answer"        # general answer from approved sources
    recommend = "recommend"  # recommends one tier (tier_id is set)
    escalate = "escalate"    # cannot answer reliably; hand over to support
    verify = "verify"        # personal question: the UI starts identity verification first


class SpeechRequest(BaseModel):
    """Text to read aloud (a chat reply) and its language."""
    text: str = Field(min_length=1, max_length=1500)
    lang: Lang = "ar"


class ChatResponse(BaseModel):
    answer: str
    lang: Lang
    action: ChatAction
    sources: list[Source] = []
    tier_id: Optional[str] = None
    needs_contact: bool = False    # escalate without contact -> UI asks for it
    summary: Optional[str] = None  # case summary prepared by the agent on escalate
    # Set when the user made a request (complaint, suggestion, service) rather than asked a
    # question with no answer: the UI preselects it, and it is not logged as "unanswered".
    category: Optional[Literal["inquiry", "complaint", "suggestion", "service"]] = None
    # Set by main.py (not the agent): links a later support case or registration click to
    # this message for the staff overview. Carries no message content.
    chat_event_id: Optional[str] = None


class CaseStatus(str, Enum):
    new = "new"
    in_progress = "in_progress"
    replied = "replied"        # staff sent a reply the visitor can read with the tracking code
    closed = "closed"


class CaseCategory(str, Enum):
    unanswered = "unanswered"  # a question the assistant could not answer
    inquiry = "inquiry"
    complaint = "complaint"
    suggestion = "suggestion"
    service = "service"


_EMAIL = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]{2,}$")
_SA_MOBILE = re.compile(r"^(?:\+966|00966|966|0)?5\d{8}$")
_ARABIC_DIGITS = str.maketrans("٠١٢٣٤٥٦٧٨٩", "0123456789")


def is_valid_contact(value: str) -> bool:
    """An email address or a Saudi mobile number (05XXXXXXXX, +9665XXXXXXXX, 5XXXXXXXX)."""
    value = value.strip()
    if _EMAIL.match(value):
        return True
    return bool(_SA_MOBILE.match(re.sub(r"[\s-]", "", value.translate(_ARABIC_DIGITS))))


class SupportCaseCreate(BaseModel):
    question: str = Field(min_length=1, max_length=2000)
    language: Lang
    contact: Optional[str] = Field(default=None, min_length=3, max_length=200)
    # The visitor consented to send the summary but chose not to leave contact details.
    anonymous: bool = False
    tier_id: Optional[str] = None
    summary: Optional[str] = None
    category: CaseCategory = CaseCategory.inquiry
    chat_event_id: Optional[str] = Field(default=None, max_length=64)  # the escalated chat message, if any

    @model_validator(mode="after")
    def _contact_unless_anonymous(self):
        if not self.anonymous and not self.contact:
            raise ValueError("contact is required unless anonymous is true")
        if self.contact is not None:
            self.contact = self.contact.strip()
            if not is_valid_contact(self.contact):
                raise ValueError("contact must be an email address or a Saudi mobile number")
        return self


class SupportCaseUpdate(BaseModel):
    status: CaseStatus


class SupportCaseReply(BaseModel):
    reply: Annotated[str, StringConstraints(strip_whitespace=True, min_length=2, max_length=4000)]


class SupportCaseOut(BaseModel):
    """A case as staff see it. The tracking-code hash never leaves the server."""
    id: str
    reference: str
    created_at: str
    updated_at: str
    question: str
    language: str
    contact: str
    tier_id: Optional[str] = None
    summary: Optional[str] = None
    status: CaseStatus
    category: str
    reply: Optional[str] = None
    replied_at: Optional[str] = None
    replied_by: Optional[str] = None
    due_at: str                 # reply expected by (business days after created_at)
    overdue: bool               # still "new" after the expected reply time
    demo: bool = False          # generated by app.seed_demo


class TrackRequest(BaseModel):
    reference: str = Field(min_length=3, max_length=20)
    code: str = Field(min_length=4, max_length=20)


class TrackResponse(BaseModel):
    """What a visitor sees with the case number and tracking code: status, dates and the
    team's reply. Never the request text, the contact details or the staff member's name."""
    reference: str
    category: str
    status: CaseStatus
    created_at: str
    updated_at: str
    replied_at: Optional[str] = None
    reply: Optional[str] = None
    due_at: str


class FaqSource(BaseModel):
    title: Localized
    url: str


class FaqItem(BaseModel):
    id: str
    question: Localized
    answer: Localized
    source: FaqSource
    langs: list[Lang] = ["ar", "en"]  # languages the question/answer were written in
    checked_at: str          # ISO date of last verification
    demo: bool = True        # content not yet approved by the association


class FaqCategory(BaseModel):
    id: str
    title: Localized
    items: list[FaqItem]


class FaqCreate(BaseModel):
    category_id: str
    question: str = Field(min_length=3, max_length=500)
    answer: str = Field(min_length=3, max_length=4000)
    source_title: str = Field(min_length=2, max_length=300)
    source_url: Optional[str] = Field(default=None, max_length=500)
    # Optional English translation when the main text is Arabic.
    question_en: Optional[str] = Field(default=None, max_length=500)
    answer_en: Optional[str] = Field(default=None, max_length=4000)
    source_title_en: Optional[str] = Field(default=None, max_length=300)


class FaqItemAdmin(BaseModel):
    """Raw FAQ row for the staff editor, with who changed it last."""
    id: str
    category_id: str
    question_ar: Optional[str] = None
    question_en: Optional[str] = None
    answer_ar: Optional[str] = None
    answer_en: Optional[str] = None
    source_title: str
    source_title_en: Optional[str] = None
    source_url: Optional[str] = None
    checked_at: str
    demo: bool
    last_action: Optional[str] = None
    last_actor: Optional[str] = None
    last_at: Optional[str] = None


class FaqItemWrite(BaseModel):
    """Create or edit an FAQ entry from the staff editor. Each of question/answer needs
    at least one language; source title is required."""
    category_id: str
    question_ar: Optional[str] = Field(default=None, max_length=500)
    question_en: Optional[str] = Field(default=None, max_length=500)
    answer_ar: Optional[str] = Field(default=None, max_length=4000)
    answer_en: Optional[str] = Field(default=None, max_length=4000)
    source_title: str = Field(min_length=2, max_length=300)
    source_title_en: Optional[str] = Field(default=None, max_length=300)
    source_url: Optional[str] = Field(default=None, max_length=500)
    demo: bool = False

    @model_validator(mode="after")
    def _one_language_each(self):
        for name in ("question_ar", "question_en", "answer_ar", "answer_en", "source_title_en", "source_url"):
            value = getattr(self, name)
            setattr(self, name, value.strip() if value and value.strip() else None)
        self.source_title = self.source_title.strip()
        if not (self.question_ar or self.question_en) or not (self.answer_ar or self.answer_en):
            raise ValueError("question and answer each need at least one language")
        return self


class AuditOut(BaseModel):
    at: str
    actor: str
    action: str
    target_type: str
    target_id: str
    summary: str


class Alert(BaseModel):
    kind: str          # high_frequency_unanswered | stale_cases | complaints_spike
    count: int
    threshold: int


class UnansweredOut(BaseModel):
    id: str
    question: str
    count: int
    last_seen: str


class UnansweredStats(BaseModel):
    pending: int
    high_frequency: int
    approved_answers: int
    high_frequency_threshold: int


class VerifyChannel(str, Enum):
    whatsapp = "whatsapp"
    email = "email"


class VerifySend(BaseModel):
    """Send a code by WhatsApp (phone) or email. With no provider configured, the
    app runs a labeled simulation and accepts any 4-digit code."""
    channel: Optional[VerifyChannel] = None   # defaults from what is filled in
    phone: Optional[str] = Field(default=None, min_length=9, max_length=20)
    email: Optional[str] = Field(default=None, min_length=5, max_length=200)
    lang: Lang = "ar"

    @model_validator(mode="after")
    def _target(self):
        if self.channel is None:
            self.channel = VerifyChannel.email if self.email and not self.phone else VerifyChannel.whatsapp
        if self.channel == VerifyChannel.email and not self.email:
            raise ValueError("email is required for the email channel")
        if self.channel == VerifyChannel.whatsapp and not self.phone:
            raise ValueError("phone is required for the whatsapp channel")
        return self


class VerifyCheck(VerifySend):
    code: str = Field(min_length=1, max_length=8)


class MembershipStatus(BaseModel):
    registered: bool
    demo: bool = True
    tier_id: Optional[str] = None
    tier_name: Optional[Localized] = None
    active: Optional[bool] = None
    expires_at: Optional[str] = None
    days_remaining: Optional[int] = None
    period_days: Optional[int] = None
    can_renew: Optional[bool] = None
    source: Optional[str] = None


class Metric(BaseModel):
    value: Optional[float] = None   # percentage 0-100, or None when there is nothing to divide by
    numerator: int
    denominator: int


class DayCount(BaseModel):
    date: str          # YYYY-MM-DD, Riyadh
    total: int
    escalated: int


class OverviewCase(BaseModel):
    id: str
    reference: str
    created_at: str
    category: str
    status: CaseStatus
    overdue: bool


class OverviewQuestion(BaseModel):
    id: str
    question: str
    count: int
    last_seen: str


class Overview(BaseModel):
    date_from: str
    date_to: str
    questions: int                 # chat messages in the period
    questions_today: int
    answered: Metric               # answer + recommend / all messages
    escalated: Metric              # escalate / all messages
    open_cases: int                # new + in_progress, now
    overdue_cases: int             # new, past the expected reply time, now
    daily: list[DayCount]          # 14 days ending on date_to
    top_unanswered: list[OverviewQuestion]
    recent_cases: list[OverviewCase]
    verified_answers: Metric       # answers citing an approved source / all messages
    handoff_success: Metric        # escalations sent on as a support case / escalations
    register_after_recommend: Metric  # recommendations followed by a registration click / recommendations
    demo_events: int               # rows from app.seed_demo in the period

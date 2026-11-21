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


class ChatResponse(BaseModel):
    answer: str
    lang: Lang
    action: ChatAction
    sources: list[Source] = []
    tier_id: Optional[str] = None
    needs_contact: bool = False    # escalate without contact -> UI asks for it
    summary: Optional[str] = None  # case summary prepared by the agent on escalate


class CaseStatus(str, Enum):
    new = "new"
    in_progress = "in_progress"
    closed = "closed"


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


class VerifySend(BaseModel):
    phone: str = Field(min_length=9, max_length=16)


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

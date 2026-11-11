"""API contract shared by the backend, the agent and the frontend."""
from enum import Enum
from typing import Literal, Optional

from pydantic import BaseModel, Field

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


class Source(BaseModel):
    title: str
    url: str


class ChatTurn(BaseModel):
    role: Literal["user", "assistant"]
    content: str


class ChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=2000)
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


class SupportCaseCreate(BaseModel):
    question: str = Field(min_length=1, max_length=2000)
    language: Lang
    contact: str = Field(min_length=3, max_length=200)
    tier_id: Optional[str] = None
    summary: Optional[str] = None


class SupportCaseUpdate(BaseModel):
    status: CaseStatus

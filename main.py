"""SuperCX API: chat, memberships, and support cases."""
import secrets
from contextlib import asynccontextmanager
from datetime import datetime, timezone
from typing import Optional

from fastapi import Depends, FastAPI, Header, HTTPException, status
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from sqlmodel import Session, select

from app.agent import run_agent
from app.config import HIGH_FREQUENCY_THRESHOLD, SUPPORT_TOKEN
from app.db import SupportCase, UnansweredQuestion, engine, get_session, init_db
from app.faq import add_approved, approved_count, category_ids, get_faq, seed_faq
from app.memberships import data_origin, get_tier, get_tiers
from app.redact import normalize_key, redact
from app.schemas import (CaseStatus, ChatAction, ChatRequest, ChatResponse, FaqCategory,
                         FaqCreate, MembershipStatus, SupportCaseCreate, SupportCaseUpdate,
                         Tier, UnansweredOut, UnansweredStats, VerifyCheck, VerifySend)
from app.verify import lookup, normalize_phone, valid_code


@asynccontextmanager
async def lifespan(_: FastAPI):
    init_db()
    with Session(engine) as session:
        seed_faq(session)  # first start only: loads data/faq.json into the DB
    yield


app = FastAPI(title="SuperCX", version="0.1.0", lifespan=lifespan)


@app.middleware("http")
async def revalidate_pages(request, call_next):
    """Pages and static assets revalidate on each load so UI updates show up immediately."""
    response = await call_next(request)
    if not request.url.path.startswith("/api/"):
        response.headers.setdefault("Cache-Control", "no-cache")
    return response


def require_support_token(x_support_token: str = Header(default="")) -> None:
    """Server-side check for every staff endpoint. An unset token rejects everyone."""
    if not SUPPORT_TOKEN or not secrets.compare_digest(x_support_token.encode(), SUPPORT_TOKEN.encode()):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid support token")


@app.get("/api/health")
def health() -> dict:
    return {"status": "ok", "memberships_origin": data_origin()}


@app.get("/api/memberships", response_model=list[Tier])
def list_memberships() -> list[Tier]:
    return get_tiers()


def case_reference(case_id: str) -> str:
    """Short, human-friendly case number derived from the id (no schema change)."""
    return "CX-" + case_id.replace("-", "")[:6].upper()


def _now() -> datetime:
    return datetime.now(timezone.utc)


def record_unanswered(session: Session, message: str) -> None:
    question = redact(message)[:500]
    key = normalize_key(question)
    if not key:
        return
    row = session.exec(select(UnansweredQuestion).where(UnansweredQuestion.key == key)).first()
    if row:
        row.count += 1
        row.last_seen = _now()
        row.resolved = False
    else:
        row = UnansweredQuestion(key=key, question=question)
    session.add(row)
    session.commit()


@app.post("/api/chat", response_model=ChatResponse)
def chat(request: ChatRequest, session: Session = Depends(get_session)) -> ChatResponse:
    reply = run_agent(request.message, request.history)
    if reply.action == ChatAction.escalate:
        record_unanswered(session, request.message)
    return reply


@app.post("/api/support-cases", status_code=status.HTTP_201_CREATED)
def create_case(payload: SupportCaseCreate, session: Session = Depends(get_session)) -> dict:
    if payload.tier_id and get_tier(payload.tier_id) is None:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_CONTENT, "Unknown tier_id")
    data = payload.model_dump(exclude={"anonymous"})
    data["contact"] = data["contact"] or ""  # anonymous: summary only, no reply channel
    data["question"] = redact(data["question"])  # phone numbers/emails only in `contact`, with consent
    if data["summary"]:
        data["summary"] = redact(data["summary"])
    case = SupportCase(**data)
    session.add(case)
    session.commit()
    # Visitors only get a reference, never other cases or member data.
    return {"id": case.id, "status": case.status, "reference": case_reference(case.id)}


@app.get("/api/support-cases", response_model=list[SupportCase],
         dependencies=[Depends(require_support_token)])
def list_cases(case_status: Optional[CaseStatus] = None,
               session: Session = Depends(get_session)) -> list[SupportCase]:
    query = select(SupportCase).order_by(SupportCase.created_at.desc())
    if case_status:
        query = query.where(SupportCase.status == case_status)
    return list(session.exec(query))


@app.patch("/api/support-cases/{case_id}", response_model=SupportCase,
           dependencies=[Depends(require_support_token)])
def update_case(case_id: str, payload: SupportCaseUpdate,
                session: Session = Depends(get_session)) -> SupportCase:
    case = session.get(SupportCase, case_id)
    if case is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Case not found")
    case.status = payload.status
    case.updated_at = datetime.now(timezone.utc)
    session.add(case)
    session.commit()
    session.refresh(case)
    return case


# FAQ: read-only for visitors, staff can approve new entries.
@app.get("/api/faq", response_model=list[FaqCategory])
def faq(session: Session = Depends(get_session)) -> list[FaqCategory]:
    return get_faq(session)


@app.get("/api/unanswered", response_model=list[UnansweredOut],
         dependencies=[Depends(require_support_token)])
def list_unanswered(sort: str = "count", session: Session = Depends(get_session)) -> list[UnansweredOut]:
    order = (UnansweredQuestion.last_seen.desc(),) if sort == "recent" else \
        (UnansweredQuestion.count.desc(), UnansweredQuestion.last_seen.desc())
    rows = session.exec(select(UnansweredQuestion).where(UnansweredQuestion.resolved == False)  # noqa: E712
                        .order_by(*order))
    return [UnansweredOut(id=r.id, question=r.question, count=r.count,
                          last_seen=r.last_seen.isoformat()) for r in rows]


@app.get("/api/unanswered/stats", response_model=UnansweredStats,
         dependencies=[Depends(require_support_token)])
def unanswered_stats(session: Session = Depends(get_session)) -> UnansweredStats:
    counts = session.exec(select(UnansweredQuestion.count)
                          .where(UnansweredQuestion.resolved == False)).all()  # noqa: E712
    return UnansweredStats(pending=len(counts),
                           high_frequency=sum(c >= HIGH_FREQUENCY_THRESHOLD for c in counts),
                           approved_answers=approved_count(session),
                           high_frequency_threshold=HIGH_FREQUENCY_THRESHOLD)


@app.post("/api/unanswered/{question_id}/promote", status_code=status.HTTP_201_CREATED,
          dependencies=[Depends(require_support_token)])
def promote_unanswered(question_id: str, payload: FaqCreate,
                       session: Session = Depends(get_session)) -> dict:
    row = session.get(UnansweredQuestion, question_id)
    if row is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Question not found")
    if payload.category_id not in category_ids(session):
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_CONTENT, "Unknown category_id")
    entry = add_approved(session, category_id=payload.category_id, question=payload.question.strip(),
                         answer=payload.answer.strip(), source_title=payload.source_title.strip(),
                         source_url=(payload.source_url or "").strip() or None, unanswered_id=row.id)
    row.resolved = True
    session.add(row)
    session.commit()
    return {"id": entry.id, "category_id": entry.category_id}


# Phone verification: SIMULATED. No SMS is sent; any 4-digit code is accepted.
@app.post("/api/verify/send")
def verify_send(payload: VerifySend) -> dict:
    if normalize_phone(payload.phone) is None:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_CONTENT, "Invalid Saudi mobile number")
    return {"sent": True, "demo": True, "code_length": 4}


@app.post("/api/verify/check", response_model=MembershipStatus)
def verify_check(payload: VerifyCheck) -> MembershipStatus:
    phone = normalize_phone(payload.phone)
    if phone is None:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_CONTENT, "Invalid Saudi mobile number")
    if not valid_code(payload.code):
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_CONTENT, "Code must be 4 digits")
    return lookup(phone)


@app.get("/", include_in_schema=False)
def chat_page() -> FileResponse:
    return FileResponse("static/index.html")


@app.get("/support", include_in_schema=False)
def support_page() -> FileResponse:
    return FileResponse("static/support.html")


@app.get("/faq", include_in_schema=False)
def faq_page() -> FileResponse:
    return FileResponse("static/faq.html")


app.mount("/static", StaticFiles(directory="static"), name="static")

"""SuperCX API: chat, memberships, and support cases."""
import secrets
from contextlib import asynccontextmanager
from datetime import datetime, timedelta, timezone
from typing import Literal, Optional

from fastapi import Depends, FastAPI, Header, HTTPException, Response, status
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from sqlmodel import Session, func, select

from app import audit, otp
from app.agent import run_agent
from app.config import (ALERT_CASE_AGE_HOURS, ALERT_COMPLAINTS_PER_WEEK, HIGH_FREQUENCY_THRESHOLD,
                        SUPPORT_TOKEN)
from app.db import FaqItem as FaqItemRow, SupportCase, UnansweredQuestion, engine, get_session, init_db
from app.export import LABELS, csv_response, local_time
from app.knowledge import refresh_index
from app.faq import (add_approved, admin_items, approved_count, category_ids, get_faq, question_text,
                     seed_faq, write_item)
from app.memberships import data_origin, get_tier, get_tiers
from app.redact import normalize_key, redact
from app.schemas import (Alert, AuditOut, CaseCategory, CaseStatus, ChatAction, ChatRequest,
                         ChatResponse, FaqCategory, FaqCreate, FaqItemAdmin, FaqItemWrite,
                         MembershipStatus, SupportCaseCreate, SupportCaseUpdate, Tier, UnansweredOut,
                         UnansweredStats, VerifyChannel, VerifyCheck, VerifySend)
from app.verify import lookup, normalize_code, normalize_email, normalize_phone, valid_code


@asynccontextmanager
async def lifespan(_: FastAPI):
    init_db()
    with Session(engine) as session:
        seed_faq(session)  # first start only: loads data/faq.json into the DB
    refresh_index()  # agent's search index follows the FAQ table
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
    data["category"] = payload.category.value
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
def list_cases(case_status: Optional[CaseStatus] = None, category: Optional[CaseCategory] = None,
               session: Session = Depends(get_session)) -> list[SupportCase]:
    query = select(SupportCase).order_by(SupportCase.created_at.desc())
    if case_status:
        query = query.where(SupportCase.status == case_status)
    if category:
        query = query.where(SupportCase.category == category.value)
    return list(session.exec(query))


@app.get("/api/support-cases/export.csv", dependencies=[Depends(require_support_token)])
def export_cases(lang: Literal["ar", "en"] = "ar", actor: str = Depends(audit.staff_name),
                 session: Session = Depends(get_session)) -> Response:
    cases = session.exec(select(SupportCase).order_by(SupportCase.created_at.desc())).all()
    names = {t.id: getattr(t.name, lang) for t in get_tiers()}
    labels = LABELS[lang]
    rows = [[case_reference(c.id), local_time(c.created_at), labels.get(c.category or "inquiry", c.category),
             labels.get(c.status.value if hasattr(c.status, "value") else c.status, c.status),
             labels[f"lang_{c.language}"] if f"lang_{c.language}" in labels else c.language,
             c.question, c.summary, names.get(c.tier_id, ""), c.contact] for c in cases]
    audit.log(session, actor, "export.cases", summary=f"{len(rows)}")
    session.commit()
    return csv_response("cases", lang, rows)


@app.patch("/api/support-cases/{case_id}", response_model=SupportCase,
           dependencies=[Depends(require_support_token)])
def update_case(case_id: str, payload: SupportCaseUpdate, actor: str = Depends(audit.staff_name),
                session: Session = Depends(get_session)) -> SupportCase:
    case = session.get(SupportCase, case_id)
    if case is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Case not found")
    old = case.status
    case.status = payload.status
    case.updated_at = datetime.now(timezone.utc)
    session.add(case)
    audit.log(session, actor, "case.status", "case", case.id,
              f"{case_reference(case.id)}: {getattr(old, 'value', old)} → {payload.status.value}")
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


@app.get("/api/unanswered/export.csv", dependencies=[Depends(require_support_token)])
def export_unanswered(lang: Literal["ar", "en"] = "ar", include_resolved: bool = True,
                      actor: str = Depends(audit.staff_name),
                      session: Session = Depends(get_session)) -> Response:
    query = select(UnansweredQuestion).order_by(UnansweredQuestion.count.desc(), UnansweredQuestion.last_seen.desc())
    if not include_resolved:
        query = query.where(UnansweredQuestion.resolved == False)  # noqa: E712
    labels = LABELS[lang]
    rows = [[q.question, q.count, local_time(q.first_seen), local_time(q.last_seen),
             labels["resolved" if q.resolved else "pending"]] for q in session.exec(query)]
    audit.log(session, actor, "export.unanswered", summary=f"{len(rows)}")
    session.commit()
    return csv_response("unanswered", lang, rows)


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
def promote_unanswered(question_id: str, payload: FaqCreate, actor: str = Depends(audit.staff_name),
                       session: Session = Depends(get_session)) -> dict:
    row = session.get(UnansweredQuestion, question_id)
    if row is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Question not found")
    if payload.category_id not in category_ids(session):
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_CONTENT, "Unknown category_id")
    entry = add_approved(session, category_id=payload.category_id, question=payload.question.strip(),
                         answer=payload.answer.strip(), source_title=payload.source_title.strip(),
                         source_url=(payload.source_url or "").strip() or None, unanswered_id=row.id,
                         question_en=payload.question_en, answer_en=payload.answer_en,
                         source_title_en=payload.source_title_en)
    row.resolved = True
    session.add(row)
    audit.log(session, actor, "faq.promote", "faq", entry.id, payload.question.strip())
    session.commit()
    refresh_index()
    return {"id": entry.id, "category_id": entry.category_id}


# ---------- FAQ editor (idea 68) and action log (idea 66) ----------
def _check_category(session: Session, category_id: str) -> None:
    if category_id not in category_ids(session):
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_CONTENT, "Unknown category_id")


@app.get("/api/staff/faq-items", response_model=list[FaqItemAdmin],
         dependencies=[Depends(require_support_token)])
def staff_faq_items(session: Session = Depends(get_session)) -> list[FaqItemAdmin]:
    return admin_items(session, audit.last_by_target(session, "faq"))


@app.post("/api/staff/faq-items", status_code=status.HTTP_201_CREATED,
          dependencies=[Depends(require_support_token)])
def staff_create_faq(payload: FaqItemWrite, actor: str = Depends(audit.staff_name),
                     session: Session = Depends(get_session)) -> dict:
    _check_category(session, payload.category_id)
    item = write_item(session, payload)
    audit.log(session, actor, "faq.create", "faq", item.id, question_text(item))
    session.commit()
    refresh_index()
    return {"id": item.id}


@app.put("/api/staff/faq-items/{item_id}", dependencies=[Depends(require_support_token)])
def staff_update_faq(item_id: str, payload: FaqItemWrite, actor: str = Depends(audit.staff_name),
                     session: Session = Depends(get_session)) -> dict:
    item = session.get(FaqItemRow, item_id)
    if item is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "FAQ item not found")
    _check_category(session, payload.category_id)
    write_item(session, payload, item)
    audit.log(session, actor, "faq.update", "faq", item.id, question_text(item))
    session.commit()
    refresh_index()
    return {"id": item.id}


@app.delete("/api/staff/faq-items/{item_id}", status_code=status.HTTP_204_NO_CONTENT,
            dependencies=[Depends(require_support_token)])
def staff_delete_faq(item_id: str, actor: str = Depends(audit.staff_name),
                     session: Session = Depends(get_session)) -> Response:
    item = session.get(FaqItemRow, item_id)
    if item is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "FAQ item not found")
    audit.log(session, actor, "faq.delete", "faq", item.id, question_text(item))
    session.delete(item)
    session.commit()
    refresh_index()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@app.get("/api/audit-log", response_model=list[AuditOut], dependencies=[Depends(require_support_token)])
def audit_log(target_id: Optional[str] = None, limit: int = 100,
              session: Session = Depends(get_session)) -> list[AuditOut]:
    return audit.entries(session, target_id, min(max(limit, 1), 500))


# ---------- Smart alerts (idea 62) ----------
@app.get("/api/alerts", response_model=list[Alert], dependencies=[Depends(require_support_token)])
def alerts(session: Session = Depends(get_session)) -> list[Alert]:
    now = _now()
    frequent = session.exec(select(func.count()).select_from(UnansweredQuestion).where(
        UnansweredQuestion.resolved == False,  # noqa: E712
        UnansweredQuestion.count >= HIGH_FREQUENCY_THRESHOLD)).one()
    stale = session.exec(select(func.count()).select_from(SupportCase).where(
        SupportCase.status == CaseStatus.new,
        SupportCase.created_at < now - timedelta(hours=ALERT_CASE_AGE_HOURS))).one()
    complaints = session.exec(select(func.count()).select_from(SupportCase).where(
        SupportCase.category == CaseCategory.complaint.value,
        SupportCase.created_at > now - timedelta(days=7))).one()
    found = [Alert(kind="high_frequency_unanswered", count=frequent, threshold=HIGH_FREQUENCY_THRESHOLD),
             Alert(kind="stale_cases", count=stale, threshold=ALERT_CASE_AGE_HOURS),
             Alert(kind="complaints_spike", count=complaints, threshold=ALERT_COMPLAINTS_PER_WEEK)]
    return [a for a in found if a.count >= (a.threshold if a.kind == "complaints_spike" else 1)]


# ---------- Verification (idea 33): email or WhatsApp code, simulation if none configured ----------
@app.get("/api/verify/channels")
def verify_channels() -> dict:
    return otp.channels()


def _otp_error(err: otp.OtpError) -> JSONResponse:
    detail = {"code": err.code}
    if err.retry_after is not None:
        detail["retry_after"] = err.retry_after
    if err.attempts_left is not None:
        detail["attempts_left"] = err.attempts_left
    headers = {"Retry-After": str(err.retry_after)} if err.retry_after else None
    return JSONResponse({"detail": detail}, status_code=err.status, headers=headers)


def _target(payload: VerifySend) -> tuple[str, str, str]:
    """(channel, normalized identity, delivery address) or 422."""
    if payload.channel == VerifyChannel.email:
        email = normalize_email(payload.email or "")
        if email is None:
            raise HTTPException(status.HTTP_422_UNPROCESSABLE_CONTENT, "Invalid email address")
        return "email", email, email
    phone = normalize_phone(payload.phone or "")
    if phone is None:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_CONTENT, "Invalid Saudi mobile number")
    return "whatsapp", phone, f"+966{phone}"


@app.post("/api/verify/send")
def verify_send(payload: VerifySend, session: Session = Depends(get_session)):
    channel, target, deliver_to = _target(payload)
    available = otp.channels()
    if available["demo"]:  # no provider configured: labeled simulation, nothing is sent
        return {"sent": True, "demo": True, "channel": channel, "code_length": otp.CODE_LENGTH}
    if not available[channel]:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_CONTENT, f"Channel not available: {channel}")
    try:
        otp.send_code(session, channel, target, deliver_to, payload.lang)
    except otp.OtpError as err:
        return _otp_error(err)
    return {"sent": True, "demo": False, "channel": channel, "code_length": otp.CODE_LENGTH,
            "expires_in": int(otp.CODE_TTL.total_seconds())}


@app.post("/api/verify/check", response_model=MembershipStatus)
def verify_check(payload: VerifyCheck, session: Session = Depends(get_session)):
    channel, target, _ = _target(payload)
    if not valid_code(payload.code):
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_CONTENT, "Code must be 4 digits")
    if not otp.channels()["demo"]:
        try:
            otp.check_code(session, channel, target, normalize_code(payload.code))
        except otp.OtpError as err:
            return _otp_error(err)
    return lookup(phone=target if channel == "whatsapp" else None, email=target if channel == "email" else None)


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

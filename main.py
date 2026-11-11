"""SuperCX API: chat, memberships, and support cases."""
from contextlib import asynccontextmanager
from datetime import datetime, timezone
from typing import Optional

from fastapi import Depends, FastAPI, Header, HTTPException, status
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from sqlmodel import Session, select

from app.agent import run_agent
from app.config import SUPPORT_TOKEN
from app.db import SupportCase, get_session, init_db
from app.memberships import data_origin, get_tier, get_tiers
from app.schemas import (CaseStatus, ChatRequest, ChatResponse, SupportCaseCreate,
                         SupportCaseUpdate, Tier)


@asynccontextmanager
async def lifespan(_: FastAPI):
    init_db()
    yield


app = FastAPI(title="SuperCX", version="0.1.0", lifespan=lifespan)


def require_support_token(x_support_token: str = Header(default="")) -> None:
    if x_support_token != SUPPORT_TOKEN:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid support token")


@app.get("/api/health")
def health() -> dict:
    return {"status": "ok", "memberships_origin": data_origin()}


@app.get("/api/memberships", response_model=list[Tier])
def list_memberships() -> list[Tier]:
    return get_tiers()


@app.post("/api/chat", response_model=ChatResponse)
def chat(request: ChatRequest) -> ChatResponse:
    return run_agent(request.message, request.history)


@app.post("/api/support-cases", status_code=status.HTTP_201_CREATED)
def create_case(payload: SupportCaseCreate, session: Session = Depends(get_session)) -> dict:
    if payload.tier_id and get_tier(payload.tier_id) is None:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_CONTENT, "Unknown tier_id")
    case = SupportCase(**payload.model_dump())
    session.add(case)
    session.commit()
    # Visitors only get a reference, never other cases or member data.
    return {"id": case.id, "status": case.status}


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


@app.get("/", include_in_schema=False)
def chat_page() -> FileResponse:
    return FileResponse("static/index.html")


@app.get("/support", include_in_schema=False)
def support_page() -> FileResponse:
    return FileResponse("static/support.html")


app.mount("/static", StaticFiles(directory="static"), name="static")

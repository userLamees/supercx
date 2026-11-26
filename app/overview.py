"""Staff overview: date periods (Riyadh calendar days) and the numbers on the overview page.
Every number is counted from the database; nothing is estimated."""
from datetime import date, datetime, time, timedelta, timezone
from typing import Optional

from fastapi import HTTPException, Query, status
from sqlmodel import Session, func, select

from .cases import RIYADH, case_reference, is_overdue
from .db import ChatEvent, FaqItem, SupportCase, UnansweredQuestion
from .schemas import (CaseStatus, DayCount, Metric, Overview, OverviewCase, OverviewQuestion)

CHART_DAYS = 14
MAX_RANGE_DAYS = 366


class Period:
    """Inclusive calendar days in Riyadh time, as a UTC [start, end) range."""

    def __init__(self, first: Optional[date], last: Optional[date]):
        self.first, self.last = first, last

    @property
    def active(self) -> bool:
        return self.first is not None or self.last is not None

    @property
    def start(self) -> Optional[datetime]:
        return _utc(self.first) if self.first else None

    @property
    def end(self) -> Optional[datetime]:
        return _utc(self.last + timedelta(days=1)) if self.last else None

    def where(self, column):
        """SQL conditions for a datetime column (timezone-aware UTC bounds)."""
        conds = []
        if self.start is not None:
            conds.append(column >= self.start)
        if self.end is not None:
            conds.append(column < self.end)
        return conds


def _utc(day: date) -> datetime:
    return datetime.combine(day, time.min, tzinfo=RIYADH).astimezone(timezone.utc)


def today() -> date:
    return datetime.now(RIYADH).date()


def period(date_from: Optional[date] = Query(default=None, description="First day, YYYY-MM-DD (Riyadh)"),
           date_to: Optional[date] = Query(default=None, description="Last day, inclusive")) -> Period:
    """Shared query params for the overview, lists and CSV exports. Both optional."""
    if date_from and date_to and date_from > date_to:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_CONTENT, "date_from must be on or before date_to")
    if date_from and date_to and (date_to - date_from).days > MAX_RANGE_DAYS:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_CONTENT, "Date range is too long")
    return Period(date_from, date_to)


def _metric(numerator: int, denominator: int) -> Metric:
    value = round(100 * numerator / denominator, 1) if denominator else None
    return Metric(value=value, numerator=numerator, denominator=denominator)


def _count(session: Session, *conds) -> int:
    return session.exec(select(func.count()).select_from(ChatEvent).where(*conds)).one()


def _iso(dt: datetime) -> str:
    return (dt if dt.tzinfo else dt.replace(tzinfo=timezone.utc)).isoformat()


def local_day(dt: datetime) -> date:
    return (dt if dt.tzinfo else dt.replace(tzinfo=timezone.utc)).astimezone(RIYADH).date()


def faq_source_titles(session: Session) -> set[str]:
    titles = set()
    for title, title_en in session.exec(select(FaqItem.source_title, FaqItem.source_title_en)):
        titles.add(title)
        if title_en:
            titles.add(title_en)
    return titles


def build(session: Session, p: Period) -> Overview:
    last = p.last or today()
    first = p.first or last - timedelta(days=6)  # default: the last 7 days
    p = Period(first, last)
    in_range = p.where(ChatEvent.at)

    total = _count(session, *in_range)
    answered = _count(session, *in_range, ChatEvent.action.in_(["answer", "recommend"]))
    escalated = _count(session, *in_range, ChatEvent.action == "escalate")
    sourced = _count(session, *in_range, ChatEvent.action.in_(["answer", "recommend"]), ChatEvent.sourced == True)  # noqa: E712
    handed_off = _count(session, *in_range, ChatEvent.action == "escalate", ChatEvent.case_created == True)  # noqa: E712
    recommended = _count(session, *in_range, ChatEvent.action == "recommend")
    registered = _count(session, *in_range, ChatEvent.action == "recommend", ChatEvent.register_clicked == True)  # noqa: E712
    demo = _count(session, *in_range, ChatEvent.demo == True)  # noqa: E712
    t = today()
    questions_today = _count(session, *Period(t, t).where(ChatEvent.at))

    # 14-day chart ending on the last day of the period.
    chart = Period(last - timedelta(days=CHART_DAYS - 1), last)
    days = {last - timedelta(days=i): [0, 0] for i in range(CHART_DAYS)}
    for at, action in session.exec(select(ChatEvent.at, ChatEvent.action).where(*chart.where(ChatEvent.at))):
        bucket = days.get(local_day(at))
        if bucket:
            bucket[0] += 1
            bucket[1] += action == "escalate"
    daily = [DayCount(date=d.isoformat(), total=v[0], escalated=v[1]) for d, v in sorted(days.items())]

    # Open requests are a "now" number: not limited by the period.
    open_rows = session.exec(select(SupportCase.created_at, SupportCase.status).where(
        SupportCase.status.in_([CaseStatus.new, CaseStatus.in_progress]))).all()
    overdue = sum(is_overdue(created, st) for created, st in open_rows)

    top = session.exec(select(UnansweredQuestion).where(
        UnansweredQuestion.resolved == False, *p.where(UnansweredQuestion.last_seen))  # noqa: E712
        .order_by(UnansweredQuestion.count.desc(), UnansweredQuestion.last_seen.desc()).limit(5)).all()
    recent = session.exec(select(SupportCase).where(*p.where(SupportCase.created_at))
                          .order_by(SupportCase.created_at.desc()).limit(5)).all()

    return Overview(
        date_from=first.isoformat(), date_to=last.isoformat(),
        questions=total, questions_today=questions_today,
        answered=_metric(answered, total), escalated=_metric(escalated, total),
        open_cases=len(open_rows), overdue_cases=overdue, daily=daily,
        top_unanswered=[OverviewQuestion(id=q.id, question=q.question, count=q.count, last_seen=_iso(q.last_seen)) for q in top],
        recent_cases=[OverviewCase(id=c.id, reference=case_reference(c.id), created_at=_iso(c.created_at),
                                   category=c.category or "inquiry", status=c.status,
                                   overdue=is_overdue(c.created_at, c.status)) for c in recent],
        verified_answers=_metric(sourced, total), handoff_success=_metric(handed_off, escalated),
        register_after_recommend=_metric(registered, recommended), demo_events=demo)

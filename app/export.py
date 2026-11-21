"""CSV exports for staff. UTF-8 with BOM so Excel opens Arabic correctly; cells that
start with = + - @ are prefixed with ' to prevent spreadsheet formula injection."""
import csv
import io
from datetime import datetime, timezone
from zoneinfo import ZoneInfo

from fastapi.responses import Response

RIYADH = ZoneInfo("Asia/Riyadh")

HEADERS = {
    "unanswered": {
        "ar": ["السؤال", "عدد مرات التكرار", "أول ظهور", "آخر ظهور", "الحالة"],
        "en": ["Question", "Times asked", "First seen", "Last seen", "Status"],
    },
    "cases": {
        "ar": ["رقم الحالة", "التاريخ", "النوع", "الحالة", "اللغة", "السؤال", "الملخص", "العضوية", "التواصل"],
        "en": ["Case no.", "Date", "Type", "Status", "Language", "Question", "Summary", "Membership", "Contact"],
    },
}
LABELS = {
    "ar": {"pending": "بانتظار الإجابة", "resolved": "حُوّل إلى سؤال شائع", "new": "جديدة",
           "in_progress": "قيد المعالجة", "closed": "مغلقة", "inquiry": "استفسار", "complaint": "شكوى",
           "suggestion": "مقترح", "service": "طلب خدمة", "lang_ar": "عربي", "lang_en": "إنجليزي"},
    "en": {"pending": "Awaiting answer", "resolved": "Converted to FAQ", "new": "New",
           "in_progress": "In progress", "closed": "Closed", "inquiry": "Inquiry", "complaint": "Complaint",
           "suggestion": "Suggestion", "service": "Service request", "lang_ar": "Arabic", "lang_en": "English"},
}


def local_time(dt: datetime) -> str:
    dt = dt if dt.tzinfo else dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(RIYADH).strftime("%Y-%m-%d %H:%M")


def _safe(value) -> str:
    text = "" if value is None else str(value)
    return "'" + text if text[:1] in ("=", "+", "-", "@", "\t", "\r") else text


def csv_response(kind: str, lang: str, rows: list[list]) -> Response:
    buffer = io.StringIO()
    writer = csv.writer(buffer)
    writer.writerow(HEADERS[kind][lang])
    for row in rows:
        writer.writerow([_safe(v) for v in row])
    stamp = datetime.now(RIYADH).strftime("%Y-%m-%d")
    return Response("﻿" + buffer.getvalue(), media_type="text/csv; charset=utf-8",
                    headers={"Content-Disposition": f'attachment; filename="supercx-{kind}-{stamp}.csv"'})

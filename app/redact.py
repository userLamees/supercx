"""Removes personal data (emails, phone numbers, long digit runs) from free text."""
import re

_EMAIL = re.compile(r"[\w.+-]+@[\w-]+(\.[\w-]+)+")
_PHONE = re.compile(r"(?:\+|00)?[\d٠-٩][\d٠-٩\s-]{6,}[\d٠-٩]")


def redact(text: str) -> str:
    text = _EMAIL.sub("[email]", text)
    text = _PHONE.sub("[phone]", text)
    return re.sub(r"\s+", " ", text).strip()


def normalize_key(text: str) -> str:
    """Grouping key: lowercase, no punctuation or diacritics, single spaces."""
    text = re.sub(r"[ً-ٟـ]", "", text.lower())
    text = text.replace("أ", "ا").replace("إ", "ا").replace("آ", "ا").replace("ة", "ه").replace("ى", "ي")
    text = re.sub(r"[^\w\s]", " ", text)
    return re.sub(r"\s+", " ", text).strip()

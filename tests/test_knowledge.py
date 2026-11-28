"""Knowledge base: Arabic normalization, index sync with the FAQ table, and search.

Uses a small word-count embedding instead of OpenAI, so the tests are free, offline and
repeatable. It only matches shared words (no real meaning), which is enough to check
that the right entry ranks first and that weak matches are dropped.
"""
import hashlib
import math
import re
from datetime import date

import pytest
from langchain_core.embeddings import Embeddings
from sqlmodel import Session, select

from app.db import FaqItem, engine
from app.knowledge import get_store, normalize_arabic, search, sync_faq_index

DIMS = 256


class WordEmbeddings(Embeddings):
    def _vector(self, text: str) -> list[float]:
        vec = [0.0] * DIMS
        for word in re.findall(r"\w+", text.lower()):
            vec[int(hashlib.md5(word.encode()).hexdigest(), 16) % DIMS] += 1.0
        norm = math.sqrt(sum(v * v for v in vec)) or 1.0
        return [v / norm for v in vec]

    def embed_documents(self, texts):
        return [self._vector(t) for t in texts]

    def embed_query(self, text):
        return self._vector(text)


@pytest.fixture(params=["chroma", "memory"])
def store(client, tmp_path, request):
    """A fresh index synced with the seeded FAQ. Every test runs on both backends."""
    if request.param == "chroma":
        pytest.importorskip("langchain_chroma")
    index = get_store(WordEmbeddings(), persist_directory=str(tmp_path / "chroma"), backend=request.param)
    with Session(engine) as session:
        sync_faq_index(session, store=index)
    return index


def _add_item(session: Session, question: str, answer: str) -> FaqItem:
    item = FaqItem(category_id="memberships", question_ar=question, answer_ar=answer,
                   source_title="صفحة اختبار", source_url="https://cxa.sa/test",
                   checked_at=date.today(), demo=False)
    session.add(item)
    session.commit()
    return item


def test_normalize_arabic():
    assert normalize_arabic("إِنْضِمَام") == "انضمام"           # diacritics + alef with hamza
    assert normalize_arabic("أعـــضاء") == "اعضاء"               # tatweel
    assert normalize_arabic("Membership fees") == "Membership fees"


def test_every_language_of_every_item_is_indexed(store):
    with Session(engine) as session:
        items = session.exec(select(FaqItem)).all()
    expected = sum(bool(i.question_ar and i.answer_ar) + bool(i.question_en and i.answer_en) for i in items)
    assert expected > 0
    assert len(store.get()["ids"]) == expected


def test_second_sync_changes_nothing(store):
    with Session(engine) as session:
        result = sync_faq_index(session, store=store)
    assert result["added_or_updated"] == 0 and result["removed"] == 0


def test_search_returns_the_matching_entry_with_its_source(store):
    with Session(engine) as session:
        item = _add_item(session, "ما مواعيد عمل فريق الدعم؟", "من الأحد إلى الخميس، التاسعة صباحًا حتى الخامسة مساءً.")
        sync_faq_index(session, store=store)
    hits = search("مواعيد عمل فريق الدعم", min_score=0, store=store)
    assert hits[0].item_id == item.id
    assert hits[0].source_url == "https://cxa.sa/test" and hits[0].demo is False


def test_spelling_variants_still_match(store):
    with Session(engine) as session:
        item = _add_item(session, "متى ينتهي الإشتراك؟", "ينتهي بعد سنة من التفعيل.")
        sync_faq_index(session, store=store)
    hits = search("متى ينتهي الاشتراك", min_score=0, store=store)  # no hamza in the question
    assert hits[0].item_id == item.id


def test_weak_matches_are_dropped(store):
    assert search("xyz qwerty", min_score=0.5, store=store) == []


def test_edited_and_deleted_items_follow_the_database(store):
    with Session(engine) as session:
        item = _add_item(session, "سؤال قديم", "جواب قديم")
        sync_faq_index(session, store=store)

        item.answer_ar = "جواب جديد"
        session.add(item)
        session.commit()
        assert sync_faq_index(session, store=store)["added_or_updated"] == 1
        assert search("سؤال قديم", min_score=0, store=store)[0].answer == "جواب جديد"

        session.delete(item)
        session.commit()
        assert sync_faq_index(session, store=store)["removed"] == 1
    assert all(h.item_id != item.id for h in search("سؤال قديم", min_score=0, store=store))


def test_language_filter(store):
    hits = search("membership fees", min_score=0, lang="en", store=store)
    assert hits and all(h.lang == "en" for h in hits)


def test_auto_backend_falls_back_to_memory_without_chroma(monkeypatch):
    from app import knowledge
    monkeypatch.setattr(knowledge, "chroma_available", lambda: False)
    assert isinstance(get_store(WordEmbeddings(), backend="auto"), knowledge.MemoryStore)
"""Knowledge base for the AI agent: the FAQ table indexed for semantic search.

Two interchangeable vector stores (VECTOR_STORE setting):
- "chroma": Chroma saved on disk (as in the RAG workshop), used when langchain-chroma is installed.
- "memory": a small in-process store. Used when Chroma cannot be installed (for example on
  Replit, where the chromadb package is blocked). The index is rebuilt from the FAQ table at
  startup, which takes one embedding call for a few dozen entries.
Both return cosine similarity, so RAG_MIN_SCORE means the same thing with either.

- One document per FAQ item and language (Arabic and English are indexed separately).
- The database stays the source of truth. `sync_faq_index` makes Chroma match it:
  new or edited items are embedded again, deleted items are removed. Unchanged items
  are skipped (compared by a content hash), so a sync costs nothing when nothing changed.
- Arabic text is normalized (diacritics, alef forms, tatweel) before embedding, for both
  documents and questions, so spelling variants still match.

Rebuild and try a search from the terminal:  python -m app.knowledge "كم رسوم العضوية؟"
"""
import hashlib
import re
from dataclasses import dataclass

from langchain_core.documents import Document
from langchain_core.embeddings import Embeddings
from sqlmodel import Session, select

import logging

from .config import AGENT_ENABLED, CHROMA_DIR, EMBEDDING_MODEL, VECTOR_STORE
from .db import FaqItem

COLLECTION = "faq"

_DIACRITICS = re.compile(r"[ً-ٰٟۖ-ۭ]")  # tashkeel and Quranic marks
_TATWEEL = "ـ"
_ALEF = re.compile(r"[إأآٱ]")


def normalize_arabic(text: str) -> str:
    """Removes diacritics and tatweel and unifies alef forms. English text is unchanged."""
    text = _DIACRITICS.sub("", text).replace(_TATWEEL, "")
    text = _ALEF.sub("ا", text).replace("ى", "ي")
    return re.sub(r"\s+", " ", text).strip()


class NormalizedEmbeddings(Embeddings):
    """Wraps any embedding model and normalizes Arabic before embedding."""

    def __init__(self, inner: Embeddings):
        self.inner = inner

    def embed_documents(self, texts: list[str]) -> list[list[float]]:
        return self.inner.embed_documents([normalize_arabic(t) for t in texts])

    def embed_query(self, text: str) -> list[float]:
        return self.inner.embed_query(normalize_arabic(text))


@dataclass
class Hit:
    """One search result: the FAQ entry and how close it is to the question (0 to 1)."""
    item_id: str
    lang: str
    question: str
    answer: str
    source_title: str
    source_url: str
    checked_at: str
    demo: bool
    score: float


class MemoryStore:
    """In-process vector store with the same methods the knowledge base uses from Chroma.
    Plain cosine similarity over every entry: instant for an FAQ of a few hundred entries."""

    def __init__(self, embeddings: Embeddings):
        self.embeddings = embeddings
        self.rows: dict[str, tuple[Document, list[float]]] = {}

    def get(self, include=None) -> dict:
        ids = list(self.rows)
        return {"ids": ids, "metadatas": [self.rows[i][0].metadata for i in ids]}

    def delete(self, ids: list[str]) -> None:
        for doc_id in ids:
            self.rows.pop(doc_id, None)

    def add_documents(self, documents: list[Document], ids: list[str]) -> None:
        vectors = self.embeddings.embed_documents([d.page_content for d in documents])
        for doc_id, doc, vector in zip(ids, documents, vectors):
            self.rows[doc_id] = (doc, vector)

    def similarity_search_with_relevance_scores(self, query: str, k: int = 4, filter: dict | None = None):
        q = self.embeddings.embed_query(query)
        q_norm = sum(x * x for x in q) ** 0.5 or 1.0
        scored = []
        for doc, vector in self.rows.values():
            if filter and any(doc.metadata.get(key) != value for key, value in filter.items()):
                continue
            norm = sum(x * x for x in vector) ** 0.5 or 1.0
            scored.append((doc, sum(a * b for a, b in zip(q, vector)) / (q_norm * norm)))
        return sorted(scored, key=lambda pair: pair[1], reverse=True)[:k]


def chroma_available() -> bool:
    try:
        import langchain_chroma  # noqa: F401
        return True
    except ImportError:
        return False


_store = None


def get_store(embeddings: Embeddings | None = None, persist_directory: str | None = None, backend: str | None = None):
    """Opens the index. Tests pass their own embeddings, folder and backend."""
    global _store
    is_default = embeddings is None and persist_directory is None and backend is None
    if is_default and _store is not None:
        return _store
    if embeddings is None:
        from langchain_openai import OpenAIEmbeddings
        embeddings = OpenAIEmbeddings(model=EMBEDDING_MODEL)
    embeddings = NormalizedEmbeddings(embeddings)

    backend = backend or VECTOR_STORE
    if backend == "auto":
        backend = "chroma" if chroma_available() else "memory"
    if backend == "chroma":
        from langchain_chroma import Chroma
        store = Chroma(collection_name=COLLECTION, embedding_function=embeddings,
                       persist_directory=persist_directory or CHROMA_DIR,
                       collection_configuration={"hnsw": {"space": "cosine"}})
    else:
        store = MemoryStore(embeddings)
    logging.getLogger(__name__).info("Knowledge index: %s", backend)
    if is_default:
        _store = store
    return store


def _documents(item: FaqItem) -> list[tuple[str, Document]]:
    """Builds the (id, document) pairs for one FAQ item: one per language it has."""
    docs = []
    for lang in ("ar", "en"):
        question = getattr(item, f"question_{lang}")
        answer = getattr(item, f"answer_{lang}")
        if not question or not answer:
            continue
        source_title = (item.source_title_en if lang == "en" else None) or item.source_title
        text = f"{question}\n{answer}"
        metadata = {
            "item_id": item.id, "lang": lang, "category_id": item.category_id,
            "question": question, "answer": answer,
            "source_title": source_title, "source_url": item.source_url or "",
            "checked_at": item.checked_at.isoformat(), "demo": item.demo,
        }
        # The hash covers everything shown to the user, so any edit triggers a re-embed.
        metadata["hash"] = hashlib.sha256(repr(sorted(metadata.items())).encode()).hexdigest()
        docs.append((f"faq:{item.id}:{lang}", Document(page_content=text, metadata=metadata)))
    return docs


def sync_faq_index(session: Session, store=None) -> dict:
    """Makes the Chroma index match the faq_items table. Returns counts for logging."""
    store = store or get_store()
    wanted = {doc_id: doc for item in session.exec(select(FaqItem)).all()
              for doc_id, doc in _documents(item)}

    existing = store.get(include=["metadatas"])
    current = {doc_id: meta.get("hash") for doc_id, meta in zip(existing["ids"], existing["metadatas"])}

    removed = [doc_id for doc_id in current if doc_id not in wanted]
    changed = [doc_id for doc_id, doc in wanted.items() if current.get(doc_id) != doc.metadata["hash"]]

    to_delete = removed + [d for d in changed if d in current]
    if to_delete:  # Chroma rejects an empty delete
        store.delete(ids=to_delete)
    if changed:
        store.add_documents([wanted[d] for d in changed], ids=changed)
    return {"total": len(wanted), "added_or_updated": len(changed), "removed": len(removed)}


def refresh_index() -> None:
    """Called at startup and after every FAQ change, so the agent answers from the latest
    approved content (idea 68). Does nothing without an API key, and never breaks the
    request that triggered it: a failed sync is logged and retried at the next change."""
    if not AGENT_ENABLED:
        return
    from .db import engine
    try:
        with Session(engine) as session:
            logging.getLogger(__name__).info("FAQ index sync: %s", sync_faq_index(session))
    except Exception:  # noqa: BLE001 - the FAQ edit itself already succeeded
        logging.getLogger(__name__).exception("FAQ index sync failed")


def search(question: str, k: int | None = None, min_score: float | None = None,
           lang: str | None = None, store=None) -> list[Hit]:
    """Returns the closest FAQ entries, best first. Entries below `min_score` are dropped,
    so an empty list means "nothing reliable found": the agent should escalate, not guess.
    Defaults come from config at call time, so the evaluation can try other values."""
    from . import config
    k = config.RAG_TOP_K if k is None else k
    min_score = config.RAG_MIN_SCORE if min_score is None else min_score
    store = store or get_store()
    search_filter = {"lang": lang} if lang else None
    results = store.similarity_search_with_relevance_scores(question, k=k, filter=search_filter)
    hits = []
    for doc, score in results:
        if score < min_score:
            continue
        m = doc.metadata
        hits.append(Hit(item_id=m["item_id"], lang=m["lang"], question=m["question"], answer=m["answer"],
                        source_title=m["source_title"], source_url=m["source_url"],
                        checked_at=m["checked_at"], demo=bool(m["demo"]), score=round(score, 3)))
    return hits


if __name__ == "__main__":
    import sys

    from .db import engine, init_db
    from .faq import seed_faq

    init_db()
    with Session(engine) as session:
        seed_faq(session)
        print("Sync:", sync_faq_index(session))
    question = " ".join(sys.argv[1:]) or "كيف أنضم للجمعية؟"
    print(f"\nQuestion: {question}")
    for hit in search(question, min_score=0):
        print(f"  {hit.score:.3f}  [{hit.lang}] {hit.question}  ({hit.source_title})")
"""Brand pass: comparison cards (static/tiers.js, run with Node), assistant name from config,
no old gold color left in static/."""
import json
import re
import shutil
import subprocess
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parent.parent
STATIC = ROOT / "static"
NODE = shutil.which("node")


def run_tiers(script: str, **data):
    """Runs JS against static/tiers.js with `data` as globals; returns its JSON output."""
    if not NODE:
        pytest.skip("node is not installed")
    prelude = f"const T = require({json.dumps(str(STATIC / 'tiers.js'))});\n"
    prelude += "".join(f"const {k} = {json.dumps(v, ensure_ascii=False)};\n" for k, v in data.items())
    out = subprocess.run([NODE, "-e", prelude + script], capture_output=True, text=True, timeout=20)
    assert out.returncode == 0, out.stderr
    return json.loads(out.stdout)


@pytest.fixture()
def tiers(client):
    return client.get("/api/memberships").json()


def ask(client, message):
    r = client.post("/api/chat", json={"message": message})
    assert r.status_code == 200
    return r.json()


# ---------- Comparison cards ----------
def test_cards_show_for_a_comparison_question(client, tiers):
    question = "ما الفرق بين العضويات؟"
    reply = ask(client, question)
    d = run_tiers("console.log(JSON.stringify(T.cardsFor(reply, question, tiers, null)))",
                  reply=reply, question=question, tiers=tiers)
    assert d is not None
    assert d["ids"] == [t["id"] for t in sorted(tiers, key=lambda t: t["display_order"])]
    assert d["recommended"] is None
    assert d["popular"] == next(t["id"] for t in tiers if t["is_most_common"])


def test_cards_show_when_a_reply_names_several_tiers(tiers):
    reply = {"action": "answer", "answer": f"{tiers[0]['name']['ar']} و{tiers[1]['name']['ar']} مختلفتان."}
    d = run_tiers("console.log(JSON.stringify(T.cardsFor(reply, 'سؤال', tiers, null)))", reply=reply, tiers=tiers)
    assert d and len(d["ids"]) == len(tiers)


def test_no_cards_for_other_replies(client, tiers):
    escalate = ask(client, "هل يمكن تقسيط رسوم العضوية على دفعات شهرية؟")
    plain = {"action": "answer", "answer": "مرحبًا بك."}
    d = run_tiers("console.log(JSON.stringify([T.cardsFor(a, 'q', tiers, null), T.cardsFor(b, 'مرحبا', tiers, null)]))",
                  a=escalate, b=plain, tiers=tiers)
    assert d == [None, None]


def test_recommended_card_matches_tier_id(client, tiers):
    reply = ask(client, "أريد عضوية تمنحني حق التصويت")
    assert reply["action"] == "recommend"
    out = run_tiers("""
      const d = T.cardsFor(reply, 'q', tiers, null);
      console.log(JSON.stringify({ d, cards: d.ids.map((id) => T.cardModel(tiers.find((t) => t.id === id), 'ar', d)) }));
    """, reply=reply, tiers=tiers)
    assert out["d"]["recommended"] == reply["tier_id"]
    marked = [c for c in out["cards"] if c["recommended"]]
    assert [c["id"] for c in marked] == [reply["tier_id"]] and marked[0]["badge"] == "recommended"


def test_earlier_recommendation_stays_marked_on_a_later_comparison(tiers):
    rec = tiers[-1]["id"]
    reply = {"action": "answer", "answer": "x"}
    d = run_tiers("console.log(JSON.stringify(T.cardsFor(reply, 'قارن بين العضويات', tiers, rec)))",
                  reply=reply, tiers=tiers, rec=rec)
    assert d["recommended"] == rec


def test_prices_and_benefits_come_from_membership_data(tiers):
    out = run_tiers("""
      const d = { recommended: null, popular: null };
      console.log(JSON.stringify(tiers.map((t) => T.cardModel(t, 'en', d))));
    """, tiers=tiers)
    for card, tier in zip(out, tiers):
        assert card["id"] == tier["id"] and card["price"] == tier["price_sar"]
        assert card["features"] == tier["features"]["en"] and card["name"] == tier["name"]["en"]
        assert card["url"] == tier["source_url"]
    # No price is written in the frontend code.
    code = (STATIC / "tiers.js").read_text() + (STATIC / "chat.js").read_text()
    for tier in tiers:
        price = int(tier["price_sar"])
        assert not re.search(rf"(?<![\w.]){price}(?![\w.])", code), f"hard-coded price {price}"


def test_card_tones_follow_price_rank(tiers):
    tones = run_tiers("console.log(JSON.stringify(T.tones(tiers)))", tiers=tiers)
    by_price = sorted(tiers, key=lambda t: t["price_sar"])
    assert [tones[t["id"]] for t in by_price] == ["gray", "blue", "indigo"]


# ---------- Assistant name ----------
def test_assistant_name_comes_from_config(client, monkeypatch):
    from app import config
    page = client.get("/").text
    assert 'content="مشاري"' in page and 'content="Mishari"' in page
    monkeypatch.setattr(config, "ASSISTANT_NAME_AR", "سلمان")
    monkeypatch.setattr(config, "ASSISTANT_NAME_EN", "Salman <b>")
    page = client.get("/").text
    assert 'content="سلمان"' in page and 'content="Salman &lt;b&gt;"' in page  # escaped
    assert client.get("/api/config").json()["assistant_name"] == {"ar": "سلمان", "en": "Salman <b>"}


def test_name_is_not_hard_coded_in_the_frontend():
    for path in STATIC.rglob("*"):
        if path.suffix in {".js", ".html", ".css"}:
            text = path.read_text(encoding="utf-8")
            assert "مشاري" not in text and "Mishari" not in text, path.name


# ---------- Colors ----------
def test_old_gold_is_gone_from_static():
    hits = [p.name for p in STATIC.rglob("*") if p.is_file() and p.suffix in {".css", ".js", ".html", ".svg"}
            and re.search(r"#c9a24a", p.read_text(encoding="utf-8"), re.I)]
    assert hits == []


def test_brand_tokens_are_defined():
    tokens = (STATIC / "tokens.css").read_text()
    for name, value in {"--c-green": "#102E1A", "--c-blue": "#3040D0", "--c-blue-bright": "#5A62F5",
                        "--c-blue-soft": "#ECEEFC", "--c-indigo": "#1A2390", "--c-ink": "#05030F"}.items():
        assert re.search(rf"{name}:\s*{value}", tokens), name
    assert "prefers-color-scheme: dark" in tokens

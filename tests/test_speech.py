"""Voice endpoints. OpenAI is replaced by fakes: these tests check limits and errors, not audio quality."""
import pytest

from app import config, speech


@pytest.fixture()
def voice_on(monkeypatch):
    monkeypatch.setattr(config, "AGENT_ENABLED", True)
    calls = {}

    def fake_transcribe(audio, filename="recording.webm"):
        calls["transcribe"] = (len(audio), filename)
        return "كيف أنضم للجمعية؟"

    def fake_synthesize(text, lang="ar"):
        calls["synthesize"] = (text, lang)
        return b"ID3-fake-mp3"
    monkeypatch.setattr(speech, "transcribe_audio", fake_transcribe)
    monkeypatch.setattr(speech, "synthesize_speech", fake_synthesize)
    return calls


def test_voice_is_off_without_a_key(client):
    assert client.get("/api/speech").json() == {"enabled": False}
    assert client.post("/api/speech/transcribe", content=b"x").status_code == 503
    assert client.post("/api/speech/synthesize", json={"text": "مرحبا"}).status_code == 503


def test_transcribe_returns_text_and_passes_the_audio_format(client, voice_on):
    r = client.post("/api/speech/transcribe", content=b"audio-bytes", headers={"Content-Type": "audio/mp4"})
    assert r.status_code == 200 and r.json() == {"text": "كيف أنضم للجمعية؟"}
    assert voice_on["transcribe"] == (11, "recording.mp4")


def test_unclear_audio_asks_to_try_again(client, voice_on, monkeypatch):
    def unclear(*a, **kw):
        raise speech.UnclearAudio("Keyfi anlamlı bir cümleyi.")
    monkeypatch.setattr(speech, "transcribe_audio", unclear)
    assert client.post("/api/speech/transcribe", content=b"audio").status_code == 422


def test_only_arabic_or_english_transcripts_are_accepted():
    assert speech.looks_like_arabic_or_english("كيف أنضم للجمعية؟")
    assert speech.looks_like_arabic_or_english("How can I join? 2026")
    assert speech.looks_like_arabic_or_english("أبي أعرف about the Ambassador tier")
    assert not speech.looks_like_arabic_or_english("Keyfi anlamlı bir cümleyi.")   # Turkish from noise
    assert not speech.looks_like_arabic_or_english("...")                           # silence


def test_transcribe_rejects_empty_and_too_long_recordings(client, voice_on):
    assert client.post("/api/speech/transcribe", content=b"").status_code == 400
    big = b"0" * (speech.MAX_AUDIO_BYTES + 1)
    assert client.post("/api/speech/transcribe", content=big).status_code == 413


def test_transcription_failure_is_reported_not_crashed(client, voice_on, monkeypatch):
    def broken(*a, **kw):
        raise RuntimeError("API down")
    monkeypatch.setattr(speech, "transcribe_audio", broken)
    assert client.post("/api/speech/transcribe", content=b"audio").status_code == 502


def test_synthesize_returns_mp3(client, voice_on):
    r = client.post("/api/speech/synthesize", json={"text": "الدعم متاح من الأحد إلى الخميس", "lang": "ar"})
    assert r.status_code == 200 and r.headers["content-type"] == "audio/mpeg"
    assert r.content == b"ID3-fake-mp3" and voice_on["synthesize"][1] == "ar"


def test_synthesize_validates_input(client, voice_on):
    assert client.post("/api/speech/synthesize", json={"text": ""}).status_code == 422
    assert client.post("/api/speech/synthesize", json={"text": "x" * 1501}).status_code == 422
    assert client.post("/api/speech/synthesize", json={"text": "hi", "lang": "fr"}).status_code == 422

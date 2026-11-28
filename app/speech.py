"""Speech-to-text and text-to-speech (OpenAI), adapted from Afaq's tools/speech_tools.py.

Used by POST /api/speech/transcribe (the microphone button) and
POST /api/speech/synthesize (the "Listen" button under each reply).
Speech is available only when OPENAI_API_KEY is set, like the AI agent.
"""
import re
from io import BytesIO

from . import config

MAX_AUDIO_BYTES = 5 * 1024 * 1024  # about a minute of browser audio, with room to spare

# No context prompt is sent to the speech model: on a silent recording it rewrote the prompt
# into a question the user never asked. Silence is caught in the browser (sound level) and,
# as a backup, these phrases that speech models invent from silence are rejected here.
SILENCE_PHRASES = {
    "you", "thank you", "thanks", "thanks for watching", "thank you for watching", "bye",
    "شكرا", "شكرا لكم", "شكرا جزيلا", "شكرا للمشاهدة", "اشتركوا في القناة", "ترجمة نانسي قنقر",
    "موسيقى", "music",
}
MAX_SPEECH_CHARS = 1500            # replies are short; the API itself accepts up to 4096

VOICE_INSTRUCTIONS = {
    "ar": "Speak in clear Modern Standard Arabic with a friendly Saudi tone. Calm, helpful and natural pace.",
    "en": "Speak clearly, naturally and professionally, with a calm and helpful tone.",
}

_client = None


def _openai():
    global _client
    if _client is None:
        from openai import OpenAI
        _client = OpenAI(api_key=config.OPENAI_API_KEY)
    return _client


def enabled() -> bool:
    return config.AGENT_ENABLED


class UnclearAudio(ValueError):
    """Silence, noise, or speech that is neither Arabic nor English."""


def _plain(text: str) -> str:
    return re.sub(r"[^\w\s]", "", text).strip().lower().replace("ً", "")


def is_silence_phrase(text: str) -> bool:
    return _plain(text) in SILENCE_PHRASES


def looks_like_arabic_or_english(text: str) -> bool:
    """Speech models can 'hear' words in another language in silence or noise
    (e.g. a Turkish sentence). Users here speak Arabic or English, so anything else is unclear."""
    letters = [ch for ch in text if ch.isalpha()]
    if not letters:
        return False
    return all("\u0600" <= ch <= "\u06FF" or ch.isascii() for ch in letters)


def transcribe_audio(audio_bytes: bytes, filename: str = "recording.webm") -> str:
    """Converts recorded audio into text. The language is detected from the speech itself:
    the interface language says nothing about the language the user speaks."""
    if not audio_bytes:
        raise ValueError("No audio was provided.")
    audio_file = BytesIO(audio_bytes)
    audio_file.name = filename  # the API detects the format from the file name
    text = _openai().audio.transcriptions.create(
        model=config.OPENAI_STT_MODEL, file=audio_file).text.strip()
    if not looks_like_arabic_or_english(text) or is_silence_phrase(text):
        raise UnclearAudio(text)
    return text


def synthesize_speech(text: str, lang: str = "ar") -> bytes:
    """Converts a reply into MP3 speech."""
    clean_text = text.strip()
    if not clean_text:
        raise ValueError("No text was provided for speech generation.")
    response = _openai().audio.speech.create(
        model=config.OPENAI_TTS_MODEL, voice=config.OPENAI_TTS_VOICE,
        input=clean_text[:MAX_SPEECH_CHARS], response_format="mp3",
        instructions=VOICE_INSTRUCTIONS.get(lang, VOICE_INSTRUCTIONS["en"]),
    )
    return response.read()
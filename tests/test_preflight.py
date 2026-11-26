"""Go-live check (python -m app.preflight) and Replit defaults."""
import importlib

from app import config, preflight


def ready(monkeypatch):
    monkeypatch.setattr(config, "OTP_SECRET", "x" * 64)
    monkeypatch.setattr(config, "SUPPORT_TOKEN", "y" * 40)
    monkeypatch.setattr(config, "STAFF_ADMIN_EMAIL", "admin@example.com")
    monkeypatch.setattr(config, "STAFF_ADMIN_PASSWORD", "Cx-temporary-1")


def test_ready_setup_has_no_problems(monkeypatch):
    ready(monkeypatch)
    assert preflight.problems() == []


def test_each_blocking_problem_is_reported(monkeypatch):
    ready(monkeypatch)
    monkeypatch.setattr(config, "OTP_SECRET", "")
    monkeypatch.setattr(config, "SUPPORT_TOKEN", "short")
    monkeypatch.setattr(config, "ON_REPLIT", True)
    monkeypatch.setattr(config, "PUBLIC_BASE_URL", "")
    found = " ".join(preflight.problems())
    assert "OTP_SECRET" in found and "SUPPORT_TOKEN" in found and "PUBLIC_BASE_URL" in found
    assert "DATABASE_URL" in found  # tests run on SQLite, which Replit doesn't keep


def test_no_way_to_sign_in_is_blocking(monkeypatch):
    ready(monkeypatch)
    for key in ("SUPPORT_TOKEN", "STAFF_ADMIN_EMAIL", "STAFF_ADMIN_PASSWORD"):
        monkeypatch.setattr(config, key, "")
    assert any("STAFF_ADMIN_EMAIL" in p for p in preflight.problems())


def test_report_exit_codes(client, monkeypatch, capsys):
    monkeypatch.setattr(config, "OTP_SECRET", "")
    assert preflight.main([]) == 1
    out = capsys.readouterr().out
    assert "MISSING" in out and "OTP_SECRET" in out
    ready(monkeypatch)
    assert preflight.main([]) == 0
    assert "Ready to go live" in capsys.readouterr().out


def test_generated_secrets_are_new_and_long(capsys):
    assert preflight.main(["--secrets"]) == 0
    first = capsys.readouterr().out
    preflight.main(["--secrets"])
    assert first != capsys.readouterr().out
    values = preflight.new_secrets()
    assert len(values["SUPPORT_TOKEN"]) >= 40 and len(values["OTP_SECRET"]) == 64
    from app.staff import password_problem
    assert password_problem(values["STAFF_ADMIN_PASSWORD"]) is None  # accepted as a staff password


def test_public_url_comes_from_replit(monkeypatch):
    monkeypatch.delenv("PUBLIC_BASE_URL", raising=False)
    monkeypatch.setenv("REPLIT_DOMAINS", "supercx.replit.app,other.example")
    monkeypatch.setenv("REPL_ID", "abc")
    try:
        cfg = importlib.reload(config)
        assert cfg.PUBLIC_BASE_URL == "https://supercx.replit.app" and cfg.ON_REPLIT
        monkeypatch.setenv("PUBLIC_BASE_URL", "https://supercx.cxa.sa/")
        assert importlib.reload(config).PUBLIC_BASE_URL == "https://supercx.cxa.sa"
    finally:
        monkeypatch.delenv("REPLIT_DOMAINS", raising=False)
        monkeypatch.delenv("REPL_ID", raising=False)
        monkeypatch.delenv("PUBLIC_BASE_URL", raising=False)
        importlib.reload(config)


def test_replit_runs_with_proxy_headers():
    text = open(".replit", encoding="utf-8").read()
    assert text.count("--proxy-headers --forwarded-allow-ips") == 2  # workspace run and deployment run
    assert "pip install -r requirements.txt" in text


def test_requirements_file_is_valid():
    """Every line is one pinned package that pip can parse (a missing newline once merged two)."""
    from packaging.requirements import Requirement
    text = open("requirements.txt", encoding="utf-8").read()
    assert text.endswith("\n")
    lines = [l.strip() for l in text.splitlines() if l.strip() and not l.startswith("#")]
    for line in lines:
        req = Requirement(line)
        assert len(req.specifier) == 1 and str(next(iter(req.specifier))).startswith("=="), line
    assert {"fastapi", "sqlmodel", "alembic", "psycopg2-binary"} <= {Requirement(l).name for l in lines}

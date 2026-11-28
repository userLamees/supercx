import os
import sys
from pathlib import Path

# Isolated test database and offline membership data.
os.environ["DATABASE_URL"] = "sqlite:///./test_supercx.db"
os.environ["MEMBERSHIP_API_URL"] = "http://127.0.0.1:9/unreachable"
os.environ["SUPPORT_TOKEN"] = "test-token"
os.environ["OPENAI_API_KEY"] = ""
# Real staff accounts from Replit Secrets must not leak into tests: each test that needs an
# admin creates its own. (With them set, 5 staff-account tests found an extra admin.)
os.environ["STAFF_ADMIN_EMAIL"] = ""
os.environ["STAFF_ADMIN_PASSWORD"] = ""
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import pytest  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402


@pytest.fixture()
def client():
    from sqlmodel import SQLModel
    from app.db import engine
    from main import app
    from sqlalchemy import text
    SQLModel.metadata.drop_all(engine)
    with engine.begin() as conn:  # forget the schema version too, so startup migrates from scratch
        conn.execute(text("DROP TABLE IF EXISTS alembic_version"))
    with TestClient(app) as c:  # startup runs the migrations
        yield c


def pytest_sessionfinish(session, exitstatus):
    from app.db import engine
    engine.dispose()  # Windows: close the DB connection before deleting the file
    try:
        Path("test_supercx.db").unlink(missing_ok=True)
    except PermissionError:
        pass

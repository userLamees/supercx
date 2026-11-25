import os
import sys
from pathlib import Path

# Isolated test database and offline membership data.
os.environ["DATABASE_URL"] = "sqlite:///./test_supercx.db"
os.environ["MEMBERSHIP_API_URL"] = "http://127.0.0.1:9/unreachable"
os.environ["SUPPORT_TOKEN"] = "test-token"
os.environ["OPENAI_API_KEY"] = ""
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import pytest  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402


@pytest.fixture()
def client():
    from sqlmodel import SQLModel
    from app.db import engine
    from main import app
    SQLModel.metadata.drop_all(engine)
    with TestClient(app) as c:  # startup recreates the tables
        yield c


def pytest_sessionfinish(session, exitstatus):
    from app.db import engine
    engine.dispose()  # Windows: close the DB connection before deleting the file
    try:
        Path("test_supercx.db").unlink(missing_ok=True)
    except PermissionError:
        pass

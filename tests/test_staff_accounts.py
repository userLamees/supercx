"""Staff accounts: sign-in, sessions, roles, the action log, and the shared token as admin key."""
from datetime import datetime, timedelta, timezone

import pytest
from sqlmodel import Session, select

from app import config, staff
from app.db import AuditEntry, StaffSession, StaffUser, engine

TOKEN = {"X-Support-Token": "test-token", "X-Staff-Name": "admin-script"}
TEMP = "Temp-pass-2026"
NEW = "New-pass-2026!"


@pytest.fixture(autouse=True)
def _fresh_limiter():
    staff.limiter.reset()
    yield
    staff.limiter.reset()


def create(client, email="sara@example.com", name="سارة", role="staff", password=TEMP, headers=TOKEN):
    r = client.post("/api/staff/users", json={"email": email, "name": name, "role": role, "password": password},
                    headers=headers)
    assert r.status_code == 201, r.text
    return r.json()


def login(client, email="sara@example.com", password=TEMP):
    return client.post("/api/staff/login", json={"email": email, "password": password})


def bearer(token):
    return {"Authorization": f"Bearer {token}"}


def ready(client, email="sara@example.com", name="سارة", role="staff"):
    """An account that has signed in and replaced its temporary password."""
    create(client, email=email, name=name, role=role)
    token = login(client, email).json()["token"]
    r = client.post("/api/staff/me/password", json={"current_password": TEMP, "new_password": NEW}, headers=bearer(token))
    assert r.status_code == 200, r.text
    return bearer(token)


# ---------- Passwords ----------
def test_password_is_stored_as_scrypt_hash(client):
    create(client)
    with Session(engine) as s:
        user = s.exec(select(StaffUser)).one()
        assert user.password_hash.startswith("scrypt$") and TEMP not in user.password_hash
    assert staff.check_password(TEMP, user.password_hash) and not staff.check_password("wrong", user.password_hash)


@pytest.mark.parametrize("password,problem", [("short1", "too_short"), ("onlyletterspassword", "too_simple"),
                                              ("12345678901", "too_simple")])
def test_weak_passwords_are_rejected(client, password, problem):
    r = client.post("/api/staff/users", json={"email": "a@example.com", "name": "أحمد", "password": password}, headers=TOKEN)
    assert r.status_code == 422 and r.json()["detail"] == problem


# ---------- Sign-in ----------
def test_login_returns_a_session_token_stored_as_hash(client):
    create(client)
    r = login(client, "SARA@example.com ")
    assert r.status_code == 200
    data = r.json()
    assert data["user"]["name"] == "سارة" and data["user"]["must_change_password"] is True
    with Session(engine) as s:
        row = s.exec(select(StaffSession)).one()
        assert data["token"] not in row.token_hash and len(row.token_hash) == 64


def test_wrong_email_and_wrong_password_look_the_same(client):
    create(client)
    a, b = login(client, password="wrong-pass-1"), login(client, "nobody@example.com")
    assert a.status_code == b.status_code == 401 and a.json() == b.json()


def test_too_many_failed_logins_are_blocked(client):
    create(client)
    for _ in range(staff.MAX_FAILURES_PER_EMAIL):
        assert login(client, password="wrong-pass-1").status_code == 401
    r = login(client)  # even the right password waits
    assert r.status_code == 429 and int(r.headers["Retry-After"]) > 0


def test_temporary_password_must_be_changed_first(client):
    create(client)
    h = bearer(login(client).json()["token"])
    assert client.get("/api/support-cases", headers=h).json()["detail"] == "password_change_required"
    assert client.get("/api/staff/me", headers=h).status_code == 200  # allowed: to show the change form
    bad = client.post("/api/staff/me/password", json={"current_password": "nope", "new_password": NEW}, headers=h)
    assert bad.status_code == 400
    same = client.post("/api/staff/me/password", json={"current_password": TEMP, "new_password": TEMP}, headers=h)
    assert same.status_code == 422
    ok = client.post("/api/staff/me/password", json={"current_password": TEMP, "new_password": NEW}, headers=h)
    assert ok.status_code == 200 and ok.json()["must_change_password"] is False
    assert client.get("/api/support-cases", headers=h).status_code == 200
    assert login(client, password=NEW).status_code == 200 and login(client, password=TEMP).status_code == 401


def test_logout_revokes_the_session(client):
    h = ready(client)
    assert client.post("/api/staff/logout", headers=h).status_code == 204
    assert client.get("/api/staff/me", headers=h).status_code == 401


def test_expired_session_is_rejected(client):
    h = ready(client)
    with Session(engine) as s:
        for row in s.exec(select(StaffSession)):
            row.expires_at = datetime.now(timezone.utc) - timedelta(minutes=1)
            s.add(row)
        s.commit()
    assert client.get("/api/staff/me", headers=h).status_code == 401


def test_bad_bearer_token_is_rejected(client):
    assert client.get("/api/support-cases", headers=bearer("made-up")).status_code == 401
    assert client.get("/api/support-cases").status_code == 401


# ---------- Who did it ----------
def test_actions_are_logged_with_the_signed_in_account(client):
    h = ready(client)
    case = client.post("/api/support-cases", json={"question": "سؤال", "language": "ar", "anonymous": True}).json()
    # A typed name header is ignored for accounts: the server knows who is signed in.
    r = client.post(f"/api/support-cases/{case['id']}/reply", json={"reply": "تم."},
                    headers={**h, "X-Staff-Name": "someone-else"})
    assert r.status_code == 200 and r.json()["replied_by"] == "سارة"
    with Session(engine) as s:
        entry = s.exec(select(AuditEntry).where(AuditEntry.action == "case.reply")).one()
        user = s.exec(select(StaffUser)).one()
        assert entry.actor == "سارة" and entry.actor_id == user.id


# ---------- Roles ----------
def test_staff_cannot_manage_accounts(client):
    h = ready(client)
    assert client.get("/api/staff/users", headers=h).status_code == 403
    r = client.post("/api/staff/users", json={"email": "x@example.com", "name": "س", "password": TEMP}, headers=h)
    assert r.status_code == 403


def test_admin_manages_accounts(client):
    admin = ready(client, "admin@example.com", "المدير", "admin")
    sara = create(client, headers=admin)
    users = client.get("/api/staff/users", headers=admin).json()
    assert [u["email"] for u in users] == ["admin@example.com", "sara@example.com"]
    assert "password_hash" not in str(users)
    r = client.patch(f"/api/staff/users/{sara['id']}", json={"name": "سارة أحمد", "role": "admin"}, headers=admin)
    assert r.json()["name"] == "سارة أحمد" and r.json()["role"] == "admin"
    assert client.post("/api/staff/users", json={"email": "sara@example.com", "name": "مكرر", "password": TEMP},
                       headers=admin).status_code == 409


def test_deactivated_account_is_signed_out(client):
    admin = ready(client, "admin@example.com", "المدير", "admin")
    sara = ready(client)
    sara_id = client.get("/api/staff/me", headers=sara).json()["id"]
    assert client.patch(f"/api/staff/users/{sara_id}", json={"active": False}, headers=admin).status_code == 200
    assert client.get("/api/staff/me", headers=sara).status_code == 401
    assert login(client, password=NEW).status_code == 401


def test_admin_reset_password_signs_out_and_forces_change(client):
    admin = ready(client, "admin@example.com", "المدير", "admin")
    sara = ready(client)
    sara_id = client.get("/api/staff/me", headers=sara).json()["id"]
    r = client.post(f"/api/staff/users/{sara_id}/password", json={"password": "Reset-pass-99"}, headers=admin)
    assert r.status_code == 200 and r.json()["must_change_password"] is True
    assert client.get("/api/staff/me", headers=sara).status_code == 401
    assert login(client, password="Reset-pass-99").json()["user"]["must_change_password"] is True


def test_last_admin_is_protected(client):
    admin = ready(client, "admin@example.com", "المدير", "admin")
    me = client.get("/api/staff/me", headers=admin).json()
    assert client.patch(f"/api/staff/users/{me['id']}", json={"role": "staff"}, headers=admin).json()["detail"] == "last_admin"
    second = create(client, "b@example.com", "بدر", "admin", headers=admin)
    assert client.patch(f"/api/staff/users/{me['id']}", json={"active": False}, headers=admin).json()["detail"] == "cannot_deactivate_self"
    assert client.patch(f"/api/staff/users/{second['id']}", json={"active": False}, headers=admin).status_code == 200


# ---------- Shared token and first admin ----------
def test_shared_token_still_works_as_admin_key(client):
    me = client.get("/api/staff/me", headers=TOKEN).json()
    assert me["via"] == "token" and me["role"] == "admin" and me["name"] == "admin-script"
    assert client.get("/api/staff/users", headers=TOKEN).status_code == 200


def test_shared_token_can_be_turned_off(client, monkeypatch):
    monkeypatch.setattr(config, "ALLOW_SUPPORT_TOKEN", False)
    assert client.get("/api/support-cases", headers=TOKEN).status_code == 401


def test_first_admin_comes_from_settings(client, monkeypatch):
    monkeypatch.setattr(config, "STAFF_ADMIN_EMAIL", "Owner@Example.com")
    monkeypatch.setattr(config, "STAFF_ADMIN_PASSWORD", "First-pass-123")
    assert staff.ensure_first_admin() == "owner@example.com"
    assert staff.ensure_first_admin() is None  # only when there is no account yet
    data = login(client, "owner@example.com", "First-pass-123").json()
    assert data["user"]["role"] == "admin" and data["user"]["must_change_password"] is True


def test_seed_creates_demo_accounts_once(client, monkeypatch):
    from app.seed_demo import seed_staff
    monkeypatch.setenv("DEMO_STAFF_PASSWORD", "Demo-pass-2026")
    with Session(engine) as s:
        created, password = seed_staff(s)
        s.commit()
        assert created == ["admin@example.com", "staff@example.com"] and password == "Demo-pass-2026"
        assert seed_staff(s) == ([], None)  # second run leaves them alone
    data = login(client, "staff@example.com", "Demo-pass-2026").json()
    assert data["user"]["role"] == "staff" and data["user"]["demo"] is True

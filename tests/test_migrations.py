"""Database migrations (Alembic): the models and the migrations agree, old databases are adopted,
and upgrades are safe to run again."""
from alembic import command
from alembic.autogenerate import compare_metadata
from alembic.runtime.migration import MigrationContext
from alembic.script import ScriptDirectory
from sqlalchemy import create_engine, inspect, text
from sqlmodel import SQLModel

from app import db


def head() -> str:
    return ScriptDirectory.from_config(db.alembic_config()).get_current_head()


def fresh_engine(tmp_path, name="m.db"):
    return create_engine(f"sqlite:///{tmp_path / name}")


def diff(engine):
    with engine.connect() as conn:
        return compare_metadata(MigrationContext.configure(conn, opts={"compare_type": True}), SQLModel.metadata)


def test_every_model_change_has_a_migration(tmp_path):
    """Fails when a model in app/db.py changed without `alembic revision --autogenerate`."""
    engine = fresh_engine(tmp_path)
    db.init_db(engine)
    assert diff(engine) == []
    with engine.connect() as conn:
        assert db.schema_version(conn) == head()


def test_startup_twice_changes_nothing(tmp_path):
    engine = fresh_engine(tmp_path)
    db.init_db(engine)
    with engine.begin() as conn:
        conn.execute(text("INSERT INTO faq_categories (id, title_ar, title_en, position) VALUES ('c', 'ع', 'e', 1)"))
    db.init_db(engine)
    with engine.connect() as conn:
        assert conn.execute(text("SELECT count(*) FROM faq_categories")).scalar() == 1


def test_downgrade_and_upgrade_round_trip(tmp_path):
    engine = fresh_engine(tmp_path)
    db.init_db(engine)
    with engine.begin() as conn:
        command.downgrade(db.alembic_config(conn), "base")
        assert set(inspect(conn).get_table_names()) <= {"alembic_version"}
        command.upgrade(db.alembic_config(conn), "head")
    assert diff(engine) == []


def test_pre_migration_database_is_adopted_with_its_data(tmp_path):
    """A database made by create_all before migrations: older support_cases columns, no
    notifications or staff tables, no alembic_version."""
    engine = fresh_engine(tmp_path, "legacy.db")
    with engine.begin() as conn:
        conn.execute(text(
            "CREATE TABLE support_cases (id VARCHAR PRIMARY KEY, created_at DATETIME NOT NULL, "
            "updated_at DATETIME NOT NULL, question VARCHAR NOT NULL, language VARCHAR NOT NULL, "
            "contact VARCHAR NOT NULL, tier_id VARCHAR, summary VARCHAR, status VARCHAR(11) NOT NULL)"))
        conn.execute(text("INSERT INTO support_cases VALUES ('case-1', '2026-01-01', '2026-01-01', 'سؤال قديم', "
                          "'ar', '', NULL, NULL, 'new')"))
        conn.execute(text("CREATE TABLE audit_log (id VARCHAR PRIMARY KEY, at DATETIME NOT NULL, actor VARCHAR NOT NULL, "
                          "action VARCHAR NOT NULL, target_type VARCHAR NOT NULL, target_id VARCHAR NOT NULL, "
                          "summary VARCHAR NOT NULL)"))
    db.init_db(engine)
    with engine.connect() as conn:
        assert db.schema_version(conn) == head()
        tables = set(inspect(conn).get_table_names())
        assert {"notifications", "staff_users", "staff_sessions", "chat_events"} <= tables
        cols = {c["name"] for c in inspect(conn).get_columns("support_cases")}
        assert {"category", "tracking_hash", "reply", "replied_at", "replied_by", "demo"} <= cols
        assert "actor_id" in {c["name"] for c in inspect(conn).get_columns("audit_log")}
        row = conn.execute(text("SELECT question, category FROM support_cases WHERE id = 'case-1'")).one()
        assert row == ("سؤال قديم", "inquiry")


def test_offline_sql_can_be_generated(tmp_path, capsys):
    """`alembic upgrade head --sql` works, for reviewing what a migration will run."""
    cfg = db.alembic_config()
    command.upgrade(cfg, "head", sql=True)
    assert "CREATE TABLE support_cases" in capsys.readouterr().out


def test_postgres_urls_use_the_installed_driver():
    from app.config import normalize_database_url
    assert normalize_database_url("postgres://u:p@h:5432/db") == "postgresql+psycopg2://u:p@h:5432/db"
    assert normalize_database_url("postgresql://u@h/db") == "postgresql+psycopg2://u@h/db"
    assert normalize_database_url("postgresql+psycopg2://u@h/db") == "postgresql+psycopg2://u@h/db"
    assert normalize_database_url("sqlite:///./supercx.db") == "sqlite:///./supercx.db"


def test_migration_renders_for_postgres():
    """The baseline also works on Replit Postgres: render its SQL with the Postgres dialect."""
    from alembic.migration import MigrationContext
    from alembic.operations import Operations
    from sqlalchemy.dialects import postgresql
    import io
    buf = io.StringIO()
    ctx = MigrationContext.configure(dialect=postgresql.dialect(), opts={"as_sql": True, "output_buffer": buf})
    from importlib import util
    spec = util.spec_from_file_location("baseline", db._ROOT / "migrations" / "versions" / "0001_baseline_schema.py")
    module = util.module_from_spec(spec)
    spec.loader.exec_module(module)
    with Operations.context(ctx):
        module.upgrade()
    sql = buf.getvalue()
    assert sql.count("CREATE TABLE") == 10 and "TIMESTAMP WITH TIME ZONE" in sql and "BOOLEAN" in sql

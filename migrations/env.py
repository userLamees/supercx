"""Alembic environment for SuperCX.

The database URL comes from app.config (DATABASE_URL: SQLite locally, Postgres on Replit), and the
target schema is the SQLModel tables in app/db.py. The app runs `upgrade head` at startup
(app.db.init_db), so this file is mostly used when creating a new migration:

    alembic revision --autogenerate -m "add something"
"""
from logging.config import fileConfig

from alembic import context
from sqlmodel import SQLModel

from app import db  # noqa: F401 (registers every table on SQLModel.metadata)
from app.config import DATABASE_URL

config = context.config
if config.config_file_name is not None and config.attributes.get("configure_logger", True):
    fileConfig(config.config_file_name, disable_existing_loggers=False)

target_metadata = SQLModel.metadata


def run_migrations_offline() -> None:
    """Emit SQL to stdout (alembic upgrade head --sql) without a database connection."""
    context.configure(url=DATABASE_URL, target_metadata=target_metadata, literal_binds=True,
                      dialect_opts={"paramstyle": "named"}, render_as_batch=DATABASE_URL.startswith("sqlite"))
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    # The app passes its own connection (init_db); the alembic CLI uses the app's engine.
    connection = config.attributes.get("connection")
    if connection is None:
        with db.engine.connect() as connection:
            _run(connection)
            connection.commit()
    else:
        _run(connection)


def _run(connection) -> None:
    # SQLite can't ALTER most things in place: batch mode copies the table instead.
    context.configure(connection=connection, target_metadata=target_metadata,
                      render_as_batch=connection.dialect.name == "sqlite", compare_type=True)
    with context.begin_transaction():
        context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()

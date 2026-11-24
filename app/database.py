"""
SQLAlchemy engine + session management for WEIS backend.
Supports both MySQL (production/staging) and SQLite (local development/testing).
"""

import os
from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker, declarative_base

from app.config import settings

# Configure engine based on dialect
if settings.DATABASE_URL.startswith("sqlite"):
    # Ensure directory exists for SQLite files (e.g. ./data/weis.db)
    if ":///" in settings.DATABASE_URL and not settings.DATABASE_URL.endswith(":memory:"):
        db_path = settings.DATABASE_URL.split(":///", 1)[1]
        dir_name = os.path.dirname(db_path)
        if dir_name:
            os.makedirs(dir_name, exist_ok=True)

    engine = create_engine(
        settings.DATABASE_URL,
        connect_args={"check_same_thread": False},
        echo=settings.DEBUG,
    )

    # Enable SQLite Foreign Key constraints enforcement
    @event.listens_for(engine, "connect")
    def set_sqlite_pragma(dbapi_connection, connection_record):
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()

else:
    # pool_pre_ping guards against stale MySQL connections timing out
    engine = create_engine(
        settings.DATABASE_URL,
        pool_pre_ping=True,
        pool_recycle=3600,
        echo=settings.DEBUG,
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    """FastAPI dependency that yields a DB session and closes it after use."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

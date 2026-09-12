"""
Shared test configuration for WEIS backend tests.
Provides a single in-memory SQLite database and TestClient shared across all test files.
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from fastapi.testclient import TestClient

from app.main import app
from app.database import Base, get_db
from app.models import Skill

# ---------- Single shared test DB ----------

SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base.metadata.create_all(bind=engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


# Apply the override once, globally
app.dependency_overrides[get_db] = override_get_db

# Shared client
client = TestClient(app)


# ---------- Seed test skills ----------

def seed_test_skills():
    """Insert test skills if not already present."""
    db = TestingSessionLocal()
    if db.query(Skill).count() == 0:
        db.add_all([
            Skill(skill_id=1, skill_name="Python", category="Technical"),
            Skill(skill_id=2, skill_name="Data Analysis", category="Technical"),
            Skill(skill_id=3, skill_name="Communication", category="Soft Skills"),
            Skill(skill_id=4, skill_name="Leadership", category="Soft Skills"),
        ])
        db.commit()
    db.close()


seed_test_skills()

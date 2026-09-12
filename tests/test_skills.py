"""
Tests for the Skills API (Phase 2A Step 5).
Uses an in-memory SQLite database to avoid requiring MySQL.
Covers catalogue retrieval, user skill CRUD, ownership/IDOR security,
authentication enforcement, and proficiency validation.
"""

import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.database import Base, get_db
from app.models import Skill
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from jose import jwt
from app.config import settings
from datetime import datetime, timedelta

from tests.conftest import client, TestingSessionLocal

# ---------- Seed skills into test DB ----------

_skills_seeded = False

def _ensure_skills_seeded():
    """Insert test skills into the test DB if not already present."""
    global _skills_seeded
    if _skills_seeded:
        return
    db = TestingSessionLocal()
    existing = db.query(Skill).count()
    if existing == 0:
        skills_data = [
            Skill(skill_id=1, skill_name="Python", category="Technical"),
            Skill(skill_id=2, skill_name="Data Analysis", category="Technical"),
            Skill(skill_id=3, skill_name="Communication", category="Soft Skills"),
            Skill(skill_id=4, skill_name="Leadership", category="Soft Skills"),
        ]
        db.add_all(skills_data)
        db.commit()
    db.close()
    _skills_seeded = True


@pytest.fixture(autouse=True)
def seed_skills():
    """Ensure test skills are present before every test in this module."""
    _ensure_skills_seeded()



# ---------- Helpers ----------

def _register_and_login(email: str, full_name: str = "Test User") -> str:
    """Register a user and return the JWT access token."""
    client.post("/api/auth/register", json={
        "full_name": full_name,
        "email": email,
        "password": "securepassword",
        "role": "mentee",
    })
    login_resp = client.post("/api/auth/login", json={
        "email": email,
        "password": "securepassword",
    })
    return login_resp.json()["access_token"]


def _auth_header(token: str) -> dict:
    return {"Authorization": f"Bearer {token}"}


# ==========================================================================
# TEST 1 — Get skill catalogue
# ==========================================================================
def test_get_skill_catalogue():
    resp = client.get("/api/skills")
    assert resp.status_code == 200
    data = resp.json()
    assert isinstance(data, list)
    assert len(data) >= 4
    # Verify structure of each skill
    for skill in data:
        assert "skill_id" in skill
        assert "skill_name" in skill
        assert "category" in skill
        # Must NOT expose internal fields
        assert "password_hash" not in skill


# ==========================================================================
# TEST 2 — Get empty user skill inventory
# ==========================================================================
def test_get_empty_user_skills():
    ts = datetime.utcnow().timestamp()
    token = _register_and_login(f"empty_skills_{ts}@example.com")

    resp = client.get("/api/users/me/skills", headers=_auth_header(token))
    assert resp.status_code == 200
    assert resp.json() == []


# ==========================================================================
# TEST 3 — Add valid skill
# ==========================================================================
def test_add_skill_to_inventory():
    ts = datetime.utcnow().timestamp()
    token = _register_and_login(f"add_skill_{ts}@example.com")

    resp = client.post(
        "/api/users/me/skills",
        headers=_auth_header(token),
        json={"skill_id": 1, "proficiency_level": "beginner"},
    )
    assert resp.status_code == 201
    data = resp.json()
    assert data["skill_id"] == 1
    assert data["skill_name"] == "Python"
    assert data["category"] == "Technical"
    assert data["proficiency_level"] == "beginner"
    assert "user_skill_id" in data


# ==========================================================================
# TEST 4 — Add another skill (multiple skills per user)
# ==========================================================================
def test_add_multiple_skills():
    ts = datetime.utcnow().timestamp()
    token = _register_and_login(f"multi_skill_{ts}@example.com")

    # Add first skill
    resp1 = client.post(
        "/api/users/me/skills",
        headers=_auth_header(token),
        json={"skill_id": 1, "proficiency_level": "beginner"},
    )
    assert resp1.status_code == 201

    # Add second skill
    resp2 = client.post(
        "/api/users/me/skills",
        headers=_auth_header(token),
        json={"skill_id": 2, "proficiency_level": "intermediate"},
    )
    assert resp2.status_code == 201

    # Verify both exist
    get_resp = client.get("/api/users/me/skills", headers=_auth_header(token))
    assert get_resp.status_code == 200
    skills = get_resp.json()
    assert len(skills) == 2
    skill_ids = {s["skill_id"] for s in skills}
    assert skill_ids == {1, 2}


# ==========================================================================
# TEST 5 — Duplicate skill rejected
# ==========================================================================
def test_duplicate_skill_rejected():
    ts = datetime.utcnow().timestamp()
    token = _register_and_login(f"dup_skill_{ts}@example.com")

    # Add skill
    client.post(
        "/api/users/me/skills",
        headers=_auth_header(token),
        json={"skill_id": 1, "proficiency_level": "beginner"},
    )

    # Attempt duplicate
    resp = client.post(
        "/api/users/me/skills",
        headers=_auth_header(token),
        json={"skill_id": 1, "proficiency_level": "advanced"},
    )
    assert resp.status_code == 409

    # Verify only one record exists
    get_resp = client.get("/api/users/me/skills", headers=_auth_header(token))
    skills = get_resp.json()
    python_skills = [s for s in skills if s["skill_id"] == 1]
    assert len(python_skills) == 1


# ==========================================================================
# TEST 6 — Invalid skill ID (nonexistent)
# ==========================================================================
def test_add_nonexistent_skill():
    ts = datetime.utcnow().timestamp()
    token = _register_and_login(f"bad_skill_{ts}@example.com")

    resp = client.post(
        "/api/users/me/skills",
        headers=_auth_header(token),
        json={"skill_id": 99999, "proficiency_level": "beginner"},
    )
    assert resp.status_code == 404


# ==========================================================================
# TEST 7 — Invalid proficiency value
# ==========================================================================
def test_invalid_proficiency():
    ts = datetime.utcnow().timestamp()
    token = _register_and_login(f"bad_prof_{ts}@example.com")

    resp = client.post(
        "/api/users/me/skills",
        headers=_auth_header(token),
        json={"skill_id": 1, "proficiency_level": "expert"},
    )
    assert resp.status_code == 422


# ==========================================================================
# TEST 8 — Update proficiency (beginner → intermediate)
# ==========================================================================
def test_update_proficiency():
    ts = datetime.utcnow().timestamp()
    token = _register_and_login(f"update_prof_{ts}@example.com")

    # Add skill as beginner
    client.post(
        "/api/users/me/skills",
        headers=_auth_header(token),
        json={"skill_id": 1, "proficiency_level": "beginner"},
    )

    # Update to intermediate
    resp = client.put(
        "/api/users/me/skills/1",
        headers=_auth_header(token),
        json={"proficiency_level": "intermediate"},
    )
    assert resp.status_code == 200
    assert resp.json()["proficiency_level"] == "intermediate"

    # Verify persistence
    get_resp = client.get("/api/users/me/skills", headers=_auth_header(token))
    skill = [s for s in get_resp.json() if s["skill_id"] == 1][0]
    assert skill["proficiency_level"] == "intermediate"


# ==========================================================================
# TEST 9 — Update to advanced
# ==========================================================================
def test_update_to_advanced():
    ts = datetime.utcnow().timestamp()
    token = _register_and_login(f"advanced_{ts}@example.com")

    client.post(
        "/api/users/me/skills",
        headers=_auth_header(token),
        json={"skill_id": 2, "proficiency_level": "intermediate"},
    )

    resp = client.put(
        "/api/users/me/skills/2",
        headers=_auth_header(token),
        json={"proficiency_level": "advanced"},
    )
    assert resp.status_code == 200
    assert resp.json()["proficiency_level"] == "advanced"


# ==========================================================================
# TEST 10 — Delete skill from inventory
# ==========================================================================
def test_delete_user_skill():
    ts = datetime.utcnow().timestamp()
    token = _register_and_login(f"del_skill_{ts}@example.com")

    # Add then delete
    client.post(
        "/api/users/me/skills",
        headers=_auth_header(token),
        json={"skill_id": 3, "proficiency_level": "beginner"},
    )

    resp = client.delete("/api/users/me/skills/3", headers=_auth_header(token))
    assert resp.status_code == 200

    # Verify removed from user inventory
    get_resp = client.get("/api/users/me/skills", headers=_auth_header(token))
    assert all(s["skill_id"] != 3 for s in get_resp.json())

    # Verify the global skill catalogue still has the skill
    cat_resp = client.get("/api/skills")
    cat_ids = {s["skill_id"] for s in cat_resp.json()}
    assert 3 in cat_ids  # Communication still in catalogue


# ==========================================================================
# TEST 11 — Delete nonexistent user skill
# ==========================================================================
def test_delete_nonexistent_user_skill():
    ts = datetime.utcnow().timestamp()
    token = _register_and_login(f"del_none_{ts}@example.com")

    resp = client.delete("/api/users/me/skills/99999", headers=_auth_header(token))
    assert resp.status_code == 404


# ==========================================================================
# TEST 12 — Missing authentication on protected endpoints
# ==========================================================================
def test_missing_auth_user_skills():
    assert client.get("/api/users/me/skills").status_code == 401
    assert client.post("/api/users/me/skills", json={"skill_id": 1, "proficiency_level": "beginner"}).status_code == 401
    assert client.put("/api/users/me/skills/1", json={"proficiency_level": "advanced"}).status_code == 401
    assert client.delete("/api/users/me/skills/1").status_code == 401


# ==========================================================================
# TEST 13 — Invalid authentication (garbage token)
# ==========================================================================
def test_invalid_auth_user_skills():
    bad_header = {"Authorization": "Bearer invalid.garbage.token"}
    assert client.get("/api/users/me/skills", headers=bad_header).status_code == 401
    assert client.post("/api/users/me/skills", headers=bad_header, json={"skill_id": 1, "proficiency_level": "beginner"}).status_code == 401


# ==========================================================================
# TEST 14 — Ownership protection / IDOR
# ==========================================================================
def test_idor_cross_user_skill_access():
    """
    User A must NOT be able to read, update, or delete User B's skills.
    Since all endpoints use /me + get_current_user(), cross-user access
    should be impossible by design. We verify it explicitly.
    """
    ts = datetime.utcnow().timestamp()
    token_a = _register_and_login(f"idor_a_{ts}@example.com", "User A")
    token_b = _register_and_login(f"idor_b_{ts}@example.com", "User B")

    # User B adds a skill
    add_resp = client.post(
        "/api/users/me/skills",
        headers=_auth_header(token_b),
        json={"skill_id": 4, "proficiency_level": "advanced"},
    )
    assert add_resp.status_code == 201

    # User A reads their own skills — should NOT see User B's skill
    get_resp = client.get("/api/users/me/skills", headers=_auth_header(token_a))
    assert get_resp.status_code == 200
    a_skill_ids = {s["skill_id"] for s in get_resp.json()}
    assert 4 not in a_skill_ids

    # User A tries to update User B's skill via /me — should 404
    update_resp = client.put(
        "/api/users/me/skills/4",
        headers=_auth_header(token_a),
        json={"proficiency_level": "beginner"},
    )
    assert update_resp.status_code == 404

    # User A tries to delete User B's skill via /me — should 404
    delete_resp = client.delete("/api/users/me/skills/4", headers=_auth_header(token_a))
    assert delete_resp.status_code == 404

    # Verify User B's skill is still intact
    b_resp = client.get("/api/users/me/skills", headers=_auth_header(token_b))
    b_skill_ids = {s["skill_id"] for s in b_resp.json()}
    assert 4 in b_skill_ids


# ==========================================================================
# TEST 15 — Role integrity (skills ops don't allow privilege escalation)
# ==========================================================================
def test_skills_no_role_escalation():
    """Adding/updating skills must not alter user role or expose sensitive data."""
    ts = datetime.utcnow().timestamp()
    token = _register_and_login(f"role_int_{ts}@example.com")

    # Add skill with extra 'role' field injected
    resp = client.post(
        "/api/users/me/skills",
        headers=_auth_header(token),
        json={"skill_id": 1, "proficiency_level": "beginner", "role": "admin"},
    )
    # Should succeed (extra fields ignored) or 422
    assert resp.status_code in (201, 422)

    # Check user role hasn't changed
    me_resp = client.get("/api/users/me", headers=_auth_header(token))
    assert me_resp.json()["role"] == "mentee"

    # No sensitive fields in skill response
    if resp.status_code == 201:
        data = resp.json()
        assert "password_hash" not in data
        assert "password" not in data


# ==========================================================================
# TEST 16 — Update nonexistent skill in user inventory
# ==========================================================================
def test_update_skill_not_in_inventory():
    ts = datetime.utcnow().timestamp()
    token = _register_and_login(f"upd_none_{ts}@example.com")

    resp = client.put(
        "/api/users/me/skills/1",
        headers=_auth_header(token),
        json={"proficiency_level": "advanced"},
    )
    assert resp.status_code == 404

"""
Tests for Admin Governance & Statistics API endpoints (/api/admin/stats).
Verifies access control, telemetry aggregation, and RBAC enforcement.
"""

from datetime import datetime
from app.models import User, RoleEnum
from app.security import hash_password, create_access_token
from tests.conftest import client, TestingSessionLocal


def _auth(token: str) -> dict:
    return {"Authorization": f"Bearer {token}"}


def _create_admin_token() -> str:
    ts = datetime.utcnow().timestamp()
    db = TestingSessionLocal()
    admin = User(
        full_name="Governance Administrator",
        email=f"admin_gov_{ts}@weis.org",
        password_hash=hash_password("adminpass123"),
        role=RoleEnum.admin,
    )
    db.add(admin)
    db.commit()
    db.refresh(admin)
    token = create_access_token({"sub": str(admin.user_id), "role": "admin"})
    db.close()
    return token


def _create_mentee_token() -> str:
    ts = datetime.utcnow().timestamp()
    db = TestingSessionLocal()
    user = User(
        full_name="Mentee User",
        email=f"mentee_test_{ts}@example.com",
        password_hash=hash_password("menteepass"),
        role=RoleEnum.mentee,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    token = create_access_token({"sub": str(user.user_id), "role": "mentee"})
    db.close()
    return token


def _create_mentor_token() -> str:
    ts = datetime.utcnow().timestamp()
    db = TestingSessionLocal()
    user = User(
        full_name="Mentor User",
        email=f"mentor_test_{ts}@example.com",
        password_hash=hash_password("mentorpass"),
        role=RoleEnum.mentor,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    token = create_access_token({"sub": str(user.user_id), "role": "mentor"})
    db.close()
    return token


def test_admin_stats_unauthenticated_returns_401():
    response = client.get("/api/admin/stats")
    assert response.status_code == 401


def test_admin_stats_mentee_returns_403():
    token = _create_mentee_token()
    response = client.get("/api/admin/stats", headers=_auth(token))
    assert response.status_code == 403
    assert "Insufficient permissions" in response.json()["detail"]


def test_admin_stats_mentor_returns_403():
    token = _create_mentor_token()
    response = client.get("/api/admin/stats", headers=_auth(token))
    assert response.status_code == 403


def test_admin_stats_success():
    token = _create_admin_token()
    response = client.get("/api/admin/stats", headers=_auth(token))
    assert response.status_code == 200
    data = response.json()

    # Validate all fields exist and have proper types
    assert "total_users" in data
    assert isinstance(data["total_users"], int)
    assert data["total_users"] >= 1

    assert "total_mentees" in data
    assert isinstance(data["total_mentees"], int)

    assert "total_mentors" in data
    assert isinstance(data["total_mentors"], int)

    assert "verified_mentors" in data
    assert isinstance(data["verified_mentors"], int)

    assert "pending_mentors" in data
    assert isinstance(data["pending_mentors"], int)

    assert "total_assessments" in data
    assert isinstance(data["total_assessments"], int)

    assert "avg_readiness_score" in data
    assert isinstance(data["avg_readiness_score"], (int, float))

    assert "total_skills_logged" in data
    assert isinstance(data["total_skills_logged"], int)

    assert "catalog_skills_count" in data
    assert isinstance(data["catalog_skills_count"], int)

    assert "total_safety_reports" in data
    assert isinstance(data["total_safety_reports"], int)

    assert "open_safety_reports" in data
    assert isinstance(data["open_safety_reports"], int)

    assert "resolved_safety_reports" in data
    assert isinstance(data["resolved_safety_reports"], int)

    assert "total_mentorship_requests" in data
    assert isinstance(data["total_mentorship_requests"], int)

    assert "accepted_mentorship_requests" in data
    assert isinstance(data["accepted_mentorship_requests"], int)

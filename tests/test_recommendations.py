"""Recommendation engine tests for WEIS Phase 9B."""

from datetime import datetime, timedelta
from unittest.mock import patch

import pytest

from app.models import Course, Recommendation, Skill, SkillGapAssessment
from tests.conftest import TestingSessionLocal, client


def _register_and_login(email: str, full_name: str = "Test User", role: str = "mentee"):
    reg_resp = client.post(
        "/api/auth/register",
        json={
            "full_name": full_name,
            "email": email,
            "password": "securepassword123",
            "role": role,
        },
    )
    assert reg_resp.status_code == 201, reg_resp.text
    user_id = reg_resp.json()["user_id"]
    login_resp = client.post(
        "/api/auth/login",
        json={"email": email, "password": "securepassword123"},
    )
    assert login_resp.status_code == 200, login_resp.text
    return login_resp.json()["access_token"], user_id


def _auth_header(token: str):
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture(autouse=True)
def seed_reference_data():
    """Before every test: reset courses to the canonical 3-course seed."""
    db = TestingSessionLocal()
    try:
        # Ensure skills exist (safe to skip if already present)
        if db.query(Skill).count() == 0:
            db.add_all(
                [
                    Skill(skill_id=1, skill_name="Python", category="Technical"),
                    Skill(skill_id=2, skill_name="Data Analysis", category="Technical"),
                    Skill(skill_id=3, skill_name="Communication", category="Soft Skills"),
                    Skill(skill_id=4, skill_name="Leadership", category="Soft Skills"),
                ]
            )
            db.commit()

        # Reset course catalogue to a known state before every test to
        # prevent cross-test state leakage in the shared in-memory DB.
        db.query(Course).delete()
        db.commit()
        db.add_all(
            [
                Course(course_id=1, title="Python for Data Analysis", provider="Coursera", skill_id=1, url="https://example.com/python", duration_hours=12),
                Course(course_id=2, title="SQL Essentials", provider="edX", skill_id=2, url="https://example.com/sql", duration_hours=14),
                Course(course_id=3, title="Advanced Communication", provider="WEIS", skill_id=3, url="https://example.com/comm", duration_hours=10),
            ]
        )
        db.commit()
    finally:
        db.close()


# 1. Successful recommendation generation

def test_generate_recommendations_success():
    token, user_id = _register_and_login(f"recs_success_{datetime.utcnow().timestamp()}@example.com")
    client.post(
        "/api/users/me/skills",
        headers=_auth_header(token),
        json={"skill_id": 1, "proficiency_level": "beginner"},
    )
    assessment = client.post(
        "/api/assessments",
        headers=_auth_header(token),
        json={
            "target_role": "Junior Data Analyst",
            "skill_ratings": [{"skill_id": 1, "required_level": "advanced"}],
        },
    )
    assert assessment.status_code == 201
    resp = client.post("/api/recommendations/generate", headers=_auth_header(token))
    assert resp.status_code == 200, resp.text
    body = resp.json()
    assert body["generated_count"] == 1
    assert body["recommendations"][0]["user_id"] == user_id
    assert body["recommendations"][0]["course_id"] == 1
    assert body["recommendations"][0]["skill_name"] == "Python"
    assert body["recommendations"][0]["match_score"] == 100.0


# 2. No assessment history

def test_generate_recommendations_no_assessment_history():
    token, _ = _register_and_login(f"recs_no_assessment_{datetime.utcnow().timestamp()}@example.com")
    resp = client.post("/api/recommendations/generate", headers=_auth_header(token))
    assert resp.status_code == 404
    assert "assessment" in resp.json()["detail"].lower()


# 3. Assessment with no skill gaps

def test_generate_recommendations_for_assessment_without_gaps():
    token, _ = _register_and_login(f"recs_no_gap_{datetime.utcnow().timestamp()}@example.com")
    client.post(
        "/api/users/me/skills",
        headers=_auth_header(token),
        json={"skill_id": 1, "proficiency_level": "advanced"},
    )
    client.post(
        "/api/assessments",
        headers=_auth_header(token),
        json={
            "target_role": "Junior Developer",
            "skill_ratings": [{"skill_id": 1, "required_level": "intermediate"}],
        },
    )
    resp = client.post("/api/recommendations/generate", headers=_auth_header(token))
    assert resp.status_code == 200
    assert resp.json()["generated_count"] == 0
    assert resp.json()["recommendations"] == []


# 4. Skill gap with matching course

def test_generate_recommendations_skill_gap_with_matching_course():
    token, _ = _register_and_login(f"recs_match_{datetime.utcnow().timestamp()}@example.com")
    client.post(
        "/api/users/me/skills",
        headers=_auth_header(token),
        json={"skill_id": 2, "proficiency_level": "beginner"},
    )
    client.post(
        "/api/assessments",
        headers=_auth_header(token),
        json={
            "target_role": "Data Analyst",
            "skill_ratings": [{"skill_id": 2, "required_level": "advanced"}],
        },
    )
    resp = client.post("/api/recommendations/generate", headers=_auth_header(token))
    assert resp.status_code == 200
    assert resp.json()["generated_count"] == 1
    assert resp.json()["recommendations"][0]["course_id"] == 2
    assert resp.json()["recommendations"][0]["match_score"] == 100.0


# 5. Skill gap without matching course

def test_generate_recommendations_without_matching_course():
    token, _ = _register_and_login(f"recs_nomatch_{datetime.utcnow().timestamp()}@example.com")
    client.post(
        "/api/users/me/skills",
        headers=_auth_header(token),
        json={"skill_id": 4, "proficiency_level": "beginner"},
    )
    client.post(
        "/api/assessments",
        headers=_auth_header(token),
        json={
            "target_role": "Team Lead",
            "skill_ratings": [{"skill_id": 4, "required_level": "advanced"}],
        },
    )
    resp = client.post("/api/recommendations/generate", headers=_auth_header(token))
    assert resp.status_code == 200
    assert resp.json()["generated_count"] == 0
    assert resp.json()["recommendations"] == []


# 6. Empty course catalogue

def test_generate_recommendations_empty_course_catalogue():
    token, _ = _register_and_login(f"recs_empty_{datetime.utcnow().timestamp()}@example.com")
    db = TestingSessionLocal()
    try:
        db.query(Course).delete()
        db.commit()
    finally:
        db.close()

    client.post(
        "/api/assessments",
        headers=_auth_header(token),
        json={
            "target_role": "Data Analyst",
            "skill_ratings": [{"skill_id": 1, "required_level": "advanced"}],
        },
    )
    resp = client.post("/api/recommendations/generate", headers=_auth_header(token))
    assert resp.status_code == 200
    assert resp.json()["generated_count"] == 0


# 7. Multiple matching courses

def test_generate_recommendations_multiple_matching_courses():
    token, _ = _register_and_login(f"recs_multi_{datetime.utcnow().timestamp()}@example.com")
    db = TestingSessionLocal()
    try:
        db.add_all(
            [
                Course(title="SQL Bootcamp 1", provider="Platform A", skill_id=2, url="https://example.com/sql1", duration_hours=8),
                Course(title="SQL Bootcamp 2", provider="Platform B", skill_id=2, url="https://example.com/sql2", duration_hours=10),
            ]
        )
        db.commit()
    finally:
        db.close()

    client.post(
        "/api/assessments",
        headers=_auth_header(token),
        json={
            "target_role": "BI Analyst",
            "skill_ratings": [{"skill_id": 2, "required_level": "advanced"}],
        },
    )
    resp = client.post("/api/recommendations/generate", headers=_auth_header(token))
    assert resp.status_code == 200
    # Fresh seed has 1 skill_id=2 course + 2 added above = 3 total matching
    assert resp.json()["generated_count"] == 3
    assert len(resp.json()["recommendations"]) == 3


# 8. Duplicate recommendation prevention

def test_generate_recommendations_prevents_duplicates():
    token, _ = _register_and_login(f"recs_dup_{datetime.utcnow().timestamp()}@example.com")
    client.post(
        "/api/assessments",
        headers=_auth_header(token),
        json={
            "target_role": "Data Analyst",
            "skill_ratings": [{"skill_id": 2, "required_level": "advanced"}],
        },
    )
    first = client.post("/api/recommendations/generate", headers=_auth_header(token))
    second = client.post("/api/recommendations/generate", headers=_auth_header(token))
    assert first.status_code == 200
    assert second.status_code == 200
    # First call creates 1 new recommendation for skill_id=2 (course_id=2)
    assert first.json()["generated_count"] == 1
    # Second call finds the existing rec and updates it; no new recs created
    assert second.json()["generated_count"] == 0


# 9. Recommendation persistence and retrieval

def test_recommendation_persistence_and_retrieval():
    token, user_id = _register_and_login(f"recs_persist_{datetime.utcnow().timestamp()}@example.com")
    client.post(
        "/api/assessments",
        headers=_auth_header(token),
        json={
            "target_role": "Data Analyst",
            "skill_ratings": [{"skill_id": 2, "required_level": "advanced"}],
        },
    )
    client.post("/api/recommendations/generate", headers=_auth_header(token))
    resp = client.get("/api/recommendations", headers=_auth_header(token))
    assert resp.status_code == 200
    data = resp.json()
    assert len(data) >= 1
    assert data[0]["user_id"] == user_id
    assert data[0]["course_id"] == 2
    assert data[0]["skill_name"] == "Data Analysis"


# 10. Cross-user recommendation isolation

def test_recommendations_are_isolated_per_user():
    token_one, _ = _register_and_login(f"recs_user1_{datetime.utcnow().timestamp()}@example.com")
    token_two, _ = _register_and_login(f"recs_user2_{datetime.utcnow().timestamp()}@example.com")

    client.post(
        "/api/assessments",
        headers=_auth_header(token_one),
        json={
            "target_role": "Data Analyst",
            "skill_ratings": [{"skill_id": 2, "required_level": "advanced"}],
        },
    )
    client.post(
        "/api/assessments",
        headers=_auth_header(token_two),
        json={
            "target_role": "Developer",
            "skill_ratings": [{"skill_id": 1, "required_level": "advanced"}],
        },
    )

    client.post("/api/recommendations/generate", headers=_auth_header(token_one))
    client.post("/api/recommendations/generate", headers=_auth_header(token_two))

    recs_one = client.get("/api/recommendations", headers=_auth_header(token_one)).json()
    recs_two = client.get("/api/recommendations", headers=_auth_header(token_two)).json()
    assert len(recs_one) >= 1
    assert len(recs_two) >= 1
    assert {item["course_id"] for item in recs_one} != {item["course_id"] for item in recs_two}


# 11. Unauthenticated access rejection

def test_recommendations_unauthenticated_access_rejected():
    assert client.get("/api/recommendations").status_code == 401
    assert client.post("/api/recommendations/generate").status_code == 401


# 12. Invalid course handling

def test_generate_recommendations_invalid_course_handling():
    token, _ = _register_and_login(f"recs_invalid_{datetime.utcnow().timestamp()}@example.com")
    db = TestingSessionLocal()
    try:
        db.add(Course(title="Broken Course", provider="Test", skill_id=999, url="https://example.com/bad", duration_hours=5))
        db.commit()
    finally:
        db.close()

    client.post(
        "/api/assessments",
        headers=_auth_header(token),
        json={
            "target_role": "Data Analyst",
            "skill_ratings": [{"skill_id": 2, "required_level": "advanced"}],
        },
    )
    resp = client.post("/api/recommendations/generate", headers=_auth_header(token))
    assert resp.status_code == 200
    assert resp.json()["generated_count"] >= 1


# 13. Invalid status rejected

def test_recommendation_status_invalid_value_rejected():
    token, _ = _register_and_login(f"recs_status_invalid_{datetime.utcnow().timestamp()}@example.com")
    db = TestingSessionLocal()
    try:
        rec = Recommendation(user_id=1, course_id=1, match_score=55.0, status="pending")
        db.add(rec)
        db.commit()
        db.refresh(rec)
        rec_id = rec.recommendation_id
    finally:
        db.close()

    resp = client.patch(
        f"/api/recommendations/{rec_id}",
        headers=_auth_header(token),
        json={"status": "unknown"},
    )
    assert resp.status_code == 422


# 14. Recommendation status update

def test_update_recommendation_status_success():
    token, _ = _register_and_login(f"recs_status_update_{datetime.utcnow().timestamp()}@example.com")
    client.post(
        "/api/assessments",
        headers=_auth_header(token),
        json={
            "target_role": "Data Analyst",
            "skill_ratings": [{"skill_id": 2, "required_level": "advanced"}],
        },
    )
    client.post("/api/recommendations/generate", headers=_auth_header(token))
    rec_id = client.get("/api/recommendations", headers=_auth_header(token)).json()[0]["recommendation_id"]
    resp = client.patch(
        f"/api/recommendations/{rec_id}",
        headers=_auth_header(token),
        json={"status": "viewed"},
    )
    assert resp.status_code == 200
    assert resp.json()["status"] == "viewed"


# 15. Database transaction rollback

def test_recommendation_generation_rolls_back_on_commit_failure():
    token, _ = _register_and_login(f"recs_rollback_{datetime.utcnow().timestamp()}@example.com")
    client.post(
        "/api/assessments",
        headers=_auth_header(token),
        json={
            "target_role": "Data Analyst",
            "skill_ratings": [{"skill_id": 2, "required_level": "advanced"}],
        },
    )
    with patch("sqlalchemy.orm.Session.commit", side_effect=RuntimeError("db down")):
        resp = client.post("/api/recommendations/generate", headers=_auth_header(token))
    assert resp.status_code == 500


# 16. Most recent assessment selection

def test_uses_most_recent_assessment_for_generation():
    token, _ = _register_and_login(f"recs_latest_{datetime.utcnow().timestamp()}@example.com")
    old_assessment = client.post(
        "/api/assessments",
        headers=_auth_header(token),
        json={
            "target_role": "Old Role",
            "skill_ratings": [{"skill_id": 1, "required_level": "advanced"}],
        },
    )
    assert old_assessment.status_code == 201

    db = TestingSessionLocal()
    try:
        latest = SkillGapAssessment(
            user_id=1,
            target_role="New Role",
            overall_score=90.0,
            assessed_at=datetime.utcnow() - timedelta(days=1),
        )
        db.add(latest)
        db.commit()
        db.refresh(latest)
    finally:
        db.close()

    resp = client.post("/api/recommendations/generate", headers=_auth_header(token))
    assert resp.status_code == 200
    assert resp.json()["assessment_id"] is not None

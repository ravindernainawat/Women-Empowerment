"""
Comprehensive automated tests for Skill-Gap Assessment Backend (Phase 9A).
Uses in-memory SQLite database via tests.conftest.
Tests:
- Deterministic scoring calculations (diff, gap_score, overall_score)
- Inventory reading (defaulting unrecorded skills to beginner)
- Validation errors (target_role missing, invalid skill_id, duplicate skills, invalid proficiency)
- Retrieval by ID (owner success, 404 nonexistent, cross-user 403, admin access)
- History listing (/api/users/me/assessments, /api/users/{user_id}/assessments)
- Authentication enforcement (401 for unauthenticated requests)
"""

from datetime import datetime, timedelta
import pytest
from app.models import Skill, User, RoleEnum
from app.security import create_access_token
from tests.conftest import client, TestingSessionLocal

_skills_seeded = False


def _ensure_skills():
    global _skills_seeded
    if _skills_seeded:
        return
    db = TestingSessionLocal()
    existing = db.query(Skill).count()
    if existing == 0:
        db.add_all([
            Skill(skill_id=1, skill_name="Python", category="Technical"),
            Skill(skill_id=2, skill_name="Data Analysis", category="Technical"),
            Skill(skill_id=3, skill_name="Communication", category="Soft Skills"),
            Skill(skill_id=4, skill_name="Leadership", category="Soft Skills"),
        ])
        db.commit()
    db.close()
    _skills_seeded = True


@pytest.fixture(autouse=True)
def setup_skills():
    _ensure_skills()


def _register_and_login(email: str, full_name: str = "Test User", role: str = "mentee") -> tuple[str, int]:
    """Register and login a user, returning (token, user_id)."""
    reg_resp = client.post("/api/auth/register", json={
        "full_name": full_name,
        "email": email,
        "password": "securepassword123",
        "role": role,
    })
    user_id = reg_resp.json()["user_id"]
    login_resp = client.post("/api/auth/login", json={
        "email": email,
        "password": "securepassword123",
    })
    token = login_resp.json()["access_token"]
    return token, user_id


def _auth_header(token: str) -> dict:
    return {"Authorization": f"Bearer {token}"}


# ==============================================================================
# 1. Successful Assessment Creation with Deterministic Scoring
# ==============================================================================
def test_create_assessment_success():
    ts = datetime.utcnow().timestamp()
    token, _ = _register_and_login(f"assess_user_{ts}@example.com")

    # Add Skill 1 as intermediate (value 2)
    client.post(
        "/api/users/me/skills",
        headers=_auth_header(token),
        json={"skill_id": 1, "proficiency_level": "intermediate"},
    )
    # Skill 2 is NOT in inventory -> will default to beginner (value 1)

    # Request requires Skill 1 advanced (3) and Skill 2 intermediate (2)
    resp = client.post(
        "/api/assessments",
        headers=_auth_header(token),
        json={
            "target_role": "Junior Data Analyst",
            "skill_ratings": [
                {"skill_id": 1, "required_level": "advanced"},      # req 3, curr 2 => diff 1 => gap 50.0 => read 50.0
                {"skill_id": 2, "required_level": "intermediate"},  # req 2, curr 1 => diff 1 => gap 50.0 => read 50.0
            ],
        },
    )
    assert resp.status_code == 201
    data = resp.json()

    assert data["target_role"] == "Junior Data Analyst"
    assert "assessment_id" in data
    assert len(data["gap_details"]) == 2

    # Overall score = (50.0 + 50.0) / 2 = 50.0
    assert data["overall_score"] == 50.0

    # Verify per-skill details
    details_map = {d["skill_id"]: d for d in data["gap_details"]}
    assert details_map[1]["gap_score"] == 50.0
    assert details_map[1]["required_level"] == "advanced"
    assert details_map[1]["current_level"] == "intermediate"
    assert details_map[1]["skill_name"] == "Python"

    assert details_map[2]["gap_score"] == 50.0
    assert details_map[2]["required_level"] == "intermediate"
    assert details_map[2]["current_level"] == "beginner"
    assert details_map[2]["skill_name"] == "Data Analysis"


# ==============================================================================
# 2. Perfect Match: User Has All Skills At or Above Required Level
# ==============================================================================
def test_create_assessment_perfect_match():
    ts = datetime.utcnow().timestamp()
    token, _ = _register_and_login(f"perfect_{ts}@example.com")

    # User has Skill 1 advanced and Skill 3 advanced
    client.post("/api/users/me/skills", headers=_auth_header(token), json={"skill_id": 1, "proficiency_level": "advanced"})
    client.post("/api/users/me/skills", headers=_auth_header(token), json={"skill_id": 3, "proficiency_level": "advanced"})

    # Role requires Skill 1 intermediate (user has advanced) and Skill 3 advanced
    resp = client.post(
        "/api/assessments",
        headers=_auth_header(token),
        json={
            "target_role": "Senior Engineer",
            "skill_ratings": [
                {"skill_id": 1, "required_level": "intermediate"},  # req 2, curr 3 => diff 0 => gap 0 => read 100
                {"skill_id": 3, "required_level": "advanced"},      # req 3, curr 3 => diff 0 => gap 0 => read 100
            ],
        },
    )
    assert resp.status_code == 201
    data = resp.json()
    assert data["overall_score"] == 100.0
    for d in data["gap_details"]:
        assert d["gap_score"] == 0.0


# ==============================================================================
# 3. Maximum Gap: User Has No Skills and Role Requires Advanced
# ==============================================================================
def test_create_assessment_maximum_gap():
    ts = datetime.utcnow().timestamp()
    token, _ = _register_and_login(f"maxgap_{ts}@example.com")

    # User has zero recorded skills -> both default to beginner (1)
    # Role requires advanced (3)
    # diff = 3 - 1 = 2 => gap = 2/2 * 100 = 100.0 => readiness = 0.0
    resp = client.post(
        "/api/assessments",
        headers=_auth_header(token),
        json={
            "target_role": "Principal Architect",
            "skill_ratings": [
                {"skill_id": 1, "required_level": "advanced"},
                {"skill_id": 2, "required_level": "advanced"},
            ],
        },
    )
    assert resp.status_code == 201
    data = resp.json()
    assert data["overall_score"] == 0.0
    for d in data["gap_details"]:
        assert d["gap_score"] == 100.0
        assert d["current_level"] == "beginner"


# ==============================================================================
# 4. Input Validation: Missing or Empty Target Role
# ==============================================================================
def test_create_assessment_empty_target_role():
    ts = datetime.utcnow().timestamp()
    token, _ = _register_and_login(f"badrole_{ts}@example.com")

    resp = client.post(
        "/api/assessments",
        headers=_auth_header(token),
        json={
            "target_role": "   ",
            "skill_ratings": [{"skill_id": 1, "required_level": "intermediate"}],
        },
    )
    assert resp.status_code == 422


# ==============================================================================
# 5. Input Validation: Nonexistent Skill ID
# ==============================================================================
def test_create_assessment_nonexistent_skill():
    ts = datetime.utcnow().timestamp()
    token, _ = _register_and_login(f"noskill_{ts}@example.com")

    resp = client.post(
        "/api/assessments",
        headers=_auth_header(token),
        json={
            "target_role": "Junior Data Analyst",
            "skill_ratings": [{"skill_id": 99999, "required_level": "intermediate"}],
        },
    )
    assert resp.status_code == 404
    assert "not found in catalogue" in resp.json()["detail"].lower()


# ==============================================================================
# 6. Input Validation: Duplicate Skill ID in Request
# ==============================================================================
def test_create_assessment_duplicate_skill_id():
    ts = datetime.utcnow().timestamp()
    token, _ = _register_and_login(f"dupskill_{ts}@example.com")

    resp = client.post(
        "/api/assessments",
        headers=_auth_header(token),
        json={
            "target_role": "Junior Data Analyst",
            "skill_ratings": [
                {"skill_id": 1, "required_level": "beginner"},
                {"skill_id": 1, "required_level": "advanced"},
            ],
        },
    )
    assert resp.status_code == 400
    assert "duplicate" in resp.json()["detail"].lower()


# ==============================================================================
# 7. Input Validation: Invalid Proficiency Level
# ==============================================================================
def test_create_assessment_invalid_proficiency():
    ts = datetime.utcnow().timestamp()
    token, _ = _register_and_login(f"badprof_{ts}@example.com")

    resp = client.post(
        "/api/assessments",
        headers=_auth_header(token),
        json={
            "target_role": "Junior Data Analyst",
            "skill_ratings": [{"skill_id": 1, "required_level": "master"}],
        },
    )
    assert resp.status_code == 422


# ==============================================================================
# 8. Unauthenticated Access Rejection
# ==============================================================================
def test_unauthenticated_assessment_access():
    # POST
    assert client.post("/api/assessments", json={"target_role": "Dev"}).status_code == 401
    # GET by ID
    assert client.get("/api/assessments/1").status_code == 401
    # GET history
    assert client.get("/api/users/me/assessments").status_code == 401


# ==============================================================================
# 9. Retrieve Assessment by ID & Detail Persistence
# ==============================================================================
def test_get_assessment_by_id():
    ts = datetime.utcnow().timestamp()
    token, _ = _register_and_login(f"getbyid_{ts}@example.com")

    create_resp = client.post(
        "/api/assessments",
        headers=_auth_header(token),
        json={
            "target_role": "Product Manager",
            "skill_ratings": [
                {"skill_id": 3, "required_level": "advanced"},
                {"skill_id": 4, "required_level": "intermediate"},
            ],
        },
    )
    assessment_id = create_resp.json()["assessment_id"]

    # Fetch by ID
    get_resp = client.get(f"/api/assessments/{assessment_id}", headers=_auth_header(token))
    assert get_resp.status_code == 200
    data = get_resp.json()
    assert data["assessment_id"] == assessment_id
    assert data["target_role"] == "Product Manager"
    assert len(data["gap_details"]) == 2
    assert all("skill_name" in d for d in data["gap_details"])


# ==============================================================================
# 10. Nonexistent Assessment ID (404)
# ==============================================================================
def test_get_nonexistent_assessment():
    ts = datetime.utcnow().timestamp()
    token, _ = _register_and_login(f"notfound_{ts}@example.com")

    resp = client.get("/api/assessments/99999", headers=_auth_header(token))
    assert resp.status_code == 404


# ==============================================================================
# 11. Security: Cross-User Assessment Access Prevention (403 Forbidden)
# ==============================================================================
def test_cross_user_assessment_isolation():
    ts = datetime.utcnow().timestamp()
    token_a, _ = _register_and_login(f"user_a_{ts}@example.com")
    token_b, _ = _register_and_login(f"user_b_{ts}@example.com")

    # User A creates an assessment
    create_resp = client.post(
        "/api/assessments",
        headers=_auth_header(token_a),
        json={
            "target_role": "Secret Role",
            "skill_ratings": [{"skill_id": 1, "required_level": "intermediate"}],
        },
    )
    assessment_id = create_resp.json()["assessment_id"]

    # User B attempts to access User A's assessment
    resp = client.get(f"/api/assessments/{assessment_id}", headers=_auth_header(token_b))
    assert resp.status_code == 403
    assert "permission" in resp.json()["detail"].lower()


# ==============================================================================
# 12. Assessment History Retrieval (/api/users/me/assessments)
# ==============================================================================
def test_get_assessment_history():
    ts = datetime.utcnow().timestamp()
    token, _ = _register_and_login(f"history_{ts}@example.com")

    # Create 2 assessments
    client.post(
        "/api/assessments",
        headers=_auth_header(token),
        json={"target_role": "Role 1", "skill_ratings": [{"skill_id": 1, "required_level": "beginner"}]},
    )
    client.post(
        "/api/assessments",
        headers=_auth_header(token),
        json={"target_role": "Role 2", "skill_ratings": [{"skill_id": 2, "required_level": "advanced"}]},
    )

    # Fetch history
    resp = client.get("/api/users/me/assessments", headers=_auth_header(token))
    assert resp.status_code == 200
    items = resp.json()
    assert len(items) == 2
    # Verify newest first
    assert items[0]["target_role"] == "Role 2"
    assert items[1]["target_role"] == "Role 1"


# ==============================================================================
# 13. Admin Authorization: Admin CAN Access Any User's Assessment
# ==============================================================================
def test_admin_can_access_any_assessment():
    ts = datetime.utcnow().timestamp()
    token_user, _ = _register_and_login(f"mentee_{ts}@example.com")

    # Create user assessment
    create_resp = client.post(
        "/api/assessments",
        headers=_auth_header(token_user),
        json={"target_role": "Data Analyst", "skill_ratings": [{"skill_id": 2, "required_level": "intermediate"}]},
    )
    assessment_id = create_resp.json()["assessment_id"]

    # Seed and log in an admin user directly via DB
    db = TestingSessionLocal()
    admin_user = User(
        full_name="Admin Test",
        email=f"admin_{ts}@weis.org",
        password_hash="fakehash",
        role=RoleEnum.admin,
    )
    db.add(admin_user)
    db.commit()
    db.refresh(admin_user)
    admin_id = admin_user.user_id
    db.close()

    admin_token = create_access_token(data={"sub": str(admin_id)})

    # Admin reads user's assessment by ID
    admin_resp = client.get(f"/api/assessments/{assessment_id}", headers=_auth_header(admin_token))
    assert admin_resp.status_code == 200
    assert admin_resp.json()["assessment_id"] == assessment_id

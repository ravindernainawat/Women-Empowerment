"""
Tests for the Mentorship router.
Uses an in-memory SQLite database via tests.conftest.
"""

from datetime import datetime

import pytest
from app.models import User, Mentor, MentorshipRequest, RoleEnum, MentorshipStatusEnum
from app.security import hash_password, create_access_token
from tests.conftest import client, TestingSessionLocal


# ---------- Helpers ----------

def _register_and_login(email: str, full_name: str = "Test User", role: str = "mentee") -> tuple:
    """Register a user and return (token, user_id)."""
    client.post("/api/auth/register", json={
        "full_name": full_name,
        "email": email,
        "password": "securepassword",
        "role": role,
    })
    login_resp = client.post("/api/auth/login", json={
        "email": email,
        "password": "securepassword",
    })
    data = login_resp.json()
    return data["access_token"], login_resp.json().get("user_id") or _get_user_id(data["access_token"])


def _get_user_id(token: str) -> int:
    """Fetch user_id from the /me endpoint."""
    resp = client.get("/api/users/me", headers={"Authorization": f"Bearer {token}"})
    return resp.json()["user_id"]


def _auth(token: str) -> dict:
    return {"Authorization": f"Bearer {token}"}


def _create_verified_mentor(email: str, full_name: str = "Mentor User", expertise: str = "Python") -> tuple:
    """Create a mentor user with a verified mentor profile. Returns (token, user_id, mentor_id)."""
    token, user_id = _register_and_login(email, full_name=full_name, role="mentor")
    # The login response may not return user_id, so fetch it
    user_id = _get_user_id(token)

    # Create mentor profile via API
    resp = client.post(
        "/api/mentors/register",
        headers=_auth(token),
        json={"expertise_area": expertise, "bio": f"Expert in {expertise}"},
    )
    assert resp.status_code == 201, f"Mentor register failed: {resp.json()}"
    mentor_id = resp.json()["mentor_id"]

    # Verify the mentor directly in DB (admin action)
    db = TestingSessionLocal()
    mentor = db.query(Mentor).filter(Mentor.mentor_id == mentor_id).first()
    mentor.is_verified = True
    db.commit()
    db.close()

    return token, user_id, mentor_id


def _create_admin_token() -> str:
    """Create an admin user directly in DB and return JWT token."""
    ts = datetime.utcnow().timestamp()
    db = TestingSessionLocal()
    admin = User(
        full_name="Admin User",
        email=f"admin_mentorship_{ts}@weis.org",
        password_hash=hash_password("adminpassword"),
        role=RoleEnum.admin,
    )
    db.add(admin)
    db.commit()
    db.refresh(admin)
    admin_id = admin.user_id
    db.close()
    return create_access_token(data={"sub": str(admin_id)})


# ---------- GET /api/mentors ----------

def test_list_mentors_empty():
    """Initially there may be no verified mentors (or only from other tests)."""
    ts = datetime.utcnow().timestamp()
    token, _ = _register_and_login(f"mentors_empty_{ts}@example.com")

    resp = client.get("/api/mentors", headers=_auth(token))
    assert resp.status_code == 200
    assert isinstance(resp.json(), list)


def test_list_mentors_returns_verified_only():
    """Only verified mentors appear in the list."""
    ts = datetime.utcnow().timestamp()

    # Create a verified mentor
    _, _, mentor_id = _create_verified_mentor(
        f"verified_mentor_{ts}@example.com",
        full_name="Verified Mentor",
        expertise="Data Science",
    )

    # Create an unverified mentor
    unver_token, _ = _register_and_login(f"unverified_mentor_{ts}@example.com", role="mentor")
    client.post(
        "/api/mentors/register",
        headers=_auth(unver_token),
        json={"expertise_area": "Art", "bio": "Unverified"},
    )

    # List mentors as a regular user
    viewer_token, _ = _register_and_login(f"mentor_viewer_{ts}@example.com")
    resp = client.get("/api/mentors", headers=_auth(viewer_token))
    assert resp.status_code == 200
    data = resp.json()

    # Verified mentor should be in the list
    mentor_ids = [m["mentor_id"] for m in data]
    assert mentor_id in mentor_ids

    # No unverified mentor should appear
    for m in data:
        assert m["is_verified"] is True


def test_filter_mentors_by_expertise():
    """Filtering by expertise should return only matching mentors."""
    ts = datetime.utcnow().timestamp()
    _create_verified_mentor(f"filter_mentor_{ts}@example.com", expertise="Machine Learning")

    viewer_token, _ = _register_and_login(f"filter_viewer_{ts}@example.com")

    # Filter for "Machine Learning"
    resp = client.get("/api/mentors?expertise=Machine", headers=_auth(viewer_token))
    assert resp.status_code == 200
    for m in resp.json():
        assert "machine" in m["expertise_area"].lower()


def test_list_mentors_unauthenticated():
    """Unauthenticated requests to /mentors should be rejected."""
    resp = client.get("/api/mentors")
    assert resp.status_code == 401


# ---------- POST /api/mentors/register ----------

def test_mentor_register_profile():
    """A mentor-role user can create their mentor profile."""
    ts = datetime.utcnow().timestamp()
    token, _ = _register_and_login(f"mentor_reg_{ts}@example.com", role="mentor")

    resp = client.post(
        "/api/mentors/register",
        headers=_auth(token),
        json={"expertise_area": "Leadership", "bio": "I lead teams."},
    )
    assert resp.status_code == 201
    data = resp.json()
    assert data["expertise_area"] == "Leadership"
    assert data["is_verified"] is False


def test_mentee_cannot_register_as_mentor():
    """A mentee-role user cannot create a mentor profile."""
    ts = datetime.utcnow().timestamp()
    token, _ = _register_and_login(f"mentee_noreg_{ts}@example.com", role="mentee")

    resp = client.post(
        "/api/mentors/register",
        headers=_auth(token),
        json={"expertise_area": "Hacking"},
    )
    assert resp.status_code == 403


def test_duplicate_mentor_profile():
    """A mentor cannot create a second profile."""
    ts = datetime.utcnow().timestamp()
    token, _ = _register_and_login(f"dup_mentor_{ts}@example.com", role="mentor")

    client.post(
        "/api/mentors/register",
        headers=_auth(token),
        json={"expertise_area": "First"},
    )
    resp = client.post(
        "/api/mentors/register",
        headers=_auth(token),
        json={"expertise_area": "Second"},
    )
    assert resp.status_code == 409


# ---------- POST /api/mentorship-requests ----------

def test_create_mentorship_request():
    """A mentee can send a mentorship request to a verified mentor."""
    ts = datetime.utcnow().timestamp()
    _, _, mentor_id = _create_verified_mentor(f"req_mentor_{ts}@example.com")
    mentee_token, _ = _register_and_login(f"req_mentee_{ts}@example.com")

    resp = client.post(
        "/api/mentorship-requests",
        headers=_auth(mentee_token),
        json={"mentor_id": mentor_id},
    )
    assert resp.status_code == 201
    data = resp.json()
    assert data["mentor_id"] == mentor_id
    assert data["status"] == "pending"


def test_duplicate_pending_request_rejected():
    """Sending a second pending request to the same mentor is rejected."""
    ts = datetime.utcnow().timestamp()
    _, _, mentor_id = _create_verified_mentor(f"dup_req_mentor_{ts}@example.com")
    mentee_token, _ = _register_and_login(f"dup_req_mentee_{ts}@example.com")

    client.post(
        "/api/mentorship-requests",
        headers=_auth(mentee_token),
        json={"mentor_id": mentor_id},
    )
    resp = client.post(
        "/api/mentorship-requests",
        headers=_auth(mentee_token),
        json={"mentor_id": mentor_id},
    )
    assert resp.status_code == 409


def test_self_mentorship_request_rejected():
    """A mentor cannot request themselves."""
    ts = datetime.utcnow().timestamp()
    mentor_token, _, mentor_id = _create_verified_mentor(f"self_req_{ts}@example.com")

    resp = client.post(
        "/api/mentorship-requests",
        headers=_auth(mentor_token),
        json={"mentor_id": mentor_id},
    )
    assert resp.status_code == 400
    assert "yourself" in resp.json()["detail"].lower()


def test_request_nonexistent_mentor():
    """Requesting a nonexistent mentor returns 404."""
    ts = datetime.utcnow().timestamp()
    token, _ = _register_and_login(f"nomentoreq_{ts}@example.com")

    resp = client.post(
        "/api/mentorship-requests",
        headers=_auth(token),
        json={"mentor_id": 99999},
    )
    assert resp.status_code == 404


def test_request_unauthenticated():
    """Unauthenticated mentorship request is rejected."""
    resp = client.post("/api/mentorship-requests", json={"mentor_id": 1})
    assert resp.status_code == 401


# ---------- PATCH /api/mentorship-requests/{request_id} ----------

def test_mentor_accept_request():
    """A mentor can accept a pending request."""
    ts = datetime.utcnow().timestamp()
    mentor_token, _, mentor_id = _create_verified_mentor(f"accept_mentor_{ts}@example.com")
    mentee_token, _ = _register_and_login(f"accept_mentee_{ts}@example.com")

    create_resp = client.post(
        "/api/mentorship-requests",
        headers=_auth(mentee_token),
        json={"mentor_id": mentor_id},
    )
    request_id = create_resp.json()["request_id"]

    resp = client.patch(
        f"/api/mentorship-requests/{request_id}",
        headers=_auth(mentor_token),
        json={"status": "accepted"},
    )
    assert resp.status_code == 200
    assert resp.json()["status"] == "accepted"


def test_mentor_decline_request():
    """A mentor can decline a pending request."""
    ts = datetime.utcnow().timestamp()
    mentor_token, _, mentor_id = _create_verified_mentor(f"decline_mentor_{ts}@example.com")
    mentee_token, _ = _register_and_login(f"decline_mentee_{ts}@example.com")

    create_resp = client.post(
        "/api/mentorship-requests",
        headers=_auth(mentee_token),
        json={"mentor_id": mentor_id},
    )
    request_id = create_resp.json()["request_id"]

    resp = client.patch(
        f"/api/mentorship-requests/{request_id}",
        headers=_auth(mentor_token),
        json={"status": "declined"},
    )
    assert resp.status_code == 200
    assert resp.json()["status"] == "declined"


def test_complete_accepted_mentorship():
    """An accepted mentorship can be marked as completed."""
    ts = datetime.utcnow().timestamp()
    mentor_token, _, mentor_id = _create_verified_mentor(f"complete_mentor_{ts}@example.com")
    mentee_token, _ = _register_and_login(f"complete_mentee_{ts}@example.com")

    create_resp = client.post(
        "/api/mentorship-requests",
        headers=_auth(mentee_token),
        json={"mentor_id": mentor_id},
    )
    request_id = create_resp.json()["request_id"]

    # Accept first
    client.patch(
        f"/api/mentorship-requests/{request_id}",
        headers=_auth(mentor_token),
        json={"status": "accepted"},
    )

    # Then complete
    resp = client.patch(
        f"/api/mentorship-requests/{request_id}",
        headers=_auth(mentor_token),
        json={"status": "completed"},
    )
    assert resp.status_code == 200
    assert resp.json()["status"] == "completed"


def test_invalid_transition_declined_to_completed():
    """Cannot transition from declined to completed."""
    ts = datetime.utcnow().timestamp()
    mentor_token, _, mentor_id = _create_verified_mentor(f"badtrans_mentor_{ts}@example.com")
    mentee_token, _ = _register_and_login(f"badtrans_mentee_{ts}@example.com")

    create_resp = client.post(
        "/api/mentorship-requests",
        headers=_auth(mentee_token),
        json={"mentor_id": mentor_id},
    )
    request_id = create_resp.json()["request_id"]

    # Decline it
    client.patch(
        f"/api/mentorship-requests/{request_id}",
        headers=_auth(mentor_token),
        json={"status": "declined"},
    )

    # Try to complete after declining
    resp = client.patch(
        f"/api/mentorship-requests/{request_id}",
        headers=_auth(mentor_token),
        json={"status": "completed"},
    )
    assert resp.status_code == 400


def test_mentee_cannot_update_request():
    """The mentee (non-mentor) cannot accept/decline their own request."""
    ts = datetime.utcnow().timestamp()
    _, _, mentor_id = _create_verified_mentor(f"noupd_mentor_{ts}@example.com")
    mentee_token, _ = _register_and_login(f"noupd_mentee_{ts}@example.com")

    create_resp = client.post(
        "/api/mentorship-requests",
        headers=_auth(mentee_token),
        json={"mentor_id": mentor_id},
    )
    request_id = create_resp.json()["request_id"]

    resp = client.patch(
        f"/api/mentorship-requests/{request_id}",
        headers=_auth(mentee_token),
        json={"status": "accepted"},
    )
    assert resp.status_code == 403


def test_admin_can_update_request():
    """An admin can update any mentorship request."""
    ts = datetime.utcnow().timestamp()
    _, _, mentor_id = _create_verified_mentor(f"admin_upd_mentor_{ts}@example.com")
    mentee_token, _ = _register_and_login(f"admin_upd_mentee_{ts}@example.com")

    create_resp = client.post(
        "/api/mentorship-requests",
        headers=_auth(mentee_token),
        json={"mentor_id": mentor_id},
    )
    request_id = create_resp.json()["request_id"]

    admin_token = _create_admin_token()
    resp = client.patch(
        f"/api/mentorship-requests/{request_id}",
        headers=_auth(admin_token),
        json={"status": "accepted"},
    )
    assert resp.status_code == 200
    assert resp.json()["status"] == "accepted"


# ---------- GET /api/mentorship-requests/me ----------

def test_get_my_mentorship_requests():
    """A mentee can list their sent mentorship requests."""
    ts = datetime.utcnow().timestamp()
    _, _, mentor_id = _create_verified_mentor(f"myreq_mentor_{ts}@example.com")
    mentee_token, _ = _register_and_login(f"myreq_mentee_{ts}@example.com")

    # Create a request
    client.post(
        "/api/mentorship-requests",
        headers=_auth(mentee_token),
        json={"mentor_id": mentor_id},
    )

    resp = client.get("/api/mentorship-requests/me", headers=_auth(mentee_token))
    assert resp.status_code == 200
    data = resp.json()
    assert len(data) >= 1
    assert data[0]["mentor_id"] == mentor_id



# ---------- GET /api/mentorship-requests/incoming ----------

def test_mentor_can_view_incoming_requests():
    """A mentor with a profile can view requests directed at them."""
    ts = datetime.utcnow().timestamp()
    mentor_token, _, mentor_id = _create_verified_mentor(f"incoming_mentor_{ts}@example.com")
    mentee_token, _ = _register_and_login(f"incoming_mentee_{ts}@example.com")

    # Mentee sends a request
    client.post(
        "/api/mentorship-requests",
        headers=_auth(mentee_token),
        json={"mentor_id": mentor_id},
    )

    resp = client.get("/api/mentorship-requests/incoming", headers=_auth(mentor_token))
    assert resp.status_code == 200
    data = resp.json()
    assert len(data) >= 1
    assert data[0]["mentor_id"] == mentor_id


def test_incoming_requires_mentor_role():
    """A mentee-role user cannot access the incoming requests endpoint."""
    ts = datetime.utcnow().timestamp()
    mentee_token, _ = _register_and_login(f"incoming_mentee_role_{ts}@example.com", role="mentee")

    resp = client.get("/api/mentorship-requests/incoming", headers=_auth(mentee_token))
    assert resp.status_code == 403


def test_incoming_requires_mentor_profile():
    """A mentor-role user without a profile gets 404 on incoming requests."""
    ts = datetime.utcnow().timestamp()
    mentor_token, _ = _register_and_login(f"noprofile_mentor_{ts}@example.com", role="mentor")
    # Note: no profile created, so mentor_profile lookup fails

    resp = client.get("/api/mentorship-requests/incoming", headers=_auth(mentor_token))
    assert resp.status_code == 404


def test_incoming_unauthenticated():
    """Unauthenticated access to incoming requests is rejected."""
    resp = client.get("/api/mentorship-requests/incoming")
    assert resp.status_code == 401


# ---------- PATCH /api/mentors/{mentor_id}/verify ----------

def test_admin_verify_mentor():
    """An admin can verify an unverified mentor profile."""
    ts = datetime.utcnow().timestamp()
    mentor_token, _ = _register_and_login(f"to_verify_mentor_{ts}@example.com", role="mentor")
    reg_resp = client.post(
        "/api/mentors/register",
        headers=_auth(mentor_token),
        json={"expertise_area": "Leadership", "bio": "Test bio"},
    )
    assert reg_resp.status_code == 201
    mentor_id = reg_resp.json()["mentor_id"]
    assert reg_resp.json()["is_verified"] is False

    admin_token = _create_admin_token()
    resp = client.patch(
        f"/api/mentors/{mentor_id}/verify",
        headers=_auth(admin_token),
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["is_verified"] is True
    assert data["mentor_id"] == mentor_id


def test_verify_mentor_idempotent():
    """Verifying an already-verified mentor returns 200 without error."""
    ts = datetime.utcnow().timestamp()
    _, _, mentor_id = _create_verified_mentor(f"already_verified_{ts}@example.com")

    admin_token = _create_admin_token()
    resp = client.patch(
        f"/api/mentors/{mentor_id}/verify",
        headers=_auth(admin_token),
    )
    assert resp.status_code == 200
    assert resp.json()["is_verified"] is True


def test_non_admin_cannot_verify_mentor():
    """A mentee or mentor cannot verify mentor profiles."""
    ts = datetime.utcnow().timestamp()
    _, _, mentor_id = _create_verified_mentor(f"verify_forbid_{ts}@example.com")
    mentee_token, _ = _register_and_login(f"verify_forbid_mentee_{ts}@example.com", role="mentee")

    resp = client.patch(
        f"/api/mentors/{mentor_id}/verify",
        headers=_auth(mentee_token),
    )
    assert resp.status_code == 403


def test_verify_nonexistent_mentor():
    """Attempting to verify a nonexistent mentor returns 404."""
    admin_token = _create_admin_token()
    resp = client.patch(
        "/api/mentors/999999/verify",
        headers=_auth(admin_token),
    )
    assert resp.status_code == 404


# ---------- GET /api/mentors/all ----------

def test_admin_can_list_all_mentors():
    """Admin can retrieve all mentors including unverified ones."""
    ts = datetime.utcnow().timestamp()
    # Create unverified mentor
    unver_token, _ = _register_and_login(f"all_unver_{ts}@example.com", role="mentor")
    unver_resp = client.post(
        "/api/mentors/register",
        headers=_auth(unver_token),
        json={"expertise_area": "Art"},
    )
    assert unver_resp.status_code == 201
    unver_mentor_id = unver_resp.json()["mentor_id"]

    admin_token = _create_admin_token()
    resp = client.get("/api/mentors/all", headers=_auth(admin_token))
    assert resp.status_code == 200
    mentor_ids = [m["mentor_id"] for m in resp.json()]
    assert unver_mentor_id in mentor_ids


def test_non_admin_cannot_list_all_mentors():
    """Non-admin users cannot access /mentors/all."""
    ts = datetime.utcnow().timestamp()
    mentee_token, _ = _register_and_login(f"all_noadmin_{ts}@example.com", role="mentee")
    resp = client.get("/api/mentors/all", headers=_auth(mentee_token))
    assert resp.status_code == 403


def test_mentorship_request_response_has_flat_names():
    """API response for mentorship requests includes mentee_name and mentor_name as strings."""
    ts = datetime.utcnow().timestamp()
    _, _, mentor_id = _create_verified_mentor(f"flatname_mentor_{ts}@example.com", full_name="Flat Mentor")
    mentee_token, _ = _register_and_login(f"flatname_mentee_{ts}@example.com", full_name="Flat Mentee")

    create_resp = client.post(
        "/api/mentorship-requests",
        headers=_auth(mentee_token),
        json={"mentor_id": mentor_id},
    )
    assert create_resp.status_code == 201
    data = create_resp.json()
    assert "mentee_name" in data
    assert "mentor_name" in data
    assert isinstance(data["mentee_name"], str)
    assert isinstance(data["mentor_name"], str)
    assert data["mentee_name"] == "Flat Mentee"
    assert data["mentor_name"] == "Flat Mentor"

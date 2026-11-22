"""
Tests for the Safety Reports router.
Safety reports are the most sensitive data in the system (TRD §7).
Uses an in-memory SQLite database via tests.conftest.
"""

from datetime import datetime

import pytest
from app.models import User, RoleEnum
from app.security import hash_password, create_access_token
from tests.conftest import client, TestingSessionLocal


# ---------- Helpers ----------

def _register_and_login(email: str, full_name: str = "Test User") -> str:
    """Register a regular user and return the JWT access token."""
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


def _auth(token: str) -> dict:
    return {"Authorization": f"Bearer {token}"}


def _create_admin_token() -> str:
    """Create an admin user directly in DB and return JWT token."""
    ts = datetime.utcnow().timestamp()
    db = TestingSessionLocal()
    admin = User(
        full_name="Admin Safety",
        email=f"admin_safety_{ts}@weis.org",
        password_hash=hash_password("adminpassword"),
        role=RoleEnum.admin,
    )
    db.add(admin)
    db.commit()
    db.refresh(admin)
    admin_id = admin.user_id
    db.close()
    return create_access_token(data={"sub": str(admin_id)})


# ---------- POST /api/safety-reports ----------

def test_file_safety_report():
    """Authenticated user can file a safety report."""
    ts = datetime.utcnow().timestamp()
    token = _register_and_login(f"safety_file_{ts}@example.com")

    resp = client.post(
        "/api/safety-reports",
        headers=_auth(token),
        json={
            "incident_type": "Harassment",
            "description": "I experienced verbal harassment during a session.",
        },
    )
    assert resp.status_code == 201
    data = resp.json()
    assert data["incident_type"] == "Harassment"
    assert data["status"] == "submitted"
    assert "report_id" in data
    assert "reported_at" in data


def test_file_report_unauthenticated():
    """Unauthenticated requests to file a report should be rejected."""
    resp = client.post("/api/safety-reports", json={
        "incident_type": "Test",
        "description": "This should fail because no auth token.",
    })
    assert resp.status_code == 401


def test_file_report_missing_fields():
    """Report without required fields should be rejected (422)."""
    ts = datetime.utcnow().timestamp()
    token = _register_and_login(f"safety_missing_{ts}@example.com")

    # Missing description
    resp = client.post(
        "/api/safety-reports",
        headers=_auth(token),
        json={"incident_type": "Test"},
    )
    assert resp.status_code == 422

    # Missing incident_type
    resp = client.post(
        "/api/safety-reports",
        headers=_auth(token),
        json={"description": "A description without incident type provided."},
    )
    assert resp.status_code == 422


def test_file_report_description_too_short():
    """Description must be at least 10 characters."""
    ts = datetime.utcnow().timestamp()
    token = _register_and_login(f"safety_short_{ts}@example.com")

    resp = client.post(
        "/api/safety-reports",
        headers=_auth(token),
        json={"incident_type": "Test", "description": "Short"},
    )
    assert resp.status_code == 422


# ---------- GET /api/safety-reports/{report_id} ----------

def test_reporter_can_view_own_report():
    """The reporter can view their own safety report."""
    ts = datetime.utcnow().timestamp()
    token = _register_and_login(f"safety_own_{ts}@example.com")

    create_resp = client.post(
        "/api/safety-reports",
        headers=_auth(token),
        json={"incident_type": "Discrimination", "description": "Witnessed discrimination during project allocation."},
    )
    report_id = create_resp.json()["report_id"]

    resp = client.get(f"/api/safety-reports/{report_id}", headers=_auth(token))
    assert resp.status_code == 200
    assert resp.json()["report_id"] == report_id


def test_other_user_cannot_view_report():
    """A different non-admin user cannot view someone else's report (403)."""
    ts = datetime.utcnow().timestamp()
    token_a = _register_and_login(f"safety_a_{ts}@example.com")
    token_b = _register_and_login(f"safety_b_{ts}@example.com")

    create_resp = client.post(
        "/api/safety-reports",
        headers=_auth(token_a),
        json={"incident_type": "Bullying", "description": "Experienced bullying from a group member."},
    )
    report_id = create_resp.json()["report_id"]

    resp = client.get(f"/api/safety-reports/{report_id}", headers=_auth(token_b))
    assert resp.status_code == 403


def test_admin_can_view_any_report():
    """An admin can view any safety report."""
    ts = datetime.utcnow().timestamp()
    user_token = _register_and_login(f"safety_admin_view_{ts}@example.com")

    create_resp = client.post(
        "/api/safety-reports",
        headers=_auth(user_token),
        json={"incident_type": "Threat", "description": "Received a threatening message from another user."},
    )
    report_id = create_resp.json()["report_id"]

    admin_token = _create_admin_token()
    resp = client.get(f"/api/safety-reports/{report_id}", headers=_auth(admin_token))
    assert resp.status_code == 200
    assert resp.json()["report_id"] == report_id


def test_nonexistent_report_returns_404():
    """Requesting a non-existent report returns 404."""
    ts = datetime.utcnow().timestamp()
    token = _register_and_login(f"safety_404_{ts}@example.com")

    resp = client.get("/api/safety-reports/99999", headers=_auth(token))
    assert resp.status_code == 404


# ---------- GET /api/safety-reports (Admin List All) ----------

def test_admin_can_list_all_reports():
    """An admin can list all safety reports."""
    ts = datetime.utcnow().timestamp()

    # File a report first
    user_token = _register_and_login(f"safety_list_user_{ts}@example.com")
    client.post(
        "/api/safety-reports",
        headers=_auth(user_token),
        json={"incident_type": "Safety Concern", "description": "Unsafe environment in the lab during evening hours."},
    )

    admin_token = _create_admin_token()
    resp = client.get("/api/safety-reports", headers=_auth(admin_token))
    assert resp.status_code == 200
    assert isinstance(resp.json(), list)
    assert len(resp.json()) >= 1


def test_non_admin_cannot_list_all_reports():
    """A non-admin user cannot list all safety reports (403)."""
    ts = datetime.utcnow().timestamp()
    token = _register_and_login(f"safety_nolist_{ts}@example.com")

    resp = client.get("/api/safety-reports", headers=_auth(token))
    assert resp.status_code == 403


def test_admin_list_filter_by_status():
    """Admin can filter reports by status."""
    ts = datetime.utcnow().timestamp()

    # File a report (status=submitted by default)
    user_token = _register_and_login(f"safety_filter_{ts}@example.com")
    client.post(
        "/api/safety-reports",
        headers=_auth(user_token),
        json={"incident_type": "Filter Test", "description": "Testing status filter functionality."},
    )

    admin_token = _create_admin_token()

    # Filter by submitted
    resp = client.get("/api/safety-reports?status=submitted", headers=_auth(admin_token))
    assert resp.status_code == 200
    for report in resp.json():
        assert report["status"] == "submitted"


# ---------- PATCH /api/safety-reports/{report_id} (Admin Only) ----------

def test_admin_can_update_report_status():
    """An admin can update the status of a safety report."""
    ts = datetime.utcnow().timestamp()
    user_token = _register_and_login(f"safety_update_{ts}@example.com")

    create_resp = client.post(
        "/api/safety-reports",
        headers=_auth(user_token),
        json={"incident_type": "Update Test", "description": "Testing admin status update functionality."},
    )
    report_id = create_resp.json()["report_id"]

    admin_token = _create_admin_token()

    # Update to under_review
    resp = client.patch(
        f"/api/safety-reports/{report_id}",
        headers=_auth(admin_token),
        json={"status": "under_review"},
    )
    assert resp.status_code == 200
    assert resp.json()["status"] == "under_review"

    # Update to resolved
    resp = client.patch(
        f"/api/safety-reports/{report_id}",
        headers=_auth(admin_token),
        json={"status": "resolved"},
    )
    assert resp.status_code == 200
    assert resp.json()["status"] == "resolved"


def test_non_admin_cannot_update_report_status():
    """A non-admin user cannot update a safety report's status (403)."""
    ts = datetime.utcnow().timestamp()
    user_token = _register_and_login(f"safety_noupdate_{ts}@example.com")

    create_resp = client.post(
        "/api/safety-reports",
        headers=_auth(user_token),
        json={"incident_type": "No Update", "description": "Non-admin should not be able to update status."},
    )
    report_id = create_resp.json()["report_id"]

    resp = client.patch(
        f"/api/safety-reports/{report_id}",
        headers=_auth(user_token),
        json={"status": "resolved"},
    )
    assert resp.status_code == 403


def test_admin_update_nonexistent_report():
    """Admin updating a non-existent report returns 404."""
    admin_token = _create_admin_token()

    resp = client.patch(
        "/api/safety-reports/99999",
        headers=_auth(admin_token),
        json={"status": "dismissed"},
    )
    assert resp.status_code == 404


# ---------- GET /api/safety-reports/me ----------

def test_user_can_get_own_reports():
    """An authenticated user can retrieve their own reports via /me."""
    ts = datetime.utcnow().timestamp()
    token = _register_and_login(f"safety_me_{ts}@example.com")

    # File two reports
    client.post(
        "/api/safety-reports",
        headers=_auth(token),
        json={"incident_type": "Concern A", "description": "First concern description here."},
    )
    client.post(
        "/api/safety-reports",
        headers=_auth(token),
        json={"incident_type": "Concern B", "description": "Second concern description here."},
    )

    resp = client.get("/api/safety-reports/me", headers=_auth(token))
    assert resp.status_code == 200
    data = resp.json()
    assert isinstance(data, list)
    assert len(data) >= 2
    # All reports must belong to this user (verified by consistent incident_type)
    incident_types = {r["incident_type"] for r in data}
    assert "Concern A" in incident_types
    assert "Concern B" in incident_types


def test_me_reports_are_user_isolated():
    """User A cannot see User B's reports via /me."""
    ts = datetime.utcnow().timestamp()
    token_a = _register_and_login(f"safety_me_a_{ts}@example.com")
    token_b = _register_and_login(f"safety_me_b_{ts}@example.com")

    # User B files a report
    client.post(
        "/api/safety-reports",
        headers=_auth(token_b),
        json={"incident_type": "B Only Report", "description": "This report belongs only to user B."},
    )

    # User A fetches their own /me reports — should NOT see B's report
    resp = client.get("/api/safety-reports/me", headers=_auth(token_a))
    assert resp.status_code == 200
    incident_types = {r["incident_type"] for r in resp.json()}
    assert "B Only Report" not in incident_types


def test_me_reports_unauthenticated():
    """Unauthenticated access to /me is rejected."""
    resp = client.get("/api/safety-reports/me")
    assert resp.status_code == 401


def test_me_reports_sorted_newest_first():
    """Reports from /me are sorted newest-first."""
    ts = datetime.utcnow().timestamp()
    token = _register_and_login(f"safety_sorted_{ts}@example.com")

    client.post(
        "/api/safety-reports",
        headers=_auth(token),
        json={"incident_type": "First Filed", "description": "First report filed chronologically."},
    )
    client.post(
        "/api/safety-reports",
        headers=_auth(token),
        json={"incident_type": "Second Filed", "description": "Second report filed chronologically."},
    )

    resp = client.get("/api/safety-reports/me", headers=_auth(token))
    assert resp.status_code == 200
    data = resp.json()
    assert len(data) >= 2
    # Newest (highest report_id) should come first
    assert data[0]["report_id"] > data[1]["report_id"]


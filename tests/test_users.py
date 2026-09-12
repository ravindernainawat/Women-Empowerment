"""
Tests for the Users / Profile router (Phase 2A Step 4).
Uses an in-memory SQLite database to avoid requiring MySQL.
"""

import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.database import Base, get_db
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from jose import jwt
from app.config import settings
from datetime import datetime, timedelta

from tests.conftest import client


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


# ---------- GET /api/users/me ----------

def test_get_profile_success():
    """Authenticated user can fetch their own profile."""
    ts = datetime.utcnow().timestamp()
    email = f"profile_get_{ts}@example.com"
    token = _register_and_login(email, full_name="Profile Getter")

    resp = client.get("/api/users/me", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 200

    data = resp.json()
    assert data["email"] == email
    assert data["full_name"] == "Profile Getter"
    assert data["role"] == "mentee"
    assert "user_id" in data
    assert "created_at" in data
    assert "updated_at" in data


def test_get_profile_excludes_sensitive_fields():
    """Response must never contain password_hash or other secrets."""
    ts = datetime.utcnow().timestamp()
    email = f"profile_safe_{ts}@example.com"
    token = _register_and_login(email)

    resp = client.get("/api/users/me", headers={"Authorization": f"Bearer {token}"})
    data = resp.json()

    assert "password_hash" not in data
    assert "password" not in data
    assert "secret" not in str(data).lower() or "secret_key" not in data


def test_get_profile_unauthenticated():
    """Requests without a token should be rejected with 401."""
    resp = client.get("/api/users/me")
    assert resp.status_code == 401


def test_get_profile_invalid_token():
    """Requests with a garbage token should be rejected with 401."""
    resp = client.get("/api/users/me", headers={"Authorization": "Bearer invalid.garbage.token"})
    assert resp.status_code == 401


def test_get_profile_expired_token():
    """Requests with an expired token should be rejected with 401."""
    to_encode = {"sub": "99999"}
    expire = datetime.utcnow() - timedelta(minutes=10)
    to_encode["exp"] = expire
    token = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

    resp = client.get("/api/users/me", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 401


# ---------- PUT /api/users/me ----------

def test_update_profile_full_name():
    """User can update their full_name."""
    ts = datetime.utcnow().timestamp()
    email = f"update_name_{ts}@example.com"
    token = _register_and_login(email, full_name="Old Name")

    resp = client.put(
        "/api/users/me",
        headers={"Authorization": f"Bearer {token}"},
        json={"full_name": "New Name"},
    )
    assert resp.status_code == 200
    assert resp.json()["full_name"] == "New Name"

    # Verify persistence via GET
    get_resp = client.get("/api/users/me", headers={"Authorization": f"Bearer {token}"})
    assert get_resp.json()["full_name"] == "New Name"


def test_update_profile_phone_and_location():
    """User can update phone and location together."""
    ts = datetime.utcnow().timestamp()
    email = f"update_contact_{ts}@example.com"
    token = _register_and_login(email)

    resp = client.put(
        "/api/users/me",
        headers={"Authorization": f"Bearer {token}"},
        json={"phone": "+91-9876543210", "location": "Mumbai, India"},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["phone"] == "+91-9876543210"
    assert data["location"] == "Mumbai, India"


def test_update_profile_partial():
    """Sending only one field should not null out other fields."""
    ts = datetime.utcnow().timestamp()
    email = f"update_partial_{ts}@example.com"
    token = _register_and_login(email, full_name="Partial User")

    # First set phone
    client.put(
        "/api/users/me",
        headers={"Authorization": f"Bearer {token}"},
        json={"phone": "1234567890"},
    )

    # Then update only location — phone should remain
    resp = client.put(
        "/api/users/me",
        headers={"Authorization": f"Bearer {token}"},
        json={"location": "Delhi"},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["phone"] == "1234567890"
    assert data["location"] == "Delhi"
    assert data["full_name"] == "Partial User"


def test_update_profile_empty_body():
    """Sending an empty body (no fields) should return 400."""
    ts = datetime.utcnow().timestamp()
    email = f"update_empty_{ts}@example.com"
    token = _register_and_login(email)

    resp = client.put(
        "/api/users/me",
        headers={"Authorization": f"Bearer {token}"},
        json={},
    )
    assert resp.status_code == 400


def test_update_profile_unauthenticated():
    """PUT without a token should be rejected with 401."""
    resp = client.put("/api/users/me", json={"full_name": "Hacker"})
    assert resp.status_code == 401


def test_update_profile_cannot_change_role():
    """A user must NOT be able to escalate their role via profile update."""
    ts = datetime.utcnow().timestamp()
    email = f"role_escalation_{ts}@example.com"
    token = _register_and_login(email)

    # Attempt to inject 'role' into the update payload
    resp = client.put(
        "/api/users/me",
        headers={"Authorization": f"Bearer {token}"},
        json={"role": "admin", "full_name": "Escalator"},
    )
    # The request may succeed (ignoring extra fields) but role must NOT change
    get_resp = client.get("/api/users/me", headers={"Authorization": f"Bearer {token}"})
    assert get_resp.json()["role"] == "mentee"  # Must remain mentee


def test_update_profile_cannot_change_email():
    """A user must NOT be able to change their email via profile update."""
    ts = datetime.utcnow().timestamp()
    email = f"email_change_{ts}@example.com"
    token = _register_and_login(email)

    resp = client.put(
        "/api/users/me",
        headers={"Authorization": f"Bearer {token}"},
        json={"email": "hacked@evil.com", "full_name": "Email Changer"},
    )
    get_resp = client.get("/api/users/me", headers={"Authorization": f"Bearer {token}"})
    assert get_resp.json()["email"] == email  # Must remain original


def test_update_profile_cannot_change_user_id():
    """A user must NOT be able to change their user_id via profile update."""
    ts = datetime.utcnow().timestamp()
    email = f"id_change_{ts}@example.com"
    token = _register_and_login(email)

    original_id = client.get("/api/users/me", headers={"Authorization": f"Bearer {token}"}).json()["user_id"]

    resp = client.put(
        "/api/users/me",
        headers={"Authorization": f"Bearer {token}"},
        json={"user_id": 99999, "full_name": "ID Changer"},
    )
    get_resp = client.get("/api/users/me", headers={"Authorization": f"Bearer {token}"})
    assert get_resp.json()["user_id"] == original_id  # Must remain original

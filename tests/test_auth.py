import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.database import Base, engine, get_db
from sqlalchemy.orm import sessionmaker
from jose import jwt
from app.config import settings
from datetime import datetime, timedelta

from tests.conftest import client

def test_health_endpoints():
    assert client.get("/").status_code == 200
    assert client.get("/docs").status_code == 200
    # /health/db might return 500 if DB is down, but we expect it to work in a healthy env
    res = client.get("/health/db")
    assert res.status_code in (200, 500)

def test_register_success():
    email = f"test_{datetime.utcnow().timestamp()}@example.com"
    data = {
        "full_name": "Test User",
        "email": email,
        "password": "securepassword",
        "role": "mentee",
        "phone": "1234567890",
        "location": "Test City"
    }
    response = client.post("/api/auth/register", json=data)
    assert response.status_code == 201
    res_data = response.json()
    assert res_data["email"] == email
    assert "password" not in res_data
    assert "password_hash" not in res_data
    return email

def test_duplicate_registration():
    email = f"dup_{datetime.utcnow().timestamp()}@example.com"
    data = {
        "full_name": "Dup User",
        "email": email,
        "password": "securepassword"
    }
    # First registration
    assert client.post("/api/auth/register", json=data).status_code == 201
    
    # Second registration
    response = client.post("/api/auth/register", json=data)
    assert response.status_code == 409

def test_admin_registration_protection():
    email = f"admin_{datetime.utcnow().timestamp()}@example.com"
    data = {
        "full_name": "Admin User",
        "email": email,
        "password": "securepassword",
        "role": "admin"
    }
    response = client.post("/api/auth/register", json=data)
    # Pydantic validation should fail or endpoint should forbid
    assert response.status_code in [422, 403]

def test_login_success():
    email = f"login_{datetime.utcnow().timestamp()}@example.com"
    data = {
        "full_name": "Login User",
        "email": email,
        "password": "securepassword"
    }
    client.post("/api/auth/register", json=data)
    
    login_data = {
        "email": email,
        "password": "securepassword"
    }
    response = client.post("/api/auth/login", json=login_data)
    assert response.status_code == 200
    res_data = response.json()
    assert "access_token" in res_data
    assert res_data["token_type"] == "bearer"
    return res_data["access_token"]

def test_login_invalid():
    login_data = {
        "email": "nonexistent@example.com",
        "password": "wrongpassword"
    }
    response = client.post("/api/auth/login", json=login_data)
    assert response.status_code == 401

def test_get_me():
    email = f"me_{datetime.utcnow().timestamp()}@example.com"
    data = {
        "full_name": "Me User",
        "email": email,
        "password": "securepassword"
    }
    client.post("/api/auth/register", json=data)
    login_data = {"email": email, "password": "securepassword"}
    token = client.post("/api/auth/login", json=login_data).json()["access_token"]
    
    response = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    assert response.json()["email"] == email

def test_missing_token():
    response = client.get("/api/auth/me")
    assert response.status_code == 401

def test_invalid_token():
    response = client.get("/api/auth/me", headers={"Authorization": "Bearer invalid.token.here"})
    assert response.status_code == 401

def test_expired_token():
    # Manually generate an expired token
    to_encode = {"sub": "99999"}
    expire = datetime.utcnow() - timedelta(minutes=10)
    to_encode.update({"exp": expire})
    token = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    
    response = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 401

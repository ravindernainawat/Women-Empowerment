import pytest
import time
from datetime import timedelta
from fastapi import HTTPException
from app.security import hash_password, verify_password, create_access_token, decode_access_token
from app.dependencies import require_role
from app.models import User, RoleEnum

def test_password_hashing():
    password = "SuperSecretPassword123"
    hashed1 = hash_password(password)
    hashed2 = hash_password(password)
    
    # Hashes should be different due to salting
    assert hashed1 != hashed2
    
    # Correct password should verify
    assert verify_password(password, hashed1) is True
    assert verify_password(password, hashed2) is True
    
    # Incorrect password should fail
    assert verify_password("WrongPassword", hashed1) is False


def test_jwt_creation_and_decoding():
    data = {"sub": "123"}
    token = create_access_token(data)
    
    decoded = decode_access_token(token)
    assert decoded.get("sub") == "123"
    assert "exp" in decoded


def test_jwt_expiration():
    data = {"sub": "123"}
    # Create a token that expires immediately
    token = create_access_token(data, expires_delta=timedelta(seconds=-1))
    
    with pytest.raises(ValueError, match="Invalid or expired token"):
        decode_access_token(token)


def test_jwt_invalid_signature():
    data = {"sub": "123"}
    token = create_access_token(data)
    
    # Tamper with the token
    invalid_token = token[:-1] + ("0" if token[-1] != "0" else "1")
    
    with pytest.raises(ValueError, match="Invalid or expired token"):
        decode_access_token(invalid_token)


def test_role_authorization_passes():
    # Setup mock user
    user = User(user_id=1, email="test@example.com", role=RoleEnum.admin)
    
    checker = require_role(["admin", "mentor"])
    result = checker(current_user=user)
    assert result.user_id == 1


def test_role_authorization_fails():
    user = User(user_id=1, email="test@example.com", role=RoleEnum.mentee)
    
    checker = require_role(["admin"])
    
    with pytest.raises(HTTPException) as excinfo:
        checker(current_user=user)
        
    assert excinfo.value.status_code == 403
    assert excinfo.value.detail == "Insufficient permissions to access this resource"

"""
FastAPI dependencies for WEIS backend.
Includes authentication and authorization (role-based) dependencies.
"""

from typing import List

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User
from app.security import decode_access_token

# OAuth2PasswordBearer tells FastAPI that the token should be sent in the 
# Authorization header with a Bearer scheme. The tokenUrl points to the login route.
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/v1/auth/login")


def get_current_user(
    token: str = Depends(oauth2_scheme), 
    db: Session = Depends(get_db)
) -> User:
    """
    Dependency to retrieve the currently authenticated user based on the JWT token.
    Raises HTTPException (401) if token is missing, invalid, expired, or user doesn't exist.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = decode_access_token(token)
        # Using 'sub' (subject) for user ID, assuming TRD implies user_id is the identity
        # Fallback to email if 'sub' is not integer ID, but ID is preferred.
        user_id_str = payload.get("sub")
        if user_id_str is None:
            raise credentials_exception
            
        try:
            user_id = int(user_id_str)
        except ValueError:
            raise credentials_exception
            
    except ValueError:
        # Handles JWTError from decode_access_token
        raise credentials_exception

    user = db.query(User).filter(User.user_id == user_id).first()
    if user is None:
        raise credentials_exception
        
    return user


def require_role(allowed_roles: List[str]):
    """
    Dependency factory to restrict endpoint access to specific roles.
    Example usage: @app.get("/admin", dependencies=[Depends(require_role(["admin"]))])
    """
    def role_checker(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role.value not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions to access this resource"
            )
        return current_user
    
    return role_checker

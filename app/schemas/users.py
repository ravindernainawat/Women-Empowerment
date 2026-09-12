"""
Pydantic schemas for the Users / Profile router.
"""

from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime
from app.models import RoleEnum


class UserProfileResponse(BaseModel):
    """Safe user profile fields returned by the API. Never includes password_hash."""
    user_id: int
    full_name: str
    email: EmailStr
    role: RoleEnum
    phone: Optional[str] = None
    location: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class UserProfileUpdate(BaseModel):
    """
    Fields the authenticated user is allowed to update on their own profile.
    Role, email, user_id, and password_hash are explicitly excluded.
    All fields are optional — only supplied fields are updated.
    """
    full_name: Optional[str] = Field(None, max_length=150)
    phone: Optional[str] = Field(None, max_length=20)
    location: Optional[str] = Field(None, max_length=150)

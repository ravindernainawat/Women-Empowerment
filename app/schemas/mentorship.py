"""
Pydantic schemas for the Mentorship API.
"""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field

from app.models import MentorshipStatusEnum


class MentorResponse(BaseModel):
    """Public mentor profile with joined user name."""
    mentor_id: int
    user_id: int
    full_name: str
    expertise_area: Optional[str] = None
    bio: Optional[str] = None
    is_verified: bool

    model_config = {"from_attributes": True}


class MentorProfileCreate(BaseModel):
    """Request body for a mentor-role user to create their mentor profile."""
    expertise_area: Optional[str] = Field(None, max_length=150)
    bio: Optional[str] = None


class MentorshipRequestCreate(BaseModel):
    """Request body to send a mentorship request."""
    mentor_id: int = Field(..., gt=0, description="ID of the mentor to request")


class MentorshipRequestResponse(BaseModel):
    """Mentorship request with joined mentee/mentor names."""
    request_id: int
    mentee_id: int
    mentor_id: int
    mentee_name: str
    mentor_name: str
    status: MentorshipStatusEnum
    requested_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class MentorshipRequestUpdate(BaseModel):
    """
    Allowed status transitions for a mentorship request.
    Valid targets: accepted, declined, completed.
    pending is the initial state set automatically.
    """
    status: MentorshipStatusEnum = Field(
        ...,
        description="New status (accepted, declined, or completed)",
    )


class MentorVerifyResponse(BaseModel):
    """Response after an admin verifies a mentor profile."""
    mentor_id: int
    user_id: int
    full_name: str
    expertise_area: Optional[str] = None
    is_verified: bool
    message: str

    model_config = {"from_attributes": True}


"""
Pydantic schemas for the Safety Reports API.
Safety reports are the most sensitive data in the system (TRD §7).
"""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field

from app.models import SafetyStatusEnum


class SafetyReportCreate(BaseModel):
    """Request body to file a new safety report."""
    incident_type: str = Field(..., max_length=150)
    description: str = Field(..., min_length=10)


class SafetyReportResponse(BaseModel):
    """Safety report returned by the API."""
    report_id: int
    user_id: Optional[int] = None   # None for anonymous reports
    incident_type: str
    description: str
    status: SafetyStatusEnum
    urgency: Optional[str] = "standard"
    tracking_token: Optional[str] = None
    reported_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class SafetyReportStatusUpdate(BaseModel):
    """Admin-only status update for a safety report."""
    status: SafetyStatusEnum = Field(
        ...,
        description="New status (submitted, under_review, resolved, or dismissed)",
    )


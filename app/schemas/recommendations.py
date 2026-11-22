"""
Pydantic schemas for the Recommendations API.
"""

from datetime import datetime
from enum import Enum
from typing import List, Optional

from pydantic import BaseModel, Field


class AllowedStatusUpdate(str, Enum):
    """Allowed status transitions for recommendation updates (excludes 'pending')."""
    viewed = "viewed"
    enrolled = "enrolled"
    completed = "completed"


class SkillSimple(BaseModel):
    skill_id: int
    skill_name: str
    category: Optional[str] = None

    model_config = {"from_attributes": True}


class CourseDetail(BaseModel):
    course_id: int
    title: str
    provider: Optional[str] = None
    skill_id: Optional[int] = None
    url: Optional[str] = None
    duration_hours: Optional[int] = None
    skill: Optional[SkillSimple] = None

    model_config = {"from_attributes": True}


class RecommendationResponse(BaseModel):
    """Full recommendation with both nested course and flat compatibility fields."""
    recommendation_id: int
    user_id: int
    course_id: int
    match_score: Optional[float] = None
    recommended_at: Optional[datetime] = None
    status: str

    # Nested course object (matches frontend TypeScript Course interface)
    course: Optional[CourseDetail] = None

    # Flattened convenience fields for backward compatibility and quick display
    course_title: Optional[str] = None
    course_provider: Optional[str] = None
    course_url: Optional[str] = None
    skill_name: Optional[str] = None
    skill_gap_explanation: Optional[str] = None

    model_config = {"from_attributes": True}


class GenerateRecommendationsResponse(BaseModel):
    message: str
    assessment_id: Optional[int] = None
    generated_count: int
    recommendations: List[RecommendationResponse] = []


class RecommendationStatusUpdate(BaseModel):
    """Request payload to update a recommendation's status."""
    status: AllowedStatusUpdate = Field(
        ..., description="New status (viewed, enrolled, or completed)"
    )

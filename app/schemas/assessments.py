"""
Pydantic schemas for the Skill-Gap Assessments API.
"""

from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field, field_validator
from app.models import ProficiencyEnum


class SkillRatingInput(BaseModel):
    """A single skill requirement specification for an assessment."""
    skill_id: int = Field(..., gt=0, description="Skill catalogue ID")
    required_level: ProficiencyEnum = Field(..., description="Target proficiency required for the role")
    current_level: Optional[ProficiencyEnum] = Field(
        None,
        description="Optional client-provided current proficiency (defaults to user inventory or beginner)"
    )


class AssessmentCreate(BaseModel):
    """Request payload to create and run a new skill-gap assessment."""
    target_role: str = Field(..., min_length=2, max_length=150, description="Target career role")
    skill_ratings: Optional[List[SkillRatingInput]] = Field(
        None,
        description="Explicit list of skills and required proficiencies for this role"
    )
    required_skills: Optional[List[SkillRatingInput]] = Field(
        None,
        description="Alternative alias for skill_ratings"
    )

    @field_validator("target_role")
    @classmethod
    def validate_target_role(cls, v: str) -> str:
        trimmed = v.strip()
        if not trimmed:
            raise ValueError("target_role cannot be empty or whitespace only.")
        return trimmed


class AssessmentGapDetailResponse(BaseModel):
    """Per-skill breakdown of a gap assessment."""
    gap_detail_id: int
    assessment_id: int
    skill_id: int
    skill_name: str
    category: Optional[str] = None
    required_level: ProficiencyEnum
    current_level: ProficiencyEnum
    gap_score: Optional[float] = None

    model_config = {"from_attributes": True}


class AssessmentResponse(BaseModel):
    """Assessment summary and overall readiness score."""
    assessment_id: int
    user_id: int
    target_role: str
    overall_score: Optional[float] = None
    assessed_at: Optional[datetime] = None
    gap_details: List[AssessmentGapDetailResponse] = []

    model_config = {"from_attributes": True}

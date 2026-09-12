"""
Pydantic schemas for the Skills API.
"""

from pydantic import BaseModel
from typing import Optional
from app.models import ProficiencyEnum


class SkillResponse(BaseModel):
    """Public skill catalogue entry."""
    skill_id: int
    skill_name: str
    category: Optional[str] = None

    model_config = {"from_attributes": True}


class AddUserSkill(BaseModel):
    """Request body to add an existing skill to the user's inventory."""
    skill_id: int
    proficiency_level: ProficiencyEnum = ProficiencyEnum.beginner


class UpdateUserSkill(BaseModel):
    """Request body to update proficiency on an existing user skill."""
    proficiency_level: ProficiencyEnum


class UserSkillResponse(BaseModel):
    """
    A single entry from the user's skill inventory.
    Includes the joined skill name and category for convenience.
    """
    user_skill_id: int
    skill_id: int
    skill_name: str
    category: Optional[str] = None
    proficiency_level: ProficiencyEnum

    model_config = {"from_attributes": True}

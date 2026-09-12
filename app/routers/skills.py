"""
Skills router for WEIS backend.
Provides the skill catalogue and authenticated user skill inventory CRUD.
"""

from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User, Skill, UserSkill
from app.dependencies import get_current_user
from app.schemas.skills import (
    SkillResponse,
    AddUserSkill,
    UpdateUserSkill,
    UserSkillResponse,
)

router = APIRouter(
    prefix="/api",
    tags=["Skills"],
)


# ──────────────────────────────────────────────
# Helper to build a flat UserSkillResponse dict
# ──────────────────────────────────────────────
def _user_skill_to_response(us: UserSkill) -> dict:
    """Flatten UserSkill + joined Skill into a dict matching UserSkillResponse."""
    return {
        "user_skill_id": us.user_skill_id,
        "skill_id": us.skill_id,
        "skill_name": us.skill.skill_name,
        "category": us.skill.category,
        "proficiency_level": us.proficiency_level,
    }


# ──────────────────────────────────────────────
# 1. Skill Catalogue
# ──────────────────────────────────────────────
@router.get("/skills", response_model=List[SkillResponse])
def get_skill_catalogue(db: Session = Depends(get_db)):
    """Return the full skill catalogue. Authenticated users can browse available skills."""
    skills = db.query(Skill).order_by(Skill.skill_name).all()
    return skills


# ──────────────────────────────────────────────
# 2. Get Current User's Skill Inventory
# ──────────────────────────────────────────────
@router.get("/users/me/skills", response_model=List[UserSkillResponse])
def get_my_skills(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Return the authenticated user's skill inventory with joined skill details."""
    user_skills = (
        db.query(UserSkill)
        .filter(UserSkill.user_id == current_user.user_id)
        .all()
    )
    return [_user_skill_to_response(us) for us in user_skills]


# ──────────────────────────────────────────────
# 3. Add Skill to User Inventory
# ──────────────────────────────────────────────
@router.post(
    "/users/me/skills",
    response_model=UserSkillResponse,
    status_code=status.HTTP_201_CREATED,
)
def add_skill_to_inventory(
    body: AddUserSkill,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Add an existing skill from the catalogue to the authenticated user's inventory.
    Rejects duplicate skills and nonexistent skill IDs.
    """
    # 1. Verify skill exists in catalogue
    skill = db.query(Skill).filter(Skill.skill_id == body.skill_id).first()
    if not skill:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Skill not found in catalogue.",
        )

    # 2. Check for duplicate (user already has this skill)
    existing = (
        db.query(UserSkill)
        .filter(
            UserSkill.user_id == current_user.user_id,
            UserSkill.skill_id == body.skill_id,
        )
        .first()
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This skill is already in your inventory.",
        )

    # 3. Create the user_skills record
    new_user_skill = UserSkill(
        user_id=current_user.user_id,
        skill_id=body.skill_id,
        proficiency_level=body.proficiency_level,
    )

    try:
        db.add(new_user_skill)
        db.commit()
        db.refresh(new_user_skill)
    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while adding the skill.",
        )

    return _user_skill_to_response(new_user_skill)


# ──────────────────────────────────────────────
# 4. Update User Skill Proficiency
# ──────────────────────────────────────────────
@router.put("/users/me/skills/{skill_id}", response_model=UserSkillResponse)
def update_my_skill(
    skill_id: int,
    body: UpdateUserSkill,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Update the proficiency level of a skill in the authenticated user's inventory.
    The skill_id in the URL refers to the skill catalogue ID, not user_skill_id.
    """
    user_skill = (
        db.query(UserSkill)
        .filter(
            UserSkill.user_id == current_user.user_id,
            UserSkill.skill_id == skill_id,
        )
        .first()
    )
    if not user_skill:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Skill not found in your inventory.",
        )

    user_skill.proficiency_level = body.proficiency_level

    try:
        db.commit()
        db.refresh(user_skill)
    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while updating the skill.",
        )

    return _user_skill_to_response(user_skill)


# ──────────────────────────────────────────────
# 5. Delete User Skill
# ──────────────────────────────────────────────
@router.delete(
    "/users/me/skills/{skill_id}",
    status_code=status.HTTP_200_OK,
)
def delete_my_skill(
    skill_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Remove a skill from the authenticated user's inventory.
    Does NOT delete the skill from the global catalogue.
    """
    user_skill = (
        db.query(UserSkill)
        .filter(
            UserSkill.user_id == current_user.user_id,
            UserSkill.skill_id == skill_id,
        )
        .first()
    )
    if not user_skill:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Skill not found in your inventory.",
        )

    try:
        db.delete(user_skill)
        db.commit()
    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while removing the skill.",
        )

    return {"detail": "Skill removed from your inventory."}

"""
Assessments router for WEIS backend.
Provides skill-gap assessment execution, detail retrieval, and assessment history.
"""

from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import (
    User,
    Skill,
    UserSkill,
    SkillGapAssessment,
    AssessmentGapDetail,
    ProficiencyEnum,
    RoleEnum,
)
from app.dependencies import get_current_user
from app.schemas.assessments import (
    AssessmentCreate,
    AssessmentResponse,
)

router = APIRouter(
    prefix="/api",
    tags=["Assessments"],
)

# Numeric values for deterministic proficiency ordering
LEVEL_VALUES: dict[ProficiencyEnum, int] = {
    ProficiencyEnum.beginner: 1,
    ProficiencyEnum.intermediate: 2,
    ProficiencyEnum.advanced: 3,
}


def _assessment_to_response(assessment: SkillGapAssessment) -> dict:
    """Format SQLAlchemy SkillGapAssessment model into dict matching AssessmentResponse."""
    gap_details = []
    for gd in assessment.gap_details:
        gap_details.append({
            "gap_detail_id": gd.gap_detail_id,
            "assessment_id": gd.assessment_id,
            "skill_id": gd.skill_id,
            "skill_name": gd.skill.skill_name if gd.skill else f"Skill #{gd.skill_id}",
            "category": gd.skill.category if gd.skill else None,
            "required_level": gd.required_level,
            "current_level": gd.current_level,
            "gap_score": float(gd.gap_score) if gd.gap_score is not None else 0.0,
        })
    return {
        "assessment_id": assessment.assessment_id,
        "user_id": assessment.user_id,
        "target_role": assessment.target_role,
        "overall_score": float(assessment.overall_score) if assessment.overall_score is not None else 0.0,
        "assessed_at": assessment.assessed_at,
        "gap_details": gap_details,
    }


# ─────────────────────────────────────────────────────────────────────────────
# 1. Create and Run a Skill-Gap Assessment
# ─────────────────────────────────────────────────────────────────────────────
@router.post(
    "/assessments",
    response_model=AssessmentResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_assessment(
    body: AssessmentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Run an objective, deterministic skill-gap assessment against a target role.

    Algorithm:
    1. Determine required skills and target proficiency for the role.
    2. Read current skill proficiencies from the authenticated user's inventory.
       (If the user has not recorded a skill, current level defaults to 'beginner').
    3. Calculate individual skill gap score:
       gap_score = max(0, required - current) / 2 * 100.0
    4. Calculate overall readiness:
       overall_score = average of (100.0 - gap_score) across all evaluated skills.
    5. Persist the assessment and gap detail breakdown inside a database transaction.
    """
    # Consolidate skill inputs from either skill_ratings or required_skills
    inputs = body.skill_ratings or body.required_skills or []

    # If no explicit ratings were passed, attempt to load default skills from catalog
    if not inputs:
        catalogue_skills = db.query(Skill).order_by(Skill.skill_id).limit(4).all()
        if not catalogue_skills:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No skills available in catalogue to evaluate. Please provide skill_ratings.",
            )
        # Construct default requirements (alternating intermediate / advanced)
        eval_items = []
        for idx, s in enumerate(catalogue_skills):
            req_lvl = ProficiencyEnum.advanced if idx % 2 == 0 else ProficiencyEnum.intermediate
            eval_items.append((s.skill_id, req_lvl))
    else:
        # Validate for duplicate skill IDs in the request
        seen_ids = set()
        eval_items = []
        for item in inputs:
            if item.skill_id in seen_ids:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Duplicate skill_id {item.skill_id} in assessment request.",
                )
            seen_ids.add(item.skill_id)
            eval_items.append((item.skill_id, item.required_level))

    if not eval_items:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="At least one skill requirement must be provided for assessment.",
        )

    # Validate that all skill IDs exist in the global skills catalogue
    all_skill_ids = [item[0] for item in eval_items]
    existing_skills = db.query(Skill).filter(Skill.skill_id.in_(all_skill_ids)).all()
    found_id_set = {s.skill_id for s in existing_skills}
    for sid in all_skill_ids:
        if sid not in found_id_set:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Skill ID {sid} not found in catalogue.",
            )

    # Fetch user's current skill inventory from MySQL
    user_skills = (
        db.query(UserSkill)
        .filter(
            UserSkill.user_id == current_user.user_id,
            UserSkill.skill_id.in_(all_skill_ids),
        )
        .all()
    )
    user_inventory_map = {us.skill_id: us.proficiency_level for us in user_skills}

    # Deterministic Scoring Calculation
    individual_gaps = []
    readiness_scores = []

    for skill_id, required_level in eval_items:
        # A user without a recorded skill receives a current level of Beginner
        current_level = user_inventory_map.get(skill_id, ProficiencyEnum.beginner)

        req_num = LEVEL_VALUES[required_level]
        curr_num = LEVEL_VALUES[current_level]

        diff = max(0, req_num - curr_num)
        gap_score = round((diff / 2.0) * 100.0, 2)
        skill_readiness = max(0.0, 100.0 - gap_score)

        individual_gaps.append({
            "skill_id": skill_id,
            "required_level": required_level,
            "current_level": current_level,
            "gap_score": gap_score,
        })
        readiness_scores.append(skill_readiness)

    overall_score = round(sum(readiness_scores) / len(readiness_scores), 2)

    # Persist in Database within a single transaction
    try:
        new_assessment = SkillGapAssessment(
            user_id=current_user.user_id,
            target_role=body.target_role,
            overall_score=overall_score,
            assessed_at=datetime.utcnow(),
        )
        db.add(new_assessment)
        db.flush()  # Populates new_assessment.assessment_id

        for gap in individual_gaps:
            detail = AssessmentGapDetail(
                assessment_id=new_assessment.assessment_id,
                skill_id=gap["skill_id"],
                required_level=gap["required_level"],
                current_level=gap["current_level"],
                gap_score=gap["gap_score"],
            )
            db.add(detail)

        db.commit()
        db.refresh(new_assessment)
        return _assessment_to_response(new_assessment)
    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while saving the skill assessment.",
        )


# ─────────────────────────────────────────────────────────────────────────────
# 2. Retrieve a Specific Assessment by ID
# ─────────────────────────────────────────────────────────────────────────────
@router.get(
    "/assessments/{assessment_id}",
    response_model=AssessmentResponse,
)
def get_assessment(
    assessment_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Retrieve an assessment and its competency breakdown by assessment ID.
    Access is restricted to the assessment owner and platform administrators.
    """
    assessment = (
        db.query(SkillGapAssessment)
        .filter(SkillGapAssessment.assessment_id == assessment_id)
        .first()
    )
    if not assessment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Assessment not found.",
        )

    # Ownership and Admin Authorization Check
    if assessment.user_id != current_user.user_id and current_user.role != RoleEnum.admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to view this assessment.",
        )

    return _assessment_to_response(assessment)


# ─────────────────────────────────────────────────────────────────────────────
# 3. Retrieve Authenticated User's Assessment History
# ─────────────────────────────────────────────────────────────────────────────
@router.get(
    "/users/me/assessments",
    response_model=List[AssessmentResponse],
)
def get_my_assessments(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Retrieve assessment history for the currently authenticated user.
    Results are sorted newest first.
    """
    assessments = (
        db.query(SkillGapAssessment)
        .filter(SkillGapAssessment.user_id == current_user.user_id)
        .order_by(
            SkillGapAssessment.assessed_at.desc(),
            SkillGapAssessment.assessment_id.desc(),
        )
        .all()
    )
    return [_assessment_to_response(a) for a in assessments]


# ─────────────────────────────────────────────────────────────────────────────
# 4. Backward/TRD Compatibility: Get Assessments for a Specific User ID
# ─────────────────────────────────────────────────────────────────────────────
@router.get(
    "/users/{user_id}/assessments",
    response_model=List[AssessmentResponse],
)
def get_user_assessments(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Retrieve assessment history for a specific user ID.
    Enforces that only the user themselves or an administrator can access this data.
    """
    if user_id != current_user.user_id and current_user.role != RoleEnum.admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to view another user's assessments.",
        )

    assessments = (
        db.query(SkillGapAssessment)
        .filter(SkillGapAssessment.user_id == user_id)
        .order_by(
            SkillGapAssessment.assessed_at.desc(),
            SkillGapAssessment.assessment_id.desc(),
        )
        .all()
    )
    return [_assessment_to_response(a) for a in assessments]

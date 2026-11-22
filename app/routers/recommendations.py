"""
Recommendations router for WEIS backend.
Provides course recommendation generation, retrieval, and status updates.
"""

from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import (
    User,
    Recommendation,
    Course,
    Skill,
    SkillGapAssessment,
    AssessmentGapDetail,
    RoleEnum,
    RecommendationStatusEnum,
)
from app.dependencies import get_current_user
from app.schemas.recommendations import (
    RecommendationResponse,
    RecommendationStatusUpdate,
    GenerateRecommendationsResponse,
)

router = APIRouter(
    prefix="/api",
    tags=["Recommendations"],
)


def _recommendation_to_response(rec: Recommendation, gap_explanation: Optional[str] = None) -> dict:
    """Format SQLAlchemy Recommendation model into dict matching RecommendationResponse."""
    course = rec.course
    skill = course.skill if course else None
    skill_name = skill.skill_name if skill else None

    # Nested course object matching frontend Course TypeScript interface
    course_data = None
    if course:
        course_data = {
            "course_id": course.course_id,
            "title": course.title,
            "provider": course.provider,
            "skill_id": course.skill_id,
            "url": course.url,
            "duration_hours": course.duration_hours,
            "skill": {
                "skill_id": skill.skill_id,
                "skill_name": skill.skill_name,
                "category": skill.category,
            } if skill else None,
        }

    score_val = float(rec.match_score) if rec.match_score is not None else None
    explanation = gap_explanation or (
        f"Addresses gap in {skill_name} (gap priority: {score_val:.1f}%)" if skill_name and score_val is not None else None
    )

    return {
        "recommendation_id": rec.recommendation_id,
        "user_id": rec.user_id,
        "course_id": rec.course_id,
        "match_score": score_val,
        "recommended_at": rec.recommended_at,
        "status": rec.status.value if hasattr(rec.status, "value") else str(rec.status),
        "course": course_data,
        "course_title": course.title if course else f"Course #{rec.course_id}",
        "course_provider": course.provider if course else None,
        "course_url": course.url if course else None,
        "skill_name": skill_name,
        "skill_gap_explanation": explanation,
    }


# ─────────────────────────────────────────────────────────────────────────────
# 1. Generate Recommendations from User's Latest Skill-Gap Assessment
# ─────────────────────────────────────────────────────────────────────────────
@router.post(
    "/recommendations/generate",
    response_model=GenerateRecommendationsResponse,
    status_code=status.HTTP_200_OK,
)
def generate_recommendations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Generate tailored course recommendations based on the user's latest skill-gap assessment.
    
    Workflow:
    1. Authenticate user from JWT token.
    2. Retrieve latest assessment and associated gap details.
    3. Identify skills with non-zero gaps (gap_score > 0).
    4. Match relevant courses from course catalogue using Course.skill_id.
    5. Prioritize courses by gap_score descending (deterministic gap priority).
    6. Persist recommendations, preventing duplicate active entries and preserving completed ones.
    7. Return generated recommendations list with summary.
    """
    # 1. Find user's latest assessment (most recent assessed_at / assessment_id)
    latest_assessment = (
        db.query(SkillGapAssessment)
        .filter(SkillGapAssessment.user_id == current_user.user_id)
        .order_by(
            SkillGapAssessment.assessed_at.desc(),
            SkillGapAssessment.assessment_id.desc(),
        )
        .first()
    )

    if not latest_assessment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No assessment history found. Please complete a skill-gap assessment first.",
        )

    # 2. Extract skills with non-zero gaps (gap_score > 0)
    gap_map = {}
    for gd in latest_assessment.gap_details:
        if gd.gap_score is not None and float(gd.gap_score) > 0:
            gap_map[gd.skill_id] = float(gd.gap_score)

    # Handle scenario where assessment has zero skill gaps (user met all requirements)
    if not gap_map:
        return GenerateRecommendationsResponse(
            message="No skill gaps identified in your latest assessment. Great job! No additional courses needed.",
            assessment_id=latest_assessment.assessment_id,
            generated_count=0,
            recommendations=[],
        )

    # 3. Retrieve relevant courses from catalogue
    matching_courses = (
        db.query(Course)
        .filter(Course.skill_id.in_(list(gap_map.keys())))
        .all()
    )

    # Handle scenario where catalogue has no courses for these gaps
    if not matching_courses:
        return GenerateRecommendationsResponse(
            message="No matching courses currently available in the catalogue for the identified skill gaps.",
            assessment_id=latest_assessment.assessment_id,
            generated_count=0,
            recommendations=[],
        )

    # 4. Fetch existing recommendations for user to prevent duplicates
    existing_recs = (
        db.query(Recommendation)
        .filter(Recommendation.user_id == current_user.user_id)
        .all()
    )
    existing_by_course = {r.course_id: r for r in existing_recs}

    newly_created_count = 0
    try:
        for course in matching_courses:
            gap_score = gap_map.get(course.skill_id, 0.0)

            if course.course_id in existing_by_course:
                existing_rec = existing_by_course[course.course_id]
                # If already completed, preserve status and do not overwrite
                if existing_rec.status != RecommendationStatusEnum.completed:
                    existing_rec.match_score = gap_score
                    existing_rec.recommended_at = datetime.utcnow()
            else:
                # Insert new active recommendation
                new_rec = Recommendation(
                    user_id=current_user.user_id,
                    course_id=course.course_id,
                    match_score=gap_score,
                    status=RecommendationStatusEnum.pending,
                    recommended_at=datetime.utcnow(),
                )
                db.add(new_rec)
                newly_created_count += 1

        db.commit()
    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while generating recommendations.",
        )

    # 5. Query all active (non-completed) user recommendations for the response,
    #    sorted by gap priority descending.
    all_user_recs = (
        db.query(Recommendation)
        .filter(Recommendation.user_id == current_user.user_id)
        .order_by(Recommendation.match_score.desc())
        .all()
    )

    return GenerateRecommendationsResponse(
        message=(
            f"Successfully generated {newly_created_count} new recommendation(s) based on your latest "
            f"assessment (role: {latest_assessment.target_role})."
        ),
        assessment_id=latest_assessment.assessment_id,
        generated_count=newly_created_count,
        recommendations=[_recommendation_to_response(r) for r in all_user_recs],
    )


# ─────────────────────────────────────────────────────────────────────────────
# 2. Get Recommendations for the Authenticated User
# ─────────────────────────────────────────────────────────────────────────────
@router.get(
    "/recommendations",
    response_model=List[RecommendationResponse],
)
def get_recommendations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Retrieve all course recommendations for the currently authenticated user.
    Results are ranked by match_score descending (highest gap priority first).
    """
    recommendations = (
        db.query(Recommendation)
        .filter(Recommendation.user_id == current_user.user_id)
        .order_by(Recommendation.match_score.desc())
        .all()
    )
    return [_recommendation_to_response(r) for r in recommendations]


# ─────────────────────────────────────────────────────────────────────────────
# 3. Get Recommendations for Authenticated User (Convenience Alias)
# ─────────────────────────────────────────────────────────────────────────────
@router.get(
    "/users/me/recommendations",
    response_model=List[RecommendationResponse],
)
def get_my_recommendations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Convenience alias for /api/recommendations matching TRD convention."""
    return get_recommendations(current_user=current_user, db=db)


# ─────────────────────────────────────────────────────────────────────────────
# 4. Get Recommendations for a Specific User ID (Owner / Admin)
# ─────────────────────────────────────────────────────────────────────────────
@router.get(
    "/users/{user_id}/recommendations",
    response_model=List[RecommendationResponse],
)
def get_user_recommendations(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Retrieve ranked course recommendations for a specific user ID.
    Enforces that only the user themselves or an administrator can access this data.
    """
    if user_id != current_user.user_id and current_user.role != RoleEnum.admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to view another user's recommendations.",
        )

    recommendations = (
        db.query(Recommendation)
        .filter(Recommendation.user_id == user_id)
        .order_by(Recommendation.match_score.desc())
        .all()
    )
    return [_recommendation_to_response(r) for r in recommendations]


# ─────────────────────────────────────────────────────────────────────────────
# 5. Get a Specific Recommendation by ID (Owner / Admin)
# ─────────────────────────────────────────────────────────────────────────────
@router.get(
    "/recommendations/{recommendation_id}",
    response_model=RecommendationResponse,
)
def get_recommendation_detail(
    recommendation_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Retrieve a specific recommendation by its ID.
    Access is restricted to the recommendation owner or an administrator.
    """
    rec = (
        db.query(Recommendation)
        .filter(Recommendation.recommendation_id == recommendation_id)
        .first()
    )
    if not rec:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Recommendation not found.",
        )

    if rec.user_id != current_user.user_id and current_user.role != RoleEnum.admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to view this recommendation.",
        )

    return _recommendation_to_response(rec)


# ─────────────────────────────────────────────────────────────────────────────
# 6. Update Recommendation Status
# ─────────────────────────────────────────────────────────────────────────────
@router.patch(
    "/recommendations/{recommendation_id}",
    response_model=RecommendationResponse,
)
def update_recommendation_status(
    recommendation_id: int,
    body: RecommendationStatusUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Update the status of a recommendation (viewed, enrolled, or completed).
    Only the recommendation owner can perform this action.
    """
    recommendation = (
        db.query(Recommendation)
        .filter(Recommendation.recommendation_id == recommendation_id)
        .first()
    )
    if not recommendation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Recommendation not found.",
        )

    # Only the owner can update their recommendation status
    if recommendation.user_id != current_user.user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to update this recommendation.",
        )

    try:
        recommendation.status = body.status.value
        db.commit()
        db.refresh(recommendation)
        return _recommendation_to_response(recommendation)
    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while updating the recommendation status.",
        )

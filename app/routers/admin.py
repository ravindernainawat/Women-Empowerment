"""
Admin API router for WEIS governance, statistics, and platform telemetry.
All endpoints require the 'admin' role.
"""

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import require_role
from app.models import (
    User,
    RoleEnum,
    Mentor,
    SkillGapAssessment,
    UserSkill,
    Skill,
    SafetyReport,
    SafetyStatusEnum,
    MentorshipRequest,
    MentorshipStatusEnum,
)
from app.schemas.admin import AdminStatsResponse

router = APIRouter(
    prefix="/api/admin",
    tags=["Admin Governance"],
    dependencies=[Depends(require_role(["admin"]))],
)


@router.get("/stats", response_model=AdminStatsResponse)
def get_admin_stats(db: Session = Depends(get_db)):
    """
    Returns aggregated ecosystem KPIs and platform telemetry across users,
    skills, assessments, mentors, mentorship requests, and safety reports.
    """
    total_users = db.query(func.count(User.user_id)).scalar() or 0
    total_mentees = (
        db.query(func.count(User.user_id))
        .filter(User.role == RoleEnum.mentee)
        .scalar()
        or 0
    )
    total_mentors = (
        db.query(func.count(User.user_id))
        .filter(User.role == RoleEnum.mentor)
        .scalar()
        or 0
    )

    verified_mentors = (
        db.query(func.count(Mentor.mentor_id))
        .filter(Mentor.is_verified == True)  # noqa: E712
        .scalar()
        or 0
    )
    pending_mentors = (
        db.query(func.count(Mentor.mentor_id))
        .filter(Mentor.is_verified == False)  # noqa: E712
        .scalar()
        or 0
    )

    total_assessments = db.query(func.count(SkillGapAssessment.assessment_id)).scalar() or 0
    avg_score_raw = db.query(func.avg(SkillGapAssessment.overall_score)).scalar()
    avg_readiness_score = round(float(avg_score_raw), 1) if avg_score_raw is not None else 0.0

    total_skills_logged = db.query(func.count(UserSkill.user_skill_id)).scalar() or 0
    catalog_skills_count = db.query(func.count(Skill.skill_id)).scalar() or 0

    total_safety_reports = db.query(func.count(SafetyReport.report_id)).scalar() or 0
    open_safety_reports = (
        db.query(func.count(SafetyReport.report_id))
        .filter(SafetyReport.status.in_([SafetyStatusEnum.submitted, SafetyStatusEnum.under_review]))
        .scalar()
        or 0
    )
    resolved_safety_reports = (
        db.query(func.count(SafetyReport.report_id))
        .filter(SafetyReport.status == SafetyStatusEnum.resolved)
        .scalar()
        or 0
    )

    total_mentorship_requests = db.query(func.count(MentorshipRequest.request_id)).scalar() or 0
    accepted_mentorship_requests = (
        db.query(func.count(MentorshipRequest.request_id))
        .filter(MentorshipRequest.status == MentorshipStatusEnum.accepted)
        .scalar()
        or 0
    )

    return AdminStatsResponse(
        total_users=total_users,
        total_mentees=total_mentees,
        total_mentors=total_mentors,
        verified_mentors=verified_mentors,
        pending_mentors=pending_mentors,
        total_assessments=total_assessments,
        avg_readiness_score=avg_readiness_score,
        total_skills_logged=total_skills_logged,
        catalog_skills_count=catalog_skills_count,
        total_safety_reports=total_safety_reports,
        open_safety_reports=open_safety_reports,
        resolved_safety_reports=resolved_safety_reports,
        total_mentorship_requests=total_mentorship_requests,
        accepted_mentorship_requests=accepted_mentorship_requests,
    )

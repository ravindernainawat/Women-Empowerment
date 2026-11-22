"""
Safety Reports router for WEIS backend.
Safety reports are the most sensitive data in the system (TRD §7).
Access is restricted to the reporting user and admin roles only.
"""

from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import (
    User,
    SafetyReport,
    SafetyStatusEnum,
    RoleEnum,
)
from app.dependencies import get_current_user, require_role
from app.schemas.safety import (
    SafetyReportCreate,
    SafetyReportResponse,
    SafetyReportStatusUpdate,
)

router = APIRouter(
    prefix="/api",
    tags=["Safety"],
)


# ─────────────────────────────────────────────────────────────────────────────
# 1. File a Safety Report
# ─────────────────────────────────────────────────────────────────────────────
@router.post(
    "/safety-reports",
    response_model=SafetyReportResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_safety_report(
    body: SafetyReportCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    File a new safety report. Any authenticated user can file a report.
    Status defaults to 'submitted' and reported_at is set automatically.
    """
    new_report = SafetyReport(
        user_id=current_user.user_id,
        incident_type=body.incident_type,
        description=body.description,
    )

    try:
        db.add(new_report)
        db.commit()
        db.refresh(new_report)
    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while filing the safety report.",
        )

    return new_report


# ─────────────────────────────────────────────────────────────────────────────
# 2. Get Authenticated User's Own Safety Reports
# ─────────────────────────────────────────────────────────────────────────────
@router.get(
    "/safety-reports/me",
    response_model=List[SafetyReportResponse],
)
def get_my_safety_reports(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Retrieve all safety reports filed by the currently authenticated user.
    Sorted newest first. Accessible by any authenticated user (own reports only).
    """
    reports = (
        db.query(SafetyReport)
        .filter(SafetyReport.user_id == current_user.user_id)
        .order_by(SafetyReport.reported_at.desc())
        .all()
    )
    return reports


# ─────────────────────────────────────────────────────────────────────────────
# 3. Get a Single Safety Report
# ─────────────────────────────────────────────────────────────────────────────
@router.get(
    "/safety-reports/{report_id}",
    response_model=SafetyReportResponse,
)
def get_safety_report(
    report_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Retrieve a safety report by ID.
    Only the reporter (the user who created it) or an admin can view it.
    """
    report = (
        db.query(SafetyReport)
        .filter(SafetyReport.report_id == report_id)
        .first()
    )
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Safety report not found.",
        )

    # Only the reporter or admin can view
    if report.user_id != current_user.user_id and current_user.role != RoleEnum.admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to view this safety report.",
        )

    return report


# ─────────────────────────────────────────────────────────────────────────────
# 3. List All Safety Reports (Admin Only)
# ─────────────────────────────────────────────────────────────────────────────
@router.get(
    "/safety-reports",
    response_model=List[SafetyReportResponse],
)
def list_safety_reports(
    report_status: Optional[str] = Query(None, alias="status", description="Filter by status"),
    limit: int = Query(50, ge=1, le=200, description="Max records to return"),
    offset: int = Query(0, ge=0, description="Number of records to skip"),
    admin_user: User = Depends(require_role(["admin"])),
    db: Session = Depends(get_db),
):
    """
    List all safety reports. Admin only.
    Supports optional status filter and pagination (limit/offset).
    """
    query = db.query(SafetyReport)

    if report_status:
        # Validate the status value
        try:
            status_enum = SafetyStatusEnum(report_status)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid status '{report_status}'. Valid values: {[s.value for s in SafetyStatusEnum]}",
            )
        query = query.filter(SafetyReport.status == status_enum)

    reports = (
        query
        .order_by(SafetyReport.reported_at.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )
    return reports


# ─────────────────────────────────────────────────────────────────────────────
# 4. Update Safety Report Status (Admin Only)
# ─────────────────────────────────────────────────────────────────────────────
@router.patch(
    "/safety-reports/{report_id}",
    response_model=SafetyReportResponse,
)
def update_safety_report_status(
    report_id: int,
    body: SafetyReportStatusUpdate,
    admin_user: User = Depends(require_role(["admin"])),
    db: Session = Depends(get_db),
):
    """
    Update the status of a safety report. Admin only.
    """
    report = (
        db.query(SafetyReport)
        .filter(SafetyReport.report_id == report_id)
        .first()
    )
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Safety report not found.",
        )

    try:
        report.status = body.status
        db.commit()
        db.refresh(report)
    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while updating the safety report status.",
        )

    return report


# ─────────────────────────────────────────────────────────────────────────────
# 6. Anonymous Safety Reporting & Tracking (Zero-Login Sanctuary)
# ─────────────────────────────────────────────────────────────────────────────
import secrets

CRITICAL_KEYWORDS = {"danger", "threat", "violence", "stalk", "abuse", "assault", "attack", "harm", "kill", "weapon"}
HIGH_KEYWORDS = {"harass", "blackmail", "intimidat", "leak", "photograph", "follow", "extort"}


def classify_urgency(incident_type: str, description: str) -> str:
    """NLP keyword triage classifier flagging high/urgent safety cases."""
    combined = f"{incident_type} {description}".lower()
    for kw in CRITICAL_KEYWORDS:
        if kw in combined:
            return "urgent"
    for kw in HIGH_KEYWORDS:
        if kw in combined:
            return "high"
    return "standard"


@router.post(
    "/safety-reports/anonymous",
    status_code=status.HTTP_201_CREATED,
)
def create_anonymous_safety_report(
    body: SafetyReportCreate,
    db: Session = Depends(get_db),
):
    """
    Submits a 100% confidential, anonymous safety incident report without requiring authentication.
    Returns a secure random tracking token so the reporter can monitor progress privately.
    """
    token = f"SAFE-{secrets.token_hex(3).upper()}-{secrets.randbelow(9000) + 1000}"
    urgency = classify_urgency(body.incident_type, body.description)

    new_report = SafetyReport(
        user_id=None,
        incident_type=body.incident_type,
        description=body.description,
        urgency=urgency,
        tracking_token=token,
        status=SafetyStatusEnum.submitted,
    )

    try:
        db.add(new_report)
        db.commit()
        db.refresh(new_report)
    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while filing the anonymous report.",
        )

    return {
        "tracking_token": token,
        "status": new_report.status.value,
        "urgency": urgency,
        "incident_type": new_report.incident_type,
        "reported_at": new_report.reported_at.isoformat() if new_report.reported_at else None,
        "message": "Report logged anonymously. Save your tracking token to monitor resolution status.",
    }


@router.get(
    "/safety-reports/track/{tracking_token}",
)
def track_anonymous_report(
    tracking_token: str,
    db: Session = Depends(get_db),
):
    """
    Public case status tracker using only the anonymous tracking token.
    Never exposes identifying reporter information.
    """
    report = (
        db.query(SafetyReport)
        .filter(SafetyReport.tracking_token == tracking_token.strip().upper())
        .first()
    )
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Case tracking token not found in WEIS Confidential Sanctuary.",
        )

    return {
        "tracking_token": report.tracking_token,
        "incident_type": report.incident_type,
        "status": report.status.value,
        "urgency": getattr(report, "urgency", "standard"),
        "reported_at": report.reported_at.isoformat() if report.reported_at else None,
        "sanctuary_note": "Case is actively being reviewed under strict zero-retaliation protocols.",
    }

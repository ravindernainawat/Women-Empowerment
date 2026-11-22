"""
Mentorship router for WEIS backend.
Provides mentor listing, mentor profile registration, mentorship request creation,
request status management, mentor incoming-request view, and admin verification.
"""

from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import (
    User,
    Mentor,
    MentorshipRequest,
    MentorshipStatusEnum,
    RoleEnum,
)
from app.dependencies import get_current_user
from app.schemas.mentorship import (
    MentorResponse,
    MentorProfileCreate,
    MentorshipRequestCreate,
    MentorshipRequestResponse,
    MentorshipRequestUpdate,
    MentorVerifyResponse,
)

router = APIRouter(
    prefix="/api",
    tags=["Mentorship"],
)


def _mentor_to_response(mentor: Mentor) -> dict:
    """Format SQLAlchemy Mentor model into dict matching MentorResponse."""
    return {
        "mentor_id": mentor.mentor_id,
        "user_id": mentor.user_id,
        "full_name": mentor.user.full_name if mentor.user else f"User #{mentor.user_id}",
        "expertise_area": mentor.expertise_area,
        "bio": mentor.bio,
        "is_verified": mentor.is_verified,
    }


def _request_to_response(req: MentorshipRequest) -> dict:
    """Format SQLAlchemy MentorshipRequest into dict matching MentorshipRequestResponse."""
    mentee_name = req.mentee.full_name if req.mentee else f"User #{req.mentee_id}"
    mentor_name = (
        req.mentor.user.full_name
        if req.mentor and req.mentor.user
        else f"Mentor #{req.mentor_id}"
    )
    return {
        "request_id": req.request_id,
        "mentee_id": req.mentee_id,
        "mentor_id": req.mentor_id,
        "mentee_name": mentee_name,
        "mentor_name": mentor_name,
        "status": req.status,
        "requested_at": req.requested_at,
    }


# ─────────────────────────────────────────────────────────────────────────────
# 1. List Verified Mentors (with optional expertise filter)
# ─────────────────────────────────────────────────────────────────────────────
@router.get("/mentors", response_model=List[MentorResponse])
def list_mentors(
    expertise: Optional[str] = Query(None, description="Filter by expertise area (case-insensitive contains)"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    List verified mentors on the platform.
    Optionally filter by expertise area (case-insensitive substring match).
    Only returns mentors with is_verified=True.
    """
    query = db.query(Mentor).filter(Mentor.is_verified == True)

    if expertise:
        query = query.filter(Mentor.expertise_area.ilike(f"%{expertise}%"))

    mentors = query.order_by(Mentor.mentor_id).all()
    return [_mentor_to_response(m) for m in mentors]


# ─────────────────────────────────────────────────────────────────────────────
# 2. Register Mentor Profile (mentor-role users only)
# ─────────────────────────────────────────────────────────────────────────────
@router.post(
    "/mentors/register",
    response_model=MentorResponse,
    status_code=status.HTTP_201_CREATED,
)
def register_mentor_profile(
    body: MentorProfileCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Create a mentor profile for the authenticated user.
    Only users with role='mentor' can create a mentor profile.
    is_verified defaults to False — an admin verifies mentors separately.
    """
    if current_user.role != RoleEnum.mentor and current_user.role != RoleEnum.admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only users with the mentor role can create a mentor profile.",
        )

    # Check if a profile already exists
    existing = db.query(Mentor).filter(Mentor.user_id == current_user.user_id).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="You already have a mentor profile.",
        )

    new_mentor = Mentor(
        user_id=current_user.user_id,
        expertise_area=body.expertise_area,
        bio=body.bio,
        is_verified=False,
    )

    try:
        db.add(new_mentor)
        db.commit()
        db.refresh(new_mentor)
    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while creating the mentor profile.",
        )

    return _mentor_to_response(new_mentor)


# ─────────────────────────────────────────────────────────────────────────────
# 3. Create a Mentorship Request (mentee → mentor)
# ─────────────────────────────────────────────────────────────────────────────
@router.post(
    "/mentorship-requests",
    response_model=MentorshipRequestResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_mentorship_request(
    body: MentorshipRequestCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Send a mentorship request to a verified mentor.
    The currently authenticated user becomes the mentee.
    Validates: mentor exists and is verified, user can't request themselves,
    no duplicate pending request to the same mentor.
    """
    # Verify the mentor exists and is verified
    mentor = db.query(Mentor).filter(Mentor.mentor_id == body.mentor_id).first()
    if not mentor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Mentor not found.",
        )

    if not mentor.is_verified:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This mentor has not been verified yet.",
        )

    # Prevent self-request
    if mentor.user_id == current_user.user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot send a mentorship request to yourself.",
        )

    # Prevent duplicate pending request to the same mentor
    existing = (
        db.query(MentorshipRequest)
        .filter(
            MentorshipRequest.mentee_id == current_user.user_id,
            MentorshipRequest.mentor_id == body.mentor_id,
            MentorshipRequest.status == MentorshipStatusEnum.pending,
        )
        .first()
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="You already have a pending request to this mentor.",
        )

    new_request = MentorshipRequest(
        mentee_id=current_user.user_id,
        mentor_id=body.mentor_id,
    )

    try:
        db.add(new_request)
        db.commit()
        db.refresh(new_request)
    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while creating the mentorship request.",
        )

    return _request_to_response(new_request)


# ─────────────────────────────────────────────────────────────────────────────
# 4. Update Mentorship Request Status (accept / decline / complete)
# ─────────────────────────────────────────────────────────────────────────────
@router.patch(
    "/mentorship-requests/{request_id}",
    response_model=MentorshipRequestResponse,
)
def update_mentorship_request(
    request_id: int,
    body: MentorshipRequestUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Update the status of a mentorship request.
    Only the mentor who received the request (or an admin) can update it.
    Valid transitions:
        pending  → accepted / declined
        accepted → completed
    """
    mentorship_req = (
        db.query(MentorshipRequest)
        .filter(MentorshipRequest.request_id == request_id)
        .first()
    )
    if not mentorship_req:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Mentorship request not found.",
        )

    # Authorization: only the mentor (user behind the mentor profile) or admin
    mentor = db.query(Mentor).filter(Mentor.mentor_id == mentorship_req.mentor_id).first()
    if not mentor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Associated mentor profile not found.",
        )

    if mentor.user_id != current_user.user_id and current_user.role != RoleEnum.admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the mentor or an admin can update this request.",
        )

    # Validate status transitions
    current_status = mentorship_req.status
    new_status = body.status

    valid_transitions = {
        MentorshipStatusEnum.pending: {MentorshipStatusEnum.accepted, MentorshipStatusEnum.declined},
        MentorshipStatusEnum.accepted: {MentorshipStatusEnum.completed},
    }

    allowed = valid_transitions.get(current_status, set())
    if new_status not in allowed:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot transition from '{current_status.value}' to '{new_status.value}'.",
        )

    try:
        mentorship_req.status = new_status
        db.commit()
        db.refresh(mentorship_req)
    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while updating the mentorship request.",
        )

    return _request_to_response(mentorship_req)


# ─────────────────────────────────────────────────────────────────────────────
# 5. Get Current User's Mentorship Requests (as mentee)
# ─────────────────────────────────────────────────────────────────────────────
@router.get(
    "/mentorship-requests/me",
    response_model=List[MentorshipRequestResponse],
)
def get_my_mentorship_requests(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Retrieve all mentorship requests the currently authenticated user has sent
    (as a mentee). Results are sorted newest first.
    """
    requests = (
        db.query(MentorshipRequest)
        .filter(MentorshipRequest.mentee_id == current_user.user_id)
        .order_by(MentorshipRequest.requested_at.desc())
        .all()
    )
    return [_request_to_response(r) for r in requests]


# ─────────────────────────────────────────────────────────────────────────────
# 6. Get Incoming Mentorship Requests (for mentor — requests directed AT them)
# ─────────────────────────────────────────────────────────────────────────────
@router.get(
    "/mentorship-requests/incoming",
    response_model=List[MentorshipRequestResponse],
)
def get_incoming_mentorship_requests(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Retrieve all mentorship requests directed at the currently authenticated
    mentor. Only accessible by users with the mentor role (or admin).
    Results sorted newest first.
    """
    if current_user.role not in (RoleEnum.mentor, RoleEnum.admin):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only mentor-role users can view incoming requests.",
        )

    # Locate the mentor profile for this user
    mentor_profile = (
        db.query(Mentor)
        .filter(Mentor.user_id == current_user.user_id)
        .first()
    )
    if not mentor_profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No mentor profile found for this account. Register one first.",
        )

    requests = (
        db.query(MentorshipRequest)
        .filter(MentorshipRequest.mentor_id == mentor_profile.mentor_id)
        .order_by(MentorshipRequest.requested_at.desc())
        .all()
    )
    return [_request_to_response(r) for r in requests]


# ─────────────────────────────────────────────────────────────────────────────
# 7. Admin: Verify a Mentor Profile
# ─────────────────────────────────────────────────────────────────────────────
@router.patch(
    "/mentors/{mentor_id}/verify",
    response_model=MentorVerifyResponse,
)
def verify_mentor(
    mentor_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Mark a mentor profile as verified (is_verified = True).
    Only admins can call this endpoint.
    Idempotent: verifying an already-verified mentor returns 200 without error.
    """
    if current_user.role != RoleEnum.admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can verify mentor profiles.",
        )

    mentor = db.query(Mentor).filter(Mentor.mentor_id == mentor_id).first()
    if not mentor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Mentor with id {mentor_id} not found.",
        )

    already_verified = mentor.is_verified
    mentor.is_verified = True

    try:
        db.commit()
        db.refresh(mentor)
    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while verifying the mentor profile.",
        )

    full_name = mentor.user.full_name if mentor.user else f"User #{mentor.user_id}"
    message = (
        "Mentor was already verified." if already_verified
        else "Mentor profile successfully verified."
    )
    return MentorVerifyResponse(
        mentor_id=mentor.mentor_id,
        user_id=mentor.user_id,
        full_name=full_name,
        expertise_area=mentor.expertise_area,
        is_verified=True,
        message=message,
    )


# ─────────────────────────────────────────────────────────────────────────────
# 8. Admin: List ALL Mentors (verified + unverified) for admin dashboard
# ─────────────────────────────────────────────────────────────────────────────
@router.get(
    "/mentors/all",
    response_model=List[MentorResponse],
)
def list_all_mentors_admin(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    List all mentors (verified and unverified) for admin oversight.
    Only accessible by admin-role users.
    Returns mentors ordered by mentor_id ascending.
    """
    if current_user.role != RoleEnum.admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can view all mentor profiles.",
        )

    mentors = db.query(Mentor).order_by(Mentor.mentor_id).all()
    return [_mentor_to_response(m) for m in mentors]


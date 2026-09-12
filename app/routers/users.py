"""
Users / Profile router for WEIS backend.
Provides authenticated profile read and update endpoints.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User
from app.dependencies import get_current_user
from app.schemas.users import UserProfileResponse, UserProfileUpdate

router = APIRouter(
    prefix="/api/users",
    tags=["Users"],
)


@router.get("/me", response_model=UserProfileResponse)
def get_my_profile(current_user: User = Depends(get_current_user)):
    """
    Return the currently authenticated user's profile.
    The user is identified entirely from the JWT — no user ID is accepted from the client.
    Never returns password_hash or other internal security fields.
    """
    return current_user


@router.put("/me", response_model=UserProfileResponse)
def update_my_profile(
    updates: UserProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Update the currently authenticated user's profile.
    Only safe fields (full_name, phone, location) can be modified.
    Role, email, user_id, and password_hash cannot be changed via this endpoint.
    """
    # Track whether any field was actually provided
    update_data = updates.model_dump(exclude_unset=True)

    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields provided for update.",
        )

    # Apply only the fields that were sent
    for field, value in update_data.items():
        setattr(current_user, field, value)

    try:
        db.commit()
        db.refresh(current_user)
    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while updating the profile.",
        )

    return current_user

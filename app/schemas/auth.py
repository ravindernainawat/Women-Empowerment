from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Optional
from datetime import datetime
from app.models import RoleEnum

class UserRegister(BaseModel):
    full_name: str = Field(..., max_length=150)
    email: EmailStr
    password: str = Field(..., min_length=8)
    role: RoleEnum = Field(default=RoleEnum.mentee)
    phone: Optional[str] = Field(None, max_length=20)
    location: Optional[str] = Field(None, max_length=150)

    @field_validator('role')
    def validate_role(cls, v):
        if v == RoleEnum.admin:
            raise ValueError("Admin accounts cannot be created via public registration.")
        return v

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    user_id: int
    full_name: str
    email: EmailStr
    role: RoleEnum
    phone: Optional[str]
    location: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True
        from_attributes = True # for Pydantic V2 compatibility

class Token(BaseModel):
    access_token: str
    token_type: str

from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional, List
from datetime import datetime
import uuid


class UserBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=200)
    email: EmailStr


class UserCreate(UserBase):
    password: str = Field(..., min_length=8, max_length=100)
    college: Optional[str] = None
    branch: Optional[str] = None
    year: Optional[int] = Field(None, ge=1, le=6)

    @validator("password")
    def password_strength(cls, v):
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        return v


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class GoogleAuthRequest(BaseModel):
    token: str


class UserUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=200)
    avatar: Optional[str] = None
    college: Optional[str] = None
    branch: Optional[str] = None
    year: Optional[int] = Field(None, ge=1, le=6)
    target_companies: Optional[List[str]] = None
    skills: Optional[List[str]] = None
    study_hours_per_day: Optional[float] = Field(None, ge=0.5, le=24)


class UserResponse(BaseModel):
    id: uuid.UUID
    name: str
    email: str
    avatar: Optional[str] = None
    role: str
    college: Optional[str] = None
    branch: Optional[str] = None
    year: Optional[int] = None
    target_companies: Optional[List[str]] = []
    skills: Optional[List[str]] = []
    study_hours_per_day: Optional[float] = 2.0
    xp: int = 0
    level: int = 1
    streak: int = 0
    longest_streak: int = 0
    created_at: datetime

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class PasswordChangeRequest(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=8)

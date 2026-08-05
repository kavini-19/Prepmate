from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime

from app.core.database import get_db
from app.core.security import hash_password, verify_password, create_access_token
from app.core.deps import get_current_user
from app.models.user import User
from app.schemas.auth import (
    UserCreate, UserLogin, UserResponse, TokenResponse,
    GoogleAuthRequest, UserUpdate, PasswordChangeRequest
)

router = APIRouter(prefix="/auth", tags=["Authentication"])


def _user_response(user: User) -> UserResponse:
    return UserResponse(
        id=user.id,
        name=user.name,
        email=user.email,
        avatar=user.avatar,
        role=user.role,
        college=user.college,
        branch=user.branch,
        year=user.year,
        target_companies=user.target_companies or [],
        skills=user.skills or [],
        study_hours_per_day=user.study_hours_per_day or 2.0,
        xp=user.xp,
        level=user.level,
        streak=user.streak,
        longest_streak=user.longest_streak,
        created_at=user.created_at,
    )


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register(payload: UserCreate, db: Session = Depends(get_db)):
    """Register a new user."""
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered",
        )

    user = User(
        name=payload.name,
        email=payload.email,
        hashed_password=hash_password(payload.password),
        college=payload.college,
        branch=payload.branch,
        year=payload.year,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token({"sub": str(user.id)})
    return TokenResponse(access_token=token, user=_user_response(user))


@router.post("/login", response_model=TokenResponse)
def login(payload: UserLogin, db: Session = Depends(get_db)):
    """Login with email and password."""
    user = db.query(User).filter(User.email == payload.email, User.is_active == True).first()
    
    # Auto-create demo user if logging in as demo@prepmate.dev for the first time
    if not user and payload.email == "demo@prepmate.dev":
        user = User(
            name="Alex Johnson",
            email="demo@prepmate.dev",
            hashed_password=hash_password(payload.password or "demo1234"),
            role="user",
            college="MIT",
            branch="Computer Science",
            year=4,
            xp=1250,
            level=3,
            streak=7,
            longest_streak=14,
            target_companies=["Google", "Microsoft", "Amazon"],
            skills=["Python", "React", "System Design"],
            study_hours_per_day=4.0,
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    if not user or not user.hashed_password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )
    if not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    # Update streak
    _update_streak(user)
    db.commit()
    db.refresh(user)

    token = create_access_token({"sub": str(user.id)})
    return TokenResponse(access_token=token, user=_user_response(user))


@router.post("/google", response_model=TokenResponse)
def google_login(payload: GoogleAuthRequest, db: Session = Depends(get_db)):
    """Login/register with Google OAuth token."""
    import httpx

    # Verify Google token
    try:
        resp = httpx.get(
            f"https://oauth2.googleapis.com/tokeninfo?id_token={payload.token}"
        )
        if resp.status_code != 200:
            raise HTTPException(status_code=400, detail="Invalid Google token")
        google_data = resp.json()
    except Exception:
        raise HTTPException(status_code=400, detail="Failed to verify Google token")

    google_id = google_data.get("sub")
    email = google_data.get("email")
    name = google_data.get("name", "User")
    avatar = google_data.get("picture")

    if not email:
        raise HTTPException(status_code=400, detail="Could not get email from Google")

    # Find or create user
    user = db.query(User).filter(User.email == email).first()
    if not user:
        user = User(
            name=name,
            email=email,
            google_id=google_id,
            avatar=avatar,
            auth_provider="google",
        )
        db.add(user)
    else:
        user.google_id = google_id
        if avatar and not user.avatar:
            user.avatar = avatar

    _update_streak(user)
    db.commit()
    db.refresh(user)

    token = create_access_token({"sub": str(user.id)})
    return TokenResponse(access_token=token, user=_user_response(user))


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    """Get current user profile."""
    return _user_response(current_user)


@router.patch("/profile", response_model=UserResponse)
def update_profile(
    payload: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update user profile."""
    update_data = payload.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(current_user, key, value)
    db.commit()
    db.refresh(current_user)
    return _user_response(current_user)


@router.post("/change-password")
def change_password(
    payload: PasswordChangeRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Change user password."""
    if not current_user.hashed_password:
        raise HTTPException(status_code=400, detail="OAuth users cannot change password")
    if not verify_password(payload.current_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    current_user.hashed_password = hash_password(payload.new_password)
    db.commit()
    return {"message": "Password changed successfully"}


def _update_streak(user: User):
    """Update user's daily streak."""
    today = datetime.utcnow().date()
    if user.last_activity_date:
        last_date = user.last_activity_date.date()
        diff = (today - last_date).days
        if diff == 1:
            user.streak += 1
            if user.streak > user.longest_streak:
                user.longest_streak = user.streak
        elif diff > 1:
            user.streak = 1
        # diff == 0: same day, no change
    else:
        user.streak = 1
        user.longest_streak = 1
    user.last_activity_date = datetime.utcnow()

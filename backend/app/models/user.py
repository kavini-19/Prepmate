import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Boolean, DateTime, Float, JSON, Text, Enum as SAEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.core.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(200), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=True)  # nullable for OAuth users
    avatar = Column(String(500), nullable=True)
    role = Column(SAEnum("user", "admin", name="user_role"), default="user", nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)

    # Academic info
    college = Column(String(300), nullable=True)
    branch = Column(String(200), nullable=True)
    year = Column(Integer, nullable=True)

    # Placement preferences
    target_companies = Column(JSON, default=list)
    skills = Column(JSON, default=list)
    study_hours_per_day = Column(Float, default=2.0)

    # Gamification
    xp = Column(Integer, default=0, nullable=False)
    level = Column(Integer, default=1, nullable=False)
    streak = Column(Integer, default=0, nullable=False)
    longest_streak = Column(Integer, default=0, nullable=False)
    last_activity_date = Column(DateTime, nullable=True)

    # OAuth
    google_id = Column(String(255), unique=True, nullable=True)
    auth_provider = Column(String(50), default="email")

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    coding_submissions = relationship("CodingSubmission", back_populates="user", lazy="dynamic")
    notes = relationship("Note", back_populates="user", lazy="dynamic")
    achievements = relationship("UserAchievement", back_populates="user", lazy="dynamic")

    def __repr__(self):
        return f"<User {self.email}>"

    @property
    def xp_for_current_level(self):
        return self.xp % 500

    @property
    def xp_progress_percent(self):
        return (self.xp_for_current_level / 500) * 100

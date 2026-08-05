import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Boolean, DateTime, Float, JSON, Text, Enum as SAEnum, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.core.database import Base


class CodingProblem(Base):
    __tablename__ = "coding_problems"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(300), nullable=False)
    slug = Column(String(300), unique=True, nullable=False, index=True)
    difficulty = Column(SAEnum("Easy", "Medium", "Hard", name="difficulty_level"), nullable=False)
    tags = Column(JSON, default=list)
    description = Column(Text, nullable=False)
    examples = Column(JSON, default=list)
    constraints = Column(JSON, default=list)
    hints = Column(JSON, default=list)
    solution = Column(Text, nullable=True)
    solution_explanation = Column(Text, nullable=True)
    companies = Column(JSON, default=list)
    acceptance_rate = Column(Float, default=0.0)
    total_submissions = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    submissions = relationship("CodingSubmission", back_populates="problem", lazy="dynamic")
    bookmarks = relationship("ProblemBookmark", back_populates="problem", lazy="dynamic")


class CodingSubmission(Base):
    __tablename__ = "coding_submissions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    problem_id = Column(UUID(as_uuid=True), ForeignKey("coding_problems.id", ondelete="CASCADE"), nullable=False)
    code = Column(Text, nullable=True)
    language = Column(String(50), default="python")
    status = Column(SAEnum("solved", "attempted", "skipped", name="submission_status"), default="attempted")
    time_taken = Column(Integer, nullable=True)  # seconds
    submitted_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="coding_submissions")
    problem = relationship("CodingProblem", back_populates="submissions")


class ProblemBookmark(Base):
    __tablename__ = "problem_bookmarks"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    problem_id = Column(UUID(as_uuid=True), ForeignKey("coding_problems.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    problem = relationship("CodingProblem", back_populates="bookmarks")

import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Boolean, DateTime, Float, JSON, Text, Enum as SAEnum, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.core.database import Base


class AptitudeQuestion(Base):
    __tablename__ = "aptitude_questions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    category = Column(
        SAEnum(
            "Quantitative Aptitude", "Logical Reasoning",
            "Verbal Ability", "Data Interpretation",
            name="aptitude_category"
        ),
        nullable=False,
    )
    difficulty = Column(SAEnum("Easy", "Medium", "Hard", name="apt_difficulty"), default="Medium")
    question = Column(Text, nullable=False)
    options = Column(JSON, nullable=False)  # list of 4 strings
    correct_answer = Column(Integer, nullable=False)  # 0-3 index
    explanation = Column(Text, nullable=False)
    time_limit = Column(Integer, default=60)  # seconds
    tags = Column(JSON, default=list)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class QuizAttempt(Base):
    __tablename__ = "quiz_attempts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    category = Column(String(100), nullable=False)
    score = Column(Integer, default=0)
    total_questions = Column(Integer, default=0)
    correct_answers = Column(Integer, default=0)
    time_taken = Column(Integer, nullable=True)  # seconds
    answers = Column(JSON, default=list)  # [{question_id, selected, correct}]
    started_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)

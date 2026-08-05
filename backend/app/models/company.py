import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Boolean, DateTime, JSON, Text, ForeignKey, Enum as SAEnum
from sqlalchemy.dialects.postgresql import UUID
from app.core.database import Base


class Company(Base):
    __tablename__ = "companies"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(200), unique=True, nullable=False)
    slug = Column(String(200), unique=True, nullable=False, index=True)
    logo = Column(String(500), nullable=True)
    industry = Column(String(100), nullable=True)
    tier = Column(
        SAEnum("FAANG", "Product", "Service", "Startup", "MNC", name="company_tier"),
        default="Product",
    )
    difficulty = Column(SAEnum("Easy", "Medium", "Hard", name="company_difficulty"), default="Medium")
    avg_package = Column(String(50), nullable=True)
    website = Column(String(300), nullable=True)
    description = Column(Text, nullable=True)
    interview_rounds = Column(JSON, default=list)
    coding_topics = Column(JSON, default=list)
    aptitude_topics = Column(JSON, default=list)
    hr_questions = Column(JSON, default=list)
    technical_topics = Column(JSON, default=list)
    interview_experiences = Column(JSON, default=list)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class PlacementDrive(Base):
    __tablename__ = "placement_drives"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    company_id = Column(UUID(as_uuid=True), ForeignKey("companies.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(300), nullable=False)
    type = Column(SAEnum("campus", "off-campus", "internship", "contest", name="drive_type"), default="campus")
    deadline = Column(DateTime, nullable=True)
    eligibility = Column(Text, nullable=True)
    apply_link = Column(String(500), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Boolean, DateTime, JSON, Text, Float, Enum as SAEnum
from sqlalchemy.dialects.postgresql import UUID
from app.core.database import Base


class Resource(Base):
    __tablename__ = "resources"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(300), nullable=False)
    description = Column(Text, nullable=True)
    type = Column(
        SAEnum("pdf", "video", "article", "cheatsheet", "notes", name="resource_type"),
        default="article",
    )
    category = Column(String(100), nullable=False)
    tags = Column(JSON, default=list)
    url = Column(String(500), nullable=True)
    download_url = Column(String(500), nullable=True)
    thumbnail = Column(String(500), nullable=True)
    views = Column(Integer, default=0)
    downloads = Column(Integer, default=0)
    rating = Column(Float, default=0.0)
    author = Column(String(200), default="PrepMate Team")
    is_active = Column(Boolean, default=True)
    is_premium = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

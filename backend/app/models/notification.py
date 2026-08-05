import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Boolean, DateTime, JSON, Text, ForeignKey, Enum as SAEnum
from sqlalchemy.dialects.postgresql import UUID
from app.core.database import Base


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=True)
    type = Column(
        SAEnum("drive", "contest", "reminder", "achievement", "system", name="notification_type"),
        default="system",
    )
    title = Column(String(300), nullable=False)
    message = Column(Text, nullable=False)
    link = Column(String(500), nullable=True)
    meta_data = Column(JSON, default=dict)
    is_read = Column(Boolean, default=False)
    is_global = Column(Boolean, default=False)  # sent to all users
    created_at = Column(DateTime, default=datetime.utcnow)

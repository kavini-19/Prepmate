from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional
import uuid

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.models.notification import Notification

router = APIRouter(prefix="/notifications", tags=["Notifications"])


@router.get("/")
def list_notifications(
    unread_only: bool = False,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(Notification).filter(
        (Notification.user_id == current_user.id) | (Notification.is_global == True)
    )
    if unread_only:
        query = query.filter(Notification.is_read == False)

    notifications = query.order_by(Notification.created_at.desc()).limit(50).all()
    return [
        {
            "id": str(n.id), "type": n.type, "title": n.title, "message": n.message,
            "link": n.link, "metadata": n.meta_data or {},
            "isRead": n.is_read, "is_read": n.is_read,
            "createdAt": n.created_at.isoformat() if n.created_at else None,
            "created_at": n.created_at.isoformat() if n.created_at else None,
        }
        for n in notifications
    ]


@router.post("/{notification_id}/read")
@router.patch("/{notification_id}/read")
def mark_as_read(
    notification_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    notification = db.query(Notification).filter(Notification.id == notification_id).first()
    if notification:
        notification.is_read = True
        db.commit()
    return {"message": "Marked as read"}


@router.post("/read-all")
@router.patch("/read-all")
def mark_all_read(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    db.query(Notification).filter(
        (Notification.user_id == current_user.id) | (Notification.is_global == True),
        Notification.is_read == False,
    ).update({"is_read": True})
    db.commit()
    return {"message": "All notifications marked as read"}


@router.get("/unread-count")
def get_unread_count(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    count = db.query(Notification).filter(
        (Notification.user_id == current_user.id) | (Notification.is_global == True),
        Notification.is_read == False,
    ).count()
    return {"count": count}

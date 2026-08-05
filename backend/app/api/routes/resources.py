from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.models.resource import Resource

router = APIRouter(prefix="/resources", tags=["Resources"])


@router.get("/")
def list_resources(
    category: Optional[str] = None,
    type: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(Resource).filter(Resource.is_active == True)
    if category:
        query = query.filter(Resource.category == category)
    if type:
        query = query.filter(Resource.type == type)
    if search:
        query = query.filter(Resource.title.ilike(f"%{search}%"))

    resources = query.order_by(Resource.views.desc()).all()
    return [
        {
            "id": str(r.id), "title": r.title, "description": r.description,
            "type": r.type, "category": r.category, "tags": r.tags or [],
            "url": r.url,
            "downloadUrl": r.download_url or r.url,
            "download_url": r.download_url or r.url,
            "thumbnail": r.thumbnail,
            "views": r.views, "downloads": r.downloads, "rating": r.rating,
            "author": r.author,
            "createdAt": r.created_at.isoformat() if r.created_at else None,
            "created_at": r.created_at.isoformat() if r.created_at else None,
        }
        for r in resources
    ]


@router.post("/{resource_id}/view")
def increment_view(
    resource_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    resource = db.query(Resource).filter(Resource.id == resource_id).first()
    if resource:
        resource.views += 1
        db.commit()
    return {"message": "View recorded"}

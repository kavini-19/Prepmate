from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional, List
from pydantic import BaseModel
import uuid

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.models.notes import Note

router = APIRouter(prefix="/notes", tags=["Notes"])


class NoteCreate(BaseModel):
    title: str
    content: str = ""
    tags: List[str] = []
    color: str = "#3b82f6"
    is_bookmarked: Optional[bool] = False
    isBookmarked: Optional[bool] = None


class NoteUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    tags: Optional[List[str]] = None
    color: Optional[str] = None
    is_bookmarked: Optional[bool] = None
    isBookmarked: Optional[bool] = None


def _note_dict(n: Note):
    return {
        "id": str(n.id),
        "title": n.title or "",
        "content": n.content or "",
        "tags": n.tags or [],
        "color": n.color or "#3b82f6",
        "isBookmarked": bool(n.is_bookmarked),
        "is_bookmarked": bool(n.is_bookmarked),
        "createdAt": n.created_at.isoformat() if n.created_at else None,
        "created_at": n.created_at.isoformat() if n.created_at else None,
        "updatedAt": n.updated_at.isoformat() if n.updated_at else None,
        "updated_at": n.updated_at.isoformat() if n.updated_at else None,
    }


@router.get("/")
def list_notes(
    search: Optional[str] = None,
    tag: Optional[str] = None,
    bookmarked: Optional[bool] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(Note).filter(
        Note.user_id == current_user.id, Note.is_deleted == False
    )
    if search:
        query = query.filter(
            Note.title.ilike(f"%{search}%") | Note.content.ilike(f"%{search}%")
        )
    if bookmarked is not None:
        query = query.filter(Note.is_bookmarked == bookmarked)

    notes = query.order_by(Note.updated_at.desc()).all()

    result = []
    for n in notes:
        if tag and tag not in (n.tags or []):
            continue
        result.append(_note_dict(n))
    return result


@router.post("/", status_code=201)
def create_note(
    payload: NoteCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    data = payload.model_dump(exclude_unset=True)
    if "isBookmarked" in data and "is_bookmarked" not in data:
        data["is_bookmarked"] = data.pop("isBookmarked")
    elif "isBookmarked" in data:
        data.pop("isBookmarked")

    note = Note(user_id=current_user.id, **data)
    db.add(note)
    db.commit()
    db.refresh(note)
    return _note_dict(note)


@router.patch("/{note_id}")
def update_note(
    note_id: uuid.UUID,
    payload: NoteUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    note = db.query(Note).filter(Note.id == note_id, Note.user_id == current_user.id).first()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")

    data = payload.model_dump(exclude_unset=True)
    if "isBookmarked" in data:
        data["is_bookmarked"] = data.pop("isBookmarked")

    for key, val in data.items():
        setattr(note, key, val)

    db.commit()
    db.refresh(note)
    return _note_dict(note)


@router.delete("/{note_id}")
def delete_note(
    note_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    note = db.query(Note).filter(Note.id == note_id, Note.user_id == current_user.id).first()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    note.is_deleted = True
    db.commit()
    return {"message": "Note deleted", "id": str(note_id)}

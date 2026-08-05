from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional
from pydantic import BaseModel

from app.core.database import get_db
from app.core.deps import get_current_admin
from app.models.user import User
from app.models.coding import CodingProblem, CodingSubmission
from app.models.aptitude import AptitudeQuestion, QuizAttempt
from app.models.notification import Notification
from app.models.resource import Resource
from app.models.company import Company
from app.services import ai_service

router = APIRouter(prefix="/admin", tags=["Admin"])


@router.get("/overview")
def get_overview(
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    """Admin dashboard overview stats."""
    return {
        "total_users": db.query(User).count(),
        "active_users": db.query(User).filter(User.is_active == True).count(),
        "total_problems": db.query(CodingProblem).count(),
        "total_questions": db.query(AptitudeQuestion).count(),
        "total_companies": db.query(Company).count(),
        "total_resources": db.query(Resource).count(),
        "total_submissions": db.query(CodingSubmission).count(),
        "total_quiz_attempts": db.query(QuizAttempt).count(),
    }


@router.get("/users")
def list_users(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    query = db.query(User)
    if search:
        query = query.filter(User.name.ilike(f"%{search}%") | User.email.ilike(f"%{search}%"))
    total = query.count()
    users = query.offset((page - 1) * page_size).limit(page_size).all()
    return {
        "data": [
            {
                "id": str(u.id), "name": u.name, "email": u.email,
                "role": u.role, "xp": u.xp, "level": u.level, "streak": u.streak,
                "is_active": u.is_active, "created_at": u.created_at.isoformat(),
            }
            for u in users
        ],
        "total": total, "page": page, "total_pages": (total + page_size - 1) // page_size,
    }


class NotificationCreate(BaseModel):
    type: str
    title: str
    message: str
    link: Optional[str] = None
    is_global: bool = True


@router.post("/notifications", status_code=201)
def create_notification(
    payload: NotificationCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    notification = Notification(
        type=payload.type,
        title=payload.title,
        message=payload.message,
        link=payload.link,
        is_global=payload.is_global,
    )
    db.add(notification)
    db.commit()
    return {"message": "Notification created"}


@router.patch("/users/{user_id}/role")
def update_user_role(
    user_id: str,
    role: str,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="User not found")
    if role not in ("user", "admin"):
        from fastapi import HTTPException
        raise HTTPException(status_code=400, detail="Invalid role")
    user.role = role
    db.commit()
    return {"message": f"User role updated to {role}"}


class GenerateAptitudeRequest(BaseModel):
    category: str
    difficulty: str


class GenerateCodingRequest(BaseModel):
    topic: str
    difficulty: str


@router.post("/generate/aptitude")
async def generate_aptitude(
    payload: GenerateAptitudeRequest,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    try:
        data = await ai_service.generate_aptitude_question_data(payload.category, payload.difficulty)
        
        # Validation checks
        if "category" not in data or "question" not in data or "options" not in data:
             from fastapi import HTTPException
             raise HTTPException(status_code=500, detail="Generated data missing required fields")

        question = AptitudeQuestion(
            category=data["category"],
            difficulty=data.get("difficulty", payload.difficulty),
            question=data["question"],
            options=data["options"],
            correct_answer=data.get("correct_answer", 0),
            explanation=data.get("explanation", ""),
            time_limit=data.get("time_limit", 60),
            tags=data.get("tags", []),
        )
        db.add(question)
        db.commit()
        db.refresh(question)
        return {"message": "Aptitude question generated successfully", "id": str(question.id)}
    except Exception as e:
        from fastapi import HTTPException
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/generate/coding")
async def generate_coding(
    payload: GenerateCodingRequest,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    try:
        data = await ai_service.generate_coding_problem_data(payload.topic, payload.difficulty)
        
        # Unique slug generation
        import uuid
        slug_base = data.get("slug", "generated-problem")
        slug = f"{slug_base}-{str(uuid.uuid4())[:8]}"

        problem = CodingProblem(
            title=data.get("title", "Generated Problem"),
            slug=slug,
            difficulty=data.get("difficulty", payload.difficulty),
            tags=data.get("tags", []),
            description=data.get("description", ""),
            examples=data.get("examples", []),
            constraints=data.get("constraints", []),
            hints=data.get("hints", []),
            solution=data.get("solution", ""),
            solution_explanation=data.get("solution_explanation", ""),
            companies=data.get("companies", []),
        )
        db.add(problem)
        db.commit()
        db.refresh(problem)
        return {"message": "Coding problem generated successfully", "id": str(problem.id)}
    except Exception as e:
        from fastapi import HTTPException
        raise HTTPException(status_code=500, detail=str(e))

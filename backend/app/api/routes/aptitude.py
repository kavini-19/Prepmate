from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Optional
from pydantic import BaseModel
from datetime import datetime

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.models.aptitude import AptitudeQuestion, QuizAttempt

router = APIRouter(prefix="/aptitude", tags=["Aptitude"])


# ── Schema ──────────────────────────────────────────────────────────────────

class QuizSimpleSubmit(BaseModel):
    """Payload sent by the frontend after client-side scoring."""
    category: str
    score: int           # number of correct answers
    total_questions: int
    time_taken: int      # seconds


# ── Routes ──────────────────────────────────────────────────────────────────

from app.services import ai_service
import random


@router.get("/questions")
async def get_questions(
    category: Optional[str] = None,
    difficulty: Optional[str] = None,
    fresh: bool = False,
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get aptitude questions for a quiz session, dynamically generating fresh AI questions if needed."""
    if (fresh or category) and category:
        # Dynamically generate 3-5 fresh AI questions for this category
        difficulties = ["Easy", "Medium", "Hard"]
        for _ in range(random.randint(3, 5)):
            diff = difficulty or random.choice(difficulties)
            try:
                q_data = await ai_service.generate_aptitude_question_data(category, diff)
                if q_data and "question" in q_data and "options" in q_data:
                    new_q = AptitudeQuestion(
                        category=q_data.get("category", category),
                        difficulty=q_data.get("difficulty", diff),
                        question=q_data["question"],
                        options=q_data["options"],
                        correct_answer=q_data.get("correct_answer", 0),
                        explanation=q_data.get("explanation", "Solution explanation"),
                        time_limit=q_data.get("time_limit", 60),
                        tags=q_data.get("tags", []),
                        is_active=True,
                    )
                    db.add(new_q)
                    db.commit()
            except Exception as e:
                # If AI generation hits a transient error, proceed with existing DB questions
                pass

    query = db.query(AptitudeQuestion).filter(AptitudeQuestion.is_active == True)
    if category:
        query = query.filter(AptitudeQuestion.category == category)
    if difficulty:
        query = query.filter(AptitudeQuestion.difficulty == difficulty)

    questions = query.order_by(func.random()).limit(limit).all()
    return [
        {
            "id": str(q.id),
            "category": q.category,
            "difficulty": q.difficulty,
            "question": q.question,
            "options": q.options,
            # camelCase – matches the AptitudeQuestion TypeScript type
            "correctAnswer": q.correct_answer,
            "explanation": q.explanation,
            "timeLimit": q.time_limit,
            "tags": q.tags or [],
        }
        for q in questions
    ]


@router.post("/submit")
def submit_quiz(
    payload: QuizSimpleSubmit,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Record a completed quiz attempt and award XP."""
    correct = payload.score
    total = payload.total_questions
    score_pct = round((correct / total) * 100) if total > 0 else 0

    attempt = QuizAttempt(
        user_id=current_user.id,
        category=payload.category,
        score=score_pct,
        total_questions=total,
        correct_answers=correct,
        time_taken=payload.time_taken,
        answers=[],
        completed_at=datetime.utcnow(),
    )
    db.add(attempt)

    # Award XP
    xp_gain = correct * 5
    current_user.xp = (current_user.xp or 0) + xp_gain
    current_user.level = 1 + current_user.xp // 500
    db.commit()

    return {
        "score": score_pct,
        "correct": correct,
        "total": total,
        "xp_gained": xp_gain,
    }


@router.get("/stats")
def get_aptitude_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Aggregate quiz stats for the current user (used by AptitudePage)."""
    row = db.query(
        func.count(QuizAttempt.id).label("total_quizzes"),
        func.avg(QuizAttempt.score).label("avg_score"),
        func.sum(QuizAttempt.total_questions).label("total_questions"),
    ).filter(QuizAttempt.user_id == current_user.id).first()

    recent = (
        db.query(QuizAttempt)
        .filter(QuizAttempt.user_id == current_user.id)
        .order_by(QuizAttempt.completed_at.desc())
        .limit(10)
        .all()
    )

    recent_history = [
        {
            "category": a.category,
            "score": a.correct_answers,
            "totalQuestions": a.total_questions,
            "createdAt": a.completed_at.isoformat() if a.completed_at else None,
        }
        for a in recent
    ]

    return {
        "totalQuizzes": row[0] or 0,
        "averageScore": round(float(row[1] or 0), 1),
        "totalQuestions": row[2] or 0,
        "recentHistory": recent_history,
    }


@router.get("/history")
def get_quiz_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Return the last 20 quiz attempts for the current user."""
    attempts = (
        db.query(QuizAttempt)
        .filter(QuizAttempt.user_id == current_user.id)
        .order_by(QuizAttempt.completed_at.desc())
        .limit(20)
        .all()
    )

    return [
        {
            "id": str(a.id),
            "category": a.category,
            "score": a.score,
            "total_questions": a.total_questions,
            "correct_answers": a.correct_answers,
            "time_taken": a.time_taken,
            "completed_at": a.completed_at.isoformat() if a.completed_at else None,
        }
        for a in attempts
    ]

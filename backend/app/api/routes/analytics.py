from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import datetime, timedelta

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.models.coding import CodingSubmission, CodingProblem
from app.models.aptitude import QuizAttempt

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("/dashboard")
def get_dashboard_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get comprehensive analytics for the dashboard."""
    # Coding stats
    all_submissions = db.query(CodingSubmission).filter(
        CodingSubmission.user_id == current_user.id
    ).all()
    solved = [s for s in all_submissions if s.status == "solved"]

    # Last 7 days activity
    seven_days_ago = datetime.utcnow() - timedelta(days=7)
    recent = [s for s in all_submissions if s.submitted_at >= seven_days_ago]

    # Daily breakdown for last 30 days
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    daily_data = {}
    for i in range(30):
        date = (datetime.utcnow() - timedelta(days=i)).strftime("%Y-%m-%d")
        daily_data[date] = {"date": date, "codingProblems": 0, "aptitudeQuestions": 0, "studyHours": 0, "interviewPractice": 0}

    for s in all_submissions:
        if s.submitted_at >= thirty_days_ago:
            date = s.submitted_at.strftime("%Y-%m-%d")
            if date in daily_data:
                daily_data[date]["codingProblems"] += 1

    # Quiz stats
    quizzes = db.query(QuizAttempt).filter(
        QuizAttempt.user_id == current_user.id
    ).all()
    avg_quiz_score = (
        sum(q.score for q in quizzes) / len(quizzes) if quizzes else 0
    )

    # Topic mastery
    solved_problem_ids = [s.problem_id for s in solved]
    topic_stats = {}
    if solved_problem_ids:
        problems = db.query(CodingProblem).filter(
            CodingProblem.id.in_(solved_problem_ids)
        ).all()
        for p in problems:
            for tag in (p.tags or []):
                if tag not in topic_stats:
                    topic_stats[tag] = 0
                topic_stats[tag] += 1

    total_problems = db.query(CodingProblem).filter(CodingProblem.is_active == True).count()

    # Drives
    from app.models.notification import Notification
    drives = db.query(Notification).filter(
        Notification.type == "drive", Notification.is_global == True
    ).order_by(Notification.created_at.desc()).limit(5).all()

    upcoming_drives = [
        {
            "id": str(d.id),
            "company": d.meta_data.get("company", d.title.split()[0]) if d.meta_data else d.title.split()[0],
            "title": d.title,
            "deadline": d.meta_data.get("deadline", "2026-09-15") if d.meta_data else "2026-09-15",
            "type": "off-campus",
        }
        for d in drives
    ]

    return {
        "coding": {
            "total_solved": len(solved),
            "total_problems": total_problems,
            "solve_rate": round(len(solved) / total_problems * 100, 1) if total_problems else 0,
            "weekly_solved": len(recent),
        },
        "aptitude": {
            "total_quizzes": len(quizzes),
            "avg_score": round(avg_quiz_score, 1),
            "total_questions": sum(q.total_questions for q in quizzes),
        },
        "interview_score": None,
        "resume_score": None,
        "streak": {
            "current": current_user.streak,
            "longest": current_user.longest_streak,
        },
        "xp": {
            "total": current_user.xp,
            "level": current_user.level,
            "progress": current_user.xp % 500,
        },
        "dailyActivity": sorted(daily_data.values(), key=lambda x: x["date"]),
        "topicMastery": [
            {"topic": k, "solved": v, "total": 10, "accuracy": round((v / 10) * 100) if v > 0 else 0} for k, v in sorted(
                topic_stats.items(), key=lambda x: x[1], reverse=True
            )[:10]
        ],
        "upcomingDrives": upcoming_drives,
    }

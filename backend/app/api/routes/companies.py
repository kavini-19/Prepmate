from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional
from pydantic import BaseModel

from app.core.database import get_db
from app.core.deps import get_current_user, get_current_admin
from app.models.user import User
from app.models.company import Company, PlacementDrive

router = APIRouter(prefix="/companies", tags=["Companies"])


@router.get("/")
def list_companies(
    search: Optional[str] = None,
    tier: Optional[str] = None,
    difficulty: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(Company).filter(Company.is_active == True)
    if search:
        query = query.filter(Company.name.ilike(f"%{search}%"))
    if tier:
        query = query.filter(Company.tier == tier)
    if difficulty:
        query = query.filter(Company.difficulty == difficulty)

    companies = query.order_by(Company.name).all()
    return [
        {
            "id": str(c.id), "name": c.name, "slug": c.slug, "logo": c.logo,
            "industry": c.industry, "tier": c.tier, "difficulty": c.difficulty,
            "avgPackage": c.avg_package,
            "codingTopics": c.coding_topics or [],
            "interviewRounds": [r.get("name") for r in (c.interview_rounds or [])] if isinstance(c.interview_rounds, list) else [],
            "interviewExperiences": c.interview_experiences or []
        }
        for c in companies
    ]


@router.get("/{slug}")
def get_company(
    slug: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    company = db.query(Company).filter(Company.slug == slug, Company.is_active == True).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")

    drives = db.query(PlacementDrive).filter(
        PlacementDrive.company_id == company.id, PlacementDrive.is_active == True
    ).all()

    return {
        "id": str(company.id), "name": company.name, "slug": company.slug,
        "logo": company.logo, "industry": company.industry, "tier": company.tier,
        "difficulty": company.difficulty, "avgPackage": company.avg_package,
        "website": company.website, "description": company.description,
        "interviewRounds": [r.get("name") for r in (company.interview_rounds or [])] if isinstance(company.interview_rounds, list) else [],
        "codingTopics": company.coding_topics or [],
        "aptitudeTopics": company.aptitude_topics or [],
        "hrQuestions": company.hr_questions or [],
        "technicalTopics": company.technical_topics or [],
        "interviewExperiences": company.interview_experiences or [],
        "upcomingDrives": [
            {
                "id": str(d.id), "title": d.title, "type": d.type,
                "deadline": d.deadline.isoformat() if d.deadline else None,
                "apply_link": d.apply_link,
            }
            for d in drives
        ],
    }


@router.get("/drives/upcoming")
def get_upcoming_drives(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get all upcoming placement drives."""
    from datetime import datetime
    drives = db.query(PlacementDrive).filter(
        PlacementDrive.is_active == True,
        PlacementDrive.deadline >= datetime.utcnow()
    ).order_by(PlacementDrive.deadline).limit(10).all()

    result = []
    for d in drives:
        company = db.query(Company).filter(Company.id == d.company_id).first()
        result.append({
            "id": str(d.id), "title": d.title, "type": d.type,
            "company": company.name if company else "Unknown",
            "company_logo": company.logo if company else None,
            "deadline": d.deadline.isoformat() if d.deadline else None,
            "apply_link": d.apply_link,
        })
    return result

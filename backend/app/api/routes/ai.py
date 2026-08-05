from fastapi import APIRouter, Depends, HTTPException
from app.core.deps import get_current_user
from app.models.user import User
from app.schemas.ai import (
    ChatRequest, ChatResponse, RoadmapRequest, RoadmapResponse,
    ResumeAnalyzeRequest, EvaluateAnswerRequest, CodeAnalysisRequest,
    StudyPlanRequest, ResumeBuildRequest, CoverLetterRequest,
)
from app.services import ai_service

router = APIRouter(prefix="/ai", tags=["AI"])


@router.post("/chat", response_model=ChatResponse)
async def chat(
    payload: ChatRequest,
    current_user: User = Depends(get_current_user),
):
    """AI chatbot for placement Q&A."""
    try:
        response = await ai_service.chat_with_ai(payload.messages, payload.context)
        return ChatResponse(response=response)
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI service error: {str(e)}")


@router.post("/roadmap", response_model=RoadmapResponse)
async def generate_roadmap(
    payload: RoadmapRequest,
    current_user: User = Depends(get_current_user),
):
    """Generate a personalized learning roadmap."""
    try:
        roadmap = await ai_service.generate_roadmap(
            target_company=payload.target_company,
            current_level=payload.current_level,
            study_hours=payload.study_hours,
            skills=payload.skills,
            time_weeks=payload.time_weeks,
        )
        return RoadmapResponse(roadmap=roadmap)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/resume-analyze")
async def analyze_resume(
    payload: ResumeAnalyzeRequest,
    current_user: User = Depends(get_current_user),
):
    """Analyze resume and return ATS score and feedback."""
    try:
        analysis = await ai_service.analyze_resume(payload.text, payload.job_description)
        return analysis
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/evaluate-answer")
async def evaluate_answer(
    payload: EvaluateAnswerRequest,
    current_user: User = Depends(get_current_user),
):
    """Evaluate an interview answer."""
    try:
        result = await ai_service.evaluate_interview_answer(
            payload.question, payload.answer, payload.type
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/analyze-code")
async def analyze_code(
    payload: CodeAnalysisRequest,
    current_user: User = Depends(get_current_user),
):
    """Analyze code for bugs and improvements."""
    try:
        result = await ai_service.analyze_code(
            payload.code, payload.language, payload.problem_statement
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/study-plan")
async def generate_study_plan(
    payload: StudyPlanRequest,
    current_user: User = Depends(get_current_user),
):
    """Generate a structured study plan."""
    try:
        plan = await ai_service.generate_study_plan(
            target_company=payload.target_company,
            days_available=payload.days_available,
            hours_per_day=payload.hours_per_day,
            weak_topics=payload.weak_topics,
            target_role=payload.target_role or "Software Engineer",
        )
        return plan
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/build-resume")
async def build_resume(
    payload: ResumeBuildRequest,
    current_user: User = Depends(get_current_user),
):
    """Generate a professional resume."""
    try:
        resume = await ai_service.build_resume(payload.model_dump())
        return {"resume": resume}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/cover-letter")
async def generate_cover_letter(
    payload: CoverLetterRequest,
    current_user: User = Depends(get_current_user),
):
    """Generate a personalized cover letter."""
    try:
        letter = await ai_service.generate_cover_letter(
            job_title=payload.job_title,
            company=payload.company,
            skills=payload.skills,
            experience=payload.experience,
            name=payload.name,
            tone=payload.tone,
        )
        return {"letter": letter}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/interview-question")
async def get_interview_question(
    domain: str,
    difficulty: str = "Medium",
    topic: str = "General",
    current_user: User = Depends(get_current_user),
):
    """Generate an AI interview question."""
    try:
        question = await ai_service.generate_interview_question(domain, difficulty, topic)
        return question
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

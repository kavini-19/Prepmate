from pydantic import BaseModel
from typing import Optional, List, Dict, Any


class ChatMessage(BaseModel):
    role: str  # "user" or "assistant"
    content: str


class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    context: Optional[str] = None


class ChatResponse(BaseModel):
    response: str


class RoadmapRequest(BaseModel):
    target_company: str
    current_level: str  # beginner, intermediate, advanced
    study_hours: float
    skills: List[str] = []
    time_weeks: int = 8


class RoadmapResponse(BaseModel):
    roadmap: str


class ResumeAnalyzeRequest(BaseModel):
    text: str
    job_description: Optional[str] = None


class EvaluateAnswerRequest(BaseModel):
    question: str
    answer: str
    type: str  # hr, technical


class CodeAnalysisRequest(BaseModel):
    code: str
    language: str
    problem_statement: Optional[str] = None


class StudyPlanRequest(BaseModel):
    target_company: str
    days_available: int
    hours_per_day: float
    weak_topics: List[str] = []
    target_role: Optional[str] = "Software Engineer"


class ResumeBuildRequest(BaseModel):
    name: str
    email: str
    phone: Optional[str] = None
    linkedin: Optional[str] = None
    github: Optional[str] = None
    summary: Optional[str] = None
    education: List[Dict[str, Any]] = []
    experience: List[Dict[str, Any]] = []
    projects: List[Dict[str, Any]] = []
    skills: List[str] = []
    certifications: List[str] = []


class CoverLetterRequest(BaseModel):
    job_title: str
    company: str
    skills: List[str] = []
    experience: str
    name: str
    tone: str = "professional"  # professional, enthusiastic, concise

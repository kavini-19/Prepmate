from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
import uuid


class CodingProblemCreate(BaseModel):
    title: str = Field(..., min_length=3, max_length=300)
    slug: str
    difficulty: str = Field(..., pattern="^(Easy|Medium|Hard)$")
    tags: List[str] = []
    description: str
    examples: List[dict] = []
    constraints: List[str] = []
    hints: List[str] = []
    solution: Optional[str] = None
    solution_explanation: Optional[str] = None
    companies: List[str] = []


class CodingProblemResponse(BaseModel):
    id: uuid.UUID
    title: str
    slug: str
    difficulty: str
    tags: List[str]
    description: str
    examples: List[dict]
    constraints: List[str]
    hints: List[str]
    companies: List[str]
    acceptance_rate: float
    total_submissions: int
    is_bookmarked: Optional[bool] = False
    is_solved: Optional[bool] = False

    class Config:
        from_attributes = True


class CodingProblemDetail(CodingProblemResponse):
    solution: Optional[str] = None
    solution_explanation: Optional[str] = None


class SubmissionCreate(BaseModel):
    problem_id: uuid.UUID
    code: Optional[str] = None
    language: str = "python"
    status: str = Field(..., pattern="^(solved|attempted|skipped)$")
    time_taken: Optional[int] = None


class ProblemListParams(BaseModel):
    page: int = 1
    page_size: int = 20
    difficulty: Optional[str] = None
    tag: Optional[str] = None
    search: Optional[str] = None
    solved: Optional[bool] = None
    bookmarked: Optional[bool] = None


class CodeRunRequest(BaseModel):
    problem_id: uuid.UUID
    code: str
    language: str = "Python"


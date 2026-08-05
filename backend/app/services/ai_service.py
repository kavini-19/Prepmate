"""AI Service - integrates Google Gemini for all AI features."""
import json
from typing import List, Optional
from app.core.config import settings
from app.schemas.ai import ChatMessage

try:
    import google.generativeai as genai
    if settings.GEMINI_API_KEY:
        genai.configure(api_key=settings.GEMINI_API_KEY)
    GEMINI_AVAILABLE = bool(settings.GEMINI_API_KEY)
except ImportError:
    GEMINI_AVAILABLE = False


DEFAULT_MODEL = "gemini-3.6-flash"
FALLBACK_MODELS = ["gemini-3.6-flash", "gemini-2.0-flash-lite", "gemini-flash-latest"]


def _get_model(model_name: str = DEFAULT_MODEL, system_instruction: Optional[str] = None):
    """Get Gemini model instance."""
    if not GEMINI_AVAILABLE:
        raise RuntimeError("Gemini API not configured. Set GEMINI_API_KEY in .env")
    import google.generativeai as genai
    if system_instruction:
        return genai.GenerativeModel(model_name, system_instruction=system_instruction)
    return genai.GenerativeModel(model_name)


def _generate_content_with_fallback(prompt: str, generation_config: Optional[dict] = None):
    """Generate content using FALLBACK_MODELS list if primary model hits rate limit or errors."""
    last_exception = None
    for model_name in FALLBACK_MODELS:
        try:
            model = _get_model(model_name=model_name)
            if generation_config:
                return model.generate_content(prompt, generation_config=generation_config)
            return model.generate_content(prompt)
        except Exception as e:
            last_exception = e
            continue

    if last_exception:
        raise last_exception
    raise RuntimeError("Failed to generate AI content.")


async def chat_with_ai(messages: List[ChatMessage], context: Optional[str] = None) -> str:
    """General-purpose AI chat for placement Q&A."""
    if not messages:
        raise ValueError("No messages provided")

    system_prompt = """You are PrepMate AI, an expert placement preparation assistant.
You help students with:
- Coding problems (DSA, algorithms, complexity analysis)
- Aptitude questions (quantitative, logical, verbal)
- Interview preparation (HR and technical)
- Resume building and optimization
- Company-specific preparation

Be concise, accurate, and encouraging. Format code with markdown code blocks.
"""
    history = []
    for msg in messages[:-1]:
        history.append({
            "role": "user" if msg.role == "user" else "model",
            "parts": [msg.content],
        })

    last_msg = messages[-1]
    last_exception = None

    for model_name in FALLBACK_MODELS:
        try:
            model = _get_model(model_name=model_name, system_instruction=system_prompt)
            chat = model.start_chat(history=history)
            response = chat.send_message(last_msg.content)
            return response.text
        except Exception as e:
            last_exception = e
            continue

    if last_exception:
        raise last_exception
    raise RuntimeError("Failed to generate AI response.")


async def generate_roadmap(
    target_company: str,
    current_level: str,
    study_hours: float,
    skills: List[str],
    time_weeks: int,
) -> str:
    """Generate a personalized learning roadmap."""
    prompt = f"""Create a detailed {time_weeks}-week placement preparation roadmap for a student.

Target Company: {target_company}
Current Level: {current_level}
Available Study Hours/Day: {study_hours}
Current Skills: {', '.join(skills) if skills else 'Basic programming'}

Generate a structured weekly plan with:
1. Weekly goals and milestones
2. Daily topic breakdown (DSA, aptitude, interview prep)
3. Recommended resources and practice problems
4. Mock interview schedule
5. Company-specific tips

Format as markdown with clear week-by-week structure."""

    response = _generate_content_with_fallback(prompt)
    return response.text


async def analyze_resume(text: str, job_description: Optional[str] = None) -> dict:
    """Analyze resume and return structured feedback."""
    prompt = f"""Analyze this resume for a software engineering position and provide detailed feedback.

Resume Text:
{text}

{f'Job Description: {job_description}' if job_description else ''}

Analyze and return a JSON object with these exact fields:
{{
  "ats_score": <0-100>,
  "grammar_score": <0-100>,
  "keyword_score": <0-100>,
  "formatting_score": <0-100>,
  "overall_score": <0-100>,
  "strengths": ["list of strengths"],
  "weaknesses": ["list of weaknesses"],
  "suggestions": ["actionable improvement suggestions"],
  "missing_skills": ["important missing skills"],
  "keywords": [{{"word": "skill/keyword", "found": true/false}}],
  "sections": [
    {{"name": "Summary", "present": true/false, "score": 0-100, "suggestions": []}},
    {{"name": "Education", "present": true/false, "score": 0-100, "suggestions": []}},
    {{"name": "Experience", "present": true/false, "score": 0-100, "suggestions": []}},
    {{"name": "Projects", "present": true/false, "score": 0-100, "suggestions": []}},
    {{"name": "Skills", "present": true/false, "score": 0-100, "suggestions": []}}
  ]
}}

Return ONLY valid JSON, no other text."""

    response = _generate_content_with_fallback(
        prompt,
        generation_config={"response_mime_type": "application/json"}
    )
    try:
        return json.loads(response.text)
    except json.JSONDecodeError:
        return {
            "ats_score": 60, "grammar_score": 70, "keyword_score": 55,
            "formatting_score": 65, "overall_score": 62,
            "strengths": ["Good structure"], "weaknesses": ["Could improve keywords"],
            "suggestions": ["Add more quantifiable achievements"],
            "missing_skills": ["Docker", "System Design"],
            "keywords": [{"word": "Python", "found": True}],
            "sections": []
        }


async def evaluate_interview_answer(question: str, answer: str, interview_type: str) -> dict:
    """Evaluate an interview answer and return feedback."""
    prompt = f"""Evaluate this {interview_type} interview answer and provide structured feedback.

Question: {question}
Candidate's Answer: {answer}

Return a JSON object:
{{
  "score": <0-100>,
  "feedback": "detailed feedback paragraph",
  "strengths": ["what was good"],
  "improvements": ["what to improve"],
  "tips": ["specific actionable tips"],
  "sample_answer": "brief example of a stronger answer",
  "confidence_indicators": ["positive signals in the answer"],
  "grammar_issues": ["any grammar/clarity issues"]
}}

Return ONLY valid JSON."""

    response = _generate_content_with_fallback(
        prompt,
        generation_config={"response_mime_type": "application/json"}
    )
    try:
        return json.loads(response.text)
    except json.JSONDecodeError:
        return {
            "score": 70, "feedback": "Good answer with room for improvement.",
            "strengths": ["Clear communication"], "improvements": ["Add specific examples"],
            "tips": ["Use the STAR method"], "sample_answer": "",
            "confidence_indicators": [], "grammar_issues": []
        }


async def analyze_code(code: str, language: str, problem_statement: Optional[str] = None) -> dict:
    """Analyze code for bugs, complexity, and improvements."""
    prompt = f"""Analyze this {language} code as an expert software engineer.

{f'Problem: {problem_statement}' if problem_statement else ''}

Code:
```{language}
{code}
```

Return a JSON object:
{{
  "bugs": ["list of bugs found"],
  "time_complexity": "O(...) with explanation",
  "space_complexity": "O(...) with explanation",
  "optimizations": ["specific optimization suggestions with code examples"],
  "best_practices": ["best practice violations and how to fix them"],
  "code_quality_score": <0-100>,
  "overall_feedback": "summary paragraph",
  "improved_code": "optimized version of the code if applicable"
}}

Return ONLY valid JSON."""

    response = _generate_content_with_fallback(
        prompt,
        generation_config={"response_mime_type": "application/json"}
    )
    try:
        return json.loads(response.text)
    except json.JSONDecodeError:
        return {
            "bugs": [], "time_complexity": "O(n)", "space_complexity": "O(1)",
            "optimizations": ["Consider using a hashmap for O(1) lookup"],
            "best_practices": ["Add docstrings"], "code_quality_score": 75,
            "overall_feedback": "Code is correct but can be optimized.",
            "improved_code": code
        }


async def generate_study_plan(
    target_company: str,
    days_available: int,
    hours_per_day: float,
    weak_topics: List[str],
    target_role: str = "Software Engineer",
) -> dict:
    """Generate a structured daily/weekly study plan."""
    prompt = f"""Create a detailed study plan for placement preparation.

Target Company: {target_company}
Target Role: {target_role}
Days Available: {days_available}
Hours Per Day: {hours_per_day}
Weak Topics: {', '.join(weak_topics) if weak_topics else 'None identified'}

Return a JSON object:
{{
  "overview": "brief plan overview",
  "weekly_goals": ["week 1 goal", "week 2 goal", ...],
  "daily_schedule": {{
    "Morning (1h)": "activity",
    "Afternoon (1h)": "activity",
    "Evening (1h)": "activity"
  }},
  "topic_priority": [
    {{"topic": "name", "priority": "high/medium/low", "days_needed": 3, "resources": ["resource1"]}}
  ],
  "milestones": [
    {{"day": 7, "target": "milestone description"}}
  ],
  "daily_tasks": {{
    "Monday": [{{"title": "task", "type": "coding/aptitude/interview", "duration": 60, "priority": "high"}}],
    "Tuesday": [],
    "Wednesday": [],
    "Thursday": [],
    "Friday": [],
    "Saturday": [],
    "Sunday": []
  }}
}}

Return ONLY valid JSON."""

    response = _generate_content_with_fallback(
        prompt,
        generation_config={"response_mime_type": "application/json"}
    )
    try:
        return json.loads(response.text)
    except json.JSONDecodeError:
        return {"overview": "Study plan generated", "weekly_goals": [], "daily_tasks": {}}


async def build_resume(data: dict) -> str:
    """Generate a professional resume in markdown format."""
    prompt = f"""Create a professional ATS-optimized resume in markdown format for a software engineering position.

Candidate Data:
{json.dumps(data, indent=2)}

Generate a clean, professional resume with proper sections. 
Use action verbs, quantify achievements where possible.
Return ONLY the resume in markdown format."""

    response = _generate_content_with_fallback(prompt)
    return response.text


async def generate_cover_letter(
    job_title: str,
    company: str,
    skills: List[str],
    experience: str,
    name: str,
    tone: str = "professional",
) -> str:
    """Generate a personalized cover letter."""
    prompt = f"""Write a compelling {tone} cover letter for a software engineering position.

Position: {job_title}
Company: {company}
Candidate Name: {name}
Key Skills: {', '.join(skills)}
Experience Summary: {experience}

Requirements:
- 3-4 paragraphs
- Highlight relevant skills and experience
- Show genuine interest in the company
- End with a strong call to action
- Professional tone, avoid generic phrases

Return ONLY the cover letter text."""

    response = _generate_content_with_fallback(prompt)
    return response.text


async def generate_interview_question(domain: str, difficulty: str, topic: str) -> dict:
    """Generate a technical interview question."""
    prompt = f"""Generate a {difficulty} level {domain} interview question about {topic}.

Return a JSON object:
{{
  "question": "the interview question",
  "hints": ["hint 1", "hint 2"],
  "key_points": ["what to cover in the answer"],
  "sample_answer": "a good answer to this question",
  "follow_up_questions": ["follow up 1", "follow up 2"]
}}

Return ONLY valid JSON."""

    response = _generate_content_with_fallback(
        prompt,
        generation_config={"response_mime_type": "application/json"}
    )
    try:
        return json.loads(response.text)
    except json.JSONDecodeError:
        return {
            "question": f"Explain the core concepts of {topic} in {domain}.",
            "hints": ["Think about the fundamentals"],
            "key_points": ["Cover the basics"],
            "sample_answer": "A comprehensive answer would cover...",
            "follow_up_questions": []
        }


async def generate_aptitude_question_data(category: str, difficulty: str) -> dict:
    """Generate a structured aptitude question for the database."""
    prompt = f"""Generate a new {difficulty} difficulty aptitude question for the category: {category}.
    
    Requirements:
    - Return a JSON object matching this schema exactly.
    - Options must be an array of exactly 4 strings.
    - Correct answer must be an integer index (0-3) pointing to the right option.
    - Time limit is in seconds.

    Return a JSON object:
    {{
      "category": "{category}",
      "difficulty": "{difficulty}",
      "question": "The question text",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct_answer": 1,
      "explanation": "Step by step explanation of the correct answer.",
      "time_limit": 60,
      "tags": ["tag1", "tag2"]
    }}

    Return ONLY valid JSON."""

    response = _generate_content_with_fallback(
        prompt,
        generation_config={"response_mime_type": "application/json"}
    )
    try:
        return json.loads(response.text)
    except json.JSONDecodeError:
        raise RuntimeError("Failed to parse JSON from AI model")


async def generate_coding_problem_data(topic: str, difficulty: str) -> dict:
    """Generate a structured coding problem for the database."""
    prompt = f"""Generate a new {difficulty} difficulty data structures and algorithms coding problem for the topic: {topic}.
    
    Requirements:
    - Return a JSON object matching this schema exactly.
    - Provide at least 2 examples with input/output and explanation.
    - Provide realistic constraints (e.g., "1 <= nums.length <= 10^4").
    - Provide a python solution string.
    - Generate a title and a unique URL-friendly slug based on the title.

    Return a JSON object:
    {{
      "title": "Problem Title",
      "slug": "problem-title",
      "difficulty": "{difficulty}",
      "tags": ["{topic}", "tag2"],
      "description": "Problem description in markdown",
      "examples": [
        {{"input": "nums = [1,2,3]", "output": "6", "explanation": "1+2+3=6"}}
      ],
      "constraints": [
        "1 <= nums.length <= 1000"
      ],
      "hints": ["Hint 1", "Hint 2"],
      "solution": "def solve(nums):\\n    return sum(nums)",
      "solution_explanation": "Explanation of the solution",
      "companies": ["Google", "Amazon"]
    }}

    Return ONLY valid JSON."""

    response = _generate_content_with_fallback(
        prompt,
        generation_config={"response_mime_type": "application/json"}
    )
    try:
        return json.loads(response.text)
    except json.JSONDecodeError:
        raise RuntimeError("Failed to parse JSON from AI model")


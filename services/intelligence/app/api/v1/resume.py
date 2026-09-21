"""
Module 1: AI Recruiter & ATS Resume Intelligence API Endpoints.
Provides 16-step screening, 14-dimension ATS analysis, Google X-Y-Z bullet optimization,
and Recruiter qualitative commentary via meta/muse-glimmer-30b.
"""
from typing import Dict, Any, Tuple, List, Optional
from app.core.ai.nvidia_client import ai_model_service
from app.server.standalone_server import api_router

def handle_parse_and_screen(
    body: Dict[str, Any],
    headers: Dict[str, str],
    params: Dict[str, str]
) -> Tuple[int, Dict[str, Any]]:
    """Executes Module 1 16-step screening and 14-dimension ATS analysis."""
    resume_text = body.get("resume_text") or body.get("document_text", "")
    jd_text = body.get("jd_text") or body.get("job_description", "")
    target_company = body.get("target_company", "FAANG")
    target_role = body.get("target_role", "Principal AI & Distributed Systems Architect")

    if not resume_text:
        return 400, {"error": "Missing required 'resume_text' in request body"}

    result = ai_model_service.screen_and_parse_resume(
        resume_text=resume_text,
        jd_text=jd_text,
        target_company=target_company,
        target_role=target_role
    )
    return 200, {"status": "success", "data": result}

def handle_optimize_bullets(
    body: Dict[str, Any],
    headers: Dict[str, str],
    params: Dict[str, str]
) -> Tuple[int, Dict[str, Any]]:
    """Executes Google X-Y-Z dynamic bullet point optimization."""
    bullets = body.get("bullets", [])
    if isinstance(bullets, str):
        bullets = [bullets]
    jd_text = body.get("jd_text", "")
    target_role = body.get("target_role", "Principal AI & Distributed Systems Architect")

    if not bullets:
        return 400, {"error": "Missing required 'bullets' list in request body"}

    optimized = ai_model_service.optimize_resume_bullets(
        original_bullets=bullets,
        jd_text=jd_text,
        target_role=target_role
    )
    return 200, {"status": "success", "optimized_bullets": optimized}

def handle_recruiter_feedback(
    body: Dict[str, Any],
    headers: Dict[str, str],
    params: Dict[str, str]
) -> Tuple[int, Dict[str, Any]]:
    """Generates AI Recruiter commentary and actionable tips."""
    candidate_name = body.get("candidate_name", "Vishnu Sharma")
    skills = body.get("skills", ["Python", "PyTorch", "FastAPI", "Qdrant"])
    role = body.get("role", "Principal AI & Distributed Systems Architect")
    ats_score = int(body.get("ats_score", 92))
    missing_skills = body.get("missing_skills", ["Docker", "AWS (S3, EC2)", "CI/CD"])

    feedback = ai_model_service.generate_recruiter_feedback(
        candidate_name=candidate_name,
        skills=skills,
        role=role,
        ats_score=ats_score,
        missing_skills=missing_skills
    )
    return 200, {"status": "success", "feedback": feedback}

# Register routes with standalone API router
api_router.add_route("POST", "/api/v1/resume/parse-and-screen", handle_parse_and_screen)
api_router.add_route("POST", "/api/v1/resume/optimize-bullets", handle_optimize_bullets)
api_router.add_route("POST", "/api/v1/resume/recruiter-feedback", handle_recruiter_feedback)

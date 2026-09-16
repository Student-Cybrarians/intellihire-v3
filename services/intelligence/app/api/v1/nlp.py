"""
NLP entity extraction and skill normalization API endpoints.
"""
from typing import Dict, Any, Tuple
from app.schemas.nlp import ExtractEntitiesRequest, NormalizeSkillsRequest
from app.core.nlp_engine import nlp_engine
from app.taxonomy.taxonomy_manager import taxonomy_manager
from app.server.standalone_server import api_router

def handle_extract_entities(body: Dict[str, Any], headers: Dict[str, str], params: Dict[str, str]) -> Tuple[int, Dict[str, Any]]:
    req = ExtractEntitiesRequest.model_validate(body)
    resp = nlp_engine.extract_entities(req)
    return 200, resp.model_dump()

def handle_normalize_skills(body: Dict[str, Any], headers: Dict[str, str], params: Dict[str, str]) -> Tuple[int, Dict[str, Any]]:
    req = NormalizeSkillsRequest.model_validate(body)
    resp = nlp_engine.normalize_skills(req)
    return 200, resp.model_dump()

def handle_get_taxonomy(body: Dict[str, Any], headers: Dict[str, str], params: Dict[str, str]) -> Tuple[int, Dict[str, Any]]:
    skills = taxonomy_manager.get_all_skills()
    careers = taxonomy_manager.get_career_hierarchy()
    return 200, {
        "total_canonical_skills": len(skills),
        "career_categories": careers,
        "skills": skills
    }

api_router.add_route("POST", "/api/v1/nlp/extract", handle_extract_entities)
api_router.add_route("POST", "/api/v1/nlp/normalize-skills", handle_normalize_skills)
api_router.add_route("GET", "/api/v1/nlp/taxonomy", handle_get_taxonomy)

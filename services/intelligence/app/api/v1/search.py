"""
Dense Semantic Search & Hybrid RAG API endpoints.
"""
from typing import Dict, Any, Tuple
from app.schemas.search import HybridSearchRequest, IndexCandidateDocumentRequest
from app.core.hybrid_search import hybrid_search_engine
from app.server.standalone_server import api_router

def handle_hybrid_search(body: Dict[str, Any], headers: Dict[str, str], params: Dict[str, str]) -> Tuple[int, Dict[str, Any]]:
    req = HybridSearchRequest.model_validate(body)
    resp = hybrid_search_engine.search(req)
    return 200, resp.model_dump()

def handle_index_candidate(body: Dict[str, Any], headers: Dict[str, str], params: Dict[str, str]) -> Tuple[int, Dict[str, Any]]:
    req = IndexCandidateDocumentRequest.model_validate(body)
    resp = hybrid_search_engine.index_candidate(req)
    return 200, resp.model_dump()

api_router.add_route("POST", "/api/v1/search/hybrid", handle_hybrid_search)
api_router.add_route("POST", "/api/v1/search/index-candidate", handle_index_candidate)

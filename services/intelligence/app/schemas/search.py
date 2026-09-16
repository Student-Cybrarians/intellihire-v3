"""
Dense Semantic Search & Hybrid RAG Schema Models.
"""
from typing import Dict, Any, List, Optional
from app.schemas.base import BaseModel

class HybridSearchFilter(BaseModel):
    tenant_id: str
    job_id: Optional[str] = None
    min_years_experience: Optional[float] = None
    required_skills: List[str] = []
    seniority_levels: List[str] = []
    location: Optional[str] = None

class HybridSearchRequest(BaseModel):
    query: str
    tenant_id: str = "default_tenant"
    top_k: int = 10
    dense_weight: float = 0.6  # 0.0 to 1.0 (semantic vs BM25)
    rrf_k: int = 60            # Reciprocal Rank Fusion constant
    filters: Optional[HybridSearchFilter] = None
    highlight_terms: bool = True

class SearchResultCandidate(BaseModel):
    candidate_id: str
    tenant_id: str
    score: float               # Combined RRF or weighted score
    dense_score: float = 0.0
    sparse_score: float = 0.0
    dense_rank: int = 0
    sparse_rank: int = 0
    name: str = ""
    target_role: str = ""
    matched_skills: List[str] = []
    missing_skills: List[str] = []
    snippet: str = ""
    experience_years: float = 0.0

class HybridSearchResponse(BaseModel):
    query: str
    tenant_id: str
    total_hits: int
    results: List[SearchResultCandidate] = []
    search_latency_ms: float = 0.0

class IndexCandidateDocumentRequest(BaseModel):
    candidate_id: str
    tenant_id: str
    name: str
    raw_text: str
    skills: List[str] = []
    target_role: str = ""
    experience_years: float = 0.0
    seniority: str = "mid_level"
    metadata: Optional[Dict[str, Any]] = None

class IndexCandidateDocumentResponse(BaseModel):
    success: bool
    candidate_id: str
    tenant_id: str
    vector_indexed: bool
    sparse_indexed: bool

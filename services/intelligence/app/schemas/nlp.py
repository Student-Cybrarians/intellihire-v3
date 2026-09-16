"""
NLP Candidate Structuring & Taxonomy Schema Models.
"""
from typing import Dict, Any, List, Optional
from app.schemas.base import BaseModel

class ProvenanceSpan(BaseModel):
    start_char: int
    end_char: int
    matched_text: str
    source_block_index: Optional[int] = None
    page_number: int = 1
    confidence: float = 1.0

class SkillEntity(BaseModel):
    raw_name: str
    canonical_id: str
    canonical_name: str
    category: str  # e.g., "Languages", "Frameworks", "Databases", "Cloud & DevOps", "Architecture"
    domain: str    # e.g., "Software Engineering", "Data & AI", "Cybersecurity"
    proficiency_level: str = "intermediate"  # "beginner", "intermediate", "advanced", "expert"
    years_experience: Optional[float] = None
    provenance: List[ProvenanceSpan] = []
    weight: float = 1.0

class EducationEntity(BaseModel):
    institution: str
    degree: str  # "Bachelor's", "Master's", "PhD", "Associate", "Certification"
    field_of_study: Optional[str] = None
    start_year: Optional[int] = None
    end_year: Optional[int] = None
    grade_or_gpa: Optional[str] = None
    provenance: List[ProvenanceSpan] = []

class ExperienceEntity(BaseModel):
    company: str
    role_title: str
    start_date: Optional[str] = None
    end_date: Optional[str] = None  # "Present" or ISO date
    is_current: bool = False
    duration_months: Optional[int] = None
    key_responsibilities: List[str] = []
    skills_demonstrated: List[str] = []
    provenance: List[ProvenanceSpan] = []

class ProjectEntity(BaseModel):
    name: str
    description: str
    technologies_used: List[str] = []
    url: Optional[str] = None
    provenance: List[ProvenanceSpan] = []

class ExtractEntitiesRequest(BaseModel):
    text: str
    tenant_id: str = "default_tenant"
    candidate_id: Optional[str] = None
    include_provenance: bool = True
    normalize_skills: bool = True

class ExtractEntitiesResponse(BaseModel):
    candidate_id: Optional[str] = None
    tenant_id: str
    skills: List[SkillEntity] = []
    education: List[EducationEntity] = []
    experience: List[ExperienceEntity] = []
    projects: List[ProjectEntity] = []
    total_years_experience: float = 0.0
    seniority_estimate: str = "mid_level"  # "entry_level", "junior", "mid_level", "senior", "lead", "principal"
    extraction_latency_ms: float = 0.0

class NormalizeSkillsRequest(BaseModel):
    skill_names: List[str]
    context_domain: Optional[str] = None

class NormalizedSkillItem(BaseModel):
    query: str
    canonical_id: str
    canonical_name: str
    category: str
    domain: str
    match_type: str  # "exact", "alias", "fuzzy", "hierarchical", "unrecognized"
    confidence: float

class NormalizeSkillsResponse(BaseModel):
    normalized_skills: List[NormalizedSkillItem] = []

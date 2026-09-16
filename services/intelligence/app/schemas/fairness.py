"""
Model Explainability & Automated Fairness Auditing Schema Models.
"""
from typing import Dict, Any, List, Optional
from app.schemas.base import BaseModel

class FeatureAttribution(BaseModel):
    feature_name: str
    feature_value: Any
    attribution_weight: float   # Signed SHAP-style attribution (-1.0 to +1.0)
    relative_importance_pct: float
    description: str

class FeatureAttributionRequest(BaseModel):
    candidate_id: str
    tenant_id: str = "default_tenant"
    overall_score: float
    feature_values: Dict[str, Any]  # e.g., {"dsa_score": 85, "keyword_match": 90, "experience_years": 4}
    baseline_model_type: str = "linear_surrogate"  # "linear_surrogate", "tree_shap"

class FeatureAttributionResponse(BaseModel):
    candidate_id: str
    overall_score: float
    base_value: float          # Expected baseline score
    attributions: List[FeatureAttribution] = []
    top_positive_factors: List[str] = []
    top_negative_factors: List[str] = []
    plain_english_summary: str = ""

class DemographicGroupMetrics(BaseModel):
    group_name: str
    total_applicants: int
    selected_count: int
    selection_rate: float      # selected_count / total_applicants
    impact_ratio: float        # selection_rate / highest_group_selection_rate
    passes_four_fifths_rule: bool

class DisparateImpactAuditRequest(BaseModel):
    tenant_id: str = "default_tenant"
    job_id: str
    protected_attribute: str   # e.g., "gender", "ethnicity", "age_bracket"
    applicant_data: List[Dict[str, Any]] = []  # List of {"candidate_id": "...", "group": "...", "passed": True/False}
    custom_threshold: float = 0.80

class DisparateImpactAuditResponse(BaseModel):
    tenant_id: str
    job_id: str
    protected_attribute: str
    highest_selection_rate_group: str
    highest_selection_rate: float
    groups: List[DemographicGroupMetrics] = []
    overall_compliant: bool
    regulatory_framework: str = "EEOC Uniform Guidelines (80% Rule) & NYC Local Law 144"
    audit_recommendations: List[str] = []

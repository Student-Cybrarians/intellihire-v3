"""
Model Explainability & Fairness Auditing API endpoints.
"""
from typing import Dict, Any, Tuple
from app.schemas.fairness import FeatureAttributionRequest, DisparateImpactAuditRequest
from app.core.explainability import explainability_engine
from app.core.fairness_auditor import fairness_auditor_engine
from app.server.standalone_server import api_router

def handle_explain_score(body: Dict[str, Any], headers: Dict[str, str], params: Dict[str, str]) -> Tuple[int, Dict[str, Any]]:
    req = FeatureAttributionRequest.model_validate(body)
    resp = explainability_engine.explain_score(req)
    return 200, resp.model_dump()

def handle_audit_disparate_impact(body: Dict[str, Any], headers: Dict[str, str], params: Dict[str, str]) -> Tuple[int, Dict[str, Any]]:
    req = DisparateImpactAuditRequest.model_validate(body)
    resp = fairness_auditor_engine.audit_disparate_impact(req)
    return 200, resp.model_dump()

api_router.add_route("POST", "/api/v1/fairness/explain-score", handle_explain_score)
api_router.add_route("POST", "/api/v1/fairness/audit-disparate-impact", handle_audit_disparate_impact)

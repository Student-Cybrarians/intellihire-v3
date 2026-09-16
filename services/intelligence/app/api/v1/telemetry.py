"""
Psychometric assessment telemetry API endpoints.
"""
from typing import Dict, Any, Tuple
from app.schemas.telemetry import ItemResponseTelemetryEvent, TelemetryBatchRequest
from app.core.telemetry_collector import telemetry_collector_engine
from app.server.standalone_server import api_router

def handle_log_response(body: Dict[str, Any], headers: Dict[str, str], params: Dict[str, str]) -> Tuple[int, Dict[str, Any]]:
    ev = ItemResponseTelemetryEvent.model_validate(body)
    telemetry_collector_engine.log_event(ev)
    return 200, {"success": True, "event_id": ev.event_id}

def handle_log_batch(body: Dict[str, Any], headers: Dict[str, str], params: Dict[str, str]) -> Tuple[int, Dict[str, Any]]:
    req = TelemetryBatchRequest.model_validate(body)
    resp = telemetry_collector_engine.log_batch(req)
    return 200, resp.model_dump()

def handle_get_stats(body: Dict[str, Any], headers: Dict[str, str], params: Dict[str, str]) -> Tuple[int, Dict[str, Any]]:
    tenant_id = params.get("tenant_id", "default_tenant")
    resp = telemetry_collector_engine.get_stats_for_tenant(tenant_id)
    return 200, resp.model_dump()

api_router.add_route("POST", "/api/v1/telemetry/log-response", handle_log_response)
api_router.add_route("POST", "/api/v1/telemetry/batch", handle_log_batch)
api_router.add_route("GET", "/api/v1/telemetry/item-stats/{tenant_id}", handle_get_stats)

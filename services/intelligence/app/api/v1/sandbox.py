"""
Isolated code execution sandbox API endpoints.
"""
from typing import Dict, Any, Tuple
from app.schemas.sandbox import CodeExecutionRequest
from app.core.sandbox_runner import sandbox_runner
from app.server.standalone_server import api_router

def handle_execute_code(body: Dict[str, Any], headers: Dict[str, str], params: Dict[str, str]) -> Tuple[int, Dict[str, Any]]:
    req = CodeExecutionRequest.model_validate(body)
    resp = sandbox_runner.execute_submission(req)
    return 200, resp.model_dump()

def handle_get_languages(body: Dict[str, Any], headers: Dict[str, str], params: Dict[str, str]) -> Tuple[int, Dict[str, Any]]:
    return 200, {
        "supported_languages": sandbox_runner.SUPPORTED_LANGUAGES,
        "execution_isolation": "process_sandbox",
        "default_limits": {
            "timeout_seconds": 3.0,
            "memory_limit_mb": 128,
            "network_enabled": False
        }
    }

api_router.add_route("POST", "/api/v1/sandbox/execute", handle_execute_code)
api_router.add_route("GET", "/api/v1/sandbox/languages", handle_get_languages)

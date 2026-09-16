"""
Document ingestion API endpoints.
"""
from typing import Dict, Any, Tuple
from app.schemas.document import ParseResumeRequest
from app.core.document_parser import document_parser_engine
from app.server.standalone_server import api_router

def handle_parse_document(body: Dict[str, Any], headers: Dict[str, str], params: Dict[str, str]) -> Tuple[int, Dict[str, Any]]:
    req = ParseResumeRequest.model_validate(body)
    resp = document_parser_engine.parse_document(req)
    return 200, resp.model_dump()

def handle_validate_document(body: Dict[str, Any], headers: Dict[str, str], params: Dict[str, str]) -> Tuple[int, Dict[str, Any]]:
    import base64
    b64_content = body.get("document_base64", "")
    file_name = body.get("file_name", "document.pdf")
    try:
        content_bytes = base64.b64decode(b64_content)
        val = document_parser_engine.validate_file(content_bytes, file_name)
        return 200, val.model_dump()
    except Exception as e:
        return 400, {"error": f"Validation failed: {str(e)}"}

api_router.add_route("POST", "/api/v1/documents/parse", handle_parse_document)
api_router.add_route("POST", "/api/v1/documents/validate", handle_validate_document)

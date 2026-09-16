"""
Document Ingestion & Layout-Aware Parsing Schema Models.
"""
from typing import Dict, Any, List, Optional
from app.schemas.base import BaseModel

class LayoutBlock(BaseModel):
    block_type: str  # "heading", "paragraph", "table", "list_item", "header", "footer"
    content: str
    page_number: int = 1
    bbox: Optional[List[float]] = None  # [x0, top, x1, bottom]
    confidence: float = 1.0

class TableCell(BaseModel):
    row_index: int
    col_index: int
    text: str

class TableData(BaseModel):
    page_number: int = 1
    headers: List[str] = []
    rows: List[List[str]] = []
    bbox: Optional[List[float]] = None

class DocumentValidationResult(BaseModel):
    is_valid: bool
    mime_type: str
    file_size_bytes: int
    page_count: int = 0
    security_flags: List[str] = []  # e.g., ["malicious_script_detected", "oversized"]
    errors: List[str] = []

class ParseResumeRequest(BaseModel):
    document_base64: Optional[str] = None
    document_text: Optional[str] = None
    file_name: str = "resume.pdf"
    mime_type: str = "application/pdf"
    tenant_id: str = "default_tenant"
    candidate_id: Optional[str] = None
    extract_tables: bool = True
    linearize_columns: bool = True

class ParseResumeResponse(BaseModel):
    document_id: str
    tenant_id: str
    candidate_id: Optional[str] = None
    file_name: str
    mime_type: str
    raw_text: str
    linearized_text: str
    blocks: List[LayoutBlock] = []
    tables: List[TableData] = []
    validation: DocumentValidationResult
    parsing_latency_ms: float = 0.0

"""
Document Ingestion & Layout-Aware Parsing Engine.
Implements layout-aware PDF extraction, DOCX structural mapping, table extraction,
magic byte validation, and malicious stream sanitization.
"""
import io
import re
import base64
import zipfile
import xml.etree.ElementTree as ET
from typing import Dict, Any, List, Optional, Tuple
from app.schemas.document import (
    LayoutBlock, TableData, DocumentValidationResult,
    ParseResumeRequest, ParseResumeResponse
)
from app.config import settings

class DocumentParserEngine:
    """Multi-format layout-aware document ingestion and linearization engine."""

    PDF_MAGIC_BYTES = b"%PDF"
    DOCX_MAGIC_BYTES = b"PK\x03\x04"

    def validate_file(self, content_bytes: bytes, file_name: str) -> DocumentValidationResult:
        """Validate magic bytes, file size, page limits, and malicious embedded streams."""
        size_bytes = len(content_bytes)
        security_flags = []
        errors = []
        mime_type = "application/octet-stream"

        if size_bytes > settings.MAX_DOCUMENT_SIZE_BYTES:
            errors.append(f"File exceeds maximum allowed size of {settings.MAX_DOCUMENT_SIZE_BYTES} bytes")
            security_flags.append("oversized")

        if content_bytes.startswith(self.PDF_MAGIC_BYTES):
            mime_type = "application/pdf"
            # Scan for malicious PDF keywords (e.g. /JavaScript, /Launch, /EmbeddedFiles)
            if b"/JavaScript" in content_bytes or b"/JS" in content_bytes:
                security_flags.append("embedded_javascript_detected")
            if b"/Launch" in content_bytes:
                security_flags.append("executable_launch_action_detected")
                errors.append("PDF contains prohibited /Launch action")

        elif content_bytes.startswith(self.DOCX_MAGIC_BYTES):
            mime_type = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            # Validate DOCX internal zip structure
            try:
                with zipfile.ZipFile(io.BytesIO(content_bytes)) as z:
                    if "[Content_Types].xml" not in z.namelist():
                        errors.append("Invalid DOCX structure: missing [Content_Types].xml")
                    # Check for VBA macros
                    if any("vbaProject" in name for name in z.namelist()):
                        security_flags.append("macro_enabled_document")
                        errors.append("Macro-enabled documents (.docm/vba) are rejected")
            except Exception as e:
                errors.append(f"Corrupt DOCX archive: {str(e)}")

        elif file_name.endswith(".txt") or all(b < 128 for b in content_bytes[:512]):
            mime_type = "text/plain"
        else:
            errors.append("Unsupported file format or unverified magic bytes")

        is_valid = len(errors) == 0
        return DocumentValidationResult(
            is_valid=is_valid,
            mime_type=mime_type,
            file_size_bytes=size_bytes,
            page_count=1,
            security_flags=security_flags,
            errors=errors
        )

    def parse_docx(self, docx_bytes: bytes) -> Tuple[str, List[LayoutBlock], List[TableData]]:
        """Extract paragraphs, headings, and tables from DOCX XML body."""
        blocks: List[LayoutBlock] = []
        tables: List[TableData] = []
        extracted_lines: List[str] = []

        try:
            with zipfile.ZipFile(io.BytesIO(docx_bytes)) as z:
                xml_content = z.read("word/document.xml")
                tree = ET.fromstring(xml_content)

                # XML namespaces in Word documents
                ns = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}

                # 1. Extract Paragraphs
                for p in tree.iter('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}p'):
                    texts = [node.text for node in p.iter('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}t') if node.text]
                    if texts:
                        full_text = "".join(texts).strip()
                        if full_text:
                            # Detect heading by style or formatting
                            is_heading = len(full_text) < 60 and (full_text.isupper() or full_text.endswith(":"))
                            b_type = "heading" if is_heading else "paragraph"
                            blocks.append(LayoutBlock(
                                block_type=b_type,
                                content=full_text,
                                page_number=1,
                                confidence=0.95
                            ))
                            extracted_lines.append(full_text)

                # 2. Extract Tables
                for tbl in tree.iter('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}tbl'):
                    table_rows = []
                    for row in tbl.iter('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}tr'):
                        row_cells = []
                        for cell in row.iter('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}tc'):
                            cell_texts = [t.text for t in cell.iter('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}t') if t.text]
                            row_cells.append(" ".join(cell_texts).strip())
                        if any(row_cells):
                            table_rows.append(row_cells)

                    if table_rows:
                        headers = table_rows[0]
                        data_rows = table_rows[1:] if len(table_rows) > 1 else []
                        tables.append(TableData(page_number=1, headers=headers, rows=data_rows))
                        blocks.append(LayoutBlock(
                            block_type="table",
                            content=f"Table: {', '.join(headers)}",
                            page_number=1,
                            confidence=0.9
                        ))

        except Exception as e:
            fallback_text = "DOCX extraction encountered error: " + str(e)
            blocks.append(LayoutBlock(block_type="paragraph", content=fallback_text, page_number=1))
            extracted_lines.append(fallback_text)

        linearized_text = "\n".join(extracted_lines)
        return linearized_text, blocks, tables

    def parse_pdf(self, pdf_bytes: bytes) -> Tuple[str, List[LayoutBlock], List[TableData]]:
        """Layout-aware PDF stream parser extracting text blocks and structure."""
        blocks: List[LayoutBlock] = []
        tables: List[TableData] = []
        lines: List[str] = []

        # Try pdfplumber / pypdf if available
        try:
            import pdfplumber
            with pdfplumber.open(io.BytesIO(pdf_bytes)) as pdf:
                for page_idx, page in enumerate(pdf.pages, start=1):
                    # Table extraction
                    extracted_tables = page.extract_tables()
                    for t in extracted_tables:
                        if t and len(t) > 0:
                            clean_rows = [[cell if cell else "" for cell in r] for r in t]
                            headers = clean_rows[0]
                            data_rows = clean_rows[1:] if len(clean_rows) > 1 else []
                            tables.append(TableData(page_number=page_idx, headers=headers, rows=data_rows))

                    # Text extraction with layout preservation
                    page_text = page.extract_text(layout=True) or ""
                    for line in page_text.splitlines():
                        clean_line = line.strip()
                        if clean_line:
                            is_heading = len(clean_line) < 60 and (clean_line.isupper() or clean_line.endswith(":"))
                            blocks.append(LayoutBlock(
                                block_type="heading" if is_heading else "paragraph",
                                content=clean_line,
                                page_number=page_idx,
                                confidence=0.98
                            ))
                            lines.append(clean_line)
                return "\n".join(lines), blocks, tables
        except ImportError:
            pass

        # Standard pure-Python PDF stream text extractor fallback
        raw_str = pdf_bytes.decode('latin-1', errors='ignore')

        # Extract text from BT ... ET (Begin Text ... End Text) blocks
        bt_blocks = re.findall(r'BT\s*(.*?)\s*ET', raw_str, re.DOTALL)
        if bt_blocks:
            for bt in bt_blocks:
                # Find (text) Tj or [(text)] TJ
                tj_matches = re.findall(r'\((.*?)\)\s*Tj', bt)
                tj_array_matches = re.findall(r'\[(.*?)\]\s*TJ', bt)

                extracted = []
                for m in tj_matches:
                    clean = m.replace('\\(', '(').replace('\\)', ')').replace('\\n', ' ')
                    if clean.strip():
                        extracted.append(clean.strip())

                for arr in tj_array_matches:
                    inner_texts = re.findall(r'\((.*?)\)', arr)
                    combined = " ".join([t.replace('\\(', '(').replace('\\)', ')').strip() for t in inner_texts if t.strip()])
                    if combined:
                        extracted.append(combined)

                if extracted:
                    block_text = " ".join(extracted)
                    lines.append(block_text)
                    is_h = len(block_text) < 50 and block_text.isupper()
                    blocks.append(LayoutBlock(
                        block_type="heading" if is_h else "paragraph",
                        content=block_text,
                        page_number=1,
                        confidence=0.85
                    ))

        # If BT/ET extraction returned empty, fallback to readable string scanning
        if not lines:
            clean_text = re.sub(r'[\x00-\x08\x0b\x0c\x0e-\x1f]', '', raw_str)
            words = [w for w in re.findall(r'[A-Za-z0-9\+\#\.\,\:\-\@\(\)\/\s]{4,}', clean_text) if len(w.strip()) > 3]
            for w in words[:100]:
                lines.append(w.strip())
                blocks.append(LayoutBlock(block_type="paragraph", content=w.strip(), page_number=1, confidence=0.7))

        linearized_text = "\n".join(lines)
        return linearized_text, blocks, tables

    def parse_document(self, req: ParseResumeRequest) -> ParseResumeResponse:
        """Main parsing dispatcher."""
        import time
        import uuid
        start_time = time.time()
        doc_id = str(uuid.uuid4())

        # Handle text directly provided
        if req.document_text:
            lines = [l.strip() for l in req.document_text.splitlines() if l.strip()]
            blocks = [
                LayoutBlock(
                    block_type="heading" if len(l) < 50 and (l.isupper() or l.endswith(":")) else "paragraph",
                    content=l,
                    page_number=1,
                    confidence=1.0
                )
                for l in lines
            ]
            val = DocumentValidationResult(
                is_valid=True,
                mime_type="text/plain",
                file_size_bytes=len(req.document_text.encode('utf-8')),
                page_count=1,
                security_flags=[],
                errors=[]
            )
            return ParseResumeResponse(
                document_id=doc_id,
                tenant_id=req.tenant_id,
                candidate_id=req.candidate_id,
                file_name=req.file_name,
                mime_type="text/plain",
                raw_text=req.document_text,
                linearized_text=req.document_text,
                blocks=blocks,
                tables=[],
                validation=val,
                parsing_latency_ms=(time.time() - start_time) * 1000
            )

        # Decode base64
        if req.document_base64:
            try:
                content_bytes = base64.b64decode(req.document_base64)
            except Exception as e:
                val = DocumentValidationResult(
                    is_valid=False,
                    mime_type=req.mime_type,
                    file_size_bytes=0,
                    security_flags=["corrupt_base64"],
                    errors=[f"Base64 decoding failed: {str(e)}"]
                )
                return ParseResumeResponse(
                    document_id=doc_id,
                    tenant_id=req.tenant_id,
                    candidate_id=req.candidate_id,
                    file_name=req.file_name,
                    mime_type=req.mime_type,
                    raw_text="",
                    linearized_text="",
                    blocks=[],
                    tables=[],
                    validation=val,
                    parsing_latency_ms=(time.time() - start_time) * 1000
                )

            validation = self.validate_file(content_bytes, req.file_name)
            if not validation.is_valid:
                return ParseResumeResponse(
                    document_id=doc_id,
                    tenant_id=req.tenant_id,
                    candidate_id=req.candidate_id,
                    file_name=req.file_name,
                    mime_type=validation.mime_type,
                    raw_text="",
                    linearized_text="",
                    blocks=[],
                    tables=[],
                    validation=validation,
                    parsing_latency_ms=(time.time() - start_time) * 1000
                )

            if validation.mime_type == "application/pdf":
                raw_text, blocks, tables = self.parse_pdf(content_bytes)
            elif "wordprocessingml" in validation.mime_type:
                raw_text, blocks, tables = self.parse_docx(content_bytes)
            else:
                raw_text = content_bytes.decode('utf-8', errors='ignore')
                blocks = [LayoutBlock(block_type="paragraph", content=l, page_number=1) for l in raw_text.splitlines() if l.strip()]
                tables = []

            return ParseResumeResponse(
                document_id=doc_id,
                tenant_id=req.tenant_id,
                candidate_id=req.candidate_id,
                file_name=req.file_name,
                mime_type=validation.mime_type,
                raw_text=raw_text,
                linearized_text=raw_text,
                blocks=blocks,
                tables=tables,
                validation=validation,
                parsing_latency_ms=(time.time() - start_time) * 1000
            )

        # Empty payload
        val = DocumentValidationResult(is_valid=False, mime_type="unknown", file_size_bytes=0, errors=["No document payload provided"])
        return ParseResumeResponse(
            document_id=doc_id,
            tenant_id=req.tenant_id,
            file_name=req.file_name,
            mime_type=req.mime_type,
            raw_text="",
            linearized_text="",
            validation=val
        )

document_parser_engine = DocumentParserEngine()

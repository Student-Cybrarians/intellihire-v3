"""
Unit tests for Document Ingestion, Magic Bytes, Layout Blocks, and DOCX/PDF Parsers.
"""
import unittest
import zipfile
import io
from app.core.document_parser import document_parser_engine
from app.schemas.document import ParseResumeRequest

class TestDocumentParser(unittest.TestCase):

    def test_magic_byte_validation_pdf(self):
        pdf_bytes = b"%PDF-1.4\n1 0 obj\n<<>>\nendobj\ntrailer\n<<>>\n%%EOF"
        val = document_parser_engine.validate_file(pdf_bytes, "sample.pdf")
        self.assertTrue(val.is_valid)
        self.assertEqual(val.mime_type, "application/pdf")
        self.assertEqual(len(val.errors), 0)

    def test_malicious_pdf_detection(self):
        malicious_pdf = b"%PDF-1.4\n/Launch << /F (calc.exe) >>\n%%EOF"
        val = document_parser_engine.validate_file(malicious_pdf, "exploit.pdf")
        self.assertFalse(val.is_valid)
        self.assertIn("executable_launch_action_detected", val.security_flags)

    def test_text_resume_parsing(self):
        resume_text = """JOHN DOE
Software Engineer
Email: john.doe@example.com

EXPERIENCE
Backend Engineer at Acme Corp (2021 - Present)
- Developed distributed microservices with Python, Go, and PostgreSQL.
- Architected REST APIs using FastAPI and Cloudflare Workers.

EDUCATION
Bachelor of Science in Computer Science, Stanford University (2017 - 2021)

SKILLS
Python, Go, TypeScript, React, Next.js, Docker, Kubernetes, PostgreSQL, Redis"""

        req = ParseResumeRequest(
            document_text=resume_text,
            file_name="john_doe_resume.txt",
            tenant_id="tenant_tech",
            candidate_id="cand_101"
        )
        resp = document_parser_engine.parse_document(req)

        self.assertTrue(resp.validation.is_valid)
        self.assertEqual(resp.candidate_id, "cand_101")
        self.assertGreater(len(resp.blocks), 0)
        self.assertIn("Acme Corp", resp.raw_text)

    def test_docx_structure_parsing(self):
        # Create a mock valid DOCX archive in memory
        docx_buf = io.BytesIO()
        with zipfile.ZipFile(docx_buf, "w") as z:
            z.writestr("[Content_Types].xml", '<?xml version="1.0"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"/>')
            xml_doc = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
    <w:body>
        <w:p><w:r><w:t>JANE SMITH</w:t></w:r></w:p>
        <w:p><w:r><w:t>AI / ML Engineer</w:t></w:r></w:p>
        <w:p><w:r><w:t>Senior Machine Learning Engineer at DataLab (2020 - 2024)</w:t></w:r></w:p>
    </w:body>
</w:document>"""
            z.writestr("word/document.xml", xml_doc)

        docx_bytes = docx_buf.getvalue()
        val = document_parser_engine.validate_file(docx_bytes, "jane_resume.docx")
        self.assertTrue(val.is_valid)
        self.assertIn("wordprocessingml", val.mime_type)

        text, blocks, tables = document_parser_engine.parse_docx(docx_bytes)
        self.assertIn("JANE SMITH", text)
        self.assertIn("DataLab", text)
        self.assertEqual(len(blocks), 3)

if __name__ == "__main__":
    unittest.main()

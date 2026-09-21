"""
Unit tests for Module 1 AI Recruiter & ATS Resume Intelligence Engine.
Tests 14-dimension resume screening, ATS compatibility scoring, Google X-Y-Z bullet optimization,
recruiter feedback generation, and API endpoints.
"""
import unittest
import json
import os
import sys

# Add root directory of intelligence service to sys.path
TEST_DIR = os.path.dirname(os.path.abspath(__file__))
SERVICE_ROOT = os.path.dirname(TEST_DIR)
if SERVICE_ROOT not in sys.path:
    sys.path.insert(0, SERVICE_ROOT)

os.environ["TESTING"] = "1"

from app.core.ai.nvidia_client import NvidiaAIModelService, ai_model_service
from app.server.standalone_server import api_router
from app.api.v1.router import init_v1_routes

class TestResumeIntelligence(unittest.TestCase):

    def setUp(self):
        init_v1_routes()
        self.service = ai_model_service
        self.sample_resume = """VISHNU SHARMA
Principal AI & Distributed Systems Architect
Email: vishnu@demo.intellihire.ai | Location: San Francisco, CA

SUMMARY
Principal AI Systems Architect with 10+ years experience in distributed inference pipelines, PyTorch, FastAPI, Qdrant.

EXPERIENCE
Principal AI Platform Engineer — Anthropic / Scale AI (2021 - Present)
- Worked on search engine features using vector embeddings and Python.
- Deployed hybrid vector search (Dense 384-d embeddings + Okapi BM25 with Reciprocal Rank Fusion k=60).

SKILLS
Python, Go, TypeScript, PyTorch, FastAPI, Qdrant, Docker, TreeSHAP

EDUCATION
Master of Science in Artificial Intelligence — Carnegie Mellon University (CMU), 2018"""

        self.sample_jd = """Role: Principal AI & Distributed Systems Architect
Requirements: 8+ years experience, PyTorch, FastAPI, Qdrant, Docker, Kubernetes, CI/CD, AWS."""

    def test_screen_and_parse_resume_dimensions(self):
        result = self.service.screen_and_parse_resume(
            resume_text=self.sample_resume,
            jd_text=self.sample_jd,
            target_company="FAANG",
            target_role="Principal AI & Distributed Systems Architect"
        )
        self.assertIn("ats_score", result)
        self.assertIn("overall_match", result)
        self.assertIn("dimensions_breakdown", result)
        self.assertIn("candidate_context_json", result)
        self.assertIn("status", result)
        self.assertEqual(result["status"], "SHORTLISTED")
        self.assertGreaterEqual(result["ats_score"], 85)
        self.assertGreaterEqual(result["overall_match"], 85.0)

        # Check all 14 dimensions exist
        dimensions = result["dimensions_breakdown"]
        expected_dims = [
            "personal_information", "education", "work_experience", "projects",
            "skills_technologies", "certifications", "achievements", "resume_formatting",
            "ats_compatibility", "keywords_matching", "semantic_similarity",
            "missing_sections", "career_level_fitment", "company_fitment"
        ]
        for dim in expected_dims:
            self.assertIn(dim, dimensions, f"Missing dimension: {dim}")

    def test_optimize_bullets_google_xyz(self):
        original_bullets = [
            "Worked on search engine features using vector embeddings and Python."
        ]
        optimized = self.service.optimize_resume_bullets(original_bullets, self.sample_jd)
        self.assertIsInstance(optimized, list)
        self.assertGreaterEqual(len(optimized), 1)
        first = optimized[0]
        self.assertIn("original", first)
        self.assertIn("optimized", first)
        self.assertIn("impact_gain", first)
        self.assertGreater(len(first["optimized"]), len(first["original"]))

    def test_generate_recruiter_feedback(self):
        feedback = self.service.generate_recruiter_feedback(
            candidate_name="Vishnu Sharma",
            skills=["Python", "PyTorch", "FastAPI", "Qdrant"],
            role="Principal AI & Distributed Systems Architect",
            ats_score=92,
            missing_skills=["Docker", "AWS", "Kubernetes"]
        )
        self.assertIn("overall_assessment", feedback)
        self.assertIn("technical_strengths", feedback)
        self.assertIn("recommendation", feedback)
        self.assertIn(feedback["recommendation"], ["SHORTLISTED", "STRONG_ADVANCE", "ADVANCE"])

    def test_api_parse_and_screen_endpoint(self):
        matched = api_router.match("POST", "/api/v1/resume/parse-and-screen")
        self.assertIsNotNone(matched)
        handler, _ = matched
        status_code, resp = handler(
            {"resume_text": self.sample_resume, "jd_text": self.sample_jd},
            {},
            {}
        )
        self.assertEqual(status_code, 200)
        self.assertEqual(resp.get("status"), "success")
        self.assertEqual(resp.get("data", {}).get("status"), "SHORTLISTED")

    def test_api_optimize_bullets_endpoint(self):
        matched = api_router.match("POST", "/api/v1/resume/optimize-bullets")
        self.assertIsNotNone(matched)
        handler, _ = matched
        status_code, resp = handler(
            {"bullets": ["Worked on search engine features using vector embeddings and Python."], "jd_text": self.sample_jd},
            {},
            {}
        )
        self.assertEqual(status_code, 200)
        self.assertEqual(resp.get("status"), "success")
        self.assertIn("optimized_bullets", resp)

    def test_api_recruiter_feedback_endpoint(self):
        matched = api_router.match("POST", "/api/v1/resume/recruiter-feedback")
        self.assertIsNotNone(matched)
        handler, _ = matched
        status_code, resp = handler(
            {
                "candidate_name": "Vishnu Sharma",
                "skills": ["Python", "FastAPI"],
                "role": "Principal AI Architect",
                "ats_score": 92
            },
            {},
            {}
        )
        self.assertEqual(status_code, 200)
        self.assertEqual(resp.get("status"), "success")
        self.assertIn("feedback", resp)

if __name__ == "__main__":
    unittest.main()

"""
Integration tests for REST API endpoints via the standalone API router.
"""
import unittest
from app.server.standalone_server import api_router
from app.api.v1.router import init_v1_routes

class TestApiEndpoints(unittest.TestCase):

    def setUp(self):
        init_v1_routes()
        self.auth_headers = {
            "x-internal-secret": "ih_sec_default_internal_service_key_77a92b3c4d5e",
            "x-tenant-id": "tenant_test"
        }

    def test_health_endpoint(self):
        matched = api_router.match("GET", "/health")
        self.assertIsNotNone(matched)
        handler, params = matched
        code, data = handler({}, {}, params)
        self.assertEqual(code, 200)
        self.assertEqual(data["status"], "healthy")
        self.assertEqual(data["service"], "intellihire-intelligence-service")
        self.assertGreater(len(data["components"]), 0)

    def test_document_parse_endpoint(self):
        matched = api_router.match("POST", "/api/v1/documents/parse")
        self.assertIsNotNone(matched)
        handler, params = matched
        payload = {
            "document_text": "Experienced Python and FastAPI Software Engineer at Meta (2020 - 2024)",
            "file_name": "resume.txt",
            "tenant_id": "tenant_test"
        }
        code, data = handler(payload, self.auth_headers, params)
        self.assertEqual(code, 200)
        self.assertTrue(data["validation"]["is_valid"])
        self.assertIn("Python", data["raw_text"])

    def test_nlp_normalize_skills_endpoint(self):
        matched = api_router.match("POST", "/api/v1/nlp/normalize-skills")
        self.assertIsNotNone(matched)
        handler, params = matched
        payload = {"skill_names": ["python3", "nextjs", "docker"]}
        code, data = handler(payload, self.auth_headers, params)
        self.assertEqual(code, 200)
        self.assertEqual(len(data["normalized_skills"]), 3)
        self.assertEqual(data["normalized_skills"][0]["canonical_id"], "skill_python")

    def test_sandbox_languages_endpoint(self):
        matched = api_router.match("GET", "/api/v1/sandbox/languages")
        self.assertIsNotNone(matched)
        handler, params = matched
        code, data = handler({}, self.auth_headers, params)
        self.assertEqual(code, 200)
        self.assertIn("python", data["supported_languages"])

    def test_fairness_explain_endpoint(self):
        matched = api_router.match("POST", "/api/v1/fairness/explain-score")
        self.assertIsNotNone(matched)
        handler, params = matched
        payload = {
            "candidate_id": "cand_test",
            "overall_score": 85.0,
            "feature_values": {"assessment_score": 90.0, "keyword_match": 80.0}
        }
        code, data = handler(payload, self.auth_headers, params)
        self.assertEqual(code, 200)
        self.assertEqual(data["candidate_id"], "cand_test")
        self.assertGreater(len(data["attributions"]), 0)

if __name__ == "__main__":
    unittest.main()

"""
Unit tests for NLP Entity Extraction, Skill Normalization, and Provenance Lineage.
"""
import unittest
from app.core.nlp_engine import nlp_engine
from app.schemas.nlp import ExtractEntitiesRequest, NormalizeSkillsRequest

class TestNLPEngine(unittest.TestCase):

    def test_extract_skills_with_provenance(self):
        text = "Expert software engineer with 5 years experience in Python, FastAPI, Docker, and Qdrant."
        skills = nlp_engine.extract_skills(text)
        skill_ids = [s.canonical_id for s in skills]

        self.assertIn("skill_python", skill_ids)
        self.assertIn("skill_fastapi", skill_ids)
        self.assertIn("skill_docker", skill_ids)
        self.assertIn("skill_qdrant", skill_ids)

        # Check provenance span tracking
        py_skill = next(s for s in skills if s.canonical_id == "skill_python")
        self.assertGreater(len(py_skill.provenance), 0)
        span = py_skill.provenance[0]
        self.assertEqual(span.matched_text, "Python")
        self.assertEqual(text[span.start_char:span.end_char], "Python")

    def test_extract_education_and_degree(self):
        text = "Education: Master of Science in Computer Science from MIT (2018 - 2020)."
        edu = nlp_engine.extract_education(text)

        self.assertEqual(len(edu), 1)
        self.assertEqual(edu[0].degree, "Master's")
        self.assertEqual(edu[0].start_year, 2018)
        self.assertEqual(edu[0].end_year, 2020)

    def test_extract_experience_and_seniority(self):
        text = """Senior Backend Engineer at Stripe (2019 - Present)
- Designed payment processing APIs.
Lead Software Architect at Acme Corp (2014 - 2019)
- Led team of 12 engineers."""

        req = ExtractEntitiesRequest(
            text=text,
            candidate_id="cand_senior_01"
        )
        resp = nlp_engine.extract_entities(req)

        self.assertGreater(resp.total_years_experience, 8.0)
        self.assertEqual(resp.seniority_estimate, "lead")
        self.assertEqual(len(resp.experience), 2)

    def test_normalize_skills(self):
        req = NormalizeSkillsRequest(skill_names=["py", "golang", "react.js", "k8s", "unknown_xyz_tool"])
        resp = nlp_engine.normalize_skills(req)

        norm_map = {item.query: item for item in resp.normalized_skills}
        self.assertEqual(norm_map["py"].canonical_id, "skill_python")
        self.assertEqual(norm_map["golang"].canonical_id, "skill_go")
        self.assertEqual(norm_map["react.js"].canonical_id, "skill_react")
        self.assertEqual(norm_map["k8s"].canonical_id, "skill_kubernetes")
        self.assertEqual(norm_map["unknown_xyz_tool"].match_type, "unrecognized")

if __name__ == "__main__":
    unittest.main()

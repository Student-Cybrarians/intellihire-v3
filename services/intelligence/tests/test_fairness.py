"""
Unit tests for Feature Attribution Decomposition and Disparate Impact Auditing.
"""
import unittest
from app.core.explainability import explainability_engine
from app.core.fairness_auditor import fairness_auditor_engine
from app.schemas.fairness import (
    FeatureAttributionRequest, DisparateImpactAuditRequest
)

class TestFairnessAndExplainability(unittest.TestCase):

    def test_feature_attribution_decomposition(self):
        req = FeatureAttributionRequest(
            candidate_id="cand_explain_01",
            overall_score=88.5,
            feature_values={
                "assessment_score": 92.0,
                "keyword_match": 85.0,
                "experience_years": 5.0,
                "interview_hr_score": 80.0
            }
        )
        resp = explainability_engine.explain_score(req)

        self.assertEqual(resp.candidate_id, "cand_explain_01")
        self.assertEqual(resp.overall_score, 88.5)
        self.assertGreater(len(resp.attributions), 0)
        self.assertGreater(len(resp.top_positive_factors), 0)
        self.assertTrue(len(resp.plain_english_summary) > 20)

    def test_fairness_four_fifths_rule_compliant(self):
        # Balanced applicant data
        # Group A: 10 applicants, 8 passed (SR = 80%)
        # Group B: 10 applicants, 7 passed (SR = 70% -> Impact Ratio = 70/80 = 87.5% >= 80% -> Passes)
        applicant_data = [
            {"group": "Group_A", "passed": i < 8} for i in range(10)
        ] + [
            {"group": "Group_B", "passed": i < 7} for i in range(10)
        ]

        req = DisparateImpactAuditRequest(
            job_id="job_backend_01",
            protected_attribute="gender",
            applicant_data=applicant_data
        )
        resp = fairness_auditor_engine.audit_disparate_impact(req)

        self.assertTrue(resp.overall_compliant)
        self.assertEqual(resp.highest_selection_rate_group, "Group_A")
        self.assertAlmostEqual(resp.highest_selection_rate, 0.8)

    def test_fairness_four_fifths_rule_adverse_impact_detected(self):
        # Adverse impact scenario
        # Group A: 10 applicants, 9 passed (SR = 90%)
        # Group B: 10 applicants, 3 passed (SR = 30% -> Impact Ratio = 30/90 = 33.3% < 80% -> Fails)
        applicant_data = [
            {"group": "Group_A", "passed": i < 9} for i in range(10)
        ] + [
            {"group": "Group_B", "passed": i < 3} for i in range(10)
        ]

        req = DisparateImpactAuditRequest(
            job_id="job_backend_02",
            protected_attribute="ethnicity",
            applicant_data=applicant_data
        )
        resp = fairness_auditor_engine.audit_disparate_impact(req)

        self.assertFalse(resp.overall_compliant)
        b_metric = next(g for g in resp.groups if g.group_name == "Group_B")
        self.assertFalse(b_metric.passes_four_fifths_rule)
        self.assertAlmostEqual(b_metric.impact_ratio, 0.3333, places=3)
        self.assertGreater(len(resp.audit_recommendations), 0)

if __name__ == "__main__":
    unittest.main()

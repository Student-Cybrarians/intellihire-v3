"""
Unit tests for Dense Semantic Vector Search, BM25 Lexical Scoring, RRF, and Multi-Tenant Isolation.
"""
import unittest
from app.core.hybrid_search import hybrid_search_engine, cosine_similarity
from app.schemas.search import (
    IndexCandidateDocumentRequest, HybridSearchRequest, HybridSearchFilter
)

class TestHybridSearch(unittest.TestCase):

    def setUp(self):
        # Index candidate A (Python Backend Specialist)
        hybrid_search_engine.index_candidate(IndexCandidateDocumentRequest(
            candidate_id="cand_alex",
            tenant_id="tenant_eng",
            name="Alex Rivera",
            raw_text="Experienced Python backend developer with FastAPI, PostgreSQL, Docker, Redis, and high-performance REST APIs.",
            skills=["Python", "FastAPI", "PostgreSQL", "Docker", "Redis"],
            target_role="Backend Software Engineer",
            experience_years=5.0,
            seniority="senior"
        ))

        # Index candidate B (Frontend Next.js Specialist)
        hybrid_search_engine.index_candidate(IndexCandidateDocumentRequest(
            candidate_id="cand_clara",
            tenant_id="tenant_eng",
            name="Clara Chen",
            raw_text="Frontend engineer building responsive web apps using React, Next.js, TypeScript, Tailwind CSS, and Web performance tuning.",
            skills=["React", "Next.js", "TypeScript", "Tailwind CSS"],
            target_role="Frontend Software Engineer",
            experience_years=3.5,
            seniority="mid_level"
        ))

        # Index candidate C in a DIFFERENT tenant (Tenant isolation check)
        hybrid_search_engine.index_candidate(IndexCandidateDocumentRequest(
            candidate_id="cand_other_tenant",
            tenant_id="tenant_isolated_other",
            name="Secret Candidate",
            raw_text="Python FastAPI backend expert in another company.",
            skills=["Python", "FastAPI"],
            target_role="Backend Engineer",
            experience_years=6.0,
            seniority="senior"
        ))

    def test_dense_cosine_similarity(self):
        v1 = [1.0, 0.0, 0.0]
        v2 = [1.0, 0.0, 0.0]
        v3 = [0.0, 1.0, 0.0]
        self.assertAlmostEqual(cosine_similarity(v1, v2), 1.0)
        self.assertAlmostEqual(cosine_similarity(v1, v3), 0.0)

    def test_hybrid_search_ranking(self):
        req = HybridSearchRequest(
            query="Python FastAPI backend developer with Redis and PostgreSQL",
            tenant_id="tenant_eng",
            top_k=5,
            dense_weight=0.6
        )
        resp = hybrid_search_engine.search(req)

        self.assertEqual(resp.tenant_id, "tenant_eng")
        self.assertGreater(resp.total_hits, 0)
        # Alex should rank first
        top_hit = resp.results[0]
        self.assertEqual(top_hit.candidate_id, "cand_alex")
        self.assertIn("python", [s.lower() for s in top_hit.matched_skills])

    def test_tenant_isolation(self):
        req = HybridSearchRequest(
            query="Python FastAPI backend developer",
            tenant_id="tenant_eng",
            top_k=5
        )
        resp = hybrid_search_engine.search(req)
        returned_ids = [r.candidate_id for r in resp.results]

        # cand_other_tenant MUST NOT be returned in tenant_eng search
        self.assertNotIn("cand_other_tenant", returned_ids)

    def test_payload_filters(self):
        req = HybridSearchRequest(
            query="Software Engineer",
            tenant_id="tenant_eng",
            filters=HybridSearchFilter(
                tenant_id="tenant_eng",
                min_years_experience=4.0  # Only Alex (5.0 yrs) passes, Clara (3.5 yrs) filtered out
            )
        )
        resp = hybrid_search_engine.search(req)
        self.assertEqual(len(resp.results), 1)
        self.assertEqual(resp.results[0].candidate_id, "cand_alex")

if __name__ == "__main__":
    unittest.main()

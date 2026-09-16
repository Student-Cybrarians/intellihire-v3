"""
Dense Semantic Search & Hybrid RAG Retrieval Engine.
Implements 384-d dense vector cosine search, BM25 exact keyword ranking,
Reciprocal Rank Fusion (RRF), and multi-tenant payload filtering.
"""
import math
import time
import re
from typing import Dict, Any, List, Optional, Tuple
from collections import Counter
from app.schemas.search import (
    HybridSearchRequest, HybridSearchResponse, SearchResultCandidate,
    IndexCandidateDocumentRequest, IndexCandidateDocumentResponse
)

class CandidateDocument:
    """Internal indexed candidate representation."""
    def __init__(
        self,
        candidate_id: str,
        tenant_id: str,
        name: str,
        raw_text: str,
        skills: List[str],
        target_role: str,
        experience_years: float,
        seniority: str,
        dense_vector: List[float]
    ):
        self.candidate_id = candidate_id
        self.tenant_id = tenant_id
        self.name = name
        self.raw_text = raw_text
        self.skills = [s.lower() for s in skills]
        self.target_role = target_role
        self.experience_years = experience_years
        self.seniority = seniority
        self.dense_vector = dense_vector
        self.tokens = self._tokenize(raw_text)

    @staticmethod
    def _tokenize(text: str) -> List[str]:
        return [w.lower() for w in re.findall(r'[A-Za-z0-9\+\#\.\-]+', text) if len(w) > 1]

class PurePythonDenseEmbedder:
    """
    384-dimensional dense semantic embedding engine.
    Uses SentenceTransformers if available; otherwise uses high-dimensional deterministic
    character-trigram semantic projection with L2 unit normalization.
    """
    DIMENSION = 384
    # Pre-compiled regex for tokenization
    _TOKEN_REGEX = re.compile(r'[A-Za-z0-9\+\#\.]+')

    def __init__(self):
        self._model = None
        try:
            from sentence_transformers import SentenceTransformer
            self._model = SentenceTransformer('all-MiniLM-L6-v2')
        except Exception:
            self._model = None

    def embed(self, text: str) -> List[float]:
        if self._model:
            try:
                vec = self._model.encode(text, convert_to_numpy=True).tolist()
                return vec
            except Exception:
                pass

        # High-entropy deterministic semantic hashing (384 dimensions)
        vec = [0.0] * self.DIMENSION
        clean = text.lower().strip()
        # Use pre-compiled regex for better performance
        tokens = [w for w in self._TOKEN_REGEX.findall(clean) if len(w) > 1]

        for token in tokens:
            # Word hash
            h = hash(token)
            idx = abs(h) % self.DIMENSION
            weight = 1.0 + min(2.0, len(token) * 0.25)  # Optimized division
            vec[idx] += weight

            # Trigram subwords - optimized loop
            token_len = len(token)
            if token_len >= 3:
                # Precompute hash values for trigrams to avoid recomputation
                for i in range(token_len - 2):
                    trigram = token[i:i+3]
                    th = hash(trigram)
                    tidx = abs(th) % self.DIMENSION
                    vec[tidx] += 0.4

        # L2 unit normalization - optimized
        norm_squared = sum(x * x for x in vec)
        if norm_squared > 1e-18:  # Avoid sqrt for very small values
            norm = math.sqrt(norm_squared)
            inv_norm = 1.0 / norm
            vec = [x * inv_norm for x in vec]
        else:
            # Return uniform vector when norm is too small
            uniform_val = 1.0 / math.sqrt(self.DIMENSION)
            vec = [uniform_val] * self.DIMENSION

        return vec

def cosine_similarity(v1: List[float], v2: List[float]) -> float:
    """Compute cosine similarity between two unit-normalized vectors."""
    # Optimized dot product computation using local variables for speed
    dot = 0.0
    for i in range(len(v1)):
        dot += v1[i] * v2[i]
    # Clamp to [0, 1] range for cosine similarity (vectors are unit-normalized)
    return 0.0 if dot < 0.0 else (1.0 if dot > 1.0 else dot)

class BM25Ranker:
    """Okapi BM25 Lexical Keyword Scoring Engine."""
    def __init__(self, k1: float = 1.5, b: float = 0.75):
        self.k1 = k1
        self.b = b
        self.doc_len: Dict[str, int] = {}
        self.doc_freq: Dict[str, int] = Counter()
        self.doc_term_counts: Dict[str, Counter] = {}
        self.num_docs = 0
        self.avg_doc_len = 0.0

    def index_doc(self, doc_id: str, tokens: List[str]):
        self.doc_len[doc_id] = len(tokens)
        term_counts = Counter(tokens)
        self.doc_term_counts[doc_id] = term_counts
        for term in term_counts.keys():
            self.doc_freq[term] += 1
        self.num_docs += 1
        self.avg_doc_len = sum(self.doc_len.values()) / max(1, self.num_docs)

    def score(self, query_tokens: List[str], doc_id: str) -> float:
        if doc_id not in self.doc_term_counts:
            return 0.0

        score = 0.0
        doc_len = self.doc_len[doc_id]
        term_counts = self.doc_term_counts[doc_id]

        # Precompute constants for BM25 formula
        k1_plus_1 = self.k1 + 1.0
        k1_b = self.k1 * (1.0 - self.b)
        k1_b_doc_len_avg = self.k1 * self.b * (doc_len / max(1.0, self.avg_doc_len))
        denominator_const = k1_b + k1_b_doc_len_avg

        for term in query_tokens:
            tf = term_counts.get(term)
            if tf is None:
                continue

            df = self.doc_freq.get(term, 0)
            idf = math.log(1.0 + (self.num_docs - df + 0.5) / (df + 0.5))

            numerator = tf * k1_plus_1
            denominator = tf + denominator_const
            score += idf * (numerator / denominator)

        return score

class HybridSearchEngine:
    """Hybrid Dense Semantic & BM25 Lexical Retrieval with Reciprocal Rank Fusion."""
    def __init__(self):
        self.embedder = PurePythonDenseEmbedder()
        self.documents: Dict[str, Dict[str, CandidateDocument]] = {}  # tenant_id -> {candidate_id -> doc}
        self.bm25_indices: Dict[str, BM25Ranker] = {}                  # tenant_id -> BM25Ranker

    def index_candidate(self, req: IndexCandidateDocumentRequest) -> IndexCandidateDocumentResponse:
        """Index a candidate document into tenant-isolated dense and sparse storage."""
        tenant = req.tenant_id
        if tenant not in self.documents:
            self.documents[tenant] = {}
            self.bm25_indices[tenant] = BM25Ranker()

        dense_vec = self.embedder.embed(f"{req.name} {req.target_role} {' '.join(req.skills)} {req.raw_text}")
        doc = CandidateDocument(
            candidate_id=req.candidate_id,
            tenant_id=req.tenant_id,
            name=req.name,
            raw_text=req.raw_text,
            skills=req.skills,
            target_role=req.target_role,
            experience_years=req.experience_years,
            seniority=req.seniority,
            dense_vector=dense_vec
        )

        self.documents[tenant][req.candidate_id] = doc
        self.bm25_indices[tenant].index_doc(req.candidate_id, doc.tokens)

        return IndexCandidateDocumentResponse(
            success=True,
            candidate_id=req.candidate_id,
            tenant_id=req.tenant_id,
            vector_indexed=True,
            sparse_indexed=True
        )

    def search(self, req: HybridSearchRequest) -> HybridSearchResponse:
        """Execute hybrid search combining dense semantic vectors and BM25 keywords with RRF."""
        start_time = time.time()
        tenant = req.tenant_id
        tenant_docs = self.documents.get(tenant, {})
        bm25_ranker = self.bm25_indices.get(tenant, BM25Ranker())

        if not tenant_docs:
            return HybridSearchResponse(
                query=req.query,
                tenant_id=tenant,
                total_hits=0,
                results=[],
                search_latency_ms=(time.time() - start_time) * 1000
            )

        # 1. Apply Hard Payload Filters
        candidate_pool: List[CandidateDocument] = []
        for doc in tenant_docs.values():
            if req.filters:
                if req.filters.min_years_experience and doc.experience_years < req.filters.min_years_experience:
                    continue
                if req.filters.seniority_levels and doc.seniority not in req.filters.seniority_levels:
                    continue
                if req.filters.required_skills:
                    doc_skills_lower = set(doc.skills)
                    req_skills_lower = set(s.lower() for s in req.filters.required_skills)
                    if not req_skills_lower.issubset(doc_skills_lower):
                        continue
            candidate_pool.append(doc)

        if not candidate_pool:
            return HybridSearchResponse(
                query=req.query,
                tenant_id=tenant,
                total_hits=0,
                results=[],
                search_latency_ms=(time.time() - start_time) * 1000
            )

        # 2. Dense Semantic Search
        query_dense_vec = self.embedder.embed(req.query)
        dense_scores = []
        for doc in candidate_pool:
            sim = cosine_similarity(query_dense_vec, doc.dense_vector)
            dense_scores.append((doc.candidate_id, sim))
        dense_scores.sort(key=lambda x: x[1], reverse=True)
        dense_ranks = {cid: rank + 1 for rank, (cid, _) in enumerate(dense_scores)}
        dense_score_map = dict(dense_scores)

        # 3. Sparse BM25 Keyword Search
        query_tokens = CandidateDocument._tokenize(req.query)
        sparse_scores = []
        for doc in candidate_pool:
            s_score = bm25_ranker.score(query_tokens, doc.candidate_id)
            sparse_scores.append((doc.candidate_id, s_score))
        sparse_scores.sort(key=lambda x: x[1], reverse=True)
        sparse_ranks = {cid: rank + 1 for rank, (cid, _) in enumerate(sparse_scores)}
        sparse_score_map = dict(sparse_scores)

        # 4. Reciprocal Rank Fusion (RRF)
        rrf_k = req.rrf_k
        w_dense = req.dense_weight
        w_sparse = 1.0 - w_dense

        fused_candidates: List[SearchResultCandidate] = []
        for doc in candidate_pool:
            cid = doc.candidate_id
            r_dense = dense_ranks.get(cid, 9999)
            r_sparse = sparse_ranks.get(cid, 9999)

            rrf_score = (w_dense / (rrf_k + r_dense)) + (w_sparse / (rrf_k + r_sparse))

            # Matched & Missing skill analysis
            matched = [s for s in doc.skills if any(t in s for t in query_tokens)]
            missing = [t for t in query_tokens if not any(t in s for s in doc.skills)]

            # Generate Snippet
            snippet = doc.raw_text[:200] + "..." if len(doc.raw_text) > 200 else doc.raw_text

            fused_candidates.append(SearchResultCandidate(
                candidate_id=cid,
                tenant_id=tenant,
                score=round(rrf_score, 5),
                dense_score=round(dense_score_map.get(cid, 0.0), 4),
                sparse_score=round(sparse_score_map.get(cid, 0.0), 4),
                dense_rank=r_dense,
                sparse_rank=r_sparse,
                name=doc.name,
                target_role=doc.target_role,
                matched_skills=matched,
                missing_skills=missing[:3],
                snippet=snippet,
                experience_years=doc.experience_years
            ))

        # Sort by final RRF score
        fused_candidates.sort(key=lambda x: x.score, reverse=True)
        top_results = fused_candidates[:req.top_k]

        return HybridSearchResponse(
            query=req.query,
            tenant_id=tenant,
            total_hits=len(fused_candidates),
            results=top_results,
            search_latency_ms=(time.time() - start_time) * 1000
        )

hybrid_search_engine = HybridSearchEngine()

-- ====================================================================
-- IntelliHire v3 - Cloudflare D1 Database Schema Migration 0002
-- Assessment Telemetry, Coding Submissions, and Fairness Audits
-- ====================================================================

-- 1. Assessment Telemetry Events
CREATE TABLE IF NOT EXISTS assessment_telemetry_events (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    candidate_id TEXT NOT NULL,
    assessment_id TEXT NOT NULL,
    question_id TEXT NOT NULL,
    domain TEXT NOT NULL,
    difficulty_tag TEXT NOT NULL,
    selected_option_id TEXT,
    is_correct INTEGER NOT NULL,
    response_time_ms INTEGER NOT NULL,
    attempt_count INTEGER DEFAULT 1,
    paste_count INTEGER DEFAULT 0,
    tab_blur_count INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (candidate_id) REFERENCES candidate_profiles(id) ON DELETE CASCADE
);

-- 2. Coding Assessment Submissions
CREATE TABLE IF NOT EXISTS code_submissions (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    candidate_id TEXT NOT NULL,
    problem_id TEXT NOT NULL,
    language TEXT NOT NULL,
    source_code TEXT NOT NULL,
    status TEXT NOT NULL, -- accepted, rejected, compilation_error, timeout
    score_percentage REAL NOT NULL,
    passed_count INTEGER NOT NULL,
    total_test_cases INTEGER NOT NULL,
    execution_time_ms REAL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (candidate_id) REFERENCES candidate_profiles(id) ON DELETE CASCADE
);

-- 3. Model Explainability & Feature Attributions
CREATE TABLE IF NOT EXISTS score_attributions (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    candidate_id TEXT NOT NULL,
    overall_score REAL NOT NULL,
    base_value REAL NOT NULL,
    attributions_json TEXT NOT NULL, -- JSON array of Shapley feature attributions
    plain_summary TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (candidate_id) REFERENCES candidate_profiles(id) ON DELETE CASCADE
);

-- 4. Disparate Impact & Fairness Compliance Audits
CREATE TABLE IF NOT EXISTS fairness_audits (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    job_id TEXT NOT NULL,
    protected_attribute TEXT NOT NULL,
    highest_rate_group TEXT NOT NULL,
    highest_rate REAL NOT NULL,
    is_compliant INTEGER NOT NULL,
    audit_results_json TEXT NOT NULL,
    regulatory_framework TEXT NOT NULL DEFAULT 'EEOC Uniform Guidelines (80% Rule)',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_telemetry_question ON assessment_telemetry_events(question_id);
CREATE INDEX IF NOT EXISTS idx_telemetry_candidate ON assessment_telemetry_events(candidate_id);
CREATE INDEX IF NOT EXISTS idx_telemetry_tenant ON assessment_telemetry_events(tenant_id);
CREATE INDEX IF NOT EXISTS idx_telemetry_assessment ON assessment_telemetry_events(assessment_id);
CREATE INDEX IF NOT EXISTS idx_code_candidate ON code_submissions(candidate_id);
CREATE INDEX IF NOT EXISTS idx_code_tenant ON code_submissions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_code_problem ON code_submissions(problem_id);
CREATE INDEX IF NOT EXISTS idx_score_candidate ON score_attributions(candidate_id);
CREATE INDEX IF NOT EXISTS idx_score_tenant ON score_attributions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_fairness_job ON fairness_audits(job_id);
CREATE INDEX IF NOT EXISTS idx_fairness_tenant ON fairness_audits(tenant_id);

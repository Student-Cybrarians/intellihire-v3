-- ====================================================================
-- IntelliHire v3 - Cloudflare D1 Database Schema Migration 0001
-- ====================================================================

-- 1. Users & Tenant Accounts
CREATE TABLE IF NOT EXISTS tenants (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    plan TEXT NOT NULL DEFAULT 'enterprise',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('candidate', 'recruiter', 'admin', 'system')),
    hashed_password TEXT,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);

-- 2. Global Candidate Career Profiles
CREATE TABLE IF NOT EXISTS candidate_profiles (
    id TEXT PRIMARY KEY,
    user_id TEXT UNIQUE NOT NULL,
    tenant_id TEXT NOT NULL,
    target_career_category TEXT,
    target_field TEXT,
    target_domain TEXT,
    target_role TEXT,
    target_seniority TEXT,
    years_experience REAL DEFAULT 0.0,
    readiness_score REAL DEFAULT 0.0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);

-- 3. Document Ingestion & Resumes
CREATE TABLE IF NOT EXISTS candidate_resumes (
    id TEXT PRIMARY KEY,
    candidate_id TEXT NOT NULL,
    tenant_id TEXT NOT NULL,
    file_name TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    r2_storage_key TEXT,
    raw_text TEXT,
    linearized_text TEXT,
    is_parsed INTEGER NOT NULL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (candidate_id) REFERENCES candidate_profiles(id) ON DELETE CASCADE
);

-- 4. Extracted Skills & Provenance
CREATE TABLE IF NOT EXISTS candidate_skills (
    id TEXT PRIMARY KEY,
    candidate_id TEXT NOT NULL,
    canonical_skill_id TEXT NOT NULL,
    canonical_name TEXT NOT NULL,
    category TEXT NOT NULL,
    domain TEXT NOT NULL,
    proficiency TEXT DEFAULT 'intermediate',
    provenance_json TEXT, -- JSON array of character offsets & evidence
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (candidate_id) REFERENCES candidate_profiles(id) ON DELETE CASCADE
);

-- 5. Jobs & Requisitions
CREATE TABLE IF NOT EXISTS jobs (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    title TEXT NOT NULL,
    department TEXT,
    description TEXT NOT NULL,
    required_skills_json TEXT, -- JSON array of skill IDs
    min_years_experience REAL DEFAULT 0.0,
    seniority TEXT DEFAULT 'mid_level',
    status TEXT DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_tenant_id ON users(tenant_id);
CREATE INDEX IF NOT EXISTS idx_candidate_tenant ON candidate_profiles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_skills_candidate ON candidate_skills(candidate_id);
CREATE INDEX IF NOT EXISTS idx_jobs_tenant ON jobs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_candidate_resumes_candidate_id ON candidate_resumes(candidate_id);

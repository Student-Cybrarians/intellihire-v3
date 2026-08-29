-- IntelliHire v3 - Initial D1 schema
-- Applied to the production D1 database via:
--   POST https://api.cloudflare.com/client/v4/accounts/{account_id}/d1/database/a73d035b-1328-4eee-8e94-91db4c78f0f2/import
--   (with this file as the multipart/form-data "data" part)
--
-- Column names follow docs/architecture/schema.sql unless the application
-- data-model required a pragmatic addition (e.g. score columns on
-- career_contexts, JSON columns for interview feedback).

CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  password_hash TEXT,
  role TEXT DEFAULT 'candidate' CHECK (role IN ('candidate', 'recruiter', 'admin', 'interviewer')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  deleted_at DATETIME
);
CREATE INDEX idx_users_email ON users(email);

CREATE TABLE career_contexts (
  id TEXT PRIMARY KEY,
  user_id TEXT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  target_role TEXT,
  target_industry TEXT,
  seniority_level TEXT,
  skills_summary TEXT,            -- JSON array of skills
  readiness_score INTEGER DEFAULT 0,
  ats_score INTEGER DEFAULT 0,
  assessment_score INTEGER DEFAULT 0,
  interview_score INTEGER DEFAULT 0,
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  deleted_at DATETIME
);
CREATE INDEX idx_career_contexts_user_id ON career_contexts(user_id);

CREATE TABLE career_roadmaps (
  id TEXT PRIMARY KEY,
  user_id TEXT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  target_role TEXT,
  stages TEXT NOT NULL DEFAULT '[]',   -- JSON array of milestone objects
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  deleted_at DATETIME
);
CREATE INDEX idx_career_roadmaps_user_id ON career_roadmaps(user_id);

-- Adaptive assessment question bank (static reference content).
CREATE TABLE assessment_catalog (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT,
  skill TEXT,
  difficulty TEXT CHECK (difficulty IN ('Beginner', 'Intermediate', 'Advanced', 'Expert')),
  question_count INTEGER,
  duration_minutes INTEGER,
  questions TEXT NOT NULL          -- JSON array of question objects
);

-- Assessment results.
CREATE TABLE assessments (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  test_id TEXT,
  test_title TEXT,
  skill TEXT,
  score REAL,
  total_questions INTEGER,
  correct_count INTEGER,
  level_reached TEXT,
  details TEXT,                    -- reserved JSON payload
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  deleted_at DATETIME
);
CREATE INDEX idx_assessments_user_id ON assessments(user_id);

CREATE TABLE tech_interviews (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  language TEXT,
  difficulty TEXT,
  problem_statement TEXT NOT NULL,
  starter_code TEXT,
  test_cases TEXT,                 -- JSON array of { input, expected }
  user_code TEXT,
  status TEXT,
  score REAL,
  feedback TEXT,                   -- JSON rubric
  completed_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  deleted_at DATETIME
);
CREATE INDEX idx_tech_interviews_user_id ON tech_interviews(user_id);

CREATE TABLE hr_interviews (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  question TEXT NOT NULL,
  scenario TEXT,
  user_response TEXT,
  status TEXT,
  feedback TEXT,                   -- JSON behavioral scores
  completed_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  deleted_at DATETIME
);
CREATE INDEX idx_hr_interviews_user_id ON hr_interviews(user_id);

-- Documents / resumes. `file_data` stores the uploaded resume durably as
-- base64 in D1 until R2 object storage is enabled; it becomes a drop-in
-- swap (R2 key reference) behind the upload storage abstraction later.
CREATE TABLE documents (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_type TEXT,
  file_size INTEGER,
  file_data TEXT,                  -- base64-encoded file content
  parsed_summary TEXT,
  ats_score INTEGER DEFAULT 0,
  suggested_keywords TEXT,         -- JSON array
  missing_keywords TEXT,           -- JSON array
  uploaded_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  deleted_at DATETIME
);
CREATE INDEX idx_documents_user_id ON documents(user_id);

CREATE TABLE activity_logs (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT,
  description TEXT,
  timestamp TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);

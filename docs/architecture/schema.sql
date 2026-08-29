# Database Schema & Data Models

## D1 Relational Schema (SQLite)

```sql
-- Users and authentication
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT,
  name TEXT,
  role TEXT DEFAULT 'candidate' CHECK (role IN ('candidate', 'recruiter', 'admin', 'interviewer')),
  is_active INTEGER DEFAULT 1,
  email_verified INTEGER DEFAULT 0,
  last_login_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  deleted_at DATETIME
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_is_active ON users(is_active);

-- User profiles
CREATE TABLE user_profiles (
  id TEXT PRIMARY KEY,
  user_id TEXT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  headline TEXT,
  summary TEXT,
  location TEXT,
  website_url TEXT,
  linkedin_url TEXT,
  github_url TEXT,
  twitter_url TEXT,
  portfolio_url TEXT,
  current_employer TEXT,
  years_of_experience INTEGER,
  is_open_to_work INTEGER DEFAULT 1,
  is_public INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);

-- Career contexts (persistent across modules)
CREATE TABLE career_contexts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  target_role TEXT,
  target_industry TEXT,
  seniority_level TEXT CHECK (seniority_level IN ('entry', 'mid', 'senior', 'lead', 'principal', 'executive')),
  skills_summary TEXT, -- JSON array of extracted/verified skills
  experience_summary TEXT,
  career_goals TEXT,
  preferred_work_environment TEXT,
  salary_expectations TEXT, -- JSON with min/max/notice_period
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  deleted_at DATETIME
);

CREATE INDEX idx_career_contexts_user_id ON career_contexts(user_id);
CREATE INDEX idx_career_contexts_target_role ON career_contexts(target_role);

-- Documents/resumes (R2 metadata)
CREATE TABLE documents (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  r2_key TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  parsed_content TEXT, -- JSON extracted text/metadata
  extracted_skills TEXT, -- JSON array
  extracted_experience TEXT, -- JSON array
  source_type TEXT DEFAULT 'resume' CHECK (source_type IN ('resume', 'linkedin', 'manual', 'referral')),
  is_primary INTEGER DEFAULT 0,
  processed_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  deleted_at DATETIME
);

CREATE INDEX idx_documents_user_id ON documents(user_id);
CREATE INDEX idx_documents_source_type ON documents(source_type);
CREATE INDEX idx_documents_is_primary ON documents(is_primary);

-- Jobs and applications
CREATE TABLE jobs (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  company_name TEXT NOT NULL,
  location TEXT,
  job_type TEXT CHECK (job_type IN ('full-time', 'part-time', 'contract', 'freelance', 'internship', 'remote')),
  salary_min REAL,
  salary_max REAL,
  currency TEXT DEFAULT 'USD',
  description TEXT,
  requirements TEXT, -- JSON array
  posted_at DATETIME,
  closing_at DATETIME,
  is_active INTEGER DEFAULT 1,
  source_url TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  deleted_at DATETIME
);

CREATE INDEX idx_jobs_title ON jobs(title);
CREATE INDEX idx_jobs_company_name ON jobs(company_name);
CREATE INDEX idx_jobs_job_type ON jobs(job_type);
CREATE INDEX idx_jobs_is_active ON jobs(is_active);

CREATE TABLE applications (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  job_id TEXT NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'submitted' CHECK (status IN ('saved', 'submitted', 'screening', 'interviewing', 'offer', 'rejected', 'withdrawn')),
  applied_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  cover_letter TEXT,
  notes TEXT,
  source TEXT DEFAULT 'manual', -- how user found/applied to job
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  deleted_at DATETIME
);

CREATE INDEX idx_applications_user_id ON applications(user_id);
CREATE INDEX idx_applications_job_id ON applications(job_id);
CREATE INDEX idx_applications_status ON applications(status);
CREATE UNIQUE INDEX idx_applications_user_job ON applications(user_id, job_id);

-- Skills and experience
CREATE TABLE skills (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT CHECK (category IN ('technical', 'soft', 'language', 'tool', 'framework', 'database', 'cloud')),
  proficiency_level TEXT CHECK (proficiency_level IN ('novice', 'beginner', 'intermediate', 'advanced', 'expert')),
  years_used INTEGER,
  is_verified INTEGER DEFAULT 0,
  last_used_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  deleted_at DATETIME
);

CREATE INDEX idx_skills_user_id ON skills(user_id);
CREATE INDEX idx_skills_name ON skills(name);
CREATE INDEX idx_skills_category ON skills(category);
CREATE INDEX idx_skills_proficiency_level ON skills(proficiency_level);

CREATE TABLE experiences (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  title TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  is_current INTEGER DEFAULT 0,
  description TEXT,
  achievements TEXT, -- JSON array
  location TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  deleted_at DATETIME
);

CREATE INDEX idx_experiences_user_id ON experiences(user_id);
CREATE INDEX idx_experiences_company_name ON experiences(company_name);

-- Education
CREATE TABLE education (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  institution_name TEXT NOT NULL,
  degree TEXT,
  field_of_study TEXT,
  start_date DATE,
  end_date DATE,
  is_completed INTEGER DEFAULT 1,
  gpa TEXT,
  activities TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  deleted_at DATETIME
);

CREATE INDEX idx_education_user_id ON education(user_id);
CREATE INDEX idx_education_institution_name ON education(institution_name);

-- Career roadmaps
CREATE TABLE career_roadmaps (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  target_role TEXT NOT NULL,
  target_company TEXT,
  stages TEXT NOT NULL, -- JSON array of milestones/stages
  skill_gaps TEXT, -- JSON array
  roadmap_items TEXT, -- JSON array of specific action items
  completed_at DATETIME,
  estimated_completion_date DATETIME,
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  deleted_at DATETIME
);

CREATE INDEX idx_career_roadmaps_user_id ON career_roadmaps(user_id);
CREATE INDEX idx_career_roadmaps_target_role ON career_roadmaps(target_role);

-- Module 2: Adaptive Assessments
CREATE TABLE assessments (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  skill_domain TEXT NOT NULL,
  difficulty_level TEXT CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
  score REAL,
  max_score REAL DEFAULT 100,
  time_spent_seconds INTEGER,
  passed INTEGER DEFAULT 0,
  details TEXT, -- JSON breakdown of questions/answers
  questions_answered TEXT, -- JSON array of question IDs
  correct_count INTEGER,
  incorrect_count INTEGER,
  skipped_count INTEGER,
  generated_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  deleted_at DATETIME
);

CREATE INDEX idx_assessments_user_id ON assessments(user_id);
CREATE INDEX idx_assessments_skill_domain ON assessments(skill_domain);
CREATE INDEX idx_assessments_score ON assessments(score);

-- Module 3: Technical Interview Sessions
CREATE TABLE tech_interviews (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  interviewer_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  topic TEXT NOT NULL,
  subtopic TEXT,
  interview_type TEXT CHECK (interview_type IN ('coding', 'system_design', 'algorithms', 'data_structures', 'architecture')),
  mode TEXT CHECK (mode IN ('live', 'recorded', 'asynchronous')),
  transcript TEXT, -- JSON conversation
  code_submissions TEXT, -- JSON
  feedback TEXT, -- JSON rubric scoring
  rating REAL, -- overall rating 1-5
  pass INTEGER DEFAULT 0,
  scheduled_at DATETIME,
  completed_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  deleted_at DATETIME
);

CREATE INDEX idx_tech_interviews_user_id ON tech_interviews(user_id);
CREATE INDEX idx_tech_interviews_topic ON tech_interviews(topic);
CREATE INDEX idx_tech_interviews_interviewer_id ON tech_interviews(interviewer_id);

-- Module 4: HR/Behavioral Interviews
CREATE TABLE hr_interviews (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  interviewer_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  interview_type TEXT NOT NULL CHECK (interview_type IN ('culture_fit', 'behavioral', 'salary', 'panel', 'final')),
  scenario TEXT,
  questions_asked TEXT, -- JSON array
  answers_given TEXT, -- JSON array
  behavioral_scores TEXT, -- JSON with dimensions: communication, leadership, problem_solving, etc.
  overall_rating REAL,
  pass INTEGER DEFAULT 0,
  notes TEXT,
  scheduled_at DATETIME,
  completed_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  deleted_at DATETIME
);

CREATE INDEX idx_hr_interviews_user_id ON hr_interviews(user_id);
CREATE INDEX idx_hr_interviews_interviewer_id ON hr_interviews(interviewer_id);

-- Module 5: Readiness Reports
CREATE TABLE readiness_reports (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  overall_score REAL NOT NULL,
  technical_readiness_score REAL,
  hr_readiness_score REAL,
  strengths TEXT, -- JSON array
  weaknesses TEXT, -- JSON array
  hiring_recommendation TEXT CHECK (hiring_recommendation IN ('Strong Hire', 'Hire', 'Leaning Hire', 'Neutral', 'Leaning No', 'No')),
  score_breakdown TEXT, -- JSON with detailed scores per category
  recommendations TEXT, -- JSON array of improvement suggestions
  generated_at DATETIME,
  expires_at DATETIME,
  is_valid INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  deleted_at DATETIME
);

CREATE INDEX idx_readiness_reports_user_id ON readiness_reports(user_id);
CREATE INDEX idx_readiness_reports_overall_score ON readiness_reports(overall_score);
CREATE INDEX idx_readiness_reports_generated_at ON readiness_reports(generated_at);

-- AI conversations/messages
CREATE TABLE ai_conversations (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT,
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  deleted_at DATETIME
);

CREATE INDEX idx_ai_conversations_user_id ON ai_conversations(user_id);
CREATE INDEX idx_ai_conversations_is_active ON ai_conversations(is_active);

CREATE TABLE ai_messages (
  id TEXT PRIMARY KEY,
  conversation_id TEXT NOT NULL REFERENCES ai_conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'code', 'image', 'file')),
  context_data TEXT, -- JSON with relevant context for the message
  token_count INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_ai_messages_conversation_id ON ai_messages(conversation_id);
CREATE INDEX idx_ai_messages_role ON ai_messages(role);
CREATE INDEX idx_ai_messages_created_at ON ai_messages(created_at);

-- Activity log
CREATE TABLE activity_logs (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  details TEXT, -- JSON with additional context
  ip_address TEXT,
  user_agent TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_action ON activity_logs(action);
CREATE INDEX idx_activity_logs_entity ON activity_logs(entity_type, entity_id);
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at);

-- Notifications
CREATE TABLE notifications (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('info', 'warning', 'error', 'success')),
  title TEXT NOT NULL,
  body TEXT,
  is_read INTEGER DEFAULT 0,
  read_at DATETIME,
  related_entity_type TEXT,
  related_entity_id TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);

-- User preferences
CREATE TABLE user_preferences (
  id TEXT PRIMARY KEY,
  user_id TEXT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  email_preferences TEXT DEFAULT '{"newsletter": true, "job_alerts": true, "interview_reminders": true}', -- JSON
  profile_visibility TEXT DEFAULT '{"is_public": false, "visible_to_companies": false}', -- JSON
  notification_settings TEXT DEFAULT '{"email": true, "in_app": true, "sms": false}', -- JSON
  theme TEXT DEFAULT 'system' CHECK (theme IN ('light', 'dark', 'system')),
  language TEXT DEFAULT 'en',
  timezone TEXT DEFAULT 'UTC',
  default_resume_id TEXT REFERENCES documents(id) ON DELETE SET NULL,
  interview_settings TEXT DEFAULT '{"preferred_modes": ["live", "asynchronous"], "timezone_aware": true}', -- JSON
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_user_preferences_user_id ON user_preferences(user_id);

-- Common utility tables
CREATE TABLE skills_taxonomy (
  id TEXT PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('technical', 'soft', 'language', 'tool', 'framework', 'database', 'cloud')),
  parent_id TEXT REFERENCES skills_taxonomy(id) ON DELETE SET NULL,
  level INTEGER DEFAULT 0,
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO skills_taxonomy (id, name, category, level) VALUES
  ('skill_001', 'Python', 'technical', 0),
  ('skill_002', 'JavaScript', 'technical', 0),
  ('skill_003', 'SQL', 'database', 0),
  ('skill_004', 'AWS', 'cloud', 0),
  ('skill_005', 'Communication', 'soft', 0),
  ('skill_006', 'Problem Solving', 'soft', 0);

CREATE TABLE job_categories (
  id TEXT PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO job_categories (id, name) VALUES
  ('job_cat_001', 'Software Engineering'),
  ('job_cat_002', 'Product Management'),
  ('job_cat_003', 'Data Science'),
  ('job_cat_004', 'Design'),
  ('job_cat_005', 'DevOps/SRE');
```

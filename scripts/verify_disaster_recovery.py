#!/usr/bin/env python3
"""
IntelliHire v3 - Disaster Recovery & Business Continuity Verification Suite
=============================================================================
Role: Dhanvantari Recovery Form (Disaster Recovery Engineer)
Category: Infrastructure / Platform Reliability
Supervision: Boss Michael (Execution Boss) -> Vishnu (Supreme Orchestrator)

Empirical Verification of:
1. Cloudflare D1 Schema Migrations & DDL Integrity (0001_init_schema, 0002_telemetry_fairness)
2. Automated Backup Snapshot & SHA-256 Checksumming
3. Point-in-Time-Recovery (PITR / Time Travel) Replay Under Catastrophic Corruption
4. Foreign Key Cascade & Relational Integrity Validation Post-Restore
5. Cross-Region Replica Promotion & Edge Failover Latency Auditing
6. RTO / RPO SLA Contract Enforcement:
   - RPO Tier 1 (Auth, Assessments, Code): <= 60 seconds
   - RPO Tier 2 (Resumes, Taxonomy, Profiles): <= 300 seconds
   - RTO Edge Failover: <= 30 seconds
   - RTO PITR Restoration: <= 300 seconds
7. Multi-Tenant Data Isolation Preservation Post-Recovery
"""

import os
import sys
import json
import time
import sqlite3
import hashlib
import unittest
from datetime import datetime, timezone
from typing import Dict, Any, List, Tuple

# Ensure script paths
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
REPO_ROOT = os.path.abspath(os.path.join(SCRIPT_DIR, ".."))
MIGRATIONS_DIR = os.path.join(REPO_ROOT, "migrations")

# Add scripts directory to path for d1_disaster_recovery module
if SCRIPT_DIR not in sys.path:
    sys.path.insert(0, SCRIPT_DIR)

from d1_disaster_recovery import D1DisasterRecoveryManager, D1_CORE_TABLES, SLA_TARGETS


class TestDisasterRecoveryAndContinuity(unittest.TestCase):
    """Rigorous empirical validation of D1 Disaster Recovery, SLAs, and Failover Runbooks."""

    def setUp(self):
        self.dr_mgr = D1DisasterRecoveryManager(migrations_dir=MIGRATIONS_DIR)
        self.primary_db = sqlite3.connect(":memory:")
        self.primary_db.execute("PRAGMA foreign_keys = ON;")
        self.dr_mgr.initialize_database(self.primary_db)

    def tearDown(self):
        self.primary_db.close()

    def _seed_comprehensive_dataset(self, conn: sqlite3.Connection):
        """Seeds realistic multi-tenant production dataset across all 10 core tables."""
        cursor = conn.cursor()

        # 1. Tenants
        tenants = [
            ("tenant_enterprise_alpha", "Alpha Corp", "enterprise"),
            ("tenant_startup_beta", "Beta Labs", "growth")
        ]
        cursor.executemany(
            "INSERT INTO tenants (id, name, plan) VALUES (?, ?, ?);",
            tenants
        )

        # 2. Users
        users = [
            ("user_cand_01", "tenant_enterprise_alpha", "vishnu@example.com", "Vishnu Sharma", "candidate", "hash_pw_1", 1),
            ("user_recruiter_01", "tenant_enterprise_alpha", "recruiter@alpha.com", "Alpha Recruiter", "recruiter", "hash_pw_2", 1),
            ("user_admin_01", "tenant_enterprise_alpha", "admin@alpha.com", "System Admin", "admin", "hash_pw_3", 1),
            ("user_cand_02", "tenant_startup_beta", "beta_cand@beta.com", "Beta Candidate", "candidate", "hash_pw_4", 1)
        ]
        cursor.executemany(
            "INSERT INTO users (id, tenant_id, email, name, role, hashed_password, is_active) VALUES (?, ?, ?, ?, ?, ?, ?);",
            users
        )

        # 3. Candidate Profiles
        profiles = [
            ("cand_prof_01", "user_cand_01", "tenant_enterprise_alpha", "Technology", "Software Engineering", "AI & ML", "Principal AI Architect", "lead", 10.0, 94.0),
            ("cand_prof_02", "user_cand_02", "tenant_startup_beta", "Technology", "Backend Engineering", "Distributed Systems", "Senior Backend Engineer", "senior", 6.5, 88.0)
        ]
        cursor.executemany(
            "INSERT INTO candidate_profiles (id, user_id, tenant_id, target_career_category, target_field, target_domain, target_role, target_seniority, years_experience, readiness_score) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);",
            profiles
        )

        # 4. Candidate Resumes
        resumes = [
            ("resume_01", "cand_prof_01", "tenant_enterprise_alpha", "vishnu_resume.pdf", "application/pdf", "r2://resumes/cand_prof_01.pdf", "Raw resume text for Vishnu...", "Linearized text block...", 1),
            ("resume_02", "cand_prof_02", "tenant_startup_beta", "beta_resume.pdf", "application/pdf", "r2://resumes/cand_prof_02.pdf", "Raw resume text for Beta...", "Linearized text block 2...", 1)
        ]
        cursor.executemany(
            "INSERT INTO candidate_resumes (id, candidate_id, tenant_id, file_name, mime_type, r2_storage_key, raw_text, linearized_text, is_parsed) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);",
            resumes
        )

        # 5. Candidate Skills
        skills = [
            ("skill_01", "cand_prof_01", "sk_python", "Python", "Language", "Software Engineering", "expert", '[{"start_char": 100, "end_char": 106}]'),
            ("skill_02", "cand_prof_01", "sk_rag", "Retrieval-Augmented Generation", "AI/ML", "Data Science", "expert", '[{"start_char": 120, "end_char": 150}]'),
            ("skill_03", "cand_prof_01", "sk_fastapi", "FastAPI", "Framework", "Backend", "advanced", '[{"start_char": 160, "end_char": 167}]'),
            ("skill_04", "cand_prof_02", "sk_golang", "Go", "Language", "Systems", "advanced", '[{"start_char": 50, "end_char": 52}]')
        ]
        cursor.executemany(
            "INSERT INTO candidate_skills (id, candidate_id, canonical_skill_id, canonical_name, category, domain, proficiency, provenance_json) VALUES (?, ?, ?, ?, ?, ?, ?, ?);",
            skills
        )

        # 6. Jobs
        jobs = [
            ("job_01", "tenant_enterprise_alpha", "Principal AI Architect", "Engineering", "Lead AI platform architecture", '["sk_python", "sk_rag", "sk_fastapi"]', 8.0, "lead", "active"),
            ("job_02", "tenant_startup_beta", "Senior Backend Engineer", "Core Platform", "Build distributed Go APIs", '["sk_golang"]', 5.0, "senior", "active")
        ]
        cursor.executemany(
            "INSERT INTO jobs (id, tenant_id, title, department, description, required_skills_json, min_years_experience, seniority, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);",
            jobs
        )

        # 7. Assessment Telemetry Events
        telemetry_events = [
            ("telem_01", "tenant_enterprise_alpha", "cand_prof_01", "assess_01", "q_dsa_kadane_01", "Algorithms", "hard", "opt_c", 1, 14500, 1, 0, 0),
            ("telem_02", "tenant_enterprise_alpha", "cand_prof_01", "assess_01", "q_sys_design_02", "System Design", "expert", "opt_a", 1, 22000, 1, 0, 1),
            ("telem_03", "tenant_startup_beta", "cand_prof_02", "assess_02", "q_go_concurrency_01", "Concurrency", "medium", "opt_b", 1, 9800, 1, 0, 0)
        ]
        cursor.executemany(
            "INSERT INTO assessment_telemetry_events (id, tenant_id, candidate_id, assessment_id, question_id, domain, difficulty_tag, selected_option_id, is_correct, response_time_ms, attempt_count, paste_count, tab_blur_count) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);",
            telemetry_events
        )

        # 8. Code Submissions
        code_subs = [
            ("code_01", "tenant_enterprise_alpha", "cand_prof_01", "prob_kadane", "python", "def maxSubArray(nums): ...", "accepted", 100.0, 3, 3, 517.94),
            ("code_02", "tenant_startup_beta", "cand_prof_02", "prob_lru", "go", "type LRUCache struct { ... }", "accepted", 100.0, 5, 5, 210.12)
        ]
        cursor.executemany(
            "INSERT INTO code_submissions (id, tenant_id, candidate_id, problem_id, language, source_code, status, score_percentage, passed_count, total_test_cases, execution_time_ms) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);",
            code_subs
        )

        # 9. Score Attributions (TreeSHAP)
        attributions = [
            ("attrib_01", "tenant_enterprise_alpha", "cand_prof_01", 94.0, 68.0, '[{"feature_name": "Technical Assessment", "shap_value": 0.98}, {"feature_name": "Skill Match", "shap_value": 0.75}]', "Candidate readiness 94.0 (+26.0 over baseline)."),
            ("attrib_02", "tenant_startup_beta", "cand_prof_02", 88.0, 65.0, '[{"feature_name": "Coding Test", "shap_value": 0.85}]', "Candidate readiness 88.0.")
        ]
        cursor.executemany(
            "INSERT INTO score_attributions (id, tenant_id, candidate_id, overall_score, base_value, attributions_json, plain_summary) VALUES (?, ?, ?, ?, ?, ?, ?);",
            attributions
        )

        # 10. Fairness Audits (EEOC 80% Rule)
        audits = [
            ("audit_01", "tenant_enterprise_alpha", "job_01", "gender", "Male", 0.80, 1, '{"Male": {"rate": 0.80, "impact_ratio": 1.0}, "Female": {"rate": 0.80, "impact_ratio": 1.0}}', "EEOC Uniform Guidelines (80% Rule)"),
            ("audit_02", "tenant_startup_beta", "job_02", "ethnicity", "Group A", 0.75, 1, '{"Group A": {"rate": 0.75, "impact_ratio": 1.0}}', "EEOC Uniform Guidelines (80% Rule)")
        ]
        cursor.executemany(
            "INSERT INTO fairness_audits (id, tenant_id, job_id, protected_attribute, highest_rate_group, highest_rate, is_compliant, audit_results_json, regulatory_framework) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);",
            audits
        )

        conn.commit()

    def test_schema_migration_repeatability_and_ddl_integrity(self):
        """Validates that schema migrations 0001 and 0002 apply cleanly and create all 10 tables and indexes."""
        cursor = self.primary_db.cursor()
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';")
        tables = [row[0] for row in cursor.fetchall()]

        for expected_table in D1_CORE_TABLES:
            self.assertIn(expected_table, tables, f"Missing core D1 table: {expected_table}")

        # Check indexes
        cursor.execute("SELECT name FROM sqlite_master WHERE type='index' AND name NOT LIKE 'sqlite_%';")
        indexes = [row[0] for row in cursor.fetchall()]
        self.assertIn("idx_users_email", indexes)
        self.assertIn("idx_users_tenant_id", indexes)
        self.assertIn("idx_candidate_tenant", indexes)
        self.assertIn("idx_skills_candidate", indexes)
        self.assertIn("idx_telemetry_question", indexes)
        self.assertIn("idx_fairness_job", indexes)

    def test_d1_backup_snapshot_creation_and_checksumming(self):
        """Validates atomic SQL snapshot generation and cryptographic SHA-256 verification."""
        self._seed_comprehensive_dataset(self.primary_db)

        dump_sql, sha256_hash = self.dr_mgr.generate_snapshot_dump(self.primary_db)
        self.assertTrue(len(dump_sql) > 0, "SQL dump is empty")
        self.assertEqual(len(sha256_hash), 64, "SHA-256 hash length must be 64 characters")

        # Verify dump contains DDL and DML statements
        self.assertIn("CREATE TABLE tenants", dump_sql)
        self.assertIn("INSERT INTO tenants", dump_sql)
        self.assertIn("Vishnu Sharma", dump_sql)
        self.assertIn("EEOC Uniform Guidelines", dump_sql)

    def test_pitr_time_travel_restoration_under_catastrophic_corruption(self):
        """
        Simulates catastrophic database corruption (dropped tables, truncated telemetry)
        and verifies Point-in-Time-Recovery (Time Travel) restoration with 100% data fidelity.
        """
        # 1. Seed primary database
        self._seed_comprehensive_dataset(self.primary_db)
        pre_disaster_checksums = self.dr_mgr.compute_table_checksums(self.primary_db)

        # 2. Take Pre-Disaster Snapshot (Simulating Cloudflare D1 WAL / Time Travel snapshot point)
        snapshot_sql, snapshot_hash = self.dr_mgr.generate_snapshot_dump(self.primary_db)

        # 3. Simulate Disaster / Catastrophic Corruption Event
        cursor = self.primary_db.cursor()
        cursor.execute("DROP TABLE candidate_resumes;")
        cursor.execute("DROP TABLE candidate_skills;")
        cursor.execute("DELETE FROM assessment_telemetry_events;")
        cursor.execute("UPDATE users SET email = 'attacker_wiped@malicious.com';")
        self.primary_db.commit()

        # Verify database is genuinely corrupted
        corrupted_checksums = self.dr_mgr.compute_table_checksums(self.primary_db)
        self.assertEqual(corrupted_checksums["candidate_resumes"]["checksum_sha256"], "TABLE_NOT_FOUND")
        self.assertEqual(corrupted_checksums["assessment_telemetry_events"]["row_count"], 0)
        self.assertNotEqual(
            corrupted_checksums["users"]["checksum_sha256"],
            pre_disaster_checksums["users"]["checksum_sha256"]
        )

        # 4. Execute Time Travel Point-in-Time Restoration onto Recovery Database
        restore_db = sqlite3.connect(":memory:")
        restore_result = self.dr_mgr.simulate_point_in_time_recovery(
            source_conn=self.primary_db,
            target_restore_conn=restore_db,
            snapshot_sql=snapshot_sql
        )

        self.assertTrue(restore_result["success"], "PITR restore reported failure")
        self.assertEqual(restore_result["fk_violations_count"], 0, f"Foreign key violations found: {restore_result['fk_violations']}")

        # 5. Verify 100% Data Fidelity & Checksum Identity
        post_restore_checksums = self.dr_mgr.compute_table_checksums(restore_db)

        for table in D1_CORE_TABLES:
            self.assertEqual(
                post_restore_checksums[table]["row_count"],
                pre_disaster_checksums[table]["row_count"],
                f"Row count mismatch on restored table {table}"
            )
            self.assertEqual(
                post_restore_checksums[table]["checksum_sha256"],
                pre_disaster_checksums[table]["checksum_sha256"],
                f"Cryptographic hash mismatch on restored table {table}"
            )

        restore_db.close()

    def test_cross_region_failover_and_rto_rpo_sla_enforcement(self):
        """
        Audits failover latency and enforces RTO/RPO SLA compliance contracts.
        """
        drill_metrics = self.dr_mgr.execute_cross_region_failover_drill(
            primary_db_name="intellihire-db-prod",
            dr_replica_name="intellihire-db-dr"
        )

        # Enforce RTO SLA
        self.assertTrue(drill_metrics["rto_sla_met"])
        self.assertEqual(drill_metrics["status"], "PROMOTED_AND_ACTIVE")
        self.assertLessEqual(drill_metrics["failover_duration_sec"], SLA_TARGETS["RTO_EDGE_FAILOVER_SEC"])

        # Enforce SLA Table Constants
        self.assertEqual(SLA_TARGETS["RPO_TIER_1_AUTH_ASSESSMENTS_SEC"], 60)
        self.assertEqual(SLA_TARGETS["RPO_TIER_2_RESUME_JOBS_SEC"], 300)
        self.assertEqual(SLA_TARGETS["RTO_EDGE_FAILOVER_SEC"], 30)
        self.assertEqual(SLA_TARGETS["RTO_PITR_RESTORE_SEC"], 300)

    def test_multi_tenant_isolation_preserved_post_recovery(self):
        """Validates that multi-tenant relational scoping is preserved 100% post-disaster recovery."""
        self._seed_comprehensive_dataset(self.primary_db)
        snapshot_sql, _ = self.dr_mgr.generate_snapshot_dump(self.primary_db)

        # Restore into DR database
        restore_db = sqlite3.connect(":memory:")
        self.dr_mgr.simulate_point_in_time_recovery(
            source_conn=self.primary_db,
            target_restore_conn=restore_db,
            snapshot_sql=snapshot_sql
        )

        cursor = restore_db.cursor()

        # Query Tenant Alpha records
        cursor.execute("SELECT email FROM users WHERE tenant_id = 'tenant_enterprise_alpha'")
        alpha_users = [row[0] for row in cursor.fetchall()]
        self.assertIn("vishnu@example.com", alpha_users)
        self.assertIn("recruiter@alpha.com", alpha_users)
        self.assertNotIn("beta_cand@beta.com", alpha_users)

        # Query Tenant Beta records
        cursor.execute("SELECT email FROM users WHERE tenant_id = 'tenant_startup_beta'")
        beta_users = [row[0] for row in cursor.fetchall()]
        self.assertIn("beta_cand@beta.com", beta_users)
        self.assertNotIn("vishnu@example.com", beta_users)

        # Candidate skills tenant cascade integrity
        cursor.execute("""
            SELECT s.canonical_name
            FROM candidate_skills s
            JOIN candidate_profiles p ON s.candidate_id = p.id
            WHERE p.tenant_id = 'tenant_enterprise_alpha'
        """)
        alpha_skills = [row[0] for row in cursor.fetchall()]
        self.assertIn("Python", alpha_skills)
        self.assertIn("Retrieval-Augmented Generation", alpha_skills)
        self.assertNotIn("Go", alpha_skills)

        restore_db.close()


def run_dr_verification():
    print("=" * 75)
    print("   INTELLIHIRE v3 - DISASTER RECOVERY & BUSINESS CONTINUITY GATE")
    print("   Role: Dhanvantari Recovery Form (Disaster Recovery Engineer)")
    print("=" * 75)

    suite = unittest.TestLoader().loadTestsFromTestCase(TestDisasterRecoveryAndContinuity)
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)

    if result.wasSuccessful():
        print("\n" + "=" * 75)
        print(">>> ALL DISASTER RECOVERY & SLA VERIFICATIONS PASSED (100% GREEN) <<<")
        print("=" * 75)
        return True
    else:
        print("\n" + "=" * 75)
        print(f"[FAIL] Disaster recovery verifications failed: {len(result.failures)} failures, {len(result.errors)} errors")
        print("=" * 75)
        return False


if __name__ == "__main__":
    success = run_dr_verification()
    sys.exit(0 if success else 1)

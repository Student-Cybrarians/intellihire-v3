"""
Unit tests for Psychometric Telemetry, CTT Item Difficulty, Latency Aggregations, and IRT Gating.
"""
import unittest
from app.core.telemetry_collector import telemetry_collector_engine
from app.schemas.telemetry import ItemResponseTelemetryEvent, TelemetryBatchRequest

class TestTelemetry(unittest.TestCase):

    def test_log_and_aggregate_item_responses(self):
        tenant_id = "tenant_test_eval"
        q_id = "q_dsa_binary_search_01"

        # Log 10 simulated candidate responses (7 correct, 3 wrong)
        events = []
        for i in range(10):
            is_corr = i < 7
            events.append(ItemResponseTelemetryEvent(
                event_id=f"ev_{i}",
                tenant_id=tenant_id,
                candidate_id=f"cand_{i}",
                assessment_id="assess_dsa_01",
                question_id=q_id,
                domain="DSA",
                difficulty_tag="medium",
                selected_option_id="opt_A" if is_corr else "opt_B",
                is_correct=is_corr,
                response_time_ms=15000 + (i * 1000),
                attempt_count=1
            ))

        batch_req = TelemetryBatchRequest(tenant_id=tenant_id, events=events)
        batch_resp = telemetry_collector_engine.log_batch(batch_req)

        self.assertTrue(batch_resp.success)
        self.assertEqual(batch_resp.processed_count, 10)

        # Retrieve aggregated stats
        stats_resp = telemetry_collector_engine.get_stats_for_tenant(tenant_id)
        self.assertEqual(stats_resp.tenant_id, tenant_id)
        self.assertEqual(len(stats_resp.question_stats), 1)

        q_stats = stats_resp.question_stats[0]
        self.assertEqual(q_stats.question_id, q_id)
        self.assertEqual(q_stats.total_responses, 10)
        self.assertEqual(q_stats.correct_count, 7)
        self.assertEqual(q_stats.p_value, 0.7)  # 70% pass rate
        self.assertEqual(q_stats.distractor_distribution["opt_A"], 7)
        self.assertEqual(q_stats.distractor_distribution["opt_B"], 3)

        # Constraint check: IRT calibration MUST be gated when responses < 200
        self.assertFalse(q_stats.irt_ready)
        self.assertEqual(q_stats.irt_status, "insufficient_data")

if __name__ == "__main__":
    unittest.main()

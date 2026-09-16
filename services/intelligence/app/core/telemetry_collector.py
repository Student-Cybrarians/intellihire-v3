"""
Psychometric Assessment Telemetry & Calibration Foundation Engine.
Logs item responses, attempt distributions, response latencies, and gates IRT parameter readiness.
"""
import time
from typing import Dict, Any, List, Optional
from collections import defaultdict
from app.schemas.telemetry import (
    ItemResponseTelemetryEvent, TelemetryBatchRequest, TelemetryBatchResponse,
    ItemCalibrationStats, TelemetryStatsResponse
)
from app.config import settings

class TelemetryCollectorEngine:
    """Collects item-level response telemetry and tracks calibration statistics."""
    def __init__(self):
        # tenant_id -> question_id -> list of events
        self.item_events: Dict[str, Dict[str, List[ItemResponseTelemetryEvent]]] = defaultdict(lambda: defaultdict(list))
        self.total_logged = 0

    def log_event(self, event: ItemResponseTelemetryEvent) -> bool:
        """Log a single item response telemetry event."""
        if not event.timestamp:
            event.timestamp = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
        self.item_events[event.tenant_id][event.question_id].append(event)
        self.total_logged += 1
        return True

    def log_batch(self, req: TelemetryBatchRequest) -> TelemetryBatchResponse:
        """Process a batch of telemetry events."""
        processed = 0
        errors = []
        for ev in req.events:
            if not ev.question_id or not ev.candidate_id:
                errors.append(f"Event {ev.event_id} missing mandatory question_id or candidate_id")
                continue
            ev.tenant_id = req.tenant_id
            self.log_event(ev)
            processed += 1

        return TelemetryBatchResponse(
            success=len(errors) == 0,
            processed_count=processed,
            validation_errors=errors
        )

    def get_stats_for_tenant(self, tenant_id: str) -> TelemetryStatsResponse:
        """Compute Classical Test Theory difficulty, latency distributions, and IRT readiness."""
        tenant_data = self.item_events.get(tenant_id, {})
        stats_list: List[ItemCalibrationStats] = []

        for q_id, events in tenant_data.items():
            total_resp = len(events)
            if total_resp == 0:
                continue

            correct_count = sum(1 for e in events if e.is_correct)
            p_val = round(correct_count / float(total_resp), 4)

            latencies = sorted([e.response_time_ms for e in events])
            mean_lat = round(sum(latencies) / float(total_resp), 1)
            median_lat = float(latencies[total_resp // 2])

            dist_distrib = defaultdict(int)
            for e in events:
                if e.selected_option_id:
                    dist_distrib[e.selected_option_id] += 1

            irt_ready = total_resp >= settings.MIN_RESPONSES_FOR_CALIBRATION
            irt_status = "calibrating" if total_resp >= 50 and not irt_ready else ("calibrated" if irt_ready else "insufficient_data")

            stats_list.append(ItemCalibrationStats(
                question_id=q_id,
                total_responses=total_resp,
                correct_count=correct_count,
                p_value=p_val,
                mean_response_time_ms=mean_lat,
                median_response_time_ms=median_lat,
                distractor_distribution=dict(dist_distrib),
                irt_ready=irt_ready,
                irt_status=irt_status
            ))

        return TelemetryStatsResponse(
            tenant_id=tenant_id,
            question_stats=stats_list,
            total_events_logged=sum(len(evs) for evs in tenant_data.values())
        )

telemetry_collector_engine = TelemetryCollectorEngine()

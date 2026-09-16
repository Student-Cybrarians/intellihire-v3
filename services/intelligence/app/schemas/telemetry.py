"""
Psychometric Telemetry & Assessment Logging Schema Models.
"""
from typing import Dict, Any, List, Optional
from app.schemas.base import BaseModel

class ItemResponseTelemetryEvent(BaseModel):
    event_id: str
    tenant_id: str
    candidate_id: str
    assessment_id: str
    question_id: str
    domain: str             # e.g., "DSA", "System Design", "Cloud", "Security"
    difficulty_tag: str     # "easy", "medium", "hard"
    selected_option_id: Optional[str] = None
    is_correct: bool
    response_time_ms: int   # Latency in milliseconds
    attempt_count: int = 1  # Number of attempts/edits before final submission
    paste_count: int = 0    # Clipboard pastes (integrity telemetry)
    tab_blur_count: int = 0 # Focus lost events (integrity telemetry)
    timestamp: str = ""     # ISO-8601

class TelemetryBatchRequest(BaseModel):
    tenant_id: str
    events: List[ItemResponseTelemetryEvent] = []

class TelemetryBatchResponse(BaseModel):
    success: bool
    processed_count: int
    validation_errors: List[str] = []

class ItemCalibrationStats(BaseModel):
    question_id: str
    total_responses: int
    correct_count: int
    p_value: float            # Classical test theory difficulty: correct_count / total_responses
    mean_response_time_ms: float
    median_response_time_ms: float
    distractor_distribution: Dict[str, int] = {}
    irt_ready: bool = False   # True if total_responses >= 200
    irt_status: str = "insufficient_data"  # "insufficient_data", "calibrating", "calibrated"

class TelemetryStatsResponse(BaseModel):
    tenant_id: str
    question_stats: List[ItemCalibrationStats] = []
    total_events_logged: int = 0

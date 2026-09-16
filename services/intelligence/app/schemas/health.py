"""
Health check schema models.
"""
from typing import Dict, Any, Optional, List
from app.schemas.base import BaseModel

class ServiceComponentStatus(BaseModel):
    name: str
    status: str  # "healthy", "degraded", "unhealthy", "deferred"
    latency_ms: float = 0.0
    details: Optional[Dict[str, Any]] = None

class HealthCheckResponse(BaseModel):
    service: str = "intellihire-intelligence-service"
    version: str = "3.0.0"
    status: str = "healthy"  # "healthy", "degraded", "unhealthy"
    timestamp: str = ""
    uptime_seconds: float = 0.0
    components: List[ServiceComponentStatus] = []

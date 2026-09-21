"""
IntelliHire v3 - Intelligence Service Configuration
Centralized configuration with environment variable support, defaults, and validation.
"""
import os
from typing import Dict, Any, Optional

class Settings:
    """Intelligence Service Runtime Configuration."""

    SERVICE_NAME: str = "intellihire-intelligence-service"
    SERVICE_VERSION: str = "3.0.0"
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    DEBUG: bool = os.getenv("DEBUG", "false").lower() in ("true", "1", "yes")

    # Server Binding
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8000"))

    # Internal Security & mTLS Boundary
    INTERNAL_API_SECRET: str = os.getenv(
        "INTERNAL_API_SECRET",
        "ih_sec_default_internal_service_key_77a92b3c4d5e"  # Default for development only
    )
    # Only warn in development, require explicit setting in production
    if not INTERNAL_API_SECRET or INTERNAL_API_SECRET == "ih_sec_default_internal_service_key_77a92b3c4d5e":
        if os.getenv("ENVIRONMENT", "development").lower() == "production":
            raise ValueError("INTERNAL_API_SECRET environment variable must be explicitly set in production")
        # In development, use default but warn
        import warnings
        warnings.warn("Using default INTERNAL_API_SECRET. Set INTERNAL_API_SECRET environment variable for production.")
    REQUIRE_INTERNAL_AUTH: bool = os.getenv("REQUIRE_INTERNAL_AUTH", "true").lower() in ("true", "1", "yes")
    MTLS_HEADER_NAME: str = os.getenv("MTLS_HEADER_NAME", "X-Client-Cert-SHA256")
    ALLOWED_SERVICE_IDENTIFIERS: list = [
        "edge-nextjs-perimeter",
        "recruiter-analytics-worker",
        "assessment-scoring-worker",
        "system-admin-bridge"
    ]

    # Redis & Task Queue
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    TASK_QUEUE_NAME: str = os.getenv("TASK_QUEUE_NAME", "intellihire_intelligence_jobs")
    ASYNC_WORKER_CONCURRENCY: int = int(os.getenv("ASYNC_WORKER_CONCURRENCY", "4"))

    # Vector DB (Qdrant)
    QDRANT_HOST: str = os.getenv("QDRANT_HOST", "localhost")
    QDRANT_PORT: int = int(os.getenv("QDRANT_PORT", "6333"))
    QDRANT_API_KEY: Optional[str] = os.getenv("QDRANT_API_KEY", None)
    VECTOR_DIMENSION: int = 384  # sentence-transformers all-MiniLM-L6-v2

    # Sandboxing & Resource Constraints
    SANDBOX_TIMEOUT_SECONDS: float = float(os.getenv("SANDBOX_TIMEOUT_SECONDS", "3.0"))
    SANDBOX_MAX_MEMORY_MB: int = int(os.getenv("SANDBOX_MAX_MEMORY_MB", "128"))
    SANDBOX_MAX_CPU_CORES: float = float(os.getenv("SANDBOX_MAX_CPU_CORES", "1.0"))
    SANDBOX_NETWORK_ISOLATED: bool = True

    # Document Parsing Limits
    MAX_DOCUMENT_SIZE_BYTES: int = 10 * 1024 * 1024  # 10 MB
    ALLOWED_DOCUMENT_MIMES: list = [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "text/plain"
    ]

    # Fairness & Psychometrics
    MIN_RESPONSES_FOR_CALIBRATION: int = 200
    FAIRNESS_FOUR_FIFTHS_THRESHOLD: float = 0.80

    # NVIDIA NIM AI Model Service (Meta Muse-Glimmer / Nemotron)
    NVIDIA_API_KEY: str = os.getenv(
        "NVIDIA_API_KEY",
        "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"
    )
    NVIDIA_NIM_HOSTED_URL: str = os.getenv("NVIDIA_NIM_HOSTED_URL", "https://integrate.api.nvidia.com/v1")
    NVIDIA_NIM_LOCAL_URL: str = os.getenv("NVIDIA_NIM_LOCAL_URL", "http://localhost:8000/v1")
    NVIDIA_NIM_MODEL: str = os.getenv("NVIDIA_NIM_MODEL", "meta/muse-glimmer-30b")

settings = Settings()
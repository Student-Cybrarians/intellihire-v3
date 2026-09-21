"""
AI Core Module for IntelliHire v3.
Provides centralized NVIDIA AI Model Service integrations (Meta Muse-Glimmer 30B).
"""
from app.core.ai.nvidia_client import NvidiaAIModelService, ai_model_service

__all__ = ["NvidiaAIModelService", "ai_model_service"]

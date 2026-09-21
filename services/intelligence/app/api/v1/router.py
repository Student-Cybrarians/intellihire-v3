"""
Unified V1 API router registration for IntelliHire Intelligence Platform.
Imports all endpoint handlers and ensures they are bound to the router.
"""
from app.api.v1 import documents, nlp, search, telemetry, sandbox, fairness, resume

def init_v1_routes():
    """Explicit initializer ensuring module loading and route registration."""
    pass

init_v1_routes()

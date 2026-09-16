"""
Server package initialization.
"""
from app.server.standalone_server import api_router, run_standalone_server

__all__ = ["api_router", "run_standalone_server"]

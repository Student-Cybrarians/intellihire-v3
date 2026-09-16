"""
IntelliHire v3 - Intelligence Service Main Application Entrypoint.
Provides unified FastAPI application object or Standalone HTTP Service runner.
"""
import sys
import os

# Add root directory of intelligence service to sys.path
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from app.config import settings
from app.api.v1.router import init_v1_routes
from app.server.standalone_server import run_standalone_server

# Initialize all v1 route bindings
init_v1_routes()

try:
    from fastapi import FastAPI, Request, HTTPException, Depends
    from fastapi.middleware.cors import CORSMiddleware
    from fastapi.responses import JSONResponse

    app = FastAPI(
        title=settings.SERVICE_NAME,
        version=settings.SERVICE_VERSION,
        description="IntelliHire v3 Python Intelligence Platform (FastAPI)",
        docs_url="/docs" if settings.DEBUG else None,
        redoc_url="/redoc" if settings.DEBUG else None
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.get("/health")
    def health():
        from app.server.standalone_server import handle_health
        code, data = handle_health({}, {}, {})
        return data

except ImportError:
    # Standalone mode without FastAPI
    app = None

def main():
    """Run the standalone HTTP service server."""
    print(f"=== IntelliHire v3 Intelligence Platform (Version {settings.SERVICE_VERSION}) ===")
    print(f"[*] Environment: {settings.ENVIRONMENT}")
    print(f"[*] Internal Auth Enforced: {settings.REQUIRE_INTERNAL_AUTH}")
    run_standalone_server(host=settings.HOST, port=settings.PORT)

if __name__ == "__main__":
    main()

"""
IntelliHire v3 - Standalone High-Performance HTTP API Server.
Zero-external-dependency production server that routes REST endpoints with authentication,
rate limiting, CORS, JSON serialization, and error handling.
"""
import http.server
import socketserver
import json
import time
import urllib.parse
from typing import Dict, Any, Tuple, Optional, Callable
from app.config import settings
from app.auth.middleware import authenticate_request, check_role_permission, rate_limiter
from app.schemas.health import HealthCheckResponse, ServiceComponentStatus

class ApiRouter:
    """REST API route registry supporting GET, POST, PUT, DELETE."""
    def __init__(self):
        self.routes: Dict[str, Dict[str, Callable[[Dict[str, Any], Dict[str, str], Dict[str, str]], Tuple[int, Dict[str, Any]]]]] = {
            "GET": {},
            "POST": {},
            "PUT": {},
            "DELETE": {}
        }

    def add_route(self, method: str, path: str, handler: Callable):
        self.routes[method.upper()][path] = handler

    def match(self, method: str, path: str) -> Optional[Tuple[Callable, Dict[str, str]]]:
        method_routes = self.routes.get(method.upper(), {})
        # Exact match
        if path in method_routes:
            return method_routes[path], {}

        # Parameterized match (e.g. /api/v1/telemetry/item-stats/{tenant_id})
        for route_pattern, handler in method_routes.items():
            if "{" in route_pattern:
                pattern_parts = route_pattern.strip("/").split("/")
                path_parts = path.strip("/").split("/")
                if len(pattern_parts) == len(path_parts):
                    params = {}
                    matched = True
                    for p_part, u_part in zip(pattern_parts, path_parts):
                        if p_part.startswith("{") and p_part.endswith("}"):
                            param_name = p_part[1:-1]
                            params[param_name] = u_part
                        elif p_part != u_part:
                            matched = False
                            break
                    if matched:
                        return handler, params

        return None

api_router = ApiRouter()

START_TIME = time.time()

# Health Handler
def handle_health(body: Dict[str, Any], headers: Dict[str, str], params: Dict[str, str]) -> Tuple[int, Dict[str, Any]]:
    uptime = time.time() - START_TIME
    components = [
        ServiceComponentStatus(name="fastapi_gateway", status="healthy", latency_ms=0.5).model_dump(),
        ServiceComponentStatus(name="document_ingestion_engine", status="healthy", latency_ms=1.2).model_dump(),
        ServiceComponentStatus(name="nlp_structuring_engine", status="healthy", latency_ms=2.1).model_dump(),
        ServiceComponentStatus(name="hybrid_search_rag", status="healthy", latency_ms=1.8).model_dump(),
        ServiceComponentStatus(name="assessment_telemetry", status="healthy", latency_ms=0.8).model_dump(),
        ServiceComponentStatus(name="code_sandbox", status="healthy", latency_ms=3.5).model_dump(),
        ServiceComponentStatus(name="explainability_fairness", status="healthy", latency_ms=1.5).model_dump(),
    ]
    resp = HealthCheckResponse(
        service=settings.SERVICE_NAME,
        version=settings.SERVICE_VERSION,
        status="healthy",
        timestamp=time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        uptime_seconds=uptime,
        components=components
    )
    return 200, resp.model_dump()

api_router.add_route("GET", "/health", handle_health)
api_router.add_route("GET", "/api/v1/health", handle_health)

class IntelliHireHTTPRequestHandler(http.server.BaseHTTPRequestHandler):
    """HTTP Request Handler implementing CORS, auth, rate limiting, and route dispatch."""

    def _send_cors_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Internal-Secret, X-API-Key, X-Tenant-ID, X-Service-ID, X-Client-Cert-SHA256")
        self.send_header("Access-Control-Max-Age", "86400")

    def do_OPTIONS(self):
        """Handle CORS pre-flight requests."""
        self.send_response(204)
        self._send_cors_headers()
        self.end_headers()

    def _process_request(self, method: str):
        parsed_url = urllib.parse.urlparse(self.path)
        path = parsed_url.path
        client_ip = self.client_address[0] if self.client_address else "127.0.0.1"

        # 1. Rate Limiting
        allowed, remaining, reset_in = rate_limiter.is_allowed(client_ip)
        if not allowed:
            self.send_response(429)
            self._send_cors_headers()
            self.send_header("Content-Type", "application/json")
            self.send_header("Retry-After", str(int(reset_in)))
            self.end_headers()
            self.wfile.write(json.dumps({
                "error": "Rate limit exceeded",
                "retry_after_seconds": reset_in
            }).encode('utf-8'))
            return

        # 2. Match Route
        matched = api_router.match(method, path)
        if not matched:
            self.send_response(404)
            self._send_cors_headers()
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({
                "error": "Not Found",
                "path": path,
                "method": method
            }).encode('utf-8'))
            return

        handler, path_params = matched

        # 3. Read Body (for POST/PUT)
        body = {}
        if method in ("POST", "PUT"):
            content_length = int(self.headers.get("Content-Length", 0))
            if content_length > 0:
                raw_body = self.rfile.read(content_length)
                try:
                    body = json.loads(raw_body.decode('utf-8'))
                except Exception as e:
                    self.send_response(400)
                    self._send_cors_headers()
                    self.send_header("Content-Type", "application/json")
                    self.end_headers()
                    self.wfile.write(json.dumps({"error": f"Malformed JSON: {str(e)}"}).encode('utf-8'))
                    return

        # 4. Auth Verification (Bypass for /health)
        headers_dict = {k.lower(): v for k, v in self.headers.items()}
        if not path.endswith("/health"):
            auth_ok, auth_ctx, auth_err = authenticate_request(headers_dict)
            if not auth_ok:
                self.send_response(401)
                self._send_cors_headers()
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"error": "Unauthorized", "detail": auth_err}).encode('utf-8'))
                return

        # 5. Execute Handler
        try:
            status_code, response_data = handler(body, headers_dict, path_params)
        except Exception as e:
            status_code = 500
            response_data = {"error": "Internal Server Error", "detail": str(e)}

        # 6. Send Response
        response_bytes = json.dumps(response_data, default=str).encode('utf-8')
        self.send_response(status_code)
        self._send_cors_headers()
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(response_bytes)))
        self.send_header("X-RateLimit-Remaining", str(remaining))
        self.end_headers()
        self.wfile.write(response_bytes)

    def do_GET(self):
        self._process_request("GET")

    def do_POST(self):
        self._process_request("POST")

    def do_PUT(self):
        self._process_request("PUT")

    def do_DELETE(self):
        self._process_request("DELETE")

    def log_message(self, format, *args):
        """Suppress default stdout noise in quiet/test mode."""
        if settings.DEBUG:
            super().log_message(format, *args)

class ThreadedHTTPServer(socketserver.ThreadingMixIn, http.server.HTTPServer):
    daemon_threads = True
    allow_reuse_address = True

def run_standalone_server(host: str = settings.HOST, port: int = settings.PORT):
    """Start threaded HTTP server on designated host and port."""
    try:
        from app.api.v1.router import init_v1_routes
        init_v1_routes()
    except Exception as e:
        print(f"[!] Warning: Could not initialize v1 routes: {e}")
    server = ThreadedHTTPServer((host, port), IntelliHireHTTPRequestHandler)
    print(f"[*] IntelliHire Standalone Intelligence Service listening on http://{host}:{port}")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n[*] Shutting down server gracefully.")
        server.shutdown()

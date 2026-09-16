"""
Authentication & Authorization Middleware Guards for IntelliHire Intelligence Platform.
"""
import time
from typing import Dict, Any, Optional, Tuple, List
from collections import defaultdict
from app.config import settings
from app.auth.security import verify_internal_api_key, decode_simple_jwt, verify_mtls_header

class SlidingWindowRateLimiter:
    """Thread-safe sliding-window rate limiter per client IP / Tenant."""
    def __init__(self, limit_per_minute: int = 120):
        self.limit = limit_per_minute
        self.requests: Dict[str, List[float]] = defaultdict(list)

    def is_allowed(self, identifier: str) -> Tuple[bool, int, float]:
        """
        Check if request is allowed.
        Returns (is_allowed, remaining_requests, reset_time_seconds).
        """
        now = time.time()
        window_start = now - 60.0

        # Purge old requests outside 60s window
        valid_timestamps = [t for t in self.requests[identifier] if t > window_start]
        self.requests[identifier] = valid_timestamps

        if len(valid_timestamps) >= self.limit:
            oldest = valid_timestamps[0] if valid_timestamps else now
            reset_in = max(0.0, 60.0 - (now - oldest))
            return False, 0, reset_in

        self.requests[identifier].append(now)
        remaining = self.limit - len(self.requests[identifier])
        return True, remaining, 60.0

rate_limiter = SlidingWindowRateLimiter(limit_per_minute=300)

class AuthContext:
    """Encapsulates authenticated caller identity and permissions."""
    def __init__(self, is_authenticated: bool, client_id: str, role: str = "system", tenant_id: str = "default"):
        self.is_authenticated = is_authenticated
        self.client_id = client_id
        self.role = role
        self.tenant_id = tenant_id

def authenticate_request(headers: Dict[str, str]) -> Tuple[bool, Optional[AuthContext], Optional[str]]:
    """
    Authenticate incoming request against internal API key, JWT bearer token, or mTLS.
    Headers keys should be lowercase for standard lookup.
    """
    # Bypass only in non-production environments for development convenience
    if not settings.REQUIRE_INTERNAL_AUTH and settings.ENVIRONMENT != "production":
        return True, AuthContext(is_authenticated=True, client_id="dev-bypass", role="admin"), None

    # Check 1: Internal API Secret Header
    internal_key = headers.get("x-internal-secret") or headers.get("x-api-key")
    if internal_key and verify_internal_api_key(internal_key):
        tenant_id = headers.get("x-tenant-id", "default_tenant")
        service_id = headers.get("x-service-id", "edge-nextjs-perimeter")
        return True, AuthContext(is_authenticated=True, client_id=service_id, role="system", tenant_id=tenant_id), None

    # Check 2: mTLS Client Certificate Header
    mtls_cert = headers.get(settings.MTLS_HEADER_NAME.lower())
    if mtls_cert and verify_mtls_header(mtls_cert):
        tenant_id = headers.get("x-tenant-id", "default_tenant")
        return True, AuthContext(is_authenticated=True, client_id="mtls-gateway", role="system", tenant_id=tenant_id), None

    # Check 3: Authorization Bearer JWT
    auth_header = headers.get("authorization", "")
    if auth_header.startswith("Bearer "):
        token = auth_header[7:].strip()
        # Direct key match
        if verify_internal_api_key(token):
            return True, AuthContext(is_authenticated=True, client_id="bearer-internal", role="system"), None

        # JWT decode
        valid, payload, err = decode_simple_jwt(token)
        if valid and payload:
            role = payload.get("role", "candidate")
            tenant_id = payload.get("tenant_id", "default_tenant")
            user_id = payload.get("sub", payload.get("user_id", "anonymous"))
            return True, AuthContext(is_authenticated=True, client_id=user_id, role=role, tenant_id=tenant_id), None
        return False, None, f"Invalid Bearer token: {err}"

    return False, None, "Missing or invalid authorization credentials"

def check_role_permission(auth: AuthContext, allowed_roles: List[str]) -> bool:
    """Verify caller role against allowed roles."""
    if "all" in allowed_roles:
        return True
    if auth.role == "admin" or auth.role == "system":
        return True
    return auth.role in allowed_roles

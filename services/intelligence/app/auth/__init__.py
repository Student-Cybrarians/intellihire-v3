"""
Auth package initialization.
"""
from app.auth.security import (
    timing_safe_compare, generate_internal_signature, verify_internal_signature,
    verify_internal_api_key, verify_mtls_header, create_simple_jwt, decode_simple_jwt
)
from app.auth.middleware import (
    AuthContext, authenticate_request, check_role_permission, rate_limiter
)

__all__ = [
    "timing_safe_compare", "generate_internal_signature", "verify_internal_signature",
    "verify_internal_api_key", "verify_mtls_header", "create_simple_jwt", "decode_simple_jwt",
    "AuthContext", "authenticate_request", "check_role_permission", "rate_limiter"
]

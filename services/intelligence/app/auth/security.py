"""
Internal Token & Security Utilities for IntelliHire Intelligence Platform.
Implements timing-safe token verification, role checks, and JWT signatures.
"""
import hmac
import hashlib
import time
import json
import base64
from typing import Dict, Any, Optional, Tuple
from app.config import settings

def timing_safe_compare(val1: str, val2: str) -> bool:
    """Constant-time string comparison to prevent timing attacks."""
    if val1 is None or val2 is None:
        return False
    return hmac.compare_digest(val1.encode('utf-8'), val2.encode('utf-8'))

def generate_internal_signature(payload_str: str, timestamp: int) -> str:
    """Generate HMAC-SHA256 signature for internal inter-service payloads."""
    message = f"{timestamp}:{payload_str}".encode('utf-8')
    key = settings.INTERNAL_API_SECRET.encode('utf-8')
    return hmac.new(key, message, hashlib.sha256).hexdigest()

def verify_internal_signature(payload_str: str, timestamp: int, signature: str, max_age_seconds: int = 300) -> bool:
    """Verify internal payload signature and replay window."""
    current_time = int(time.time())
    if abs(current_time - timestamp) > max_age_seconds:
        return False
    expected_sig = generate_internal_signature(payload_str, timestamp)
    return timing_safe_compare(expected_sig, signature)

def verify_internal_api_key(provided_key: Optional[str]) -> bool:
    """Verify bearer or header internal service key."""
    if not settings.REQUIRE_INTERNAL_AUTH:
        return True
    if not provided_key:
        return False

    # Strip 'Bearer ' if present
    if provided_key.startswith("Bearer "):
        provided_key = provided_key[7:]

    return timing_safe_compare(settings.INTERNAL_API_SECRET, provided_key)

def verify_mtls_header(mtls_header_value: Optional[str]) -> bool:
    """Verify presence and validity of trusted mTLS client cert SHA256 header."""
    if not mtls_header_value:
        return False
    # Verify SHA256 hex string format (64 chars)
    return len(mtls_header_value) == 64 and all(c in "0123456789abcdefABCDEF" for c in mtls_header_value)

def create_simple_jwt(payload: Dict[str, Any], secret: str = settings.INTERNAL_API_SECRET, exp_seconds: int = 3600) -> str:
    """Generate self-contained HMAC-SHA256 signed JWT token."""
    header = {"alg": "HS256", "typ": "JWT"}
    body = {**payload, "exp": int(time.time()) + exp_seconds, "iat": int(time.time())}

    b64_header = base64.urlsafe_b64encode(json.dumps(header).encode()).decode().rstrip("=")
    b64_body = base64.urlsafe_b64encode(json.dumps(body).encode()).decode().rstrip("=")

    signing_input = f"{b64_header}.{b64_body}".encode()
    signature = hmac.new(secret.encode(), signing_input, hashlib.sha256).digest()
    b64_sig = base64.urlsafe_b64encode(signature).decode().rstrip("=")

    return f"{b64_header}.{b64_body}.{b64_sig}"

def decode_simple_jwt(token: str, secret: str = settings.INTERNAL_API_SECRET) -> Tuple[bool, Optional[Dict[str, Any]], Optional[str]]:
    """Decode and verify HMAC-SHA256 signed JWT token."""
    try:
        parts = token.split(".")
        if len(parts) != 3:
            return False, None, "Invalid token format"

        b64_header, b64_body, b64_sig = parts

        # Verify signature
        signing_input = f"{b64_header}.{b64_body}".encode()
        expected_sig = hmac.new(secret.encode(), signing_input, hashlib.sha256).digest()

        # Pad base64 if needed
        padding = '=' * (4 - len(b64_sig) % 4) if len(b64_sig) % 4 != 0 else ''
        actual_sig = base64.urlsafe_b64decode(b64_sig + padding)

        if not hmac.compare_digest(expected_sig, actual_sig):
            return False, None, "Invalid signature"

        # Parse payload
        pad_body = '=' * (4 - len(b64_body) % 4) if len(b64_body) % 4 != 0 else ''
        payload = json.loads(base64.urlsafe_b64decode(b64_body + pad_body).decode())

        # Check expiry
        if "exp" in payload and payload["exp"] < time.time():
            return False, None, "Token expired"

        return True, payload, None
    except Exception as e:
        return False, None, f"Token decode error: {str(e)}"

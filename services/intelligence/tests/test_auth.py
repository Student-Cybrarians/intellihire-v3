"""
Unit tests for Authentication, JWT signing, and mTLS security boundaries.
"""
import unittest
import time
from app.auth.security import (
    timing_safe_compare, generate_internal_signature, verify_internal_signature,
    verify_internal_api_key, verify_mtls_header, create_simple_jwt, decode_simple_jwt
)
from app.auth.middleware import authenticate_request, rate_limiter, AuthContext

class TestAuthSecurity(unittest.TestCase):

    def test_timing_safe_compare(self):
        self.assertTrue(timing_safe_compare("secret_key_123", "secret_key_123"))
        self.assertFalse(timing_safe_compare("secret_key_123", "secret_key_124"))
        self.assertFalse(timing_safe_compare("short", "longer_string"))
        self.assertFalse(timing_safe_compare(None, "val"))

    def test_internal_signature_verification(self):
        payload = '{"candidate_id": "cand_01", "score": 92.5}'
        now = int(time.time())
        sig = generate_internal_signature(payload, now)

        self.assertTrue(verify_internal_signature(payload, now, sig, max_age_seconds=60))
        # Tampered payload
        self.assertFalse(verify_internal_signature(payload + "tamper", now, sig, max_age_seconds=60))
        # Expired signature (outside 60s window)
        old_time = now - 120
        old_sig = generate_internal_signature(payload, old_time)
        self.assertFalse(verify_internal_signature(payload, old_time, old_sig, max_age_seconds=60))

    def test_mtls_header_validation(self):
        valid_sha = "a" * 64
        invalid_short = "a" * 32
        invalid_chars = "g" * 64

        self.assertTrue(verify_mtls_header(valid_sha))
        self.assertFalse(verify_mtls_header(invalid_short))
        self.assertFalse(verify_mtls_header(invalid_chars))
        self.assertFalse(verify_mtls_header(None))

    def test_simple_jwt_lifecycle(self):
        payload = {"sub": "user_123", "role": "recruiter", "tenant_id": "tenant_acme"}
        token = create_simple_jwt(payload, exp_seconds=300)

        valid, decoded, err = decode_simple_jwt(token)
        self.assertTrue(valid)
        self.assertIsNotNone(decoded)
        self.assertEqual(decoded["sub"], "user_123")
        self.assertEqual(decoded["role"], "recruiter")
        self.assertEqual(decoded["tenant_id"], "tenant_acme")

        # Tampered token
        tampered = token[:-4] + "xxxx"
        valid_t, _, err_t = decode_simple_jwt(tampered)
        self.assertFalse(valid_t)
        self.assertIn("Invalid signature", err_t)

    def test_authenticate_request_headers(self):
        # 1. Valid internal secret
        h1 = {"x-internal-secret": "ih_sec_default_internal_service_key_77a92b3c4d5e", "x-tenant-id": "tenant_01"}
        ok1, ctx1, _ = authenticate_request(h1)
        self.assertTrue(ok1)
        self.assertEqual(ctx1.role, "system")

        # 2. Invalid secret
        h2 = {"x-internal-secret": "wrong_key"}
        ok2, _, err2 = authenticate_request(h2)
        self.assertFalse(ok2)

        # 3. Missing secret
        ok3, _, _ = authenticate_request({})
        self.assertFalse(ok3)

    def test_rate_limiter_sliding_window(self):
        from app.auth.middleware import SlidingWindowRateLimiter
        limiter = SlidingWindowRateLimiter(limit_per_minute=3)
        ip = "192.168.1.100"

        # 3 allowed
        self.assertTrue(limiter.is_allowed(ip)[0])
        self.assertTrue(limiter.is_allowed(ip)[0])
        self.assertTrue(limiter.is_allowed(ip)[0])

        # 4th blocked
        allowed, rem, reset_in = limiter.is_allowed(ip)
        self.assertFalse(allowed)
        self.assertEqual(rem, 0)
        self.assertGreater(reset_in, 0)

if __name__ == "__main__":
    unittest.main()

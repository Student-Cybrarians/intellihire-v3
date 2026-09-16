"""
Unit tests for Isolated Sandbox Code Execution, Test Case Harness, and Resource Limits.
"""
import unittest
from app.core.sandbox_runner import sandbox_runner
from app.schemas.sandbox import CodeExecutionRequest, TestCase, SandboxResourceLimits

class TestSandboxRunner(unittest.TestCase):

    def test_python_solution_accepted(self):
        # Two-sum in python reading stdin
        code = """import sys
lines = sys.stdin.read().split()
if lines:
    a, b = int(lines[0]), int(lines[1])
    print(a + b)"""

        test_cases = [
            TestCase(id="tc_1", stdin="2 3", expected_output="5"),
            TestCase(id="tc_2", stdin="-5 10", expected_output="5"),
            TestCase(id="tc_3", stdin="100 200", expected_output="300", is_hidden=True)
        ]

        req = CodeExecutionRequest(
            language="python",
            source_code=code,
            test_cases=test_cases,
            submission_id="sub_py_01"
        )
        resp = sandbox_runner.execute_submission(req)

        self.assertEqual(resp.status, "accepted")
        self.assertTrue(resp.all_passed)
        self.assertEqual(resp.passed_count, 3)
        self.assertEqual(resp.score_percentage, 100.0)

        # Ensure hidden test case output is sanitized / redacted
        tc3_res = next(r for r in resp.results if r.test_case_id == "tc_3")
        self.assertTrue(tc3_res.is_hidden)
        self.assertIsNone(tc3_res.actual_output)

    def test_python_runtime_error(self):
        code = """import sys
print(1 / 0)"""

        req = CodeExecutionRequest(
            language="python",
            source_code=code,
            test_cases=[TestCase(id="tc_err", stdin="", expected_output="1")],
            submission_id="sub_err_01"
        )
        resp = sandbox_runner.execute_submission(req)

        self.assertEqual(resp.status, "rejected")
        self.assertFalse(resp.all_passed)
        self.assertEqual(resp.results[0].status, "runtime_error")
        self.assertIn("ZeroDivisionError", resp.results[0].error_message)

    def test_sandbox_timeout_enforcement(self):
        code = """import time
while True:
    time.sleep(0.1)"""

        req = CodeExecutionRequest(
            language="python",
            source_code=code,
            test_cases=[TestCase(id="tc_inf", stdin="", expected_output="done")],
            limits=SandboxResourceLimits(timeout_seconds=0.5),
            submission_id="sub_timeout_01"
        )
        resp = sandbox_runner.execute_submission(req)

        self.assertEqual(resp.status, "rejected")
        self.assertEqual(resp.results[0].status, "time_limit_exceeded")

if __name__ == "__main__":
    unittest.main()

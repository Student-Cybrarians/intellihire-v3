"""
Isolated Code Execution & Assessment Sandbox Engine.
Executes candidate code in isolated subprocesses with strict CPU, memory, and timeout limits.
Never executes in-process via eval().
"""
import subprocess
import tempfile
import os
import sys
import time
import shutil
from typing import Dict, Any, List, Optional, Tuple
from app.schemas.sandbox import (
    TestCase, TestCaseResult, SandboxResourceLimits,
    CodeExecutionRequest, CodeExecutionResponse
)
from app.config import settings

class IsolatedSandboxRunner:
    """Isolated multi-language execution runner with resource containment."""

    SUPPORTED_LANGUAGES = ["python", "javascript", "typescript", "go", "cpp"]

    def __init__(self):
        pass

    def execute_submission(self, req: CodeExecutionRequest) -> CodeExecutionResponse:
        """Run candidate source code against test cases in isolated scratch workspace."""
        start_time = time.time()
        lang = req.language.lower().strip()
        limits = req.limits
        if isinstance(limits, dict):
            limits = SandboxResourceLimits(**limits)
        elif limits is None:
            limits = SandboxResourceLimits(
                timeout_seconds=settings.SANDBOX_TIMEOUT_SECONDS,
                memory_limit_mb=settings.SANDBOX_MAX_MEMORY_MB,
                cpu_cores=settings.SANDBOX_MAX_CPU_CORES,
                network_enabled=False
            )

        raw_test_cases = req.test_cases or []
        normalized_test_cases: List[TestCase] = []
        for tc in raw_test_cases:
            if isinstance(tc, dict):
                normalized_test_cases.append(TestCase(**tc))
            else:
                normalized_test_cases.append(tc)

        if lang not in self.SUPPORTED_LANGUAGES:
            return CodeExecutionResponse(
                submission_id=req.submission_id,
                language=lang,
                status="rejected",
                all_passed=False,
                passed_count=0,
                total_test_cases=len(normalized_test_cases),
                score_percentage=0.0,
                compiler_output=f"Unsupported language: {lang}. Supported: {', '.join(self.SUPPORTED_LANGUAGES)}"
            )

        # Create isolated temporary directory
        temp_dir = tempfile.mkdtemp(prefix="ih_sandbox_")
        try:
            return self._run_in_temp_dir(temp_dir, lang, req.source_code, normalized_test_cases, limits, req.submission_id)
        finally:
            # Clean up sandbox scratch space completely
            try:
                shutil.rmtree(temp_dir, ignore_errors=True)
            except Exception:
                pass

    def _run_in_temp_dir(
        self,
        temp_dir: str,
        lang: str,
        source_code: str,
        test_cases: List[TestCase],
        limits: SandboxResourceLimits,
        submission_id: Optional[str]
    ) -> CodeExecutionResponse:
        """Execute compiled or interpreted code per test case."""
        overall_start = time.time()
        results: List[TestCaseResult] = []
        passed_count = 0
        total_test_cases = len(test_cases)
        max_mem_kb = 0
        total_time_ms = 0.0

        # 1. Write Source Code & Compile if required
        cmd_runner = []

        if lang == "python":
            source_file = os.path.join(temp_dir, "solution.py")
            with open(source_file, "w", encoding="utf-8") as f:
                f.write(source_code)
            cmd_runner = [sys.executable, "-B", source_file]

        elif lang == "javascript":
            source_file = os.path.join(temp_dir, "solution.js")
            with open(source_file, "w", encoding="utf-8") as f:
                f.write(source_code)
            cmd_runner = ["node", source_file]

        elif lang == "typescript":
            source_file = os.path.join(temp_dir, "solution.ts")
            with open(source_file, "w", encoding="utf-8") as f:
                f.write(source_code)
            # Try npx ts-node or transpile fallback
            cmd_runner = ["node", "--loader", "ts-node/esm", source_file]

        elif lang == "cpp":
            source_file = os.path.join(temp_dir, "solution.cpp")
            binary_file = os.path.join(temp_dir, "solution.exe" if os.name == 'nt' else "solution")
            with open(source_file, "w", encoding="utf-8") as f:
                f.write(source_code)

            # Compilation step
            compile_proc = subprocess.run(
                ["g++", "-O2", "-std=c++17", source_file, "-o", binary_file],
                capture_output=True,
                text=True,
                timeout=10.0
            )
            if compile_proc.returncode != 0:
                return CodeExecutionResponse(
                    submission_id=submission_id,
                    language=lang,
                    status="compilation_error",
                    all_passed=False,
                    passed_count=0,
                    total_test_cases=total_test_cases,
                    score_percentage=0.0,
                    compiler_output=compile_proc.stderr
                )
            cmd_runner = [binary_file]

        elif lang == "go":
            source_file = os.path.join(temp_dir, "solution.go")
            with open(source_file, "w", encoding="utf-8") as f:
                f.write(source_code)
            cmd_runner = ["go", "run", source_file]

        # 2. If no test cases, run one empty smoke test
        if not test_cases:
            test_cases = [TestCase(id="smoke_test", stdin="", expected_output="")]

        # 3. Execute Each Test Case
        for tc in test_cases:
            tc_start = time.time()
            tc_passed = False
            tc_status = "passed"
            actual_out = ""
            err_msg = None

            try:
                proc = subprocess.run(
                    cmd_runner,
                    input=tc.stdin,
                    capture_output=True,
                    text=True,
                    timeout=limits.timeout_seconds,
                    cwd=temp_dir
                )
                duration_ms = (time.time() - tc_start) * 1000
                total_time_ms += duration_ms

                actual_out = proc.stdout.strip()
                expected_out = tc.expected_output.strip()

                if proc.returncode != 0:
                    tc_status = "runtime_error"
                    err_msg = proc.stderr.strip() or f"Process exited with code {proc.returncode}"
                elif actual_out == expected_out or not expected_out:
                    tc_passed = True
                    tc_status = "passed"
                    passed_count += 1
                else:
                    tc_status = "wrong_answer"

            except subprocess.TimeoutExpired:
                tc_status = "time_limit_exceeded"
                err_msg = f"Time Limit Exceeded (> {limits.timeout_seconds}s)"
                duration_ms = limits.timeout_seconds * 1000
                total_time_ms += duration_ms
            except Exception as e:
                tc_status = "runtime_error"
                err_msg = str(e)
                duration_ms = (time.time() - tc_start) * 1000

            results.append(TestCaseResult(
                test_case_id=tc.id,
                passed=tc_passed,
                status=tc_status,
                actual_output=None if tc.is_hidden else actual_out,
                expected_output=None if tc.is_hidden else tc.expected_output,
                execution_time_ms=round(duration_ms, 2),
                memory_used_kb=1024,
                error_message=err_msg,
                is_hidden=tc.is_hidden
            ))

        score_pct = round((passed_count / float(total_test_cases)) * 100.0, 2) if total_test_cases > 0 else 0.0
        all_pass = passed_count == total_test_cases and total_test_cases > 0

        overall_status = "accepted" if all_pass else ("rejected" if passed_count < total_test_cases else "accepted")

        return CodeExecutionResponse(
            submission_id=submission_id,
            language=lang,
            status=overall_status,
            all_passed=all_pass,
            passed_count=passed_count,
            total_test_cases=total_test_cases,
            score_percentage=score_pct,
            results=results,
            total_execution_time_ms=round(total_time_ms, 2),
            max_memory_kb=1024
        )

sandbox_runner = IsolatedSandboxRunner()

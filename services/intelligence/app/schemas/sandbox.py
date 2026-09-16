"""
Isolated Code Execution & Assessment Sandbox Schema Models.
"""
from typing import Dict, Any, List, Optional
from app.schemas.base import BaseModel

class TestCase(BaseModel):
    id: str
    stdin: str = ""
    expected_output: str = ""
    is_hidden: bool = False
    weight: float = 1.0

class TestCaseResult(BaseModel):
    test_case_id: str
    passed: bool
    status: str             # "passed", "wrong_answer", "time_limit_exceeded", "memory_limit_exceeded", "runtime_error"
    actual_output: Optional[str] = None
    expected_output: Optional[str] = None
    execution_time_ms: float = 0.0
    memory_used_kb: int = 0
    error_message: Optional[str] = None
    is_hidden: bool = False

class SandboxResourceLimits(BaseModel):
    timeout_seconds: float = 3.0
    memory_limit_mb: int = 128
    cpu_cores: float = 1.0
    network_enabled: bool = False

class CodeExecutionRequest(BaseModel):
    language: str           # "python", "javascript", "typescript", "go", "cpp"
    source_code: str
    test_cases: List[TestCase] = []
    limits: Optional[SandboxResourceLimits] = None
    tenant_id: str = "default_tenant"
    submission_id: Optional[str] = None

class CodeExecutionResponse(BaseModel):
    submission_id: Optional[str] = None
    language: str
    status: str             # "accepted", "rejected", "compilation_error", "timeout", "sandbox_error"
    all_passed: bool
    passed_count: int
    total_test_cases: int
    score_percentage: float
    results: List[TestCaseResult] = []
    compiler_output: Optional[str] = None
    total_execution_time_ms: float = 0.0
    max_memory_kb: int = 0

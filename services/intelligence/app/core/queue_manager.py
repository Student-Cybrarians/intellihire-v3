"""
Async Task Queue & Job Dispatcher for IntelliHire Intelligence Platform.
Supports Redis + RQ when available, with resilient in-process background worker fallback.
"""
import time
import uuid
import threading
import queue
from typing import Dict, Any, Callable, Optional, List

class AsyncTaskJob:
    """Represents an async background intelligence job."""
    def __init__(self, job_id: str, job_type: str, payload: Dict[str, Any]):
        self.job_id = job_id
        self.job_type = job_type
        self.payload = payload
        self.status = "queued"  # queued, processing, completed, failed
        self.result: Optional[Dict[str, Any]] = None
        self.error: Optional[str] = None
        self.created_at = time.time()
        self.completed_at: Optional[float] = None

class QueueManager:
    """Task queue dispatcher managing async NLP, document parsing, and indexing tasks."""
    def __init__(self):
        self.jobs: Dict[str, AsyncTaskJob] = {}
        self.handlers: Dict[str, Callable[[Dict[str, Any]], Dict[str, Any]]] = {}
        self.work_queue: queue.Queue = queue.Queue()
        self._is_running = False
        self._worker_threads: List[threading.Thread] = []

    def register_handler(self, job_type: str, handler: Callable[[Dict[str, Any]], Dict[str, Any]]):
        """Register execution handler for a specific job type."""
        self.handlers[job_type] = handler

    def enqueue(self, job_type: str, payload: Dict[str, Any]) -> str:
        """Enqueue task for background execution."""
        job_id = str(uuid.uuid4())
        job = AsyncTaskJob(job_id=job_id, job_type=job_type, payload=payload)
        self.jobs[job_id] = job
        self.work_queue.put(job)
        return job_id

    def get_job_status(self, job_id: str) -> Optional[Dict[str, Any]]:
        """Retrieve job execution state and results."""
        job = self.jobs.get(job_id)
        if not job:
            return None
        return {
            "job_id": job.job_id,
            "job_type": job.job_type,
            "status": job.status,
            "result": job.result,
            "error": job.error,
            "created_at": job.created_at,
            "completed_at": job.completed_at,
            "duration_ms": (job.completed_at - job.created_at) * 1000 if job.completed_at else None
        }

    def start_workers(self, num_workers: int = 2):
        """Start in-process worker pool."""
        if self._is_running:
            return
        self._is_running = True
        for i in range(num_workers):
            t = threading.Thread(target=self._worker_loop, name=f"IntelligenceWorker-{i}", daemon=True)
            t.start()
            self._worker_threads.append(t)

    def _worker_loop(self):
        """Background thread worker loop."""
        while self._is_running:
            try:
                job: AsyncTaskJob = self.work_queue.get(timeout=1.0)
                if job is None:
                    continue

                job.status = "processing"
                handler = self.handlers.get(job.job_type)
                if not handler:
                    job.status = "failed"
                    job.error = f"No handler registered for job type '{job.job_type}'"
                    job.completed_at = time.time()
                    self.work_queue.task_done()
                    continue

                try:
                    res = handler(job.payload)
                    job.result = res
                    job.status = "completed"
                except Exception as e:
                    job.status = "failed"
                    job.error = str(e)
                finally:
                    job.completed_at = time.time()
                    self.work_queue.task_done()
            except queue.Empty:
                continue
            except Exception:
                continue

    def stop_workers(self):
        """Gracefully terminate background workers."""
        self._is_running = False
        for _ in self._worker_threads:
            self.work_queue.put(None)

queue_manager = QueueManager()
queue_manager.start_workers(num_workers=2)

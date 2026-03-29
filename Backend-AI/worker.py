"""
RQ Worker entry point
Run this to start processing detection jobs from Redis Queue

Usage:
    python worker.py
"""

import sys
import os
import socket
import time
from pathlib import Path
from redis import Redis
from rq.worker import Worker, SimpleWorker
from rq.queue import Queue
from rq.worker_registration import clean_worker_registry
from rq.timeouts import TimerDeathPenalty
from core.config import Config
from core.log import logger

# Load configuration
config = Config()

# Ensure models are loaded at startup
def load_model_at_startup():
    """
    Pre-load YOLO and VLM models when worker starts to avoid cold start.
    Models loaded here will be inherited by forked child processes.
    """
    try:
        from services.yolo_service import get_detector
        logger.info("Pre-loading YOLO model...")
        detector = get_detector()
        logger.info("YOLO model loaded successfully in worker")
    except Exception as e:
        logger.error(f"Failed to load YOLO model in worker: {e}")
        raise

    try:
        from services.VLM_service import get_embedding_model
        logger.info("Pre-loading VLM embedding model...")
        embedding_model = get_embedding_model()
        logger.info("VLM embedding model loaded successfully in worker")
    except Exception as e:
        logger.error(f"Failed to load VLM model in worker: {e}")
        raise

def main():
    """
    Main worker function.
    Start RQ worker to process jobs from Redis Queue.
    """
    try:
        # Connect to Redis
        logger.info(f"Connecting to Redis at: {config.REDIS_URL}")
        redis_conn = Redis.from_url(config.REDIS_URL)
        redis_conn.ping()
        logger.info("Redis connection established")

        # Pre-load YOLO model
        load_model_at_startup()

        # Create queues — must match queue names used in redis_service.py
        detection_queue = Queue("detection_jobs", connection=redis_conn)
        embedding_queue = Queue("embedding_jobs", connection=redis_conn)
        logger.info("Listening on queues: detection_jobs, embedding_jobs")

        # Clean up stale worker registrations (tránh lỗi "worker already exists" khi restart)
        clean_worker_registry(queue=detection_queue)
        clean_worker_registry(queue=embedding_queue)
        logger.info("Cleaned up stale worker registrations")

        # Worker name thêm timestamp để luôn unique khi restart
        hostname = socket.gethostname()
        pid = os.getpid()
        worker_name = f"yolo-worker-{hostname}-{pid}-{int(time.time())}"

        # Windows has no os.fork() and no SIGALRM, so use Windows-safe worker/timeouts.
        worker_cls = SimpleWorker if os.name == "nt" else Worker
        if worker_cls is SimpleWorker:
            logger.warning("Windows detected: using SimpleWorker (no fork)")
            logger.warning("Windows detected: using TimerDeathPenalty (no SIGALRM)")

        # Create worker
        worker = worker_cls(
            [detection_queue, embedding_queue],
            connection=redis_conn,
            name=worker_name
        )

        if worker_cls is SimpleWorker:
            # RQ 1.x may not accept death_penalty_class in constructor.
            worker.death_penalty_class = TimerDeathPenalty
        logger.info(f"Starting RQ worker: {worker.name}")
        logger.info(f"Max workers: {config.MAX_WORKERS}")
        logger.info(f"Job timeout: {config.REDIS_JOB_TIMEOUT}s")

        # Scheduler mode relies on fork and is not available on Windows.
        with_scheduler = os.name != "nt"
        worker.work(with_scheduler=with_scheduler)

    except KeyboardInterrupt:
        logger.info("Worker stopped by user")
        sys.exit(0)
    except Exception as e:
        logger.error(f"Worker error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()

"""
Celery worker entry point.

Usage:
    python worker.py
"""

import sys
import os
from core.config import Config
from core.log import logger
from services.celery_app import celery_app

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
    Start Celery worker to process jobs from Redis.
    """
    try:
        logger.info(f"Starting Celery worker with broker/backend: {config.REDIS_URL}")
        load_model_at_startup()

        args = [
            "worker",
            "--loglevel=info",
            "--queues=detection_jobs,embedding_jobs",
            f"--concurrency={config.MAX_WORKERS}",
        ]

        # Windows cannot use prefork pool reliably.
        if os.name == "nt":
            args.append("--pool=solo")
            logger.warning("Windows detected: using Celery solo pool")

        celery_app.worker_main(args)

    except KeyboardInterrupt:
        logger.info("Worker stopped by user")
        sys.exit(0)
    except Exception as e:
        logger.error(f"Worker error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()

from celery import Celery
import os

from core.config import Config

config = Config()

# Use Redis for both broker and result backend so API can track async results.
celery_app = Celery(
    "backend_ai",
    broker=config.REDIS_URL,
    backend=config.REDIS_URL,
    include=["services.tasks"],
)

celery_app.conf.update(
    task_default_queue="detection_jobs",
    task_routes={
        "services.tasks.process_detection": {"queue": "detection_jobs"},
        "services.tasks.process_image_embedding": {"queue": "embedding_jobs"},
    },
    task_track_started=True,
    task_time_limit=config.CELERY_TASK_TIME_LIMIT,
    result_expires=config.CELERY_RESULT_EXPIRES,
    worker_prefetch_multiplier=1,
    task_acks_late=False,
)

# Windows does not support prefork reliably in Celery; force solo pool.
if os.name == "nt":
    celery_app.conf.update(
        worker_pool="solo",
        worker_concurrency=1,
    )

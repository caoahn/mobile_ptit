from datetime import datetime
from typing import Any, Optional
from fastapi import APIRouter, HTTPException
from celery.result import AsyncResult

from services.celery_app import celery_app
from core.schemas import JobDetectionStatusResponse, JobEmbeddingStatusResponse, DetectionResult
from core.log import logger


# Create router
router = APIRouter(prefix="/job", tags=["Job Management"])

# ==================== ENDPOINTS ====================

@router.get("/status_detection/{job_id}", response_model=JobDetectionStatusResponse)
async def get_job_status(
    job_id: str,
):
    """
    Check status of a detection job.

    Args:
        job_id: Celery task ID

    Returns:
        JobDetectionStatusResponse: Job status and result if completed
    """
    try:
        task = AsyncResult(job_id, app=celery_app)
        status = _map_celery_status(task.status)

        response = JobDetectionStatusResponse(
            job_id=job_id,
            status=status,
            created_at=None,
            started_at=None,
            ended_at=_normalize_datetime(task.date_done),
        )

        # If task finished, check if worker returned success/error payload
        if task.successful():
            result_data = task.result
            if isinstance(result_data, dict):
                if result_data.get("success"):
                    results_list = [
                        DetectionResult(
                            class_name=r["class_name"],
                            confidence=r["confidence"],
                            bounding_box=r["bounding_box"]
                        )
                        for r in result_data.get("results", [])
                    ]
                    response.result = results_list
                else:
                    response.status = "failed"
                    response.error = result_data.get("error", "Unknown error")
            else:
                response.error = "Unexpected task result format"

        elif task.failed():
            response.error = _extract_task_error(task)

        return response

    except Exception as e:
        logger.error(f"Failed to fetch job {job_id}: {e}")
        raise HTTPException(
            status_code=404,
            detail=f"Job not found or expired: {job_id}"
        )

@router.get("/status_embedding/{job_id}", response_model=JobEmbeddingStatusResponse)
async def get_embedding_job_status(
    job_id: str,
):
    """
    Check status of an embedding job.

    Args:
        job_id: Celery task ID

    Returns:
        JobEmbeddingStatusResponse: Job status and result if completed
    """
    try:
        task = AsyncResult(job_id, app=celery_app)
        status = _map_celery_status(task.status)

        response = JobEmbeddingStatusResponse(
            job_id=job_id,
            status=status,
            created_at=None,
            started_at=None,
            ended_at=_normalize_datetime(task.date_done),
        )

        if task.successful():
            response.result = task.result
        elif task.failed():
            response.error = _extract_task_error(task)

        return response

    except Exception as e:
        logger.error(f"Failed to fetch embedding job {job_id}: {e}")
        raise HTTPException(
            status_code=404,
            detail=f"Job not found or expired: {job_id}"
        )

@router.delete("/job/{job_id}", status_code=200)
async def cancel_job(
    job_id: str,
):
    """
    Cancel a queued or running job.

    Args:
        job_id: Celery task ID

    Returns:
        Success message
    """
    try:
        task = AsyncResult(job_id, app=celery_app)

        status = _map_celery_status(task.status)
        if status in ["finished", "failed"]:
            return {
                "message": f"Job already {status}, cannot cancel",
                "job_id": job_id,
                "status": status
            }

        # Revoke queued/running task.
        celery_app.control.revoke(job_id, terminate=True)

        logger.info(f"Job {job_id} cancelled successfully")

        return {
            "message": "Job cancelled successfully",
            "job_id": job_id
        }

    except Exception as e:
        logger.error(f"Failed to cancel job {job_id}: {e}")
        raise HTTPException(
            status_code=404,
            detail=f"Job not found: {job_id}"
        )

def _map_celery_status(status: str) -> str:
    mapping = {
        "PENDING": "queued",
        "RECEIVED": "queued",
        "RETRY": "queued",
        "STARTED": "started",
        "SUCCESS": "finished",
        "FAILURE": "failed",
        "REVOKED": "failed",
    }
    return mapping.get(status, status.lower())


def _extract_task_error(task: AsyncResult) -> str:
    result = task.result
    if isinstance(result, Exception):
        return str(result)
    if result is None:
        return "Job failed with unknown error"
    return str(result)


def _normalize_datetime(value: Any) -> Optional[str]:
    if value is None:
        return None
    if isinstance(value, datetime):
        return value.isoformat()
    return str(value)
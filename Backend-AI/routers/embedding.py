from fastapi import APIRouter, HTTPException, Depends
from rq.queue import Queue
from redis.exceptions import ConnectionError as RedisConnectionError

from core.config import Config
from core.log import logger
from core.schemas import (
    EmbeddingResponse,
    JobSubmitResponse,
    EmbeddingRequest
)
from services.redis_service import get_embedding_queue
from services.tasks import process_image_embedding

# Load configuration
config = Config()

# Create router
router = APIRouter(prefix="/embedding", tags=["embedding"])

# ==================== ENDPOINTS ====================

@router.post("/url", response_model=JobSubmitResponse, status_code=202)
async def embedding_url_async(
    request: EmbeddingRequest,
    queue: Queue = Depends(get_embedding_queue)
):
    """
    Submit embedding job asynchronously (non-blocking).
    Returns job_id immediately for status checking.

    Args:
        request (EmbeddingRequest): The request containing the image URL and optional text list
        queue: RQ Queue instance (injected)

    Returns:
        JobSubmitResponse: Contains job_id for status checking
    """
    try:
        logger.info(f"[Async] Received embedding request for URL: {request.image_url}")

        # Validate URL
        if not request.image_url:
            raise HTTPException(
                status_code=400,
                detail="image_url is required"
            )

        # Enqueue embedding job to RQ (non-blocking)
        job = queue.enqueue(
            process_image_embedding,
            args=(request.image_url, request.text_list),
            job_timeout=config.REDIS_JOB_TIMEOUT,
            result_ttl=3600  # Keep result for 1 hour
        )

        logger.info(f"[Async] Enqueued embedding job: {job.id} for URL: {request.image_url}")

        return JobSubmitResponse(
            job_id=job.id,
            status="queued",
            message=f"Job submitted successfully. Use GET /job/status_embedding/{job.id} to check progress."
        )

    except HTTPException:
        raise
    except RedisConnectionError:
        logger.error("[Async] Redis connection failed when enqueuing embedding job")
        raise HTTPException(
            status_code=503,
            detail="Queue service is temporarily unavailable. Please try again later."
        )
    except Exception as e:
        logger.error(f"[Async] Failed to enqueue embedding job: {e}")
        raise HTTPException(
            status_code=500,
            detail="Internal server error while submitting job."
        )
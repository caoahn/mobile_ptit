from fastapi import APIRouter, HTTPException, Depends
from celery import Celery
from redis.exceptions import ConnectionError as RedisConnectionError

from core.config import Config
from core.log import logger

from core.schemas import PostRequest
from services.redis_service import get_celery_app
from services.tasks import process_post_embedding

# Load configuration
config = Config()

# Create router
router = APIRouter(prefix="/post", tags=["post"])

# ==================== ENDPOINTS ====================

@router.post("/embedding", status_code=202)
async def post_embedding_async(
    request: PostRequest,
    celery: Celery = Depends(get_celery_app)
):
    """
    Submit embedding job for a post asynchronously (non-blocking).
    Returns job_id immediately for status checking.

    Args:
        request (PostRequest): The request containing post_id, list of image URLs, and optional text
        celery: Celery app instance (injected)

    Returns:
        JobSubmitResponse: Contains job_id for status checking
    """
    try:
        logger.info(f"[Async] Received post embedding request for post_id: {request.post_id}")

        # Validate input
        if not request.list_image_url:
            raise HTTPException(
                status_code=400,
                detail="list_image_url is required"
            )

        # Submit Celery task (non-blocking)
        task = celery.send_task(
            process_post_embedding.name,
            args=[request.post_id, request.list_image_url, [request.text] if request.text else []],
            queue="embedding_jobs",
            time_limit=config.CELERY_TASK_TIME_LIMIT,
            expires=config.CELERY_RESULT_EXPIRES,
        )

        logger.info(f"[Async] Submitted post embedding job: {task.id} for post_id: {request.post_id}")

        return {"job_id": task.id}
    
    except HTTPException:
        raise  # Re-raise HTTP exceptions to be handled by FastAPI
    except RedisConnectionError as e:
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
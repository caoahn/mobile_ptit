from fastapi import APIRouter, HTTPException, Depends
from rq.queue import Queue
from redis.exceptions import ConnectionError as RedisConnectionError
from typing import List
import torch
import numpy as np

from core.config import Config
from core.log import logger
from core.schemas import (
    EmbeddingResponse,
    JobSubmitResponse,
    EmbeddingRequest
)
from services.VLM_service import get_embedding_model
from services.redis_service import get_embedding_queue
from services.image_service import download_image_from_url, cleanup_temp_file, InvalidImageException

# Load configuration
config = Config()

# Create router
router = APIRouter(prefix="/embedding", tags=["embedding"])

# ==================== WORKER FUNCTION ====================

def process_image_embedding(image_url: str, text_list: List[str] = None) -> List[float]:
    """
    Worker function to process image embedding (runs in RQ worker).

    Args:
        image_url: URL of the image to process
        text_list: Optional list of text descriptions for the image

    Returns:
        List[float]: normalized embedding vector (length 512)
    """
    temp_file_path = None

    try:
        logger.info(f"[Worker] Starting embedding for: {image_url}")

        # 1. Download image
        temp_file_path = download_image_from_url(image_url)

        # 2. Load embedding model (singleton)
        embedding_model = get_embedding_model()

        # 3. Extract features
        with torch.no_grad():
            logger.debug(f"Extracting features for image: {image_url} with text_list: {text_list}")
            features = embedding_model.extract_features(temp_file_path, text_list)

        # 5. Convert to numpy float32
        embedding = (
            features
            .detach()
            .cpu()
            .numpy()
            .astype(np.float32)[0]   # shape (512,)
        )

        logger.info(f"[Worker] Embedding completed for: {image_url}")

        return embedding.tolist()

    except InvalidImageException as e:
        logger.error(f"[Worker] Invalid image: {e}")
        raise
    except Exception as e:
        logger.exception(f"[Worker] Embedding failed for {image_url}: {e}")
        raise
    finally:
        # Cleanup temp file
        if temp_file_path:
            cleanup_temp_file(temp_file_path)

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
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from rq.queue import Queue
from typing import List

from core.config import Config
from core.log import logger
from core.schemas import (
    DetectionRequest,
    DetectionResponse,
    DetectionResult,
    JobSubmitResponse
)
from services.image_service import (
    save_upload_file,
    download_image_from_url,
    cleanup_temp_file,
    InvalidImageException,
    FileUploadException
)
from services.yolo_service import get_detector
from services.redis_service import get_detection_queue, get_redis_connection

# Load configuration
config = Config()

# Create router
router = APIRouter(prefix="/detect", tags=["Detection"])

# ==================== WORKER FUNCTION ====================

def process_detection(image_url: str) -> List[dict]:
    """
    Worker function to process detection (runs in RQ worker).
    This function will be executed by RQ worker in background.

    Args:
        image_url (str): URL of the image to process
    Returns:
        List[dict]: List of detection results as dictionaries
    """
    logger.info(f"[Worker] Processing detection for URL: {image_url}")
    temp_file_path = None
    try:
        logger.info(f"[Worker] Starting detection for: {image_url}")

        # Download image
        temp_file_path = download_image_from_url(image_url)

        # Get detector instance
        detector = get_detector()

        # Run detection (using local file path)
        detection_results = detector.detect(str(temp_file_path))

        # Convert DetectionResult objects to dictionaries
        results_dict = [
            {
                "class_name": result.class_name,
                "confidence": result.confidence,
                "bounding_box": {
                    "x": result.bounding_box.x,
                    "y": result.bounding_box.y,
                    "width": result.bounding_box.width,
                    "height": result.bounding_box.height
                }
            }
            for result in detection_results
        ]

        logger.info(f"[Worker] Detection completed. Found {len(results_dict)} objects")
        return {"success": True, "results": results_dict}

    except InvalidImageException as e:
        error_msg = f"Image error: {str(e)}"
        logger.error(f"[Worker] {error_msg}")
        return {"success": False, "error": error_msg}
    except FileUploadException as e:
        error_msg = f"Upload error: {str(e)}"
        logger.error(f"[Worker] {error_msg}")
        return {"success": False, "error": error_msg}
    except Exception as e:
        error_msg = f"Detection failed unexpectedly"
        logger.exception(f"[Worker] {error_msg}: {e}")
        return {"success": False, "error": error_msg}
    finally:
        # Cleanup temporary file
        if temp_file_path:
            cleanup_temp_file(temp_file_path)

# ==================== ENDPOINTS ====================

@router.post("/upload", response_model=DetectionResponse)
async def detect_upload(
    file: UploadFile = File(..., description="Image file to detect objects")
):
    """
    Detect objects in uploaded image file.

    Args:
        file: Uploaded image file (form-data)
        queue: RQ Queue instance (injected)

    Returns:
        DetectionResponse: Detection results with list of detected objects
    """
    temp_file_path = None

    try:
        logger.info(f"Received file upload: {file.filename}")

        # Validate file size
        file.file.seek(0, 2)  # Seek to end
        file_size = file.file.tell()
        file.file.seek(0)  # Reset to beginning

        if file_size > config.MAX_FILE_SIZE:
            raise HTTPException(
                status_code=413,
                detail=f"File too large. Maximum size: {config.MAX_FILE_SIZE / (1024*1024)}MB"
            )

        # Save uploaded file to temp directory
        temp_file_path = save_upload_file(file)
        logger.info(f"File saved to: {temp_file_path}")

        detector = get_detector()
        detection_results = detector.detect(str(temp_file_path))

        # Convert to response format
        results_list = [
            DetectionResult(
                class_name=result.class_name,
                confidence=result.confidence,
                bounding_box=result.bounding_box
            )
            for result in detection_results
        ]

        logger.info(f"Detection completed. Found {len(results_list)} objects")

        return DetectionResponse(
            success=True,
            results=results_list,
            error=None
        )

    except InvalidImageException as e:
        logger.error(f"Invalid image: {e}")
        return DetectionResponse(
            success=False,
            results=[],
            error=str(e)
        )
    except FileUploadException as e:
        logger.error(f"File upload error: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error in detect_upload: {e}")
        return DetectionResponse(
            success=False,
            results=[],
            error=f"Detection failed: {str(e)}"
        )
    finally:
        # Cleanup temporary file
        if temp_file_path:
            cleanup_temp_file(temp_file_path)

# ==================== ASYNC ENDPOINTS ====================

@router.post("/url", response_model=JobSubmitResponse, status_code=202)
async def detect_url_async(
    request: DetectionRequest,
    queue: Queue = Depends(get_detection_queue)
):
    """
    Submit detection job asynchronously (non-blocking).
    Returns job_id immediately for status checking.

    Args:
        request: DetectionRequest with image_url
        queue: RQ Queue instance (injected)

    Returns:
        JobSubmitResponse: Job ID and status
    """
    try:
        logger.info(f"[Async] Received detection request for URL: {request.image_url}")

        # Validate URL
        if not request.image_url:
            raise HTTPException(
                status_code=400,
                detail="image_url is required"
            )

        # Enqueue detection job to RQ (non-blocking)
        job = queue.enqueue(
            process_detection,
            args=(request.image_url,),
            job_timeout=config.REDIS_JOB_TIMEOUT,
            result_ttl=3600  # Keep result for 1 hour
        )

        logger.info(f"[Async] Job enqueued with ID: {job.id}")

        return JobSubmitResponse(
            job_id=job.id,
            status="queued",
            message=f"Job submitted successfully. Use GET /job/status_detection/{job.id} to check progress."
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"[Async] Failed to enqueue job: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to submit job: {str(e)}"
        )

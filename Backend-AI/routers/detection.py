from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from celery import Celery

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
    cleanup_temp_file,
    InvalidImageException,
    FileUploadException
)
from services.yolo_service import get_detector
from services.redis_service import get_celery_app
from services.tasks import process_detection

# Load configuration
config = Config()

# Create router
router = APIRouter(prefix="/detect", tags=["Detection"])

# ==================== ENDPOINTS ====================

@router.post("/upload", response_model=DetectionResponse)
async def detect_upload(
    file: UploadFile = File(..., description="Image file to detect objects")
):
    """
    Detect objects in uploaded image file.

    Args:
        file: Uploaded image file (form-data)

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
    celery: Celery = Depends(get_celery_app)
):
    """
    Submit detection job asynchronously (non-blocking).
    Returns job_id immediately for status checking.

    Args:
        request: DetectionRequest with image_url
        celery: Celery app instance (injected)

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

        # Submit Celery task (non-blocking)
        task = celery.send_task(
            process_detection.name,
            args=[request.image_url],
            queue="detection_jobs",
            time_limit=config.CELERY_TASK_TIME_LIMIT,
            expires=config.CELERY_RESULT_EXPIRES,
        )

        logger.info(f"[Async] Job submitted with ID: {task.id}")

        return JobSubmitResponse(
            job_id=task.id,
            status="queued",
            message=f"Job submitted successfully. Use GET /job/status_detection/{task.id} to check progress."
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"[Async] Failed to enqueue job: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to submit job: {str(e)}"
        )

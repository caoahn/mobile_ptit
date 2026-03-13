import time
from typing import List
from fastapi import APIRouter, HTTPException, Depends
from rq.job import Job, JobStatus
from redis import Redis

from services.redis_service import get_redis_connection
from core.schemas import JobDetectionStatusResponse, JobEmbeddingStatusResponse, DetectionResult
from core.log import logger


# Create router
router = APIRouter(prefix="/job", tags=["Job Management"])

# ==================== ENDPOINTS ====================

@router.get("/status_detection/{job_id}", response_model=JobDetectionStatusResponse)
async def get_job_status(
    job_id: str,
    redis_conn: Redis = Depends(get_redis_connection)
):
    """
    Check status of a detection job.
    
    Args:
        job_id: Job ID returned from async endpoint
        redis_conn: Redis connection (injected)
    
    Returns:
        JobDetectionStatusResponse: Job status and result if completed
    """
    try:
        # Fetch job from Redis
        job = Job.fetch(job_id, connection=redis_conn)
        
        # Get job status
        status = job.get_status()
        
        response = JobDetectionStatusResponse(
            job_id=job_id,
            status=status,
            created_at=job.created_at.isoformat() if job.created_at else None,
            started_at=job.started_at.isoformat() if job.started_at else None,
            ended_at=job.ended_at.isoformat() if job.ended_at else None
        )
        
        # If job finished, check if worker returned success or error
        if status == JobStatus.FINISHED:
            result_data = job.result
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
                    # Worker returned an error result
                    response.status = "failed"
                    response.error = result_data.get("error", "Unknown error")
        
        # If job failed (exception in worker), include error
        elif status == JobStatus.FAILED:
            response.error = job.exc_info if job.exc_info else "Job failed with unknown error"
        
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
    redis_conn: Redis = Depends(get_redis_connection)
):
    """
    Check status of an embedding job.
    
    Args:
        job_id: Job ID returned from async endpoint
        redis_conn: Redis connection (injected)
    
    Returns:
        JobEmbeddingStatusResponse: Job status and result if completed
    """
    try:
        # Fetch job from Redis
        job = Job.fetch(job_id, connection=redis_conn)
        
        # Get job status
        status = job.get_status()
        
        response = JobEmbeddingStatusResponse(
            job_id=job_id,
            status=status,
            created_at=job.created_at.isoformat() if job.created_at else None,
            started_at=job.started_at.isoformat() if job.started_at else None,
            ended_at=job.ended_at.isoformat() if job.ended_at else None
        )
        
        # If job finished successfully, include results
        if status == JobStatus.FINISHED:
            response.result = job.result
        
        # If job failed, include error
        elif status == JobStatus.FAILED:
            response.error = job.exc_info if job.exc_info else "Job failed with unknown error"
        
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
    redis_conn: Redis = Depends(get_redis_connection)
):
    """
    Cancel a queued or running job.
    
    Args:
        job_id: Job ID to cancel
        redis_conn: Redis connection (injected)
    
    Returns:
        Success message
    """
    try:
        job = Job.fetch(job_id, connection=redis_conn)
        
        status = job.get_status()
        if status in [JobStatus.FINISHED, JobStatus.FAILED]:
            return {
                "message": f"Job already {status}, cannot cancel",
                "job_id": job_id,
                "status": status
            }
        
        # Cancel the job
        job.cancel()
        job.delete()
        
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

# ==================== HELPER FUNCTION ====================

def wait_for_job_result(job: Job, timeout: int = None) -> List[dict]:
    """
    Wait for job to complete and return result.
    
    Args:
        job (Job): RQ Job instance
        timeout (int): Maximum time to wait in seconds
    Returns:
        List[dict]: Job result (detection results)
    Raises:
        HTTPException: If job times out or fails
    """
    if timeout is None:
        timeout = config.JOB_TIMEOUT
    
    try:
        logger.info(f"Waiting for job {job.id} to complete (timeout: {timeout}s)")
        
        # Wait for job to finish
        start_time = time.time()
        while not job.is_finished and not job.is_failed:
            if time.time() - start_time > timeout:
                # Cancel the job
                job.cancel()
                logger.error(f"Job {job.id} timed out after {timeout}s")
                raise HTTPException(
                    status_code=408,
                    detail=f"Detection timeout after {timeout} seconds"
                )
            time.sleep(0.5)  # Poll every 500ms
        
        # Check job status
        if job.is_failed:
            logger.error(f"Job {job.id} failed: {job.exc_info}")
            raise HTTPException(
                status_code=500,
                detail=f"Detection failed: {str(job.exc_info)}"
            )
        
        # Get result
        result = job.result
        logger.info(f"Job {job.id} completed successfully")
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error waiting for job result: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get detection result: {str(e)}"
        )
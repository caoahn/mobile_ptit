from fastapi import Depends, HTTPException
from redis import Redis
from rq import Queue

from core.log import logger
from core.config import Config

# Load configuration
config = Config()

# ==================== REDIS & QUEUE SETUP ====================

def get_redis_connection():
    """
    Dependency to get Redis connection.
    Returns:
        Redis: Redis connection instance
    """
    try:
        redis_conn = Redis.from_url(config.REDIS_URL)
        # Test connection
        redis_conn.ping()
        return redis_conn
    except Exception as e:
        logger.error(f"Failed to connect to Redis: {e}")
        raise HTTPException(
            status_code=503,
            detail="Redis service unavailable"
        )

# ==================== QUEUE FACTORY ====================

def create_queue_dependency(queue_name: str):
    """
    Factory function to create a queue dependency for a specific queue.
    
    Args:
        queue_name: Name of the queue to create
        
    Returns:
        Function: Dependency function that returns a Queue instance
    """
    def get_specific_queue(redis_conn: Redis = Depends(get_redis_connection)) -> Queue:
        """Get RQ Queue instance for specific queue."""
        return Queue(queue_name, connection=redis_conn)
    return get_specific_queue

# ==================== QUEUE DEPENDENCIES ====================

# Detection queue dependency
get_detection_queue = create_queue_dependency("detection_jobs")

# Embedding queue dependency  
get_embedding_queue = create_queue_dependency("embedding_jobs")

# Default queue (for backward compatibility)
def get_queue(redis_conn: Redis = Depends(get_redis_connection)) -> Queue:
    """
    Get default RQ Queue instance.
    Deprecated: Use get_detection_queue or get_embedding_queue instead.
    """
    return Queue(config.REDIS_QUEUE_NAME, connection=redis_conn)

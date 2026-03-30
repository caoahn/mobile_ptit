from fastapi import Depends, HTTPException
from redis import Redis

from core.log import logger
from core.config import Config
from services.celery_app import celery_app

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

def get_celery_app():
    """Dependency to access configured Celery application instance."""
    return celery_app

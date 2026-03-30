import time
import uuid
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from redis import Redis
from core.log import logger
from core.config import Config
from core.schemas import CheckHealthResponse
from db.conn import get_db_connection, init_db
from routers.detection import router as detection_router
from routers.embedding import router as embedding_router
from routers.job import router as job_router
from routers.user import router as user_router
from routers.post import router as post_router
from services.yolo_service import get_detector, ModelNotFoundException
from services.VLM_service import get_embedding_model

# Load configuration
config = Config()

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting up application...")
    # Initialize database connection pool
    init_db()

    # Initialize yolo model
    get_detector()

    # Initialize VLM embedding model
    get_embedding_model()
    yield

# ==================== APPLICATION ====================
app = FastAPI(
    title=config.APP_NAME,
    version=config.APP_VERSION,
    description="YOLO Object Detection API with Celery + Redis",
    lifespan=lifespan
)

# Include routers
app.include_router(detection_router)
app.include_router(embedding_router)
app.include_router(job_router)
app.include_router(user_router)
app.include_router(post_router)

# ==================== MIDDLEWARE LOGGING ====================
@app.middleware("http")
async def log_requests(request: Request, call_next):
    """
    Middleware để log mọi HTTP request/response

    Logs:
    - Request: Method, URL, Client IP, Request ID
    - Response: Status code, Response time
    """
    # Tạo unique request ID để trace qua nhiều services
    request_id = str(uuid.uuid4())

    # Ghi thời điểm bắt đầu
    start_time = time.time()

    # Lấy thông tin client
    client_host = request.client.host if request.client else "unknown"

    # Log REQUEST
    logger.info(
        f"Request started | "
        f"ID: {request_id} | "
        f"Method: {request.method} | "
        f"Path: {request.url.path} | "
        f"Client: {client_host}"
    )

    # Thêm request_id vào state để có thể dùng trong endpoints
    request.state.request_id = request_id

    # Cho request đi qua endpoint
    response = await call_next(request)

    # Tính thời gian xử lý
    process_time = time.time() - start_time

    # Log RESPONSE
    logger.info(
        f"Request completed | "
        f"ID: {request_id} | "
        f"Status: {response.status_code} | "
        f"Time: {process_time:.3f}s"
    )

    # Thêm headers để client có thể trace
    response.headers["X-Request-ID"] = request_id
    response.headers["X-Process-Time"] = str(process_time)

    return response

# ==================== HEALTH CHECK ====================
@app.get("/health", response_model=CheckHealthResponse)
async def health_check():
    """
    Health check endpoint to verify API, Redis, and YOLO model status.
    """
    health_status = {
        "status": "healthy",
        "model_loaded": False,
        "redis_connected": False
    }

    # Check Redis connection
    try:
        redis_conn = Redis.from_url(config.REDIS_URL)
        redis_conn.ping()
        health_status["redis_connected"] = True
        logger.info("Redis connection: OK")
    except Exception as e:
        logger.error(f"Redis connection failed: {e}")
        health_status["status"] = "unhealthy"

    # Check YOLO model
    try:
        detector = get_detector()
        if detector and hasattr(detector, 'model'):
            health_status["model_loaded"] = True
            logger.info("YOLO model: OK")
    except ModelNotFoundException as e:
        logger.error(f"YOLO model not loaded: {e}")
        health_status["status"] = "unhealthy"
    except Exception as e:
        logger.error(f"YOLO model check failed: {e}")
        health_status["status"] = "unhealthy"

    # check database connection
    try:
        conn = get_db_connection()
        conn.close()
        logger.info("Database connection: OK")
    except Exception as e:
        logger.error(f"Database connection failed: {e}")
        health_status["status"] = "unhealthy"
    return CheckHealthResponse(**health_status)

# ==================== ROUTES ====================
@app.get("/")
async def root():
    return {
        "message": "YOLO Object Detection API",
        "version": config.APP_VERSION,
        "endpoints": {
            "health": "/health",
            "detect_upload": "/detect/upload",
            "detect_url": "/detect/url",
            "docs": "/docs"
        }
    }
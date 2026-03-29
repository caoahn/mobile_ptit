from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field

class Config(BaseSettings):
    # Cấu hình để đọc file .env
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False  # Không phân biệt hoa thường
    )
    # ==================== APPLICATION CONFIGURATION ====================
    APP_NAME: str = Field("Mobile API", env="APP_NAME")
    APP_VERSION: str = Field("1.0.0", env="APP_VERSION")
    DEBUG: bool = Field(False, env="DEBUG")

    # YOLO model configuration
    MODEL_PATH: str = Field("/models/yolo11n.pt", env="MODEL_PATH")
    CONFIDENCE_THRESHOLD: float = Field(0.5, env="CONFIDENCE_THRESHOLD")
    IOU_THRESHOLD: float = Field(0.5, env="IOU_THRESHOLD")

    # VLM configuration
    VLM_MODEL_NAME: str = Field("openai/clip-vit-base-patch32", env="VLM_MODEL_NAME")
    VLM_ALPHA: float = Field(0.5, env="VLM_ALPHA")  # Weight for combining image and text features

    # Queue configuration
    MAX_WORKERS: int = Field(4, env="MAX_WORKERS")
    JOB_TIMEOUT: int = Field(300, env="JOB_TIMEOUT")  # in seconds

    # Redis configuration
    REDIS_URL: str = Field("redis://localhost:6379/0", env="REDIS_URL")
    REDIS_QUEUE_NAME: str = Field("yolo_jobs", env="REDIS_QUEUE_NAME")
    REDIS_JOB_TIMEOUT: int = Field(300, env="REDIS_JOB_TIMEOUT")  # in seconds

    # Directory configuration
    UPLOAD_DIR: str = Field("uploads", env="UPLOAD_DIR")
    TEMP_DIR: str = Field("temp", env="TEMP_DIR")
    LOGS_DIR: str = Field("logs", env="LOGS_DIR")

    # File Upload configuration
    MAX_FILE_SIZE: int = Field(10 * 1024 * 1024, env="MAX_FILE_SIZE")  # 10 MB
    ALLOWED_EXTENSIONS: list[str] = Field([".jpg", ".jpeg", ".png"], env="ALLOWED_EXTENSIONS")

    # Logging configuration
    LOG_LEVEL: str = Field("INFO", env="LOG_LEVEL")

    # PostgreSQL configuration
    POSTGRES_URL: str = Field(..., env="POSTGRES_URL")

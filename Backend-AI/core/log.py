import logging
import os
from logging.handlers import RotatingFileHandler
from pathlib import Path

from core.config import Config

# Load configuration
config = Config()

# Tạo thư mục logs nếu chưa có
logs_dir = Path(config.LOGS_DIR)
logs_dir.mkdir(exist_ok=True)

# Format cho log
log_format = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
date_format = "%Y-%m-%d %H:%M:%S"

# Tạo logger
logger = logging.getLogger("mobile_app")
logger.setLevel(getattr(logging, config.LOG_LEVEL.upper()))

# Xóa handlers cũ nếu có (tránh duplicate)
logger.handlers.clear()

# 1. CONSOLE HANDLER - Hiển thị trên terminal
console_handler = logging.StreamHandler()
console_handler.setLevel(logging.INFO)
console_formatter = logging.Formatter(log_format, date_format)
console_handler.setFormatter(console_formatter)
logger.addHandler(console_handler)

# 2. ROTATING FILE HANDLER - Ghi tất cả log vào file
# Tự động tạo file mới mỗi 10MB, giữ 5 files backup
file_handler = RotatingFileHandler(
    filename=logs_dir / "app.log",
    maxBytes=10 * 1024 * 1024,  # 10 MB
    backupCount=5,  # Giữ 5 files: app.log.1, app.log.2, ..., app.log.5
    encoding="utf-8"
)
file_handler.setLevel(logging.DEBUG)  # Ghi tất cả từ DEBUG trở lên
file_formatter = logging.Formatter(log_format, date_format)
file_handler.setFormatter(file_formatter)
logger.addHandler(file_handler)

# 3. ERROR FILE HANDLER - Chỉ ghi lỗi nghiêm trọng
error_handler = RotatingFileHandler(
    filename=logs_dir / "error.log",
    maxBytes=10 * 1024 * 1024,  # 10 MB
    backupCount=5,
    encoding="utf-8"
)
error_handler.setLevel(logging.ERROR)  # Chỉ ghi ERROR và CRITICAL
error_formatter = logging.Formatter(log_format, date_format)
error_handler.setFormatter(error_formatter)
logger.addHandler(error_handler)

# Tắt propagate để tránh log trùng lặp
logger.propagate = False

# Log thông báo khởi động
logger.info(f"Logging system initialized - Level: {config.LOG_LEVEL}")
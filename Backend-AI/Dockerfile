# Optimized Multi-stage build for YOLO Detection API
# Target size: ~3-4GB (thay vì 33GB)

FROM python:3.11-slim as base

# Set environment variables để giảm dung lượng
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

# Set working directory
WORKDIR /app

# Select dependency set at build time (api or worker).
ARG REQUIREMENTS_FILE=requirements.txt

# Install system dependencies và clean up trong cùng 1 layer
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1 \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender1 \
    libgomp1 \
    wget \
    curl \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

# Copy requirements files first for better caching
COPY requirements*.txt ./

# Install Python dependencies và clean up trong cùng 1 layer
RUN python -m pip install --no-cache-dir --upgrade pip \
    && python -m pip install --no-cache-dir -r ${REQUIREMENTS_FILE} \
    && python -m pip check \
    && rm -rf /root/.cache/pip/* \
    && find /usr/local/lib/python3.11/site-packages -type d -name "tests" -exec rm -rf {} + 2>/dev/null || true \
    && find /usr/local/lib/python3.11/site-packages -type d -name "test" -exec rm -rf {} + 2>/dev/null || true \
    && find /usr/local/lib/python3.11/site-packages -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true

# Create necessary directories
RUN mkdir -p logs temp uploads models

# Copy application code (this layer changes when code changes)
COPY . .

# Expose port for API
EXPOSE 8000

# Default command (can be overridden)
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]

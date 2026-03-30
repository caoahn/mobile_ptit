# Mobile API — YOLO Detection & VLM Embedding

FastAPI REST API phục vụ **object detection** (YOLO) và **image embedding** (CLIP) với xử lý bất đồng bộ qua Celery + Redis.

## Features

- **Object Detection** — upload file hoặc gửi URL ảnh, nhận bounding box + confidence
- **Image Embedding** — trích xuất vector 512-d từ ảnh (CLIP), hỗ trợ kết hợp text
- **Async Processing** — job queue qua Celery + Redis, poll kết quả qua job ID
- **Health Check** — kiểm tra trạng thái API, Redis, model
- **Request Logging** — middleware log mọi request kèm request ID & thời gian xử lý

## Architecture

```
mobile/
├── app.py                    # FastAPI entry point, middleware, health check
├── worker.py                 # Celery worker entrypoint — pre-load model, xử lý job
├── core/
│   ├── config.py             # Pydantic Settings (đọc .env)
│   ├── log.py                # Logging (loguru)
│   └── schemas.py            # Request/Response Pydantic models
├── routers/
│   ├── detection.py          # POST /detect/upload, POST /detect/url
│   ├── embedding.py          # POST /embedding/url
│   └── job.py                # GET /job/status_detection/{id}, GET /job/status_embedding/{id}
├── services/
│   ├── yolo_service.py       # YOLO model singleton + detect logic
│   ├── VLM_service.py        # CLIP model singleton + embedding logic
│   ├── image_service.py      # Download/upload/validate ảnh
│   ├── redis_service.py      # Redis connection helper
│   └── celery_app.py         # Celery app config (broker/backend/routes)
├── models/
│   └── best.pt               # YOLO weights
├── docker-compose.yml        # Production (2 workers, healthcheck, persistent Redis)
├── docker-compose.dev.yml    # Development (hot reload, debug log, HF cache)
├── Dockerfile                # Multi-stage build (Python 3.11-slim)
├── requirements.txt          # Dependencies
└── test-api.py               # Script test toàn bộ API
```

## Quick Start

### Docker (Recommended)

```bash
# Production
docker-compose up -d

# Development (hot reload)
docker-compose -f docker-compose.dev.yml up -d

# Worker only (run API with uvicorn on host)
docker-compose -f docker-compose.worker.yml up -d
```

API sẵn sàng tại **http://localhost:8000** — Swagger docs tại **/docs**.

### Manual

**Yêu cầu:** Python 3.10+, Redis server, file model YOLO (`models/best.pt`)

```bash
# Cài dependencies
pip install -r requirements.txt

# Hoặc cài riêng theo vai trò
pip install -r requirements-api.txt
# hoặc
pip install -r requirements-worker.txt

# Tạo file .env (xem phần Configuration)
cp .env.example .env

# Terminal 1 — API server
uvicorn app:app --reload --host 0.0.0.0 --port 8000

# Terminal 2 — Celery Worker
celery -A services.celery_app.celery_app worker --queues=detection_jobs,embedding_jobs --loglevel=info --concurrency=2

# Windows (khuyến nghị)
celery -A services.celery_app.celery_app worker --queues=detection_jobs,embedding_jobs --loglevel=info --pool=solo
```

## Configuration

Cấu hình qua biến môi trường hoặc file `.env`:

| Biến | Mặc định | Mô tả |
|------|----------|-------|
| `MODEL_PATH` | *(bắt buộc)* | Đường dẫn đến file YOLO `.pt` |
| `REDIS_URL` | `redis://localhost:6379/0` | Redis connection string |
| `CONFIDENCE_THRESHOLD` | `0.5` | Ngưỡng confidence cho detection |
| `IOU_THRESHOLD` | `0.5` | Ngưỡng IoU cho NMS |
| `VLM_MODEL_NAME` | `openai/clip-vit-base-patch32` | Tên model CLIP |
| `VLM_ALPHA` | `0.5` | Trọng số kết hợp image/text features |
| `MAX_FILE_SIZE` | `10485760` (10 MB) | Giới hạn file upload |
| `ALLOWED_EXTENSIONS` | `.jpg, .jpeg, .png` | Định dạng ảnh hỗ trợ |
| `LOG_LEVEL` | `INFO` | Mức log (`DEBUG`, `INFO`, `WARNING`...) |
| `CELERY_TASK_TIME_LIMIT` | `300` | Hard timeout mỗi task (giây) |
| `CELERY_RESULT_EXPIRES` | `3600` | TTL kết quả task trong Redis (giây) |

## API Endpoints

### Health & Info

| Method | Path | Mô tả |
|--------|------|-------|
| GET | `/` | Thông tin API + danh sách endpoints |
| GET | `/health` | Trạng thái API, Redis, model |

### Detection

| Method | Path | Mô tả |
|--------|------|-------|
| POST | `/detect/upload` | Upload ảnh trực tiếp (multipart/form-data) — trả kết quả ngay |
| POST | `/detect/url` | Gửi URL ảnh — trả `job_id` (async, status 202) |

### Embedding

| Method | Path | Mô tả |
|--------|------|-------|
| POST | `/embedding/url` | Gửi URL ảnh + text list — trả `job_id` (async, status 202) |

### Job Management

| Method | Path | Mô tả |
|--------|------|-------|
| GET | `/job/status_detection/{job_id}` | Kiểm tra trạng thái job detection |
| GET | `/job/status_embedding/{job_id}` | Kiểm tra trạng thái job embedding |
| DELETE | `/job/job/{job_id}` | Hủy job |

## Usage Examples

### Detection qua URL (async)

```bash
# 1. Submit job
curl -X POST http://localhost:8000/detect/url \
  -H "Content-Type: application/json" \
  -d '{"image_url": "https://ultralytics.com/images/bus.jpg"}'

# Response: {"job_id": "abc-123", "status": "queued", "message": "..."}

# 2. Poll kết quả
curl http://localhost:8000/job/status_detection/abc-123
```

### Detection qua upload (sync)

```bash
curl -X POST http://localhost:8000/detect/upload \
  -F "file=@path/to/image.jpg"
```

### Embedding

```bash
curl -X POST http://localhost:8000/embedding/url \
  -H "Content-Type: application/json" \
  -d '{"image_url": "https://example.com/photo.jpg", "text_list": ["a cat", "a dog"]}'
```

### Response Examples

**Detection result:**
```json
{
  "success": true,
  "results": [
    {
      "class_name": "person",
      "confidence": 0.92,
      "bounding_box": {"x": 100, "y": 150, "width": 200, "height": 300}
    }
  ],
  "error": null
}
```

**Embedding job finished:**
```json
{
  "job_id": "abc-123",
  "status": "finished",
  "result": [0.0123, -0.0456, 0.0789, "... (512 values)"]
}
```

## Testing

```bash
# Test toàn bộ API
python test-api.py

# Bỏ qua test embedding
python test-api.py --skip-embed

# Dùng URL ảnh tùy chỉnh
python test-api.py --url https://example.com/image.jpg
```

## Docker

| File | Mục đích |
|------|----------|
| `docker-compose.yml` | **Production** — API + Worker + Redis, persistent volume, healthcheck, auto restart |
| `docker-compose.dev.yml` | **Development (Worker-only)** — Redis + Worker trong Docker, API chạy trên host |
| `docker-compose.worker.yml` | **Worker-only explicit** — dùng khi chỉ muốn chạy queue stack bằng Docker |

### Requirements split

- `requirements-common.txt`: thư viện dùng chung giữa API và Worker
- `requirements-api.txt`: API server (`fastapi`, `uvicorn`, upload/db deps)
- `requirements-worker.txt`: Worker-only (không kéo web-server deps)
- `requirements.txt`: alias mặc định trỏ tới `requirements-api.txt` để tương thích lệnh cũ

Chi tiết xem [DOCKER.md](DOCKER.md).
- Verify Redis is accessible from your network

### Worker Not Processing Jobs
- Check Celery worker is running: `celery -A services.celery_app.celery_app worker --queues=detection_jobs,embedding_jobs --loglevel=info`
- Verify `REDIS_URL` is correct
- Check worker logs for errors

### Detection Timeout
- Increase `JOB_TIMEOUT` in `.env`
- Check worker performance
- Reduce image size or complexity

## 📝 Development

### Project Structure

- **app.py**: Main FastAPI application with middleware
- **worker.py**: Celery worker bootstrap for async jobs
- **routers/**: API endpoint definitions
- **services/**: Business logic (YOLO, image handling)
- **core/**: Configuration, schemas, logging

### Adding New Endpoints

1. Create endpoint in `routers/`
2. Import and include router in `app.py`
3. Update schemas in `core/schemas.py` if needed

## 🔒 Production Considerations

- [ ] Add authentication/authorization
- [ ] Implement rate limiting
- [ ] Use production-grade Redis (Redis Cluster/Sentinel)
- [ ] Add result caching
- [ ] Configure CORS properly
- [ ] Set up monitoring (Prometheus, Grafana)
- [ ] Use HTTPS
- [ ] Optimize YOLO model (quantization, pruning)

## 📄 License

[Your License Here]

## 👥 Contributors

[Your Name/Team]

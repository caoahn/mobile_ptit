# Mode A - Chạy Local Full (API + Worker trên máy)

Hướng dẫn chi tiết chạy trực tiếp trên máy không Docker.

## Yêu cầu

- Python 3.10+ (khuyến nghị 3.11)
- Redis server (local hoặc accessible)
- Model file: `models/yolo11n.pt`
- File config: `.env` hoặc set biến môi trường

## Bước 1: Chuẩn bị Python environment

### Tùy chọn A - Có Conda

```powershell
conda activate mobile
pip install -r requirements-api.txt
```

### Tùy chọn B - Không có Conda (Windows PowerShell)

```powershell
# 1. Tạo virtual environment
python -m venv venv

# 2. Kích hoạt
.\venv\Scripts\Activate.ps1

# 3. Cài dependencies
pip install --upgrade pip
pip install -r requirements-api.txt
```

Nếu gặp lỗi `cannot be loaded because running scripts is disabled`:

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

Rồi chạy lại:

```powershell
.\venv\Scripts\Activate.ps1
```

### Tùy chọn C - Không có Conda (Linux/macOS)

```bash
# 1. Tạo virtual environment
python3 -m venv venv

# 2. Kích hoạt
source venv/bin/activate

# 3. Cài dependencies
pip install --upgrade pip
pip install -r requirements-api.txt
```

**Kiểm tra**: Khi activate thành công, dòng lệnh sẽ có prefix `(venv)`.

## Bước 2: Cấu hình biến môi trường

### Option 1 - Tạo file `.env`

Tạo file `.env` trong thư mục gốc dự án:

```
POSTGRES_URL=postgresql://user:password@localhost:5432/dbname
REDIS_URL=redis://localhost:6379/0
MODEL_PATH=models/yolo11n.pt
LOG_LEVEL=DEBUG
```

### Option 2 - Set biến môi trường tạm thời (Windows PowerShell)

```powershell
$env:POSTGRES_URL="postgresql://user:password@localhost:5432/dbname"
$env:REDIS_URL="redis://localhost:6379/0"
$env:MODEL_PATH="models/yolo11n.pt"
$env:LOG_LEVEL="DEBUG"
```

### Option 3 - Set biến môi trường tạm thời (Linux/macOS)

```bash
export POSTGRES_URL="postgresql://user:password@localhost:5432/dbname"
export REDIS_URL="redis://localhost:6379/0"
export MODEL_PATH="models/yolo11n.pt"
export LOG_LEVEL="DEBUG"
```

## Bước 3: Chuẩn bị Redis

### Cách A - Redis local (nếu đã cài sẵn)

Mở terminal riêng, chạy:

```bash
redis-server
```

Default sẽ listen tại `localhost:6379`.

### Cách B - Redis qua Docker

Mở terminal riêng:

```bash
docker run -d -p 6379:6379 redis:7-alpine
```

Hoặc dùng compose:

```bash
docker compose -f docker-compose.worker.yml up -d redis
```

### Cách C - Redis trên server khác

Cập nhật `REDIS_URL` trong `.env` hoặc env var:

```
REDIS_URL=redis://server-ip:6379/0
```

## Bước 4: Chạy API (Terminal 1)

Từ thư mục gốc, chạy:

```bash
uvicorn app:app --host 0.0.0.0 --port 8000 --reload
```

Log thành công:

```
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Started server process [12345]
```

Kiểm tra health:

```bash
curl http://localhost:8000/health
```

Expected response:

```json
{"status": "healthy", "model_loaded": true, "redis_connected": true}
```

## Bước 5: Chạy Worker (Terminal 2)

Từ thư mục gốc (trong venv tương ứng):

```bash
python worker.py
```

Log thành công:

```
2026-03-29 ... - INFO - Connecting to Redis at: redis://localhost:6379/0
2026-03-29 ... - INFO - Redis connection established
2026-03-29 ... - INFO - Pre-loading YOLO model...
2026-03-29 ... - INFO - Starting RQ worker: yolo-worker-DESKTOP-XXX-12345-1234567890
```

**Ghi chú Windows**: Worker sẽ tự động dùng `SimpleWorker` + `TimerDeathPenalty` (không lỗi `os.fork` hay `SIGALRM`).

## Bước 6: Test

Mở terminal 3 (hoặc dùng curl/Postman):

```bash
python test-api.py
```

Hoặc test manual:

```bash
# Test detection sync (upload file)
curl -X POST http://localhost:8000/detect/upload \
  -F "file=@test_image.jpg"

# Test detection async (URL)
curl -X POST http://localhost:8000/detect/url \
  -H "Content-Type: application/json" \
  -d '{"image_url": "https://ultralytics.com/images/bus.jpg"}'

# Kiểm tra job status
curl http://localhost:8000/job/status_detection/{job_id}
```

## Biến môi trường quan trọng

| Biến | Default | Ghi chú |
|------|---------|--------|
| `REDIS_URL` | `redis://localhost:6379/0` | Nơi queue chạy |
| `MODEL_PATH` | `/models/yolo11n.pt` | Đường dẫn model YOLO |
| `POSTGRES_URL` | **(bắt buộc)** | Database connection |
| `LOG_LEVEL` | `INFO` | DEBUG/INFO/WARNING |
| `REDIS_JOB_TIMEOUT` | `300` | Timeout job (giây) |

Nếu thiếu `POSTGRES_URL` hoặc `REDIS_URL`, API sẽ lỗi ngay khi startup.

## Troubleshooting

### API không khởi động

```
Error: Failed to connect to Redis at: redis://localhost:6379/0
```

**Giải pháp**:
- Kiểm tra Redis đang chạy
- Kiểm tra `REDIS_URL` đúng

### Worker crash trên Windows

```
AttributeError: module 'os' has no attribute 'fork'
```

**Giải pháp**: Đã fix trong code mới, pull lại `worker.py`.

### Model không load

```
ModelNotFoundException: Model file not found at: models/yolo11n.pt
```

**Giải pháp**:
- Xác nhận file tồn tại: `ls models/`
- Xác nhận `MODEL_PATH` đúng tên file

### Port 8000 bị chiếm

```
OSError: [Errno 10048] Only one usage of each socket address...
```

**Giải pháp**:

```powershell
# Tìm process chiếm port 8000 (Windows)
netstat -ano | findstr :8000

# Hoặc chạy trên port khác
uvicorn app:app --port 8001 --reload
```

### Job vào queue nhưng không chạy

**Debug**:

1. Kiểm tra worker log có lỗi gì
2. Kiểm tra Redis còn hoạt động: `redis-cli ping`
3. Kiểm tra queue name: `redis-cli KEYS "rq:queue:*"`

## Dừng/Restart

Khi cần dừng:

- **API**: `Ctrl+C` (Terminal 1)
- **Worker**: `Ctrl+C` (Terminal 2)
- **Redis** (local): `Ctrl+C`
- **Redis** (Docker): `docker stop redis-7-alpine` hoặc `docker compose ... down`

## Workflow phát triển

1. Activate venv
2. Set env var (hoặc `.env`)
3. Start Redis (terminal riêng)
4. Start API: `uvicorn app:app --reload`
5. Start Worker: `python worker.py`
6. Code + test
7. Commit + push

---

**Ghi chú**: Cách này phù hợp debug logic Python nhanh. Khi sẵn sàng, test lại mode full Docker trước khi deploy.

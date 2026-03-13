# Docker Deployment Guide

This document explains how to deploy the YOLO Detection API using Docker.

## 📦 Files

- `Dockerfile` - Container image definition
- `docker-compose.yml` - Production deployment
- `docker-compose.dev.yml` - Development with hot reload
- `.dockerignore` - Files to exclude from image

## 🚀 Quick Start

### Prerequisites

- Docker 20.10+
- Docker Compose V2+
- YOLO model file in `models/` directory

### 1. Prepare Model

```bash
# Place your YOLO model in models directory
mkdir -p models
# Copy your model file
cp /path/to/your/model.pt models/best.pt
```

### 2. Build and Start Services

**Production:**
```bash
docker-compose up -d
```

**Development (chỉ chạy Redis trong Docker):**
```bash
# 1. Khởi động Redis
docker-compose -f docker-compose.dev.yml up -d

# 2. Chạy API trực tiếp (cửa sổ terminal 1)
uvicorn app:app --host 0.0.0.0 --port 8000 --reload

# 3. Chạy Worker trực tiếp (cửa sổ terminal 2)
python worker.py
```

> **Ưu điểm Development mode:** Không cần rebuild Docker image mỗi lần thay đổi code, chỉ cần lưu file là tự động reload!

### 3. Verify Services

```bash
# Check all services are running
docker-compose ps

# Check API health
curl http://localhost:8000/health

# View logs
docker-compose logs -f api
docker-compose logs -f worker
```

## 🏗️ Architecture

```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │
       ▼
┌─────────────┐     ┌─────────────┐
│  API:8000   │────▶│   Redis     │
└─────────────┘     └──────┬──────┘
                           │
                    ┌──────┴──────┐
                    │             │
              ┌─────▼─────┐ ┌────▼──────┐
              │  Worker 1 │ │  Worker 2 │
              └───────────┘ └───────────┘
```

## 📝 Services

### API Service
- **Port:** 8000
- **Container:** yolo-api
- **Purpose:** REST API endpoints
- **Replicas:** 1
- **Health Check:** `/health` endpoint

### Worker Service
- **Container:** yolo-worker
- **Purpose:** Process detection jobs
- **Replicas:** 2 (configurable)
- **Queue:** Redis Queue (RQ)

### Redis Service
- **Port:** 6379
- **Container:** yolo-redis
- **Purpose:** Job queue and cache
- **Persistence:** Volume mounted

## ⚙️ Configuration

### Environment Variables

Edit `docker-compose.yml` to customize:

```yaml
environment:
  - MODEL_PATH=/app/models/best.pt
  - CONFIDENCE_THRESHOLD=0.25
  - IOU_THRESHOLD=0.45
  - MAX_WORKERS=2
  - JOB_TIMEOUT=180
```

### Volumes

**Persistent Data:**
- `./models:/app/models:ro` - Model files (read-only)
- `./logs:/app/logs` - Application logs
- `./temp:/app/temp` - Temporary files
- `redis-data` - Redis persistence

### Scaling Workers

```bash
# Scale to 4 workers
docker-compose up -d --scale worker=4

# Or edit docker-compose.yml:
deploy:
  replicas: 4
```

## 🧪 Testing

```bash
# Upload file test
curl -X POST http://localhost:8000/detect/upload \
  -F "file=@test_image.jpg"

# URL detection test
curl -X POST http://localhost:8000/detect/url \
  -H "Content-Type: application/json" \
  -d '{"image_url": "https://example.com/image.jpg"}'
```

## 📊 Monitoring

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f api
docker-compose logs -f worker
docker-compose logs -f redis

# Last 100 lines
docker-compose logs --tail=100 api
```

### Check Resource Usage

```bash
docker stats
```

### Redis Queue Status

```bash
# Connect to Redis
docker exec -it yolo-redis redis-cli

# Check queue length
LLEN yolo_detection_queue

# View queue items
LRANGE yolo_detection_queue 0 -1
```

## 🔧 Maintenance

### Update Application

```bash
# Rebuild and restart
docker-compose down
docker-compose up -d --build
```

### Clean Up

```bash
# Stop services
docker-compose down

# Remove volumes (WARNING: deletes data)
docker-compose down -v

# Remove images
docker-compose down --rmi all
```

### Backup Model

```bash
# Backup model file
docker cp yolo-api:/app/models/best.pt ./backup/

# Or use volume
tar -czf models-backup.tar.gz models/
```

## 🐛 Troubleshooting

### API Not Starting

```bash
# Check logs
docker-compose logs api

# Common issues:
# 1. Model file not found
# 2. Redis not connected
# 3. Port 8000 already in use
```

### Worker Not Processing

```bash
# Check worker logs
docker-compose logs worker

# Restart worker
docker-compose restart worker

# Check Redis connection
docker-compose exec redis redis-cli ping
```

### Out of Memory

```bash
# Add memory limits to docker-compose.yml
services:
  api:
    deploy:
      resources:
        limits:
          memory: 4G
```

### Slow Performance

```bash
# Increase workers
docker-compose up -d --scale worker=4

# Check resource usage
docker stats

# Optimize model (use smaller YOLO variant)
```

## 🔒 Production Best Practices

### 1. Use Environment Files

```bash
# Create .env file
cp .env.example .env

# Load in docker-compose.yml
env_file:
  - .env
```

### 2. Enable HTTPS

Use a reverse proxy (nginx, traefik):

```yaml
# Add to docker-compose.yml
nginx:
  image: nginx:alpine
  ports:
    - "443:443"
  volumes:
    - ./nginx.conf:/etc/nginx/nginx.conf
    - ./ssl:/etc/nginx/ssl
```

### 3. Resource Limits

```yaml
deploy:
  resources:
    limits:
      cpus: '2'
      memory: 4G
    reservations:
      cpus: '1'
      memory: 2G
```

### 4. Health Checks

```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 40s
```

### 5. Logging

```yaml
logging:
  driver: "json-file"
  options:
    max-size: "10m"
    max-file: "3"
```

## 📈 Performance Tuning

### Worker Scaling

- CPU-bound: 1-2 workers per CPU core
- Memory: 1-2GB per worker minimum
- Model size dependent

### Redis Optimization

```bash
# In docker-compose.yml
command: redis-server --maxmemory 512mb --maxmemory-policy allkeys-lru
```

### API Optimization

- Use gunicorn for production
- Enable uvicorn workers
- Configure timeouts

```dockerfile
CMD ["gunicorn", "app:app", "-w", "4", "-k", "uvicorn.workers.UvicornWorker", "-b", "0.0.0.0:8000"]
```

## 🌐 Multi-Host Deployment

For production across multiple servers:

```bash
# Use Docker Swarm
docker swarm init
docker stack deploy -c docker-compose.yml yolo

# Or Kubernetes
# Convert to k8s with kompose
kompose convert -f docker-compose.yml
```

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com)
- [Docker Compose Reference](https://docs.docker.com/compose/compose-file/)
- [RQ Documentation](https://python-rq.org/)
- [FastAPI Deployment](https://fastapi.tiangolo.com/deployment/)

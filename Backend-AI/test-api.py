#!/usr/bin/env python3
"""
Test script cho toàn bộ hệ thống YOLO Detection + Embedding API
Bao gồm: Health Check, Detection (upload + URL async), Embedding, Job Management

Cách chạy:
    python test-api.py                  # Test tất cả
    python test-api.py --skip-embed     # Bỏ qua test embedding
    python test-api.py --url <url>      # Dùng URL ảnh tùy chỉnh
"""

import requests
import time
import sys
import argparse
import os

BASE_URL = "http://localhost:8000"
TEST_IMAGE_URL = "https://ultralytics.com/images/bus.jpg"
POLL_INTERVAL = 2   # seconds
MAX_POLL = 30        # max attempts

# ==================== HELPERS ====================

passed = 0
failed = 0
skipped = 0

def ok(msg):
    global passed
    passed += 1
    print(f"  ✓ {msg}")

def fail(msg):
    global failed
    failed += 1
    print(f"  ✗ {msg}")

def info(msg):
    print(f"  → {msg}")

def skip(msg):
    global skipped
    skipped += 1
    print(f"  ⊘ Bỏ qua: {msg}")

def section(title):
    print(f"\n{'─'*50}")
    print(f"  {title}")
    print(f"{'─'*50}")

def api_get(path, **kwargs):
    return requests.get(f"{BASE_URL}{path}", timeout=10, **kwargs)

def api_post(path, **kwargs):
    return requests.post(f"{BASE_URL}{path}", timeout=30, **kwargs)

def api_delete(path, **kwargs):
    return requests.delete(f"{BASE_URL}{path}", timeout=10, **kwargs)

def poll_job(status_path, job_id):
    """Poll job cho đến khi hoàn thành hoặc hết timeout."""
    for attempt in range(1, MAX_POLL + 1):
        time.sleep(POLL_INTERVAL)
        resp = api_get(f"{status_path}/{job_id}")
        resp.raise_for_status()
        data = resp.json()
        status = data["status"]
        info(f"[{attempt}/{MAX_POLL}] status={status}")

        if status in ("finished", "failed"):
            return data

    fail(f"Job không hoàn thành sau {MAX_POLL * POLL_INTERVAL}s")
    return None

# ==================== TESTS ====================

def test_root():
    section("1. Root Endpoint  GET /")
    try:
        resp = api_get("/")
        resp.raise_for_status()
        data = resp.json()
        ok(f"message = {data.get('message')}")
        ok(f"version = {data.get('version')}")

        endpoints = data.get("endpoints", {})
        if endpoints:
            ok(f"endpoints: {list(endpoints.keys())}")
        return True
    except Exception as e:
        fail(f"Root endpoint lỗi: {e}")
        return False


def test_health():
    section("2. Health Check  GET /health")
    try:
        resp = api_get("/health")
        resp.raise_for_status()
        data = resp.json()
        ok(f"status        = {data['status']}")
        ok(f"model_loaded  = {data['model_loaded']}")
        ok(f"redis_connected = {data['redis_connected']}")

        if data["status"] != "healthy":
            fail("API không healthy!")
            return False
        if not data["redis_connected"]:
            fail("Redis chưa kết nối — đảm bảo Redis đang chạy")
            return False
        if not data["model_loaded"]:
            fail("YOLO model chưa load — kiểm tra models/best.pt")
            return False

        ok("Tất cả services healthy")
        return True
    except requests.ConnectionError:
        fail("Không kết nối được API — đảm bảo uvicorn đang chạy")
        return False
    except Exception as e:
        fail(f"Health check lỗi: {e}")
        return False


def test_detect_upload():
    section("3. Detection Upload  POST /detect/upload")

    # 3a. Test với file hợp lệ
    test_files = ["test_image.jpg", "test_image.png", "test.jpg"]
    test_file = None
    for f in test_files:
        if os.path.exists(f):
            test_file = f
            break

    if test_file:
        try:
            with open(test_file, "rb") as f:
                info(f"Upload file: {test_file}")
                resp = api_post("/detect/upload", files={"file": (test_file, f, "image/jpeg")})
                resp.raise_for_status()
                data = resp.json()

                if data.get("success"):
                    results = data.get("results", [])
                    ok(f"Detection thành công! Tìm thấy {len(results)} objects")
                    for r in results:
                        bb = r["bounding_box"]
                        print(f"     • {r['class_name']}: {r['confidence']*100:.1f}% "
                              f"[x={bb['x']}, y={bb['y']}, w={bb['width']}, h={bb['height']}]")
                else:
                    fail(f"Detection thất bại: {data.get('error')}")
        except Exception as e:
            fail(f"Upload lỗi: {e}")
    else:
        skip("Không tìm thấy file ảnh test (test_image.jpg)")

    # 3b. Test upload file không hợp lệ (empty)
    info("Test upload file rỗng...")
    try:
        resp = api_post("/detect/upload", files={"file": ("empty.jpg", b"", "image/jpeg")})
        if resp.status_code >= 400 or not resp.json().get("success", True):
            ok("Server từ chối file rỗng đúng cách")
        else:
            fail("Server không reject file rỗng")
    except Exception:
        ok("Server từ chối file rỗng")


def test_detect_url_async(image_url):
    section("4. Detection URL Async  POST /detect/url")
    try:
        info(f"Submit job cho URL: {image_url}")
        resp = api_post("/detect/url", json={"image_url": image_url})

        if resp.status_code != 202:
            fail(f"Expected 202, got {resp.status_code}")
            return None

        data = resp.json()
        job_id = data["job_id"]
        ok(f"Job submitted: {job_id}")
        ok(f"status  = {data['status']}")
        ok(f"message = {data['message']}")

        # Poll kết quả
        info("Đang chờ worker xử lý...")
        result = poll_job("/job/status_detection", job_id)

        if result and result["status"] == "finished":
            ok("Detection hoàn thành!")
            detections = result.get("result", [])
            ok(f"Tìm thấy {len(detections)} objects")
            for r in detections:
                bb = r["bounding_box"]
                print(f"     • {r['class_name']}: {r['confidence']*100:.1f}% "
                      f"[x={bb['x']}, y={bb['y']}, w={bb['width']}, h={bb['height']}]")
        elif result and result["status"] == "failed":
            fail(f"Job failed: {result.get('error', 'unknown')[:200]}")

        return job_id
    except Exception as e:
        fail(f"Async detection lỗi: {e}")
        return None


def test_detect_url_invalid():
    section("5. Detection URL Invalid  POST /detect/url (bad URL)")
    try:
        resp = api_post("/detect/url", json={"image_url": "https://invalid-domain-xyz.com/no.jpg"})
        if resp.status_code == 202:
            data = resp.json()
            job_id = data["job_id"]
            info(f"Job submitted (sẽ fail ở worker): {job_id}")

            result = poll_job("/job/status_detection", job_id)
            if result and result["status"] == "failed":
                ok("Worker xử lý lỗi URL không hợp lệ đúng cách")
            else:
                fail("Worker không báo lỗi cho URL không hợp lệ")
        else:
            ok(f"Server reject URL không hợp lệ: {resp.status_code}")
    except Exception as e:
        fail(f"Test invalid URL lỗi: {e}")


def test_detect_url_missing():
    section("6. Detection URL Missing  POST /detect/url (no body)")
    try:
        resp = api_post("/detect/url", json={})
        if resp.status_code == 422:
            ok(f"Server trả 422 Validation Error đúng cách")
        else:
            fail(f"Expected 422, got {resp.status_code}")
    except Exception as e:
        fail(f"Test missing URL lỗi: {e}")


def test_embedding_url_async(image_url, text_list=None):
    section("7. Embedding URL Async  POST /embedding/url")
    try:
        info(f"Submit embedding job cho URL: {image_url} và text_list: {text_list}")
        resp = api_post("/embedding/url", json={"image_url": image_url, "text_list": text_list})

        if resp.status_code not in (200, 201, 202):
            fail(f"Unexpected status {resp.status_code}: {resp.text[:200]}")
            return None

        data = resp.json()
        job_id = data["job_id"]
        ok(f"Job submitted: {job_id}")
        ok(f"status = {data['status']}")

        # Poll kết quả
        info("Đang chờ worker xử lý embedding...")
        result = poll_job("/job/status_embedding", job_id)

        if result and result["status"] == "finished":
            ok("Embedding hoàn thành!")
            embedding = result.get("result", [])
            if embedding:
                ok(f"Vector dimension: {len(embedding)}")
                ok(f"Mẫu 5 giá trị đầu: {[round(v, 4) for v in embedding[:5]]}")
            else:
                fail("Embedding trả về rỗng")
        elif result and result["status"] == "failed":
            fail(f"Job failed: {result.get('error', 'unknown')[:200]}")

        return job_id
    except Exception as e:
        fail(f"Embedding lỗi: {e}")
        return None


def test_job_status_not_found():
    section("8. Job Status Not Found  GET /job/status_detection/fake-id")
    try:
        resp = api_get("/job/status_detection/fake-job-id-12345")
        if resp.status_code == 404:
            ok("Server trả 404 cho job không tồn tại")
        else:
            fail(f"Expected 404, got {resp.status_code}")
    except Exception as e:
        fail(f"Test job not found lỗi: {e}")


def test_job_cancel(job_id):
    section("9. Job Cancel  DELETE /job/job/{job_id}")
    if not job_id:
        skip("Không có job_id để test cancel")
        return

    try:
        resp = api_delete(f"/job/job/{job_id}")
        if resp.status_code == 200:
            data = resp.json()
            ok(f"Cancel response: {data.get('message')}")
        elif resp.status_code == 404:
            ok("Job đã hết hạn hoặc đã bị xóa (expected)")
        else:
            fail(f"Unexpected status: {resp.status_code}")
    except Exception as e:
        fail(f"Job cancel lỗi: {e}")


def test_docs():
    section("10. API Documentation  GET /docs")
    try:
        resp = api_get("/docs")
        if resp.status_code == 200:
            ok("Swagger UI accessible")
        else:
            fail(f"Docs returned {resp.status_code}")

        resp2 = api_get("/openapi.json")
        if resp2.status_code == 200:
            spec = resp2.json()
            paths = list(spec.get("paths", {}).keys())
            ok(f"OpenAPI spec có {len(paths)} endpoints: {paths}")
        else:
            fail(f"OpenAPI spec returned {resp2.status_code}")
    except Exception as e:
        fail(f"Docs test lỗi: {e}")


# ==================== MAIN ====================

def main():
    global BASE_URL
    
    parser = argparse.ArgumentParser(description="Test toàn bộ API")
    parser.add_argument("--url", default=TEST_IMAGE_URL, help="URL ảnh để test")
    parser.add_argument("--skip-embed", action="store_true", help="Bỏ qua test embedding")
    parser.add_argument("--base-url", default=BASE_URL, help="Base URL của API")
    args = parser.parse_args()

    BASE_URL = args.base_url

    print("=" * 50)
    print("  YOLO Detection + Embedding API - Full Test")
    print(f"  Target: {BASE_URL}")
    print(f"  Image:  {args.url}")
    print("=" * 50)

    # 1-2: Kiểm tra kết nối cơ bản
    test_root()
    healthy = test_health()
    if not healthy:
        print("\n⛔ API chưa sẵn sàng. Kiểm tra lại:")
        print("   - uvicorn đang chạy?  (uvicorn app:app --reload)")
        print("   - Redis đang chạy?    (docker-compose -f docker-compose.dev.yml up -d)")
        print("   - Worker đang chạy?   (python worker.py / docker worker)")
        print("   - Model tồn tại?      (models/best.pt)")
        sys.exit(1)

    # 3: Upload detection
    test_detect_upload()

    # 4: Async URL detection
    detection_job_id = test_detect_url_async(args.url)

    # 5-6: Edge cases
    test_detect_url_invalid()
    test_detect_url_missing()

    # 7: Embedding
    embedding_job_id = None
    text_list = ["a bus on the street", "a vehicle", "outdoor scene"]
    if not args.skip_embed:
        embedding_job_id = test_embedding_url_async(args.url, text_list)
    else:
        section("7. Embedding")
        skip("--skip-embed flag")

    # 8: Job not found
    test_job_status_not_found()

    # 9: Job cancel (dùng job cũ đã xong)
    test_job_cancel(detection_job_id)

    # 10: Docs
    test_docs()

    # ==================== KẾT QUẢ ====================
    print("\n" + "=" * 50)
    print(f"  KẾT QUẢ: {passed} passed / {failed} failed / {skipped} skipped")
    print("=" * 50)
    print(f"\n  API Docs:    {BASE_URL}/docs")
    print(f"  Health:      {BASE_URL}/health")

    if failed > 0:
        print(f"\n  ⚠ Có {failed} test thất bại!")
        sys.exit(1)
    else:
        print("\n  ✓ Tất cả tests passed!")
        sys.exit(0)


if __name__ == "__main__":
    main()

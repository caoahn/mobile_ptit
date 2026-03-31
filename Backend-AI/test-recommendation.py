#!/usr/bin/env python3
"""
Test script cho Recommendation endpoints
- POST /user/UpdateBatchUser   -> Update user embeddings
- GET /user/top-recipes         -> Get top K recipes for all users
- GET /user/top-recipes/{user_id} -> Get top K recipes for specific user

Cách chạy:
    python test-recommendation.py
"""

import requests
import json
import numpy as np
import time
from core.config import Config

config = Config()

BASE_URL = "http://127.0.0.1:8000"
TEST_IMAGE_URL = "https://ultralytics.com/images/bus.jpg"
POLL_INTERVAL = 2
MAX_POLL = 30
POSTGRES_SQL = config.POSTGRES_URL
# ==================== HELPERS ====================

passed = 0
failed = 0

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

def section(title):
    print(f"\n{'─'*60}")
    print(f"  {title}")
    print(f"{'─'*60}")

def api_post(path, **kwargs):
    timeout = kwargs.pop("timeout", 30)
    return requests.post(f"{BASE_URL}{path}", timeout=timeout, **kwargs)

def api_get(path, **kwargs):
    timeout = kwargs.pop("timeout", 10)
    return requests.get(f"{BASE_URL}{path}", timeout=timeout, **kwargs)

def to_pgvector(vec):
    return "[" + ",".join(map(str, vec)) + "]"

def poll_job(status_path, job_id):
    """Poll job status until finished/failed or timeout."""
    for attempt in range(1, MAX_POLL + 1):
        time.sleep(POLL_INTERVAL)
        resp = api_get(f"{status_path}/{job_id}")
        resp.raise_for_status()

        data = resp.json()
        status = data.get("status")
        info(f"[{attempt}/{MAX_POLL}] status={status}")

        if status in ("finished", "failed"):
            return data

    fail(f"Job did not finish after {MAX_POLL * POLL_INTERVAL}s")
    return None

# ==================== SEED TEST DATA ====================

def generate_random_embedding(dim=512):
    """Generate random normalized embedding vector"""
    vec = np.random.randn(dim).astype(np.float32)
    vec = vec / np.linalg.norm(vec)  # normalize
    return vec.tolist()

def seed_test_data():
    """
    Seed cơ sở dữ liệu với test data:
    - 3 recipes với embeddings
    - 2 users với interactions
    """
    section("0. Seed Test Data")

    # Note: Bạn cần tự insert recipes vào DB trước
    # SQL:
    # INSERT INTO recipe_vector (recipe_id, embedding) VALUES
    #   (1, '{embedding1}'),
    #   (2, '{embedding2}'),
    #   (3, '{embedding3}');

    info("⚠️  Bước 1: INSERT test recipes vào database")
    print("""
    Chạy lệnh SQL này trên PostgreSQL:

    psql -U your_user -d your_db -c "
    INSERT INTO recipe_vector (recipe_id, embedding) VALUES
        (1, '{embedding1}'),
        (2, '{embedding2}'),
        (3, '{embedding3}');
    "

    hoặc dùng Python psycopg2:
    """)

    # Hoặc auto-insert nếu có credentials
    try:
        import psycopg2
        from psycopg2.extras import execute_values

        # EDIT CÁI NÀY VỚI POSTGRES CREDENTIALS CỦA BẠN
        conn = psycopg2.connect(
            POSTGRES_SQL,
            sslmode='require'  # nếu cần
        )
        cursor = conn.cursor()

        # Insert test recipes
        test_recipes = [
            (1, generate_random_embedding()),
            (2, generate_random_embedding()),
            (3, generate_random_embedding()),
        ]

        for recipe_id, embedding in test_recipes:
            cursor.execute(
                "INSERT INTO recipe_vector (recipe_id, embedding) VALUES (%s, %s) ON CONFLICT (recipe_id) DO NOTHING",
                (recipe_id, to_pgvector(embedding))
            )
        conn.commit()
        cursor.close()
        conn.close()

        ok("Test recipes inserted into database")
        return True

    except Exception as e:
        fail(f"Cannot auto-insert test data: {e}")
        info("⚠️  Hãy thêm test data thủ công trước khi chạy tests")
        return False

# ==================== TESTS ====================

def test_health():
    """Test health endpoint để confirm server running"""
    section("1. Health Check  GET /health")
    try:
        resp = api_get("/health")
        resp.raise_for_status()
        data = resp.json()

        ok(f"status = {data['status']}")
        ok(f"redis_connected = {data['redis_connected']}")

        if data["status"] != "healthy":
            fail("API nicht healthy!")
            return False
        return True

    except requests.ConnectionError:
        fail("Cannot connect to API - ensure uvicorn is running")
        return False
    except Exception as e:
        fail(f"Health check error: {e}")
        return False

def test_update_user_interactions():
    """Test POST /user/UpdateBatchUser"""
    section("2. Update User Interactions  POST /user/UpdateBatchUser")

    try:
        payload = {
            "users": [
                {
                    "user_id": 101,
                    "interactions": [
                        {"item_id": 1, "event": "like"},
                        {"item_id": 2, "event": "share"},
                        {"item_id": 3, "event": "click"},
                    ]
                },
                {
                    "user_id": 102,
                    "interactions": [
                        {"item_id": 2, "event": "save"},
                        {"item_id": 3, "event": "dwell_10s"},
                    ]
                }
            ]
        }

        info(f"Sending batch update for {len(payload['users'])} users...")
        resp = api_post("/user/UpdateBatchUser", json=payload)
        resp.raise_for_status()

        data = resp.json()
        if data["success"]:
            ok(f"Batch update successful: {data['updated_users']} users updated")
            return True
        else:
            fail(f"Batch update failed: {data}")
            return False

    except Exception as e:
        fail(f"Batch update error: {e}")
        return False

def test_post_embedding_endpoint():
    """Test POST /post/embedding and verify async job status."""
    section("3. Post Embedding  POST /post/embedding")

    try:
        payload = {
            "post_id": 999001,
            "list_image_url": [TEST_IMAGE_URL],
            "text": "street traffic with bus"
        }

        info(f"Submitting post embedding for post_id={payload['post_id']}...")
        resp = api_post("/post/embedding", json=payload)
        resp.raise_for_status()

        data = resp.json()
        job_id = data.get("job_id")
        if not job_id:
            fail(f"Missing job_id in response: {data}")
            return False

        ok(f"Post embedding job submitted: {job_id}")

        result = poll_job("/job/status_embedding", job_id)
        if not result:
            return False

        if result.get("status") == "finished":
            ok("Post embedding job finished")
            return True

        fail(f"Post embedding job failed: {result.get('error', 'unknown')}")
        return False

    except Exception as e:
        fail(f"Post embedding endpoint error: {e}")
        return False

def test_get_top_recipes_all_users():
    """Test GET /user/top-recipes (all users)"""
    section("4. Get Top Recipes for All Users  GET /user/top-recipes")

    try:
        for k in [5, 10]:
            info(f"Fetching top {k} recipes for all users...")
            resp = api_get(f"/user/top-recipes?k={k}")
            resp.raise_for_status()

            data = resp.json()
            info(f"Response: {json.dumps(data, indent=2)}")
            if data["success"]:
                count = data["count"]
                ok(f"Got results for {count} users with k={k}")

                # Pretty print first user's results
                if data["result"]:
                    first_user = data["result"][0]
                    print(f"     User {first_user['user_id']}: {len(first_user['recommendations'])} recommendations")
                    for recipe_id, score in first_user['recommendations'][:3]:
                        print(f"       - Recipe {recipe_id}: score={score:.4f}")
            else:
                fail(f"Failed: {data.get('error')}")
                return False

        return True

    except Exception as e:
        fail(f"Get top recipes (all users) error: {e}")
        return False

def test_get_top_recipes_single_user():
    """Test GET /user/top-recipes/{user_id} (single user)"""
    section("5. Get Top Recipes for Single User  GET /user/top-recipes/{user_id}")

    try:
        test_user_ids = [101, 102]

        for user_id in test_user_ids:
            for k in [5, 10]:
                info(f"Fetching top {k} recipes for user {user_id}...")
                resp = api_get(f"/user/top-recipes/{user_id}?k={k}")
                resp.raise_for_status()

                data = resp.json()
                if data["success"]:
                    count = data["count"]
                    ok(f"User {user_id} got {count} recommendations")

                    if data["result"]["recommendations"]:
                        print(f"     Top 3 recommendations:")
                        for recipe_id, score in data["result"]["recommendations"][:3]:
                            print(f"       - Recipe {recipe_id}: score={score:.4f}")
                else:
                    fail(f"Failed for user {user_id}: {data.get('error')}")
                    return False

        return True

    except Exception as e:
        fail(f"Get top recipes (single user) error: {e}")
        return False

def test_invalid_k():
    """Test error handling for invalid k parameter"""
    section("6. Error Handling - Invalid k Parameter")

    try:
        # Test k <= 0
        response = api_get("/user/top-recipes?k=0")
        if response.status_code == 400:
            ok("Server returned 400 for k=0")
        else:
            fail(f"Expected 400, got {response.status_code}")

        # Test k < 0
        response = api_get("/user/top-recipes?k=-1")
        if response.status_code == 400:
            ok("Server returned 400 for k=-1")
        else:
            fail(f"Expected 400, got {response.status_code}")

        return True

    except Exception as e:
        fail(f"Error handling test failed: {e}")
        return False

def test_nonexistent_user():
    """Test with non-existent user"""
    section("7. Error Handling - Non-existent User")

    try:
        info("Fetching recommendations for non-existent user (user_id=99999)...")
        resp = api_get("/user/top-recipes/99999?k=10")
        resp.raise_for_status()

        data = resp.json()
        if data["success"]:
            if data["count"] == 0:
                ok("Non-existent user returns empty recommendations")
            else:
                fail("Expected empty results for non-existent user")
        else:
            fail(f"Failed: {data}")

        return True

    except Exception as e:
        fail(f"Non-existent user test failed: {e}")
        return False

# ==================== MAIN ====================

def main():
    print("""
╔════════════════════════════════════════════════════════════╗
║  RECOMMENDATION API TEST SUITE                             ║
║  Testing: User Embeddings & Recipe Recommendations         ║
╚════════════════════════════════════════════════════════════╝
    """)

    # Check if server is running
    try:
        resp = api_get("/health", timeout=5)
        resp.raise_for_status()
    except Exception as e:
        print("REAL ERROR:", e)
        fail("❌ API server is not running!")
        return

    # Run tests
    tests = [
        ("Health Check", test_health),
        ("Seed Data", seed_test_data),
        ("Update User Interactions", test_update_user_interactions),
        ("Post Embedding Endpoint", test_post_embedding_endpoint),
        ("Get Top Recipes (All Users)", test_get_top_recipes_all_users),
        ("Get Top Recipes (Single User)", test_get_top_recipes_single_user),
        ("Error Handling - Invalid k", test_invalid_k),
        ("Error Handling - Non-existent User", test_nonexistent_user),
    ]

    for name, test_func in tests:
        try:
            result = test_func()
            if not result and result is not None:
                break
        except Exception as e:
            fail(f"Test '{name}' crashed: {e}")
            break

    # Summary
    section(f"SUMMARY")
    print(f"\n  ✓ Passed:  {passed}")
    print(f"  ✗ Failed:  {failed}")
    print(f"\n  Total: {passed + failed}\n")

    if failed == 0:
        print("  🎉 All tests passed!")
    else:
        print(f"  ⚠️  {failed} test(s) failed")

if __name__ == "__main__":
    main()

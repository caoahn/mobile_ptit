# Hướng Dẫn Tích Hợp API User Recommendation

Tài liệu này dành cho server khác gửi dữ liệu interaction sang service Backend-AI để cập nhật user embedding và lấy kết quả gợi ý.

> **⚠️ Lưu ý triển khai:** Các endpoint `/user/*` trong tài liệu này **chưa được implement** trong Backend-AI. Cần tạo router `routers/user.py` và đăng ký trong `app.py` trước khi tích hợp.

## 1) Base URL

- Local: `http://localhost:8000`
- Staging/Production: thay bằng domain/IP thực tế, ví dụ: `https://ai-api.yourdomain.com`

## 1.1) Authentication

Tất cả request server-to-server nên dùng API Key để tránh truy cập trái phép:

```http
X-API-Key: <your_api_key>
```

> Nếu chưa cấu hình API Key, bỏ qua header này trong môi trường local/dev.

## 2) Endpoint Nhận Dữ Liệu Từ Server Khác

### POST `/user/UpdateBatchUser`

Gửi batch interaction của nhiều user để cập nhật user embedding.

- Method: `POST`
- Content-Type: `application/json`
- Path: `/user/UpdateBatchUser`
- Giới hạn: khuyến nghị tối đa **100 user/request** để tránh timeout.

### Request Body Format

```json
{
  "users": [
    {
      "user_id": 101,
      "interactions": [
        {
          "item_id": 1001,
          "event": "like"
        },
        {
          "item_id": 1002,
          "event": "save"
        }
      ]
    },
    {
      "user_id": 102,
      "interactions": [
        {
          "item_id": 1003,
          "event": "click"
        },
        {
          "item_id": 1004,
          "event": "skip"
        }
      ]
    }
  ]
}
```

### Field Rules

- `users`: bắt buộc, là mảng user cần cập nhật.
- `users[].user_id`: bắt buộc, kiểu `int`.
- `users[].interactions`: bắt buộc, là mảng interaction của user.
- `users[].interactions[].item_id`: bắt buộc, kiểu `int` (= `recipe_id` trong DB).
- `users[].interactions[].event`: bắt buộc, kiểu `string`.

Giá trị `event` hợp lệ và trọng số tương ứng:

| Event       | Trọng số | Tương ứng trong DB              |
| ----------- | -------- | ------------------------------- |
| `share`     | 5.0      | `share`                         |
| `save`      | 4.0      | `save`                          |
| `comment`   | 3.5      | `comment`                       |
| `like`      | 3.0      | `like`                          |
| `dwell_10s` | 2.5      | `view` với `duration_s > 30s`   |
| `view`      | 1.0      | `view` với `duration_s` 5–30s   |
| `click`     | 0.5      | `view` với `duration_s < 5s`    |
| `skip`      | 0.0      | (tín hiệu âm, chưa có trong DB) |

> **Mapping từ DB sang AI service:** Khi đẩy `view` interaction lên, server cần chuyển đổi `duration_s` thành event tương ứng (`dwell_10s`, `view`, `click`) trước khi gửi.

Lưu ý:

- Nếu gửi event không nằm trong danh sách trên, hệ thống sẽ coi trọng số = 0.
- Nếu `interactions` rỗng, user đó sẽ không thay đổi embedding.

### Success Response

HTTP 200

```json
{
  "success": true,
  "updated_users": 2
}
```

### Error Response

HTTP 401 (thiếu hoặc sai API Key)

```json
{
  "detail": "Unauthorized"
}
```

HTTP 500

```json
{
  "detail": "Failed to update user embeddings"
}
```

HTTP 422 (sai format schema)

```json
{
  "detail": [
    {
      "loc": ["body", "users", 0, "user_id"],
      "msg": "value is not a valid integer",
      "type": "type_error.integer"
    }
  ]
}
```

## 3) Endpoint Lấy Kết Quả Recommendation

### GET `/user/top-recipes/{user_id}?k=10`

Lấy top `k` recipe cho 1 user.

- Method: `GET`
- Path param: `user_id` (int)
- Query param: `k` (int, > 0, mặc định = 10)

Response (HTTP 200):

```json
{
  "success": true,
  "result": {
    "user_id": 101,
    "recommendations": [
      [1001, 0.9321],
      [1020, 0.8877],
      [991, 0.8502]
    ]
  },
  "count": 3
}
```

> `count` ở đây là số recipe được trả về cho user đó.

Error (HTTP 404 — user chưa có embedding):

```json
{
  "detail": "User 101 not found in user_vector"
}
```

### GET `/user/top-recipes?k=10`

Lấy top `k` recipe cho tất cả user hiện có trong bảng `user_vector`.

> **Lưu ý:** Endpoint này có thể chậm nếu số lượng user lớn. Cân nhắc dùng endpoint theo từng user hoặc thêm pagination sau.

Response (HTTP 200):

```json
{
  "success": true,
  "result": [
    {
      "user_id": 101,
      "recommendations": [
        [1001, 0.93],
        [1020, 0.88]
      ]
    },
    {
      "user_id": 102,
      "recommendations": [
        [1003, 0.91],
        [1009, 0.84]
      ]
    }
  ],
  "count": 2
}
```

> `count` ở đây là **số user** có trong kết quả, không phải số recipe.

## 4) Ví Dụ Gọi Từ Server Khác

### cURL

```bash
curl -X POST "http://localhost:8000/user/UpdateBatchUser" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your_api_key" \
  -d '{
    "users": [
      {
        "user_id": 101,
        "interactions": [
          {"item_id": 1001, "event": "like"},
          {"item_id": 1002, "event": "save"}
        ]
      }
    ]
  }'
```

### Node.js (Axios) — phù hợp backend Express/NestJS

```typescript
import axios from "axios";

const AI_BASE_URL = process.env.AI_SERVICE_URL ?? "http://localhost:8000";
const AI_API_KEY = process.env.AI_API_KEY ?? "";

async function pushUserInteractions(
  users: {
    user_id: number;
    interactions: { item_id: number; event: string }[];
  }[],
) {
  const response = await axios.post(
    `${AI_BASE_URL}/user/UpdateBatchUser`,
    { users },
    {
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": AI_API_KEY,
      },
      timeout: 10_000,
    },
  );
  return response.data; // { success: true, updated_users: N }
}

// Mapping view duration_s -> event
function mapViewEvent(duration_s: number): string {
  if (duration_s > 30) return "dwell_10s";
  if (duration_s >= 5) return "view";
  return "click";
}
```

### Python (requests)

```python
import requests

url = "http://localhost:8000/user/UpdateBatchUser"
headers = {
    "Content-Type": "application/json",
    "X-API-Key": "your_api_key",
}
payload = {
    "users": [
        {
            "user_id": 101,
            "interactions": [
                {"item_id": 1001, "event": "like"},
                {"item_id": 1002, "event": "save"}
            ]
        }
    ]
}

resp = requests.post(url, json=payload, headers=headers, timeout=10)
print(resp.status_code)
print(resp.json())
```

## 5) Khuyến Nghị Tích Hợp

- Đặt timeout cho request (5–10s).
- Có cơ chế retry (tối đa 2–3 lần, backoff tuyến tính) nếu gặp lỗi mạng tạm thời.
- Ghi log request + response status để dễ trace lỗi.
- Đồng bộ `item_id` với `recipe_id` trong bảng `recipe_vector` để hệ thống tính được recommendation.
- Giới hạn batch ≤ 100 user/lần gọi; nếu lớn hơn hãy chia nhỏ.
- Lưu API Key trong biến môi trường, không hardcode trong code.

## 6) Kiểm Tra Nhanh Trước Khi Go Live

1. API hoạt động: `GET /health` trả về `status=healthy`.
2. Gửi 1 payload test vào `/user/UpdateBatchUser` với 1–2 user.
3. Gọi `/user/top-recipes/{user_id}` để xác nhận đã có recommendation.
4. Kiểm tra log Backend-AI không có lỗi liên quan đến `user_vector`.

# Huong Dan Tich Hop API User Recommendation

Tai lieu nay danh cho server khac gui du lieu interaction sang service Backend-AI.

## 1) Base URL

- Local: `http://localhost:8000`
- Neu deploy, thay bang domain/IP thuc te, vi du: `https://ai-api.yourdomain.com`

## 2) Endpoint Nhan Du Lieu Tu Server Khac

### POST `/user/UpdateBatchUser`

Gui batch interaction cua nhieu user de cap nhat user embedding.

- Method: `POST`
- Content-Type: `application/json`
- Path: `/user/UpdateBatchUser`

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

- `users`: bat buoc, la mang user can cap nhat.
- `users[].user_id`: bat buoc, kieu `int`.
- `users[].interactions`: bat buoc, la mang interaction cua user.
- `users[].interactions[].item_id`: bat buoc, kieu `int` (recipe_id).
- `users[].interactions[].event`: bat buoc, kieu `string`.

Gia tri `event` de nghi dung dung bo su kien sau:

- `share`
- `save`
- `like`
- `dwell_10s`
- `click`
- `skip`

Luu y:
- Neu gui event khong nam trong danh sach tren, he thong se coi trong so = 0.
- Neu `interactions` rong, user do se khong thay doi embedding.

### Success Response

HTTP 200

```json
{
  "success": true,
  "updated_users": 2
}
```

### Error Response

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

## 3) Endpoint Lay Ket Qua Recommendation

### GET `/user/top-recipes/{user_id}?k=10`

Lay top `k` recipe cho 1 user.

- Method: `GET`
- Path param: `user_id` (int)
- Query param: `k` (int, > 0, mac dinh = 10)

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

### GET `/user/top-recipes?k=10`

Lay top `k` recipe cho tat ca user hien co trong bang `user_vector`.

Response (HTTP 200):

```json
{
  "success": true,
  "result": [
    {
      "user_id": 101,
      "recommendations": [[1001, 0.93], [1020, 0.88]]
    },
    {
      "user_id": 102,
      "recommendations": [[1003, 0.91], [1009, 0.84]]
    }
  ],
  "count": 2
}
```

## 4) Vi Du Goi Tu Server Khac

### cURL

```bash
curl -X POST "http://localhost:8000/user/UpdateBatchUser" \
  -H "Content-Type: application/json" \
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

### Python (requests)

```python
import requests

url = "http://localhost:8000/user/UpdateBatchUser"
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

resp = requests.post(url, json=payload, timeout=10)
print(resp.status_code)
print(resp.json())
```

## 5) Khuyen Nghi Tich Hop

- Dat timeout cho request (5-10s).
- Co co che retry (toi da 2-3 lan) neu gap loi mang tam thoi.
- Ghi log request + response status de de trace loi.
- Dong bo `item_id` voi `recipe_id` trong bang `recipe_vector` de he thong tinh duoc recommendation.

## 6) Kiem Tra Nhanh Truoc Khi Go Live

- API hoat dong: `GET /health` tra ve `status=healthy`.
- Gui 1 payload test vao `/user/UpdateBatchUser`.
- Goi `/user/top-recipes/{user_id}` de xac nhan da co recommendation.

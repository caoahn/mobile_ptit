# Hướng dẫn sử dụng các API Recommendation

## 1. API lưu embedding cho bài đăng mới

### Endpoint
- **POST** `/post/embedding`

### Mục đích
Khi người dùng đăng bài mới (có ảnh/text), hệ thống sẽ tự động gọi API này để lưu embedding của bài đăng vào database (PostgreSQL).

### Cách sử dụng
- Khi user đăng post mới, FE/BE gọi API này với thông tin:
  - `post_id`: ID của bài đăng
  - `image_url`: URL ảnh của bài đăng
  - `text`: (tùy chọn) mô tả hoặc caption

#### Ví dụ request
```json
POST /post/embedding
{
  "post_id": 12345,
  "image_url": "https://example.com/image.jpg",
  "text": "Mô tả bài đăng"
}
```

#### Response
```json
{
  "job_id": "<id của job xử lý async>"
}
```
- Hệ thống trả về `job_id` để kiểm tra trạng thái xử lý embedding (nếu cần).

### Ghi chú
- API này xử lý bất đồng bộ (asynchronous), trả về ngay lập tức.
- Embedding sẽ được lưu vào bảng `recipe_vector` trong PostgreSQL.
- Nếu cần kiểm tra trạng thái job, gọi `/job/status_embedding/{job_id}`.

---

## 2. API cập nhật embedding cho user

### Endpoint
- **POST** `/user/UpdateBatchUser`

### Mục đích
Cứ mỗi 5 phút, hệ thống sẽ tự động gọi API này để cập nhật embedding cho user dựa trên các tương tác mới nhất (like, share, save, click, ...).

### Cách sử dụng
- Gửi danh sách user và các tương tác của họ:

```json
POST /user/UpdateBatchUser
{
  "users": [
    {
      "user_id": 101,
      "interactions": [
        {"item_id": 1, "event": "like"},
        {"item_id": 2, "event": "share"}
      ]
    },
    {
      "user_id": 102,
      "interactions": [
        {"item_id": 2, "event": "save"},
        {"item_id": 3, "event": "dwell_10s"}
      ]
    }
  ]
}
```

#### Response
```json
{
  "success": true,
  "updated_users": 2
}
```

### Ghi chú
- Nên thiết lập cronjob hoặc scheduler gọi API này mỗi 5 phút.
- Các event hợp lệ: `like`, `share`, `save`, `click`, `dwell_10s`, `skip`.
- Embedding user sẽ được cập nhật trong bảng `user_vector`.

---

## 3. API lấy danh sách gợi ý công thức (recipe) cho user

### Endpoint
- **GET** `/user/top-recipes` (toàn bộ user)
- **GET** `/user/top-recipes/{user_id}` (cho 1 user cụ thể)

### Tham số đầu vào
- `k` (query): số lượng gợi ý muốn lấy (mặc định 10, phải > 0)
- `user_id` (path): ID của user muốn lấy gợi ý (nếu dùng endpoint `/user/top-recipes/{user_id}`)

### Ví dụ request
- Lấy top 5 gợi ý cho tất cả user:
  - `GET /user/top-recipes?k=5`
- Lấy top 10 gợi ý cho user 101:
  - `GET /user/top-recipes/101?k=10`

### Response
#### Với `/user/top-recipes` (toàn bộ user)
```json
{
  "success": true,
  "result": [
    {
      "user_id": 101,
      "recommendations": [
        [1, 0.98],
        [2, 0.95]
      ]
    },
    {
      "user_id": 102,
      "recommendations": [
        [2, 0.97],
        [3, 0.93]
      ]
    }
  ],
  "count": 2
}
```

#### Với `/user/top-recipes/{user_id}` (1 user)
```json
{
  "success": true,
  "result": {
    "user_id": 101,
    "recommendations": [
      [1, 0.98],
      [2, 0.95]
    ]
  },
  "count": 2
}
```

### Ý nghĩa output
- `recommendations`: Danh sách các cặp `[recipe_id, similarity_score]`, sắp xếp theo độ phù hợp giảm dần.
- `count`: Số lượng gợi ý trả về.
- `success`: Trạng thái thành công của API.

### Ghi chú
- Nếu user chưa có embedding hoặc không có tương tác, API sẽ trả về gợi ý mặc định.
- Nếu truyền `k <= 0` sẽ trả về lỗi 400.
- Nếu user không tồn tại, trả về danh sách rỗng.

---

## Tổng kết
- Khi user đăng post mới: FE/BE gọi POST `/post/embedding`.
- Định kỳ mỗi 5 phút: BE gọi POST `/user/UpdateBatchUser` để cập nhật embedding user.
- Để lấy gợi ý: gọi GET `/user/top-recipes` hoặc `/user/top-recipes/{user_id}` với tham số `k`.

Mọi thắc mắc vui lòng liên hệ team AI Backend.

# Seed Data - Tạo dữ liệu mẫu cho hệ thống Recommendation

## Mục đích

Để hệ thống AI Recommendation hoạt động chính xác, cần có đủ dữ liệu:

- **20 tài khoản** người dùng mẫu
- **5 recipe mỗi tài khoản** → tổng **100 recipes**
- Mỗi recipe sau khi tạo **tự động gọi `POST /post/embedding`** lên AI Backend để tạo vector

---

## File script

```
backend/src/scripts/seed-data.ts
```

---

## Cách chạy

### 1. Đảm bảo backend + AI service đang chạy

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - AI Backend
cd Backend-AI
docker-compose up
```

### 2. Kiểm tra file `.env` có đủ biến

```env
# Backend .env
BASE_URL=http://localhost:3000/api   # (tuỳ chọn, mặc định đã có)
AI_SERVICE_URL=http://localhost:8000
AI_API_KEY=your_key_here             # (nếu AI service yêu cầu)
```

### 3. Chạy script

```bash
cd backend
npx ts-node src/scripts/seed-data.ts
```

---

## Luồng hoạt động của script

```
For each account (1 → 20):
  1. POST /api/auth/register   → Tạo tài khoản
  2. POST /api/auth/login      → Lấy JWT token

  For each recipe (1 → 5):
    3. POST /api/recipes        → Tạo recipe (auth required)
    4. POST /post/embedding     → Gửi embedding lên AI Backend (async)
    5. Delay 300ms              → Tránh spam API
```

---

## Output mẫu

```
═══════════════════════════════════════════════════
  SEED SCRIPT - DishGram Recommendation System
  Backend : http://localhost:3000/api
  AI      : http://localhost:8000
═══════════════════════════════════════════════════

[Account 1/20]
  ✓ Đăng ký thành công: seeduser1@dishgram.test
  ✓ Đăng nhập thành công: seeduser1@dishgram.test (userId=42)
  [Recipe 1/5] "Phở Bò Hà Nội"
    ✓ Recipe tạo thành công: id=101
    → Embedding queued: job_id=abc123
  [Recipe 2/5] "Bún Bò Huế"
    ✓ Recipe tạo thành công: id=102
    → Embedding queued: job_id=abc124
  ...

═══════════════════════════════════════════════════
  KẾT QUẢ
═══════════════════════════════════════════════════
  ✓ Tổng recipes tạo thành công : 100
  ✓ Embedding đã gửi            : 100
  ✓ Không có lỗi nào!
═══════════════════════════════════════════════════
```

---

## Chi tiết kỹ thuật

### Tài khoản được tạo

| Thuộc tính | Giá trị                         |
| ---------- | ------------------------------- |
| Email      | `seeduser{1..20}@dishgram.test` |
| Password   | `Seed@123456`                   |
| Full name  | `Seed User {1..20}`             |

> Script **idempotent**: nếu chạy lại, tài khoản đã tồn tại sẽ được bỏ qua đăng ký và chỉ đăng nhập lại.

### Recipe templates

Script có sẵn **10 template** công thức nấu ăn Việt Nam thực tế (mỗi template có ảnh, nguyên liệu, các bước rõ ràng). Các recipe được xoay vòng qua 10 template nên 100 recipe sẽ đa dạng.

| Template           | Category    |
| ------------------ | ----------- |
| Phở Bò Hà Nội      | Món chính   |
| Bún Bò Huế         | Món chính   |
| Cơm Tấm Sườn Bì    | Món chính   |
| Bánh Mì Thịt Nướng | Bánh        |
| Gà Rang Gừng       | Món chính   |
| Canh Chua Cá Lóc   | Món canh    |
| Mì Quảng           | Món chính   |
| Bò Kho Bánh Mì     | Món chính   |
| Chả Giò Rán        | Món khai vị |
| Bánh Xèo Miền Nam  | Bánh        |

### Gọi `/post/embedding`

Sau mỗi recipe, script gọi:

```json
POST {AI_SERVICE_URL}/post/embedding
{
  "post_id": <recipe_id>,
  "image_url": "<url ảnh của template>",
  "text": "<tên recipe>"
}
```

Nếu AI service chưa sẵn sàng, lỗi embedding sẽ được **ghi log và bỏ qua** (không dừng toàn bộ script).

---

## Xử lý lỗi

| Tình huống          | Hành vi                                               |
| ------------------- | ----------------------------------------------------- |
| Account đã tồn tại  | Bỏ qua đăng ký, tiếp tục đăng nhập                    |
| Recipe tạo thất bại | Log lỗi, bỏ qua recipe đó, tiếp tục                   |
| AI service down     | Log cảnh báo ⚠, bỏ qua embedding, recipe vẫn được tạo |
| Backend down        | Dừng script, in lỗi fatal                             |

---

## Sau khi chạy xong

Kiểm tra embedding đã được xử lý:

```bash
# Kiểm tra job status
GET {AI_SERVICE_URL}/job/status_embedding/{job_id}

# Kiểm tra top recipes cho user nào đó
GET {AI_SERVICE_URL}/user/top-recipes/{userId}?k=10
```

Hoặc thử endpoint recommendation trên backend:

```bash
GET http://localhost:3000/api/recommendations/feed?k=10
# Header: Authorization: Bearer <token của user>
```

---

## Chạy lại từ đầu (reset)

Nếu muốn xóa toàn bộ seed data và chạy lại từ đầu, xóa các user có email pattern `seeduser%@dishgram.test` trong database:

```sql
-- Cẩn thận! Chỉ chạy trên môi trường dev
DELETE FROM users WHERE email LIKE 'seeduser%@dishgram.test';
```

Sau đó chạy lại script.

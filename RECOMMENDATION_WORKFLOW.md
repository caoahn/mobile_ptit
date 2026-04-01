# Recommendation System — Workflow Chi Tiết

## Tổng quan

Hệ thống gợi ý gồm 3 tầng:

```
┌─────────────────┐     ┌──────────────────────┐     ┌────────────────────┐
│  React Native   │────▶│   Backend Node.js     │────▶│   Backend-AI       │
│  (my-app)       │◀────│   (port 3000)         │◀────│   (port 8000)      │
└─────────────────┘     └──────────────────────┘     └────────────────────┘
```

---

## LUỒNG 1 — Khi user đăng recipe mới

```
User nhấn "Đăng" trên app
        │
        ▼
POST /api/recipes
        │
        ▼
RecipeController.createRecipe()
        │
        ▼
RecipeService.createRecipe()
        │
        ├─① Lưu recipe vào PostgreSQL
        │
        └─② Fire-and-forget (không chờ):
              recommendationService.sendPostEmbedding(recipe_id, image_url, title)
                        │
                        ▼
              POST http://localhost:8000/post/embedding
              {
                "post_id": 42,
                "list_image_url": ["https://..."],
                "text": "Phở bò Hà Nội"
              }
                        │
                        ▼
              Backend-AI nhận → dùng CLIP model tạo vector embedding
              → lưu vào bảng recipe_vector (PostgreSQL)
              → trả về job_id (xử lý async qua Celery)
```

**Kết quả:** Recipe mới có vector đại diện trong DB, sẵn sàng để AI so sánh với user sau này.

---

## LUỒNG 2 — Khi user tương tác (like / save / xem)

### Like hoặc Save

```
User nhấn ❤️ hoặc 🔖 trên RecipeCard
        │
        ▼
RecipeCard.handleLike() / handleSave()
        │
        ├─① Gọi POST /api/recipes/:id/like (hoặc /save) → cập nhật DB
        │
        └─② Nếu kết quả là liked/saved = true:
              trackInteraction({ recipe_id: 42, event: "like" })
                        │
                        ▼
              POST /api/recommendations/track
              { "recipe_id": 42, "event": "like" }
                        │
                        ▼
              RecommendationService.trackInteraction()
                        │
                        ▼
              POST http://localhost:8000/user/UpdateBatchUser
              {
                "users": [{
                  "user_id": 101,
                  "interactions": [{ "item_id": 42, "event": "like" }]
                }]
              }
                        │
                        ▼
              Backend-AI cập nhật user_vector trong PostgreSQL
```

### Xem chi tiết recipe

```
User mở màn hình recipe/[id]
        │
        ▼
useEffect mount → ghi nhận thời điểm bắt đầu xem

User đọc xong, quay lại
        │
        ▼
useEffect unmount → tính duration_s = thời_lúc_thoát - thời_lúc_mở
        │
        ▼
trackInteraction({ recipe_id: 42, event: "view", duration_s: 45 })
        │
        ▼
POST /api/recommendations/track
{ "recipe_id": 42, "event": "view", "duration_s": 45 }
        │
        ▼
Backend map duration_s → event thực sự:
  > 30s  →  "dwell_10s"  (xem kỹ, trọng số cao)
  5-30s  →  "view"       (xem bình thường)
  < 5s   →  "click"      (chỉ lướt qua)
        │
        ▼
POST http://localhost:8000/user/UpdateBatchUser
```

### Bảng trọng số các event

| Event       | Ý nghĩa        | Ví dụ                  |
| ----------- | -------------- | ---------------------- |
| `like`      | Thích bài viết | Nhấn ❤️                |
| `save`      | Lưu lại        | Nhấn 🔖                |
| `dwell_10s` | Đọc kỹ > 30s   | Đọc công thức chi tiết |
| `view`      | Xem 5–30s      | Lướt qua đọc sơ        |
| `click`     | Mở < 5s        | Mở nhầm, đóng ngay     |
| `share`     | Chia sẻ        | (tracking thủ công)    |
| `skip`      | Bỏ qua         | (tracking thủ công)    |

---

## LUỒNG 3 — Khi user mở trang Home (Feed)

```
User mở tab Home
        │
        ▼
index.tsx: loadInitial()  [seenIds = {} (rỗng)]
        │
        ▼
GET /api/recipes/recommended?page=1&limit=10
        │
        ▼
RecipeController.getRecommendedFeed()
        │
        ▼
RecipeService.getRecommendedFeed(userId, page=1, limit=10, seenIds=[])
        │
        ▼
Bước 1: Tính poolSize = page × limit + seenIds.length + 1
        = 1 × 10 + 0 + 1 = 11   ← "peek" để kiểm tra hasMore
┌──────────────────────────────────────────────────────────┐
│  GET http://localhost:8000/user/top-recipes/101?k=11     │
│                                                          │
│  AI trả về:                                              │
│  { "result": {                                           │
│      "recommendations": [[55,0.98],[12,0.95],[88,0.93],...]│
│    }                                                     │
│  }                                                       │
└──────────────────────────────────────────────────────────┘
        │
        ├─ Nếu AI có data (count > 0):
        │         │
        │         ▼
        │   Bước 2: Dedup IDs (phòng AI trả trùng)
        │   [55, 12, 88, 3, 41, 55] → [55, 12, 88, 3, 41, ...]
        │         │
        │         ▼
        │   Bước 3: Lọc bỏ seenIds (trang đầu = rỗng, bước này không ảnh hưởng)
        │   freshIds = dedupedIds.filter(id => !seenIds.includes(id))
        │         │
        │         ▼
        │   Bước 4: Kiểm tra hasMore (kỹ thuật "peek")
        │   Nếu freshIds.length > 10 → hasMore = true
        │   Nếu freshIds.length ≤ 10 → hasMore = false
        │         │
        │         ▼
        │   Bước 5: Lấy đúng limit
        │   pageIds = freshIds.slice(0, 10) → 10 recipe_id
        │         │
        │         ▼
        │   Bước 6: Batch query PostgreSQL
        │   SELECT * FROM recipes WHERE id IN (55,12,88,3,41,99,7,23,64,17)
        │   (giữ đúng thứ tự rank từ AI)
        │         │
        │         ▼
        │   Trả về: { source: "rec", recipes: [...], hasMore: true }
        │
        └─ Nếu AI không có data hoặc lỗi:
                  │
                  ▼
            getFeed(page=1, limit=10) → query DB bình thường
            Trả về: { source: "feed", recipes: [...], hasMore: true }
```

**Frontend nhận response:**

- `source: "rec"` → hiện label **"Gợi ý cho bạn"** dưới logo, lưu 10 ID vào `seenIdsRef`
- `source: "feed"` → không hiện label, feed bình thường

---

## LUỒNG 4 — Khi user scroll xuống (Load More)

Vấn đề cần giải quyết: AI có thể **re-rank** mỗi lần được hỏi, nên nếu chỉ dùng `page × limit` để slice thì có thể trả lại bài đã hiển thị. Giải pháp: FE gửi kèm tất cả IDs đã hiển thị (`seenIds`), backend lọc chúng ra trước khi slice.

```
User scroll đến 80% cuối danh sách
        │
        ▼
FlatList.onEndReached → handleLoadMore()
        │
        ▼
loadMore(nextPage = 2)
│  seenIdsRef hiện có 10 IDs từ trang 1: {55,12,88,3,41,99,7,23,64,17}
        │
        ▼
GET /api/recipes/recommended?page=2&limit=10&seen=55,12,88,3,41,99,7,23,64,17
        │
        ▼
RecipeService.getRecommendedFeed(userId, page=2, limit=10, seenIds=[55,12,88,...])
        │
        ▼
Bước 1: Tính poolSize = page × limit + seenIds.length + 1
        = 2 × 10 + 10 + 1 = 31   ← đủ lớn để sau khi lọc còn ít nhất 10 bài
        │
        ▼
Bước 2: Hỏi AI k=31 → AI trả về top 31 IDs (theo rank mới nhất)
        │
        ▼
Bước 3: Dedup IDs → loại trùng nội bộ trong kết quả AI
        │
        ▼
Bước 4: Lọc seenIds → bỏ 10 ID đã hiển thị
        freshIds = [bài mới chưa từng hiển thị]
        │
        ▼
Bước 5: Peek hasMore: freshIds.length > 10 → hasMore = true/false
        │
        ▼
Bước 6: pageIds = freshIds.slice(0, 10) → 10 ID tiếp theo
        │
        ▼
Bước 7: Query DB → trả thêm 10 bài
        │
        ▼
FE append vào danh sách, thêm 10 ID mới vào seenIdsRef
```

### Minh họa seenIds qua các trang

```
Page 1:  seenIds=[]       → poolSize=11  → freshIds=[tất cả 11] → show 10
Page 2:  seenIds=[10 IDs] → poolSize=31  → freshIds=[21 còn lại] → show 10
Page 3:  seenIds=[20 IDs] → poolSize=51  → freshIds=[31 còn lại] → show 10
```

> **Ưu điểm:** Dù AI re-rank hoàn toàn giữa các request, user sẽ không bao giờ thấy lại bài đã scroll qua.

---

## LUỒNG 5 — TTL 5 phút (tránh gọi AI liên tục)

```
User chuyển sang tab khác → quay lại tab Home
        │
        ▼
useFocusEffect chạy
        │
        ├─ Nếu đang ở "rec" mode VÀ < 5 phút kể từ lần probe cuối:
        │   → KHÔNG gọi lại AI, giữ nguyên danh sách hiện tại
        │
        └─ Nếu đang ở "feed" mode HOẶC đã > 5 phút HOẶC pull-to-refresh:
            → GỌI LẠI loadInitial() để probe AI mới nhất
```

**Lý do:** Gọi AI mỗi lần chuyển tab tốn latency không cần thiết. 5 phút là đủ để AI có thể cập nhật vector mới từ các tương tác gần đây.

---

## Vòng đời đầy đủ theo user journey

```
Ngày 1 — Tạo tài khoản mới
  → Feed hiển thị: source:"feed" (chưa có vector)
  → User bắt đầu like, xem, save các bài

  Mỗi tương tác → POST /user/UpdateBatchUser → AI cập nhật user_vector

Ngày 1 (sau vài tương tác)
  → AI đã có user_vector
  → Feed chuyển sang: source:"rec" (gợi ý cá nhân hóa)
  → Label "Gợi ý cho bạn" hiện ra

Khi user đăng recipe mới
  → POST /post/embedding → AI tạo recipe_vector
  → Recipe mới xuất hiện trong gợi ý của những user phù hợp
```

---

## Tóm tắt các API liên quan

| API                                               | Gọi từ   | Khi nào                     |
| ------------------------------------------------- | -------- | --------------------------- |
| `POST /api/recommendations/track`                 | Frontend | Sau mỗi like, save, xem     |
| `GET /api/recipes/recommended?page=&limit=&seen=` | Frontend | Load feed, load-more        |
| `POST /post/embedding` _(AI)_                     | Backend  | Sau khi tạo recipe mới      |
| `POST /user/UpdateBatchUser` _(AI)_               | Backend  | Từ `/recommendations/track` |
| `GET /user/top-recipes/:id?k=poolSize` _(AI)_     | Backend  | Từ `/recipes/recommended`   |

### Query params của `GET /api/recipes/recommended`

| Param   | Kiểu     | Mô tả                                                                 |
| ------- | -------- | --------------------------------------------------------------------- |
| `page`  | `number` | Số trang, mặc định `1`                                                |
| `limit` | `number` | Số bài mỗi trang, mặc định `10`, tối đa `50`                          |
| `seen`  | `string` | Danh sách ID đã hiển thị, phân cách bằng dấu phẩy (ví dụ: `55,12,88`) |

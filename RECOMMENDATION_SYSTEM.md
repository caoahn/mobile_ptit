# HỆ THỐNG GỢI Ý CÔNG THỨC (Recommendation System)

**Dự án:** DishGram  
**Ngày tạo:** 27/03/2026  
**Version:** 1.0

---

## I. TỔNG QUAN

### Mục tiêu

Cá nhân hóa bảng tin (feed) cho từng người dùng dựa trên hành vi thực tế:

- Họ hay **xem** loại công thức nào
- Họ **like / comment / save / share** những gì
- Họ **follow** ai

### Luồng xử lý tổng quát

```
[User hành động]
       │
       ▼
[Ghi vào user_interactions]
       │
       ▼
[Tính preference score theo category & tag]
       │
       ▼
[Scoring từng recipe ứng viên]
       │
       ▼
[Trả về feed đã sắp xếp]
```

---

## II. THU THẬP DỮ LIỆU

### 2.1. Bảng `user_interactions`

```sql
CREATE TABLE user_interactions (
  id          BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id     INT NOT NULL,
  recipe_id   INT NOT NULL,
  type        ENUM('view', 'like', 'comment', 'save', 'share') NOT NULL,
  duration_s  INT NULL,        -- chỉ dùng cho type = 'view' (số giây đọc)
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  -- Tránh ghi trùng like/save (view thì cho phép nhiều lần)
  UNIQUE KEY uq_user_recipe_type (user_id, recipe_id, type),

  INDEX idx_user        (user_id),
  INDEX idx_recipe      (recipe_id),
  INDEX idx_user_type   (user_id, type),
  INDEX idx_created     (created_at)
);
```

> **Lưu ý UNIQUE KEY:** Chỉ áp dụng cho `like`, `save`, `share`. Với `view` và `comment` cần cho phép nhiều dòng → xử lý ở tầng service.

---

### 2.2. Trọng số từng hành động

| Hành động | Điều kiện      | Weight  | Lý do                            |
| --------- | -------------- | ------- | -------------------------------- |
| `view`    | duration < 5s  | **0.5** | Lướt qua, không quan tâm         |
| `view`    | duration 5–30s | **1.0** | Đọc sơ qua                       |
| `view`    | duration > 30s | **2.5** | Đọc kỹ, thật sự quan tâm         |
| `like`    | —              | **3.0** | Thể hiện thích rõ ràng           |
| `comment` | —              | **3.5** | Tương tác sâu                    |
| `save`    | —              | **4.0** | Muốn dùng lại                    |
| `share`   | —              | **5.0** | Rất thích, giới thiệu người khác |

---

### 2.3. Khi nào ghi interaction?

| Sự kiện                     | Hành động ghi                               |
| --------------------------- | ------------------------------------------- |
| User mở xem chi tiết recipe | Ghi `view` với `duration_s = 0`             |
| User đóng màn hình recipe   | **Update** `duration_s` = thời gian thực tế |
| User nhấn Like              | Ghi `like`                                  |
| User nhấn Save/Bookmark     | Ghi `save`                                  |
| User gửi comment            | Ghi `comment`                               |
| User nhấn Share             | Ghi `share`                                 |

---

## III. XÂY DỰNG USER PREFERENCE PROFILE

### 3.1. Điểm ưa thích theo Category

```sql
SELECT
  r.category,
  SUM(
    CASE
      WHEN ui.type = 'share'                        THEN 5.0
      WHEN ui.type = 'save'                         THEN 4.0
      WHEN ui.type = 'comment'                      THEN 3.5
      WHEN ui.type = 'like'                         THEN 3.0
      WHEN ui.type = 'view' AND ui.duration_s > 30  THEN 2.5
      WHEN ui.type = 'view' AND ui.duration_s > 5   THEN 1.0
      ELSE 0.5
    END
  ) AS preference_score
FROM user_interactions ui
JOIN recipes r ON ui.recipe_id = r.id
WHERE ui.user_id = :userId
  AND ui.created_at > NOW() - INTERVAL 30 DAY
GROUP BY r.category
ORDER BY preference_score DESC;
```

### 3.2. Điểm ưa thích theo Tag

```sql
SELECT
  t.id   AS tag_id,
  t.name AS tag_name,
  SUM(
    CASE
      WHEN ui.type = 'share'                        THEN 5.0
      WHEN ui.type = 'save'                         THEN 4.0
      WHEN ui.type = 'comment'                      THEN 3.5
      WHEN ui.type = 'like'                         THEN 3.0
      WHEN ui.type = 'view' AND ui.duration_s > 30  THEN 2.5
      WHEN ui.type = 'view' AND ui.duration_s > 5   THEN 1.0
      ELSE 0.5
    END
  ) AS preference_score
FROM user_interactions ui
JOIN recipe_tags rt ON ui.recipe_id = rt.recipe_id
JOIN tags t         ON rt.tag_id    = t.id
WHERE ui.user_id = :userId
  AND ui.created_at > NOW() - INTERVAL 30 DAY
GROUP BY t.id
ORDER BY preference_score DESC
LIMIT 10;
```

> Lấy **top 10 tags** để dùng trong bước scoring.

---

## IV. THUẬT TOÁN SCORING

### 4.1. Công thức tổng

```
SCORE(recipe) =
  (A) category_score   × 0.35
+ (B) tag_score        × 0.25
+ (C) following_boost  × 0.20
+ (D) popularity_score × 0.20
```

---

### 4.2. Chi tiết từng thành phần

#### (A) Category Score — 35%

```
Nếu recipe.category nằm trong top 3 category yêu thích của user:
  → Rank 1: 1.0 điểm
  → Rank 2: 0.7 điểm
  → Rank 3: 0.4 điểm
  → Không nằm trong top: 0.0 điểm
```

#### (B) Tag Score — 25%

```
tag_score = (số tags trùng với top 10 tags của user) / 10
```

Ví dụ: recipe có 3 tags trùng → tag_score = 3/10 = 0.3

#### (C) Following Boost — 20%

```
Nếu recipe.user_id nằm trong danh sách user đang follow:
  → following_boost = 1.0
  → Không follow: 0.0
```

#### (D) Popularity + Recency Score — 20% (HackerNews formula)

```
popularity = (likes × 1.0 + saves × 1.5 + comments × 2.0)
hours_age  = (NOW - recipe.created_at) / 3600

popularity_score = popularity / (hours_age + 2)^1.5
```

Bài mới + nhiều tương tác → điểm cao. Bài cũ dần hạ điểm tự nhiên.

---

### 4.3. Query scoring ví dụ

```sql
SELECT
  r.id,
  r.title,
  r.category,
  r.image_url,

  -- (A) Category score
  CASE
    WHEN r.category = :top1Category THEN 1.0
    WHEN r.category = :top2Category THEN 0.7
    WHEN r.category = :top3Category THEN 0.4
    ELSE 0.0
  END * 0.35 AS a_category_score,

  -- (C) Following boost
  CASE WHEN r.user_id IN (:followingIds) THEN 1.0 ELSE 0.0 END * 0.20 AS c_following_score,

  -- (D) Popularity + recency
  (
    (COUNT(DISTINCT l.user_id) * 1.0 + COUNT(DISTINCT s.user_id) * 1.5 + COUNT(DISTINCT c.id) * 2.0)
    / POW(TIMESTAMPDIFF(HOUR, r.created_at, NOW()) + 2, 1.5)
  ) * 0.20 AS d_popularity_score

FROM recipes r
LEFT JOIN likes         l ON l.recipe_id = r.id
LEFT JOIN saved_recipes s ON s.recipe_id = r.id
LEFT JOIN comments      c ON c.recipe_id = r.id
WHERE r.id NOT IN (
  -- Loại bỏ recipe user đã xem trong 7 ngày gần đây
  SELECT recipe_id FROM user_interactions
  WHERE user_id = :userId
    AND type = 'view'
    AND created_at > NOW() - INTERVAL 7 DAY
)
GROUP BY r.id
ORDER BY (a_category_score + c_following_score + d_popularity_score) DESC
LIMIT 20 OFFSET :offset;
```

> Tag score (B) tính riêng ở tầng Service sau khi có kết quả, vì cần subquery phức tạp.

---

## V. XỬ LÝ COLD START (User mới)

| Trạng thái      | Điều kiện         | Chiến lược                           |
| --------------- | ----------------- | ------------------------------------ |
| **New user**    | 0 interaction     | 100% Trending Feed (7 ngày gần nhất) |
| **Warm up**     | 1–9 interactions  | 70% Trending + 30% Personalized      |
| **Active user** | ≥ 10 interactions | 100% Personalized                    |

### Trending Feed query

```sql
SELECT r.id, r.title,
  (COUNT(DISTINCT l.user_id) + COUNT(DISTINCT s.user_id) * 1.5 + COUNT(DISTINCT c.id) * 2) AS score
FROM recipes r
LEFT JOIN likes         l ON l.recipe_id = r.id AND l.created_at > NOW() - INTERVAL 7 DAY
LEFT JOIN saved_recipes s ON s.recipe_id = r.id AND s.created_at > NOW() - INTERVAL 7 DAY
LEFT JOIN comments      c ON c.recipe_id = r.id AND c.created_at > NOW() - INTERVAL 7 DAY
WHERE r.created_at > NOW() - INTERVAL 30 DAY
GROUP BY r.id
ORDER BY score DESC
LIMIT 20;
```

---

## VI. API ENDPOINTS

### Endpoints mới cần thêm

| Method  | Endpoint                    | Mô tả                         |
| ------- | --------------------------- | ----------------------------- |
| `POST`  | `/recipes/:id/view`         | Ghi nhận lượt xem             |
| `PATCH` | `/recipes/:id/view`         | Cập nhật duration_s khi thoát |
| `GET`   | `/recipes/feed/recommended` | Feed cá nhân hóa              |

### Request/Response

**POST `/recipes/:id/view`**

```json
// Request body (không bắt buộc gì cả, chỉ cần JWT header)
{}

// Response
{ "success": true }
```

**PATCH `/recipes/:id/view`**

```json
// Request body
{ "duration_s": 45 }

// Response
{ "success": true }
```

**GET `/recipes/feed/recommended?page=1&limit=20`**

```json
{
  "data": [
    {
      "id": 123,
      "title": "Phở bò Hà Nội",
      "category": "Lunch",
      "image_url": "...",
      "author": { "id": 5, "username": "chef_nam", "avatar_url": "..." },
      "stats": { "likes": 120, "saves": 45, "comments": 23 },
      "score": 0.82, // debug field, có thể ẩn ở production
      "created_at": "..."
    }
  ],
  "pagination": { "page": 1, "limit": 20, "total": 150 }
}
```

---

## VII. CẤU TRÚC CODE CẦN THÊM/SỬA

```
backend/src/
├── models/
│   └── user-interaction.model.ts           [NEW]
│
├── repositories/
│   └── user-interaction.repository.ts      [NEW]
│       ├── create(userId, recipeId, type, durationS?)
│       ├── updateDuration(userId, recipeId, durationS)
│       ├── countByUser(userId)                    ← dùng cho cold start check
│       ├── getTopCategories(userId, limit, days)  ← top N categories yêu thích
│       └── getTopTags(userId, limit, days)        ← top N tags yêu thích
│
├── services/
│   └── recommendation.service.ts           [NEW]
│       ├── getRecommendedFeed(userId, page, limit)
│       ├── getTrendingFeed(page, limit)
│       ├── getUserPreferenceProfile(userId)  ← trả về top categories + tags
│       └── calculateTagScore(recipeTagIds, userTopTags)
│
├── controllers/
│   ├── recipe.controller.ts                [EDIT]
│   │   └── thêm: getRecommendedFeed()
│   └── (tạo mới hoặc gộp vào recipe controller)
│       └── trackView() + updateViewDuration()
│
└── routes/
    └── recipe.routes.ts                    [EDIT]
        ├── thêm: POST   /:id/view
        ├── thêm: PATCH  /:id/view
        └── thêm: GET    /feed/recommended
```

### Mobile cần thêm

```
my-app/src/
├── features/recipe/
│   └── hooks/
│       └── useTrackView.ts         [NEW]
│           ├── Gọi POST /recipes/:id/view khi mount màn hình
│           └── Gọi PATCH /recipes/:id/view khi unmount (kèm duration)
│
└── features/feed/
    └── hooks/
        └── useFeed.ts              [EDIT]
            └── Đổi endpoint sang /feed/recommended
```

---

## VIII. ROADMAP TRIỂN KHAI

### Phase 1 — MVP (SQL-based)

- [ ] Tạo bảng `user_interactions`
- [ ] Tạo model + repository cho `user_interactions`
- [ ] Thêm API `POST/PATCH /recipes/:id/view`
- [ ] Xây dựng `RecommendationService` với SQL scoring
- [ ] Thêm API `GET /feed/recommended`
- [ ] Mobile: hook `useTrackView`
- [ ] Mobile: kết nối feed với API mới

### Phase 2 — Collaborative Filtering

> Dùng **Backend-AI** (Python service đã có sẵn) để tránh ảnh hưởng backend chính.

- [ ] Export ma trận `user × recipe` từ DB sang Redis
- [ ] Implement Collaborative Filtering (user-based hoặc item-based)
- [ ] Expose endpoint từ Backend-AI, backend chính gọi sang

### Phase 3 — Semantic Similarity (OpenAI Embeddings)

- [ ] Generate embeddings cho từng recipe (title + description + tags)
- [ ] Lưu vector vào DB hoặc vector store (pgvector / Pinecone)
- [ ] Tìm recipe "giống nhau về ý nghĩa" thay vì chỉ trùng category/tag

---

## IX. LƯU Ý QUAN TRỌNG

### Performance

- Chạy scoring query **bất đồng bộ**, cache kết quả **5–10 phút** (Redis) cho mỗi user
- Chỉ score **pool 200–500 recipes mới nhất**, không score toàn bộ DB
- Đặt index đúng trên `user_interactions(user_id, created_at)`

### Privacy

- Không expose `score` field ra client ở production
- Cho phép user **opt-out** khỏi personalization (chỉ xem trending)
- Tuân thủ nguyên tắc: chỉ lưu hành vi, không lưu nội dung tìm kiếm riêng tư

### Edge Cases

- User xem cùng 1 recipe nhiều lần → chỉ giữ lần có `duration_s` cao nhất
- Recipe đã bị xóa → xóa cascade hết interactions liên quan
- User bị block → không gợi ý recipe của người đó

---

_Ngày tạo: 27/03/2026 — Version 1.0_

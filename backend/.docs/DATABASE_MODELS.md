# 📊 DATABASE MODELS & RELATIONSHIPS

## Tổng quan

Hệ thống Recipe Sharing Platform sử dụng **16 bảng** trong cơ sở dữ liệu, được tổ chức thành 4 nhóm chức năng chính.

---

## 1️⃣ NHÓM NGƯỜI DÙNG & XÁC THỰC

### 🔹 **users** - Người dùng

**Bảng chính lưu thông tin người dùng**

| Trường          | Kiểu         | Ràng buộc             | Mô tả              |
| --------------- | ------------ | --------------------- | ------------------ |
| `id`            | INTEGER      | PK, AUTO_INCREMENT    | ID người dùng      |
| `username`      | VARCHAR(50)  | UNIQUE, NOT NULL      | Tên đăng nhập      |
| `email`         | VARCHAR(100) | UNIQUE, NOT NULL      | Email              |
| `password_hash` | VARCHAR(255) | NOT NULL              | Mật khẩu đã mã hóa |
| `full_name`     | VARCHAR(100) | NULL                  | Họ tên đầy đủ      |
| `bio`           | TEXT         | NULL                  | Tiểu sử            |
| `avatar_url`    | VARCHAR(255) | NULL                  | URL ảnh đại diện   |
| `created_at`    | DATETIME     | NOT NULL, DEFAULT NOW | Ngày tạo           |
| `updated_at`    | DATETIME     | NOT NULL, DEFAULT NOW | Ngày cập nhật      |

**Quan hệ:**

- 1 User → N Recipes (tạo nhiều công thức)
- 1 User → N Collections (tạo nhiều bộ sưu tập)
- 1 User → N Comments (viết nhiều bình luận)
- 1 User → N Notifications (nhận nhiều thông báo)
- M Users ↔ M Users qua `follows` (theo dõi lẫn nhau)
- M Users ↔ M Recipes qua `likes`, `ratings`, `saved_recipes`

---

### 🔹 **refresh_tokens** - Token làm mới

**Lưu JWT refresh token**

| Trường       | Kiểu         | Ràng buộc             | Mô tả                   |
| ------------ | ------------ | --------------------- | ----------------------- |
| `id`         | INTEGER      | PK, AUTO_INCREMENT    | ID token                |
| `user_id`    | INTEGER      | FK → users.id         | Người dùng sở hữu token |
| `token_hash` | VARCHAR(255) | NOT NULL              | Token đã hash           |
| `expires_at` | DATETIME     | NOT NULL              | Thời gian hết hạn       |
| `is_revoked` | BOOLEAN      | DEFAULT false         | Đã thu hồi chưa         |
| `created_at` | DATETIME     | NOT NULL, DEFAULT NOW | Ngày tạo                |

**Quan hệ:** N refresh_tokens → 1 User

---

### 🔹 **password_reset_tokens** - Token đặt lại mật khẩu

**Lưu OTP để reset password**

| Trường       | Kiểu         | Ràng buộc             | Mô tả               |
| ------------ | ------------ | --------------------- | ------------------- |
| `id`         | INTEGER      | PK, AUTO_INCREMENT    | ID token            |
| `user_id`    | INTEGER      | FK → users.id         | Người yêu cầu reset |
| `otp_hash`   | VARCHAR(255) | NOT NULL              | OTP đã hash         |
| `expires_at` | DATETIME     | NOT NULL              | Thời gian hết hạn   |
| `is_used`    | BOOLEAN      | DEFAULT false         | Đã sử dụng chưa     |
| `created_at` | DATETIME     | NOT NULL, DEFAULT NOW | Ngày tạo            |

**Quan hệ:** N password_reset_tokens → 1 User

---

## 2️⃣ NHÓM CÔNG THỨC NẤU ĂN

### 🔹 **recipes** - Công thức nấu ăn

**Bảng chính lưu công thức**

| Trường        | Kiểu         | Ràng buộc             | Mô tả                                |
| ------------- | ------------ | --------------------- | ------------------------------------ |
| `id`          | INTEGER      | PK, AUTO_INCREMENT    | ID công thức                         |
| `user_id`     | INTEGER      | FK → users.id         | Người tạo công thức                  |
| `title`       | VARCHAR(255) | NOT NULL              | Tên món ăn                           |
| `description` | TEXT         | NULL                  | Mô tả                                |
| `image_url`   | VARCHAR(255) | NULL                  | Ảnh món ăn                           |
| `category`    | VARCHAR(50)  | NULL                  | Danh mục (món chính, tráng miệng...) |
| `prep_time`   | INTEGER      | NULL                  | Thời gian chuẩn bị (phút)            |
| `cook_time`   | INTEGER      | NULL                  | Thời gian nấu (phút)                 |
| `servings`    | INTEGER      | NULL                  | Số khẩu phần                         |
| `tips`        | TEXT         | NULL                  | Mẹo nấu nướng                        |
| `created_at`  | DATETIME     | NOT NULL, DEFAULT NOW | Ngày tạo                             |
| `updated_at`  | DATETIME     | NOT NULL, DEFAULT NOW | Ngày cập nhật                        |

**Quan hệ:**

- N Recipes → 1 User (người tạo)
- 1 Recipe → N Ingredients
- 1 Recipe → N Recipe_Steps
- 1 Recipe → N Comments
- M Recipes ↔ M Tags qua `recipe_tags`
- M Recipes ↔ M Collections qua `collection_recipes`
- M Recipes ↔ M Users qua `likes`, `ratings`, `saved_recipes`

---

### 🔹 **ingredients** - Nguyên liệu

**Danh sách nguyên liệu của từng công thức**

| Trường      | Kiểu         | Ràng buộc          | Mô tả                       |
| ----------- | ------------ | ------------------ | --------------------------- |
| `id`        | INTEGER      | PK, AUTO_INCREMENT | ID nguyên liệu              |
| `recipe_id` | INTEGER      | FK → recipes.id    | Công thức                   |
| `name`      | VARCHAR(100) | NOT NULL           | Tên nguyên liệu             |
| `amount`    | VARCHAR(50)  | NULL               | Số lượng                    |
| `unit`      | VARCHAR(50)  | NULL               | Đơn vị (gram, ml, muỗng...) |

**Quan hệ:** N Ingredients → 1 Recipe

**Ví dụ:**

```json
{
  "recipe_id": 1,
  "name": "Thịt ba chỉ",
  "amount": "500",
  "unit": "gram"
}
```

---

### 🔹 **recipe_steps** - Các bước thực hiện

**Hướng dẫn từng bước nấu ăn**

| Trường        | Kiểu         | Ràng buộc          | Mô tả          |
| ------------- | ------------ | ------------------ | -------------- |
| `id`          | INTEGER      | PK, AUTO_INCREMENT | ID bước        |
| `recipe_id`   | INTEGER      | FK → recipes.id    | Công thức      |
| `step_number` | INTEGER      | NOT NULL           | Thứ tự bước    |
| `title`       | VARCHAR(100) | NULL               | Tiêu đề bước   |
| `description` | TEXT         | NULL               | Mô tả chi tiết |
| `image_url`   | VARCHAR(255) | NULL               | Ảnh minh họa   |

**Quan hệ:** N Recipe_Steps → 1 Recipe

**Ví dụ:**

```json
{
  "step_number": 1,
  "title": "Chuẩn bị nguyên liệu",
  "description": "Rửa sạch thịt, thái miếng vừa ăn"
}
```

---

### 🔹 **tags** - Thẻ tags

**Phân loại công thức theo tags**

| Trường       | Kiểu        | Ràng buộc             | Mô tả             |
| ------------ | ----------- | --------------------- | ----------------- |
| `id`         | INTEGER     | PK, AUTO_INCREMENT    | ID tag            |
| `name`       | VARCHAR(50) | UNIQUE, NOT NULL      | Tên tag           |
| `slug`       | VARCHAR(50) | UNIQUE, NOT NULL      | URL-friendly slug |
| `created_at` | DATETIME    | NOT NULL, DEFAULT NOW | Ngày tạo          |

**Quan hệ:** M Tags ↔ M Recipes qua `recipe_tags`

**Ví dụ tags:** "món Việt", "ăn chay", "nhanh gọn", "giảm cân", "món Á", "món Âu"

---

### 🔹 **recipe_tags** - Bảng trung gian Recipe-Tag

**Liên kết công thức với tags (Many-to-Many)**

| Trường       | Kiểu     | Ràng buộc             | Mô tả        |
| ------------ | -------- | --------------------- | ------------ |
| `recipe_id`  | INTEGER  | PK, FK → recipes.id   | Công thức    |
| `tag_id`     | INTEGER  | PK, FK → tags.id      | Tag          |
| `created_at` | DATETIME | NOT NULL, DEFAULT NOW | Ngày gắn tag |

**Khóa chính kép:** (`recipe_id`, `tag_id`)

**Ý nghĩa:**

- 1 recipe có thể có nhiều tags
- 1 tag có thể gắn với nhiều recipes

---

## 3️⃣ NHÓM TƯƠNG TÁC XÃ HỘI

### 🔹 **comments** - Bình luận

**Bình luận trên công thức (hỗ trợ reply)**

| Trường              | Kiểu     | Ràng buộc              | Mô tả                        |
| ------------------- | -------- | ---------------------- | ---------------------------- |
| `id`                | INTEGER  | PK, AUTO_INCREMENT     | ID bình luận                 |
| `recipe_id`         | INTEGER  | FK → recipes.id        | Công thức được bình luận     |
| `user_id`           | INTEGER  | FK → users.id          | Người bình luận              |
| `parent_comment_id` | INTEGER  | FK → comments.id, NULL | Bình luận cha (nếu là reply) |
| `content`           | TEXT     | NOT NULL               | Nội dung                     |
| `created_at`        | DATETIME | NOT NULL, DEFAULT NOW  | Thời gian bình luận          |
| `updated_at`        | DATETIME | NOT NULL, DEFAULT NOW  | Thời gian sửa                |

**Quan hệ:**

- N Comments → 1 Recipe
- N Comments → 1 User
- **Self-referencing:** 1 Comment → N Comments (replies)

**Đặc biệt:** Hỗ trợ bình luận lồng nhau (nested comments)

- Comment gốc: `parent_comment_id = NULL`
- Reply comment: `parent_comment_id = ID của comment cha`

---

### 🔹 **likes** - Thích

**Like công thức**

| Trường       | Kiểu     | Ràng buộc             | Mô tả               |
| ------------ | -------- | --------------------- | ------------------- |
| `user_id`    | INTEGER  | PK, FK → users.id     | Người like          |
| `recipe_id`  | INTEGER  | PK, FK → recipes.id   | Công thức được like |
| `created_at` | DATETIME | NOT NULL, DEFAULT NOW | Thời gian like      |

**Khóa chính kép:** (`user_id`, `recipe_id`)

**Quan hệ:** Many-to-Many giữa Users và Recipes

**Ý nghĩa:** 1 user like nhiều recipes, 1 recipe được nhiều users like

---

### 🔹 **ratings** - Đánh giá

**Đánh giá sao và review công thức**

| Trường        | Kiểu     | Ràng buộc             | Mô tả                   |
| ------------- | -------- | --------------------- | ----------------------- |
| `user_id`     | INTEGER  | PK, FK → users.id     | Người đánh giá          |
| `recipe_id`   | INTEGER  | PK, FK → recipes.id   | Công thức được đánh giá |
| `rating`      | INTEGER  | NOT NULL, CHECK (1-5) | Số sao (1-5)            |
| `review_text` | TEXT     | NULL                  | Nội dung review         |
| `created_at`  | DATETIME | NOT NULL, DEFAULT NOW | Ngày đánh giá           |
| `updated_at`  | DATETIME | NOT NULL, DEFAULT NOW | Ngày sửa đánh giá       |

**Khóa chính kép:** (`user_id`, `recipe_id`)

**Quan hệ:** Many-to-Many với ràng buộc unique (1 user chỉ đánh giá 1 recipe 1 lần)

**Validation:** `rating` phải từ 1-5

---

### 🔹 **follows** - Theo dõi

**Người dùng theo dõi nhau**

| Trường         | Kiểu     | Ràng buộc             | Mô tả               |
| -------------- | -------- | --------------------- | ------------------- |
| `follower_id`  | INTEGER  | PK, FK → users.id     | Người theo dõi      |
| `following_id` | INTEGER  | PK, FK → users.id     | Người được theo dõi |
| `created_at`   | DATETIME | NOT NULL, DEFAULT NOW | Ngày follow         |

**Khóa chính kép:** (`follower_id`, `following_id`)

**Quan hệ:** Self-referencing Many-to-Many trong bảng `users`

**Ý nghĩa:**

- User A follow User B: `follower_id = A, following_id = B`
- 1 user có thể follow nhiều users
- 1 user có thể được nhiều users follow

---

### 🔹 **notifications** - Thông báo

**Thông báo về các hoạt động**

| Trường       | Kiểu     | Ràng buộc                             | Mô tả                     |
| ------------ | -------- | ------------------------------------- | ------------------------- |
| `id`         | INTEGER  | PK, AUTO_INCREMENT                    | ID thông báo              |
| `user_id`    | INTEGER  | FK → users.id                         | Người nhận thông báo      |
| `type`       | ENUM     | 'like', 'comment', 'follow', 'rating' | Loại thông báo            |
| `actor_id`   | INTEGER  | FK → users.id                         | Người thực hiện hành động |
| `recipe_id`  | INTEGER  | FK → recipes.id, NULL                 | Công thức liên quan       |
| `comment_id` | INTEGER  | FK → comments.id, NULL                | Bình luận liên quan       |
| `is_read`    | BOOLEAN  | DEFAULT false                         | Đã đọc chưa               |
| `created_at` | DATETIME | NOT NULL, DEFAULT NOW                 | Thời gian tạo             |

**Quan hệ:**

- N Notifications → 1 User (người nhận)
- N Notifications → 1 User (actor - người gây ra)
- N Notifications → 1 Recipe (nullable)
- N Notifications → 1 Comment (nullable)

**Các loại thông báo:**

1. **like:** User X liked công thức của bạn
2. **comment:** User X bình luận công thức của bạn
3. **follow:** User X theo dõi bạn
4. **rating:** User X đánh giá công thức của bạn

---

## 4️⃣ NHÓM BỘ SƯU TẬP

### 🔹 **collections** - Bộ sưu tập

**Nhóm công thức theo chủ đề**

| Trường        | Kiểu         | Ràng buộc             | Mô tả                  |
| ------------- | ------------ | --------------------- | ---------------------- |
| `id`          | INTEGER      | PK, AUTO_INCREMENT    | ID bộ sưu tập          |
| `user_id`     | INTEGER      | FK → users.id         | Người tạo              |
| `name`        | VARCHAR(100) | NOT NULL              | Tên bộ sưu tập         |
| `description` | TEXT         | NULL                  | Mô tả                  |
| `image_url`   | VARCHAR(255) | NULL                  | Ảnh đại diện           |
| `is_public`   | BOOLEAN      | DEFAULT true          | Công khai hay riêng tư |
| `created_at`  | DATETIME     | NOT NULL, DEFAULT NOW | Ngày tạo               |
| `updated_at`  | DATETIME     | NOT NULL, DEFAULT NOW | Ngày cập nhật          |

**Quan hệ:**

- N Collections → 1 User
- M Collections ↔ M Recipes qua `collection_recipes`

**Ví dụ:** "Món ăn giảm cân", "Món cho bé", "Món Tết"

---

### 🔹 **collection_recipes** - Bảng trung gian Collection-Recipe

**Công thức trong bộ sưu tập**

| Trường          | Kiểu     | Ràng buộc               | Mô tả              |
| --------------- | -------- | ----------------------- | ------------------ |
| `collection_id` | INTEGER  | PK, FK → collections.id | Bộ sưu tập         |
| `recipe_id`     | INTEGER  | PK, FK → recipes.id     | Công thức          |
| `added_at`      | DATETIME | NOT NULL, DEFAULT NOW   | Thời gian thêm vào |

**Khóa chính kép:** (`collection_id`, `recipe_id`)

**Quan hệ:** Many-to-Many giữa Collections và Recipes

**Ý nghĩa:**

- 1 collection chứa nhiều recipes
- 1 recipe có thể nằm trong nhiều collections

---

### 🔹 **saved_recipes** - Công thức đã lưu

**Bookmark công thức yêu thích**

| Trường       | Kiểu     | Ràng buộc             | Mô tả              |
| ------------ | -------- | --------------------- | ------------------ |
| `user_id`    | INTEGER  | PK, FK → users.id     | Người lưu          |
| `recipe_id`  | INTEGER  | PK, FK → recipes.id   | Công thức được lưu |
| `created_at` | DATETIME | NOT NULL, DEFAULT NOW | Thời gian lưu      |

**Khóa chính kép:** (`user_id`, `recipe_id`)

**Quan hệ:** Many-to-Many giữa Users và Recipes

**Khác biệt với Collections:**

- `saved_recipes`: Bookmark nhanh, đơn giản
- `collections`: Tổ chức có cấu trúc, có tên, mô tả

---

## 🔗 BIỂU ĐỒ MỐI QUAN HỆ TỔNG THỂ

```
┌─────────────────────────────────────────────────────────────────┐
│                          USERS (Trung tâm)                      │
└──┬──────┬──────┬──────┬──────┬──────┬──────┬──────┬──────────┘
   │      │      │      │      │      │      │      │
   │      │      │      │      │      │      │      └──→ FOLLOWS (self)
   │      │      │      │      │      │      │
   │      │      │      │      │      │      └──────→ NOTIFICATIONS (actor)
   │      │      │      │      │      │
   │      │      │      │      │      └─────────────→ NOTIFICATIONS (receiver)
   │      │      │      │      │
   │      │      │      │      └───────────────────→ PASSWORD_RESET_TOKENS
   │      │      │      │
   │      │      │      └──────────────────────────→ REFRESH_TOKENS
   │      │      │
   │      │      └─────────────────────────────────→ COMMENTS
   │      │
   │      └────────────────────────────────────────→ COLLECTIONS
   │                                                      │
   │                                                      ↓
   │                                            COLLECTION_RECIPES
   │                                                      │
   ↓                                                      ↓
RECIPES ←──────────────────────────────────────────────────┘
   │
   ├──→ INGREDIENTS
   ├──→ RECIPE_STEPS
   ├──→ COMMENTS
   ├──→ NOTIFICATIONS
   │
   ├──→ RECIPE_TAGS ←──→ TAGS
   │
   └──→ Many-to-Many với USERS qua:
        ├─ LIKES
        ├─ RATINGS
        └─ SAVED_RECIPES
```

---

## 📊 THỐNG KÊ QUAN HỆ

### Các loại quan hệ

| Loại quan hệ         | Số lượng | Mô tả                                                                                                                                                             |
| -------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **One-to-Many**      | 8        | User → Recipes, Recipe → Ingredients, Recipe → Steps, User → Collections, User → Comments, Recipe → Comments, User → Refresh Tokens, User → Password Reset Tokens |
| **Many-to-Many**     | 6        | Recipes ↔ Tags, Collections ↔ Recipes, Users ↔ Recipes (likes), Users ↔ Recipes (ratings), Users ↔ Recipes (saved), Users ↔ Users (follows)                       |
| **Self-referencing** | 2        | Comments → Comments (parent-child), Users → Users (follows)                                                                                                       |

### Phân loại bảng theo vai trò

| Vai trò                            | Số bảng | Tên bảng                                                                        |
| ---------------------------------- | ------- | ------------------------------------------------------------------------------- |
| **Bảng chính**                     | 6       | users, recipes, tags, collections, comments, notifications                      |
| **Bảng phụ thuộc**                 | 5       | ingredients, recipe_steps, refresh_tokens, password_reset_tokens, saved_recipes |
| **Bảng trung gian** (Many-to-Many) | 5       | recipe_tags, collection_recipes, likes, ratings, follows                        |

---

## 🎯 CÁC TRUY VẤN QUAN TRỌNG

### 1. Lấy công thức với đầy đủ thông tin

```sql
SELECT
  r.*,
  u.username, u.avatar_url,
  COUNT(DISTINCT l.user_id) as total_likes,
  AVG(rt.rating) as avg_rating,
  COUNT(DISTINCT c.id) as total_comments
FROM recipes r
LEFT JOIN users u ON r.user_id = u.id
LEFT JOIN likes l ON r.id = l.recipe_id
LEFT JOIN ratings rt ON r.id = rt.recipe_id
LEFT JOIN comments c ON r.id = c.recipe_id
WHERE r.id = ?
GROUP BY r.id
```

### 2. Lấy danh sách followers/following

```sql
-- Followers (người follow mình)
SELECT u.* FROM users u
JOIN follows f ON u.id = f.follower_id
WHERE f.following_id = ?

-- Following (mình đang follow)
SELECT u.* FROM users u
JOIN follows f ON u.id = f.following_id
WHERE f.follower_id = ?
```

### 3. Lấy công thức trong collection

```sql
SELECT r.*, cr.added_at
FROM recipes r
JOIN collection_recipes cr ON r.id = cr.recipe_id
WHERE cr.collection_id = ?
ORDER BY cr.added_at DESC
```

### 4. Lấy thông báo chưa đọc

```sql
SELECT
  n.*,
  actor.username as actor_name,
  r.title as recipe_title
FROM notifications n
JOIN users actor ON n.actor_id = actor.id
LEFT JOIN recipes r ON n.recipe_id = r.id
WHERE n.user_id = ? AND n.is_read = false
ORDER BY n.created_at DESC
```

### 5. Tìm công thức theo tags

```sql
SELECT DISTINCT r.*
FROM recipes r
JOIN recipe_tags rt ON r.id = rt.recipe_id
JOIN tags t ON rt.tag_id = t.id
WHERE t.slug IN ('mon-viet', 'an-chay')
```

---

## ⚠️ LƯU Ý QUAN TRỌNG

### Indexes cần tạo

```sql
-- Foreign keys
CREATE INDEX idx_recipes_user_id ON recipes(user_id);
CREATE INDEX idx_ingredients_recipe_id ON ingredients(recipe_id);
CREATE INDEX idx_comments_recipe_id ON comments(recipe_id);
CREATE INDEX idx_comments_user_id ON comments(user_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);

-- Composite indexes cho bảng trung gian đã có PK kép

-- Tìm kiếm
CREATE INDEX idx_recipes_category ON recipes(category);
CREATE INDEX idx_tags_slug ON tags(slug);
CREATE INDEX idx_notifications_is_read ON notifications(user_id, is_read);
```

### Cascade Delete

Khi xóa user, cần xử lý:

- Soft delete recipes (hoặc chuyển sang user "deleted")
- Xóa refresh_tokens, password_reset_tokens
- Xóa các quan hệ: likes, ratings, saved_recipes, follows
- Giữ lại comments (đổi thành "Deleted User")

### Timestamps

- **created_at + updated_at:** users, recipes, collections, comments, ratings
- **created_at only:** likes, follows, saved_recipes, tags, notifications, refresh_tokens, password_reset_tokens
- **No timestamps:** ingredients, recipe_steps (thuộc về recipe)

---

## 📝 NOTES

- Tất cả bảng sử dụng `snake_case` cho tên bảng và cột
- Sequelize ORM với `underscored: true` config
- ID dùng `INTEGER UNSIGNED` với `AUTO_INCREMENT`
- Foreign keys không có explicit constraints trong Sequelize init, cần define associations riêng

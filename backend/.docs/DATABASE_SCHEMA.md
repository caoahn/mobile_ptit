# Database Schema - Recipe Sharing App

## Tổng quan

Database được thiết kế cho một ứng dụng chia sẻ công thức nấu ăn với đầy đủ tính năng social network.

## Danh sách Models

### 1. Core Models (Chính)

#### **User** - Người dùng

```typescript
- id: number (PK)
- username: string (unique)
- email: string (unique)
- password_hash: string
- full_name?: string
- bio?: string
- avatar_url?: string
- created_at: Date
- updated_at: Date
```

#### **Recipe** - Công thức nấu ăn

```typescript
- id: number (PK)
- user_id: number (FK -> User)
- title: string
- description?: string
- image_url?: string
- category?: string
- prep_time?: number (phút)
- cook_time?: number (phút)
- servings?: number (khẩu phần)
- tips?: string
- created_at: Date
- updated_at: Date
```

#### **Ingredient** - Nguyên liệu

```typescript
- id: number (PK)
- recipe_id: number (FK -> Recipe)
- name: string
- amount?: string
- unit?: string
```

#### **RecipeStep** - Các bước thực hiện

```typescript
- id: number (PK)
- recipe_id: number (FK -> Recipe)
- step_number: number
- title?: string
- description?: string
- image_url?: string
```

### 2. Social Features (Tương tác xã hội)

#### **Like** - Thích công thức

```typescript
- user_id: number (PK, FK -> User)
- recipe_id: number (PK, FK -> Recipe)
- created_at: Date
```

_Composite Primary Key: (user_id, recipe_id)_

#### **SavedRecipe** - Lưu công thức yêu thích

```typescript
- user_id: number (PK, FK -> User)
- recipe_id: number (PK, FK -> Recipe)
- created_at: Date
```

_Composite Primary Key: (user_id, recipe_id)_

#### **Follow** - Theo dõi người dùng khác

```typescript
- follower_id: number (PK, FK -> User) - Người follow
- following_id: number (PK, FK -> User) - Người được follow
- created_at: Date
```

_Composite Primary Key: (follower_id, following_id)_
_Self-referencing relationship_

#### **Comment** - Bình luận

```typescript
- id: number (PK)
- recipe_id: number (FK -> Recipe)
- user_id: number (FK -> User)
- parent_comment_id?: number (FK -> Comment) - Cho reply
- content: string
- created_at: Date
- updated_at: Date
```

_Hỗ trợ nested comments (reply)_

#### **Rating** - Đánh giá công thức

```typescript
- user_id: number (PK, FK -> User)
- recipe_id: number (PK, FK -> Recipe)
- rating: number (1-5)
- review_text?: string
- created_at: Date
- updated_at: Date
```

_Composite Primary Key: (user_id, recipe_id)_

### 3. Organization Features (Tổ chức nội dung)

#### **Tag** - Thẻ gắn

```typescript
- id: number (PK)
- name: string (unique)
- slug: string (unique)
- created_at: Date
```

#### **RecipeTag** - Liên kết Recipe và Tag

```typescript
- recipe_id: number (PK, FK -> Recipe)
- tag_id: number (PK, FK -> Tag)
- created_at: Date
```

_Junction table cho Many-to-Many_
_Composite Primary Key: (recipe_id, tag_id)_

#### **Collection** - Bộ sưu tập công thức

```typescript
- id: number (PK)
- user_id: number (FK -> User)
- name: string
- description?: string
- image_url?: string
- is_public: boolean
- created_at: Date
- updated_at: Date
```

#### **CollectionRecipe** - Công thức trong bộ sưu tập

```typescript
- collection_id: number (PK, FK -> Collection)
- recipe_id: number (PK, FK -> Recipe)
- added_at: Date
```

_Junction table cho Many-to-Many_
_Composite Primary Key: (collection_id, recipe_id)_

### 4. System Features (Hệ thống)

#### **Notification** - Thông báo

```typescript
- id: number (PK)
- user_id: number (FK -> User) - Người nhận
- type: enum ("like" | "comment" | "follow" | "rating")
- actor_id: number (FK -> User) - Người thực hiện
- recipe_id?: number (FK -> Recipe)
- comment_id?: number (FK -> Comment)
- is_read: boolean
- created_at: Date
```

#### **RefreshToken** - Token làm mới

```typescript
- id: number (PK)
- user_id: number (FK -> User)
- token_hash: string
- expires_at: Date
- is_revoked: boolean
- created_at: Date
```

#### **PasswordResetToken** - Token reset mật khẩu

```typescript
- id: number (PK)
- user_id: number (FK -> User)
- otp_hash: string
- expires_at: Date
- is_used: boolean
- created_at: Date
```

---

## Relationships (Mối quan hệ)

### 1. User Relationships

#### User ➜ Recipe (1:N)

- **Alias:** `recipes` (User) ← `chef` (Recipe)
- Một user có thể tạo nhiều công thức
- Mỗi công thức thuộc về một user

#### User ➜ Like (1:N)

- **Alias:** `likes`
- Một user có thể like nhiều công thức

#### User ➜ SavedRecipe (1:N)

- **Alias:** `saved_recipes`
- Một user có thể lưu nhiều công thức

#### User ➜ Follow (1:N) - Self-referencing

- **Alias:** `following` (follower_id), `followers` (following_id)
- Một user có thể follow nhiều user khác
- Một user có thể có nhiều followers

#### User ➜ Comment (1:N)

- **Alias:** `comments`
- Một user có thể comment nhiều lần

#### User ➜ Rating (1:N)

- **Alias:** `ratings`
- Một user có thể đánh giá nhiều công thức

#### User ➜ Collection (1:N)

- **Alias:** `collections` (User) ← `owner` (Collection)
- Một user có thể tạo nhiều bộ sưu tập

#### User ➜ Notification (1:N)

- **Alias:** `notifications` (recipient), `sent_notifications` (actor)
- Một user có thể nhận và gửi nhiều thông báo

### 2. Recipe Relationships

#### Recipe ➜ Ingredient (1:N)

- **Alias:** `ingredients`
- Một công thức có nhiều nguyên liệu
- **Cascade Delete:** Xóa recipe → xóa ingredients

#### Recipe ➜ RecipeStep (1:N)

- **Alias:** `steps`
- Một công thức có nhiều bước thực hiện
- **Cascade Delete:** Xóa recipe → xóa steps

#### Recipe ➜ Like (1:N)

- **Alias:** `likes`
- Một công thức có thể được nhiều người like

#### Recipe ➜ SavedRecipe (1:N)

- **Alias:** `saved_by_users`
- Một công thức có thể được nhiều người lưu

#### Recipe ➜ Comment (1:N)

- **Alias:** `comments`
- Một công thức có thể có nhiều comments

#### Recipe ➜ Rating (1:N)

- **Alias:** `ratings`
- Một công thức có thể có nhiều đánh giá

#### Recipe ↔ Tag (N:N via RecipeTag)

- **Alias:** `tags` (Recipe) ← `recipes` (Tag)
- Một công thức có thể có nhiều tags
- Một tag có thể gắn cho nhiều công thức

#### Recipe ↔ Collection (N:N via CollectionRecipe)

- **Alias:** `collections` (Recipe) ← `recipes` (Collection)
- Một công thức có thể nằm trong nhiều bộ sưu tập
- Một bộ sưu tập có thể chứa nhiều công thức

### 3. Comment Relationships

#### Comment ➜ Comment (1:N) - Self-referencing

- **Alias:** `replies` (Comment) ← `parent` (parent Comment)
- Một comment có thể có nhiều replies
- Một reply thuộc về một parent comment
- **Support nested comments**

### 4. Notification Relationships

#### Notification ➜ Recipe (N:1)

- **Alias:** `recipe`
- Thông báo liên quan đến một công thức cụ thể

#### Notification ➜ Comment (N:1)

- **Alias:** `comment`
- Thông báo liên quan đến một comment cụ thể

---

## Entity Relationship Diagram (ERD)

```
                                    ┌──────────────┐
                          ┌─────────│     USER     │─────────┐
                          │         └──────────────┘         │
                          │                │                 │
                          │                │ 1               │
                          │                │                 │
                 ┌────────▼─────┐          │          ┌──────▼─────────┐
                 │   FOLLOW     │          │          │   COLLECTION   │
                 │ (self-ref)   │          │          └────────┬───────┘
                 └──────────────┘          │                   │
                                          │ N                 │ N
                                          │                   │
                 ┌────────────────────────▼──────┐            │
                 │         RECIPE                │            │
                 └───┬────┬────┬────┬────┬───┬──┘            │
                     │    │    │    │    │   │               │
              ┌──────┘    │    │    │    │   └───────┐       │
              │           │    │    │    │           │       │
         ┌────▼───┐  ┌────▼──┐ │    │ ┌──▼────┐ ┌───▼────┐  │
         │INGREDI-│  │RECIPE │ │    │ │ LIKE  │ │ SAVED  │  │
         │  ENT   │  │ STEP  │ │    │ │       │ │ RECIPE │  │
         └────────┘  └───────┘ │    │ └───────┘ └────────┘  │
                               │    │                        │
                          ┌────▼──┐ │                        │
                          │COMMENT│ │                        │
                          │       │ │                        │
                          │(nested│ │                        │
                          │ reply)│ │                        │
                          └───────┘ │                        │
                                    │                        │
                               ┌────▼─────┐                  │
                               │  RATING  │                  │
                               └──────────┘                  │
                                                            │
        ┌──────────┐                                        │
        │   TAG    │◄───────┐                              │
        └──────────┘        │                              │
                            │                              │
                     ┌──────▼────────┐          ┌──────────▼──────────┐
                     │  RECIPE_TAG   │          │ COLLECTION_RECIPE   │
                     │ (junction)    │          │    (junction)       │
                     └───────────────┘          └─────────────────────┘


                     ┌─────────────────┐
                     │  NOTIFICATION   │
                     │  (system)       │
                     └─────────────────┘

                     ┌─────────────────┐
                     │  TOKEN MODELS   │
                     │  (auth)         │
                     └─────────────────┘
```

---

## Indexes & Performance

### Recommended Indexes:

1. **User:**
   - `username` (unique)
   - `email` (unique)

2. **Recipe:**
   - `user_id` (foreign key)
   - `category` (filter)
   - `created_at` (sorting)

3. **Like:**
   - Composite: `(user_id, recipe_id)` (PK)
   - `recipe_id` (count likes)

4. **Comment:**
   - `recipe_id` (get all comments)
   - `parent_comment_id` (nested replies)
   - `user_id`

5. **Rating:**
   - Composite: `(user_id, recipe_id)` (PK)
   - `recipe_id` (calculate avg rating)

6. **Tag:**
   - `slug` (unique, search)

7. **Notification:**
   - `user_id, is_read` (unread notifications)
   - `created_at` (sorting)

---

## Common Queries

### 1. Lấy công thức với đầy đủ thông tin:

```typescript
Recipe.findOne({
  where: { id },
  include: [
    { model: User, as: "chef" },
    { model: Ingredient, as: "ingredients" },
    { model: RecipeStep, as: "steps" },
    { model: Tag, as: "tags" },
    { model: Comment, as: "comments", include: [{ model: User, as: "user" }] },
    { model: Rating, as: "ratings" },
  ],
});
```

### 2. Tính trung bình rating:

```sql
SELECT recipe_id, AVG(rating) as avg_rating, COUNT(*) as total_ratings
FROM ratings
GROUP BY recipe_id
```

### 3. Công thức phổ biến (nhiều likes nhất):

```sql
SELECT r.*, COUNT(l.recipe_id) as like_count
FROM recipes r
LEFT JOIN likes l ON r.id = l.recipe_id
GROUP BY r.id
ORDER BY like_count DESC
LIMIT 10
```

### 4. Feed công thức từ người mình follow:

```sql
SELECT r.*
FROM recipes r
INNER JOIN follows f ON r.user_id = f.following_id
WHERE f.follower_id = :currentUserId
ORDER BY r.created_at DESC
```

---

## Business Rules

1. **User không thể like/save công thức của mình** (optional - có thể cho phép)
2. **User chỉ được rating mỗi công thức 1 lần** (enforced by composite PK)
3. **User không thể follow chính mình** (validation needed)
4. **Recipe phải có ít nhất 1 ingredient** (validation)
5. **Comment có thể được nested tối đa 3 cấp** (optional limit)
6. **Rating chỉ từ 1-5 sao** (validation constraint)
7. **Xóa recipe → cascade delete tất cả related data** (ingredients, steps, likes, etc.)
8. **Xóa user → cascade/soft delete tất cả recipes của user đó**

---

## Future Enhancements (Có thể thêm sau)

1. **RecipeView** - Tracking lượt xem
2. **ShoppingList** - Danh sách mua hàng
3. **MealPlan** - Kế hoạch bữa ăn
4. **RecipeHistory** - Lịch sử nấu ăn
5. **Report** - Báo cáo vi phạm
6. **Category** - Tách category thành bảng riêng
7. **Unit** - Chuẩn hóa đơn vị đo lường
8. **Media** - Quản lý ảnh/video tập trung

---

_Generated: February 4, 2026_

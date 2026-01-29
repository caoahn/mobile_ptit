# Tài liệu đặc tả kỹ thuật dự án DishGram

## 1. Giới thiệu

DishGram là ứng dụng mạng xã hội chia sẻ công thức nấu ăn, cho phép người dùng tạo, khám phá, lưu trữ công thức và sử dụng AI để quét nguyên liệu từ hình ảnh.

---

## 2. Thiết kế Cơ sở dữ liệu (MySQL)

Dưới đây là thiết kế các bảng (Tables) cần thiết cho dự án.

### 2.1. Users (Người dùng)

Lưu trữ thông tin người dùng.

```sql
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    bio TEXT,
    avatar_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### 2.2. Recipes (Công thức)

Lưu trữ thông tin cơ bản của công thức nấu ăn.

```sql
CREATE TABLE recipes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    image_url VARCHAR(255), -- Hình ảnh đại diện món ăn
    category VARCHAR(50),   -- Ví dụ: Breakfast, Lunch, Dinner
    prep_time INT,          -- Thời gian chuẩn bị (phút)
    cook_time INT,          -- Thời gian nấu (phút)
    servings INT,           -- Số phần ăn
    tips TEXT,              -- Mẹo nhỏ (Chef's Tips)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### 2.3. Ingredients (Nguyên liệu)

Danh sách nguyên liệu cho từng công thức.

```sql
CREATE TABLE ingredients (
    id INT AUTO_INCREMENT PRIMARY KEY,
    recipe_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    amount VARCHAR(50), -- Ví dụ: "200", "1/2"
    unit VARCHAR(50),   -- Ví dụ: "g", "cup", "tsp"
    FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE
);
```

### 2.4. Recipe Steps (Các bước)

Hướng dẫn chi tiết từng bước nấu.

```sql
CREATE TABLE recipe_steps (
    id INT AUTO_INCREMENT PRIMARY KEY,
    recipe_id INT NOT NULL,
    step_number INT NOT NULL,
    title VARCHAR(100),
    description TEXT,
    image_url VARCHAR(255), -- Hình ảnh minh họa cho bước (nếu có)
    FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE
);
```

### 2.5. Likes & Saved (Tương tác)

Lưu trữ lượt thích và công thức đã lưu.

```sql
-- Bảng Like
CREATE TABLE likes (
    user_id INT NOT NULL,
    recipe_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, recipe_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE
);

-- Bảng Saved (Bookmarks)
CREATE TABLE saved_recipes (
    user_id INT NOT NULL,
    recipe_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, recipe_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE
);
```

### 2.6. Follows (Theo dõi)

Mạng lưới xã hội giữa các người dùng.

```sql
CREATE TABLE follows (
    follower_id INT NOT NULL, -- Người đi theo dõi
    following_id INT NOT NULL, -- Người được theo dõi
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (follower_id, following_id),
    FOREIGN KEY (follower_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (following_id) REFERENCES users(id) ON DELETE CASCADE
);
```

---

## 3. Danh sách API cần thiết

### 3.1. Authentication (Xác thực)

| Method | Endpoint                  | Mô tả                                             |
| :----- | :------------------------ | :------------------------------------------------ |
| `POST` | `/api/auth/register`      | Đăng ký tài khoản mới (username, email, password) |
| `POST` | `/api/auth/login`         | Đăng nhập (email, password) -> Trả về JWT Token   |
| `POST` | `/api/auth/refresh-token` | Làm mới token khi hết hạn                         |
| `GET`  | `/api/auth/me`            | Lấy thông tin user hiện tại (yêu cầu Token)       |

### 3.2. Recipes (Công thức)

| Method   | Endpoint              | Mô tả                                                                                                           |
| :------- | :-------------------- | :-------------------------------------------------------------------------------------------------------------- |
| `GET`    | `/api/recipes`        | Lấy danh sách công thức (Feed). Hỗ trợ phân trang, filter (category).                                           |
| `GET`    | `/api/recipes/:id`    | Xem chi tiết công thức (bao gồm ingredients, steps, user info).                                                 |
| `POST`   | `/api/recipes`        | Tạo công thức mới. Body chứa thông tin, danh sách ingredients, steps. Hình ảnh cần upload riêng hoặc multipart. |
| `PUT`    | `/api/recipes/:id`    | Cập nhật công thức.                                                                                             |
| `DELETE` | `/api/recipes/:id`    | Xóa công thức.                                                                                                  |
| `GET`    | `/api/recipes/search` | Tìm kiếm công thức theo tên hoặc nguyên liệu (`?q=keyword`).                                                    |

### 3.3. User Actions (Tương tác)

| Method   | Endpoint                 | Mô tả                                   |
| :------- | :----------------------- | :-------------------------------------- |
| `POST`   | `/api/recipes/:id/like`  | Like một công thức.                     |
| `DELETE` | `/api/recipes/:id/like`  | Bỏ like.                                |
| `POST`   | `/api/recipes/:id/save`  | Lưu công thức vào kho lưu trữ.          |
| `DELETE` | `/api/recipes/:id/save`  | Bỏ lưu.                                 |
| `GET`    | `/api/users/:id/recipes` | Lấy danh sách công thức do user tạo.    |
| `GET`    | `/api/users/me/saved`    | Lấy danh sách công thức đã lưu của tôi. |

### 3.4. AI / Utilities (Tiện ích)

| Method | Endpoint                   | Mô tả                                                                                 |
| :----- | :------------------------- | :------------------------------------------------------------------------------------ |
| `POST` | `/api/upload`              | Upload hình ảnh (cho recipe hoặc avatar) -> Trả về URL.                               |
| `POST` | `/api/ai/scan-ingredients` | Gửi hình ảnh lên để AI phân tích -> Trả về danh sách nguyên liệu và độ chính xác (%). |

---

## 4. Chi tiết Dữ liệu JSON (Ví dụ)

### 4.1. Create Recipe Request

```json
{
  "title": "Spicy Miso Ramen",
  "category": "Dinner",
  "imageUrl": "https://example.com/ramen.jpg",
  "prepTime": 15,
  "cookTime": 30,
  "servings": 2,
  "tips": "Use cold butter for flakiness",
  "ingredients": [
    { "name": "Miso Paste", "amount": "2", "unit": "tbsp" },
    { "name": "Ramen Noodles", "amount": "200", "unit": "g" }
  ],
  "steps": [
    {
      "stepNumber": 1,
      "title": "Prepare Broth",
      "description": "Mix miso with hot water..."
    },
    { "stepNumber": 2, "title": "Cook Noodles", "description": "Boil water..." }
  ]
}
```

### 4.2. Recipe Detail Response

```json
{
  "id": 1,
  "title": "Spicy Miso Ramen",
  "chef": {
    "id": 101,
    "username": "chef_sarah",
    "avatarUrl": "..."
  },
  "likesCount": 1248,
  "isLiked": true,
  "isSaved": false,
  "ingredients": [...],
  "steps": [...]
}
```

# TỔNG QUAN DỰ ÁN DISHGRAM

**Dự án:** DishGram - Ứng dụng mạng xã hội chia sẻ công thức nấu ăn  
**Ngày cập nhật:** 03/02/2026  
**Version:** 1.0

---

## 📱 I. GIỚI THIỆU DỰ ÁN

DishGram là một ứng dụng mạng xã hội di động cho phép người dùng:

- **Tạo và chia sẻ** công thức nấu ăn của riêng mình với cộng đồng
- **Khám phá** hàng ngàn công thức từ những người dùng khác
- **Lưu trữ** các công thức yêu thích để dễ dàng tìm lại
- **Quét nguyên liệu** từ hình ảnh sử dụng công nghệ AI
- **Tương tác xã hội** thông qua tính năng theo dõi, thích và chia sẻ

---

## 🎯 II. CÁC CHỨC NĂNG CƠ BẢN

### 2.1. Quản lý Tài khoản & Xác thực

#### **Đăng ký tài khoản**

- Đăng ký bằng email, username và password
- Validation: email format, username unique, password strength
- Mã hóa password bằng bcrypt
- Tự động đăng nhập sau khi đăng ký thành công

#### **Đăng nhập**

- Đăng nhập bằng email/username và password
- Xác thực JWT (JSON Web Token)
- Access Token (1 giờ) + Refresh Token (7 ngày)
- Remember me option
- Tự động refresh token khi hết hạn

#### **Quên mật khẩu & Đặt lại mật khẩu**

- Gửi email reset password link
- Xác thực reset token
- Cập nhật mật khẩu mới

#### **Đăng xuất**

- Revoke refresh token
- Xóa tokens khỏi local storage
- Redirect về màn hình login

---

### 2.2. Quản lý Hồ sơ Người dùng

#### **Xem hồ sơ cá nhân**

- Hiển thị: Avatar, Username, Full name, Bio
- Thống kê: Số công thức đã tạo, Followers, Following
- Tab: Công thức của tôi, Công thức đã lưu

#### **Chỉnh sửa hồ sơ**

- Cập nhật avatar (upload ảnh từ camera/gallery)
- Cập nhật tên đầy đủ
- Cập nhật bio (giới thiệu bản thân)
- Preview trước khi lưu

#### **Xem hồ sơ người dùng khác**

- Hiển thị thông tin công khai
- Nút Follow/Unfollow
- Xem danh sách công thức của người đó

#### **Quản lý Following/Followers**

- Theo dõi người dùng khác
- Bỏ theo dõi
- Xem danh sách người đang follow
- Xem danh sách followers

---

### 2.3. Quản lý Công thức (Recipe Management)

#### **Tạo công thức mới**

Công thức bao gồm các thông tin:

**Thông tin cơ bản:**

- Tiêu đề món ăn
- Mô tả ngắn
- Hình ảnh đại diện món ăn
- Danh mục (Breakfast, Lunch, Dinner, Dessert, Snack, Beverage...)

**Thông tin chi tiết:**

- Thời gian chuẩn bị (phút)
- Thời gian nấu (phút)
- Số phần ăn (servings)

**Nguyên liệu:**

- Danh sách nguyên liệu
- Mỗi nguyên liệu: Tên, Số lượng, Đơn vị (g, kg, cup, tsp, tbsp...)
- Thêm/xóa/sắp xếp nguyên liệu

**Các bước thực hiện:**

- Danh sách các bước (đánh số thứ tự)
- Mỗi bước: Tiêu đề, Mô tả chi tiết, Hình ảnh minh họa (optional)
- Thêm/xóa/sắp xếp thứ tự các bước

**Mẹo nhỏ (Chef's Tips):**

- Lời khuyên, bí quyết nấu món này
- Optional

#### **Chỉnh sửa công thức**

- Chỉ tác giả mới có quyền chỉnh sửa
- Cập nhật bất kỳ thông tin nào
- Preview trước khi lưu

#### **Xóa công thức**

- Chỉ tác giả mới có quyền xóa
- Xác nhận trước khi xóa (confirmation dialog)
- Xóa cascade: công thức + nguyên liệu + các bước + likes + saves

#### **Xem chi tiết công thức**

Hiển thị đầy đủ thông tin:

- Header: Ảnh món ăn, Tiêu đề
- Thông tin tác giả: Avatar, Username (tap để xem profile)
- Stats: Likes count, Saves count
- Details: Thời gian chuẩn bị, thời gian nấu, số phần
- Nguyên liệu (có thể check vào từng item)
- Các bước thực hiện (có ảnh minh họa)
- Chef's Tips
- Actions: Like, Save, Share buttons

---

### 2.4. Khám phá & Tìm kiếm

#### **Home Feed (Recipe Feed)**

- Hiển thị danh sách công thức mới nhất
- Sắp xếp theo thời gian tạo (mới nhất trước)
- Infinite scroll (load more khi scroll xuống cuối)
- Pull-to-refresh để cập nhật
- Mỗi item hiển thị: Ảnh, Tiêu đề, Tác giả, Stats (likes, saves)

#### **Tìm kiếm công thức**

Tìm kiếm theo:

- **Tên món ăn**: Search trong title và description
- **Nguyên liệu**: Tìm công thức chứa nguyên liệu cụ thể
- **Danh mục**: Filter theo category (Breakfast, Lunch...)
- **Tác giả**: Tìm công thức của user cụ thể

**Features:**

- Search bar với debounce (tránh gọi API liên tục)
- Hiển thị gợi ý tìm kiếm (search suggestions)
- Lưu lịch sử tìm kiếm gần đây
- Xóa lịch sử tìm kiếm

#### **Lọc công thức (Filter)**

Lọc theo các tiêu chí:

- Danh mục món ăn
- Thời gian chuẩn bị (< 15 phút, 15-30 phút, 30-60 phút, > 60 phút)
- Thời gian nấu
- Số phần ăn
- Kết hợp nhiều filter cùng lúc

#### **Sắp xếp (Sort)**

- Mới nhất (Newest)
- Phổ biến nhất (Most Liked)
- Được lưu nhiều nhất (Most Saved)

---

### 2.5. Tương tác Xã hội

#### **Like (Thích)**

- Tap icon ❤️ để thích công thức
- Tap lại để bỏ thích
- Hiển thị số lượng likes
- Animation khi like/unlike

#### **Save (Lưu/Bookmark)**

- Tap icon 🔖 để lưu công thức
- Tap lại để bỏ lưu
- Lưu vào collection "Saved Recipes"
- Xem tất cả công thức đã lưu trong Profile

#### **Share (Chia sẻ)**

- Chia sẻ công thức ra ngoài app
- Share qua: Message, Email, Social media (Facebook, Instagram...)
- Copy link công thức

#### **Follow (Theo dõi)**

- Follow người dùng khác
- Unfollow
- Xem danh sách Following/Followers
- Thông báo khi người mình follow đăng công thức mới (future)

---

### 2.6. Upload & Quản lý Media

#### **Upload hình ảnh**

Hỗ trợ upload cho:

- Avatar người dùng
- Hình ảnh món ăn (recipe image)
- Hình ảnh các bước nấu (step images)

**Tính năng:**

- Chọn ảnh từ thư viện (Gallery)
- Chụp ảnh trực tiếp bằng Camera
- Crop/resize ảnh trước khi upload
- Compress ảnh để tối ưu dung lượng
- Preview ảnh trước khi upload

**Validation:**

- File format: JPG, PNG
- Kích thước tối đa: 5MB
- Tỷ lệ khung hình gợi ý: 1:1 (square) hoặc 4:3

**Lưu trữ:**

- Upload lên Cloudinary hoặc AWS S3
- Lưu URL vào database
- Tự động optimize ảnh (resize, format conversion)
- CDN delivery cho tốc độ tải nhanh

---

## 🤖 III. CÁC CHỨC NĂNG AI

### 3.1. AI Ingredient Scanner (Quét Nguyên liệu từ Hình ảnh)

#### **Mô tả:**

Sử dụng AI để nhận diện nguyên liệu từ hình ảnh, giúp người dùng tạo danh sách nguyên liệu nhanh chóng mà không cần gõ tay.

#### **Quy trình hoạt động:**

1. Người dùng chụp ảnh hoặc chọn ảnh từ thư viện
2. Upload ảnh lên server
3. Server gọi API OpenAI Vision hoặc Google Cloud Vision
4. AI phân tích ảnh và nhận diện các nguyên liệu
5. Trả về danh sách nguyên liệu với:
   - Tên nguyên liệu
   - Số lượng ước tính (nếu có thể)
   - Độ tin cậy (confidence score: 0-1)
6. Người dùng review và chỉnh sửa kết quả
7. Thêm vào danh sách nguyên liệu của công thức

#### **Use Cases:**

- Quét ảnh giỏ nguyên liệu trên bàn bếp
- Quét ảnh trong siêu thị để tạo shopping list
- Quét ảnh từ sách dạy nấu ăn

#### **Công nghệ sử dụng:**

- **Primary:** OpenAI GPT-4 Vision API
- **Backup:** Google Cloud Vision API (Label Detection + Object Localization)

---

### 3.2. AI Recipe Generator (Tạo Công thức từ Mô tả)

#### **Mô tả:**

Người dùng mô tả món ăn muốn nấu (dạng text), AI tự động tạo công thức hoàn chỉnh.

#### **Quy trình hoạt động:**

1. Người dùng nhập mô tả (VD: "Món gà xào chua ngọt kiểu Thái")
2. Có thể thêm preferences:
   - Thời gian nấu mong muốn
   - Số người ăn
   - Độ khó (dễ, trung bình, khó)
   - Dietary restrictions (vegetarian, vegan, gluten-free...)
3. Gọi API OpenAI GPT-4
4. AI generate:
   - Tiêu đề món ăn
   - Mô tả
   - Danh sách nguyên liệu (tên, số lượng, đơn vị)
   - Các bước thực hiện chi tiết
   - Chef's tips
5. Hiển thị kết quả cho người dùng
6. Người dùng review, chỉnh sửa và lưu

#### **Công nghệ sử dụng:**

- OpenAI GPT-4 Turbo API (Chat Completions)
- Structured output (JSON format)

---

### 3.3. Smart Recipe Recommendations (Gợi ý Công thức Thông minh)

#### **Mô tả:**

Gợi ý công thức phù hợp dựa trên hành vi và sở thích của người dùng.

#### **Các loại gợi ý:**

**A. Gợi ý dựa trên lịch sử:**

- Phân tích công thức người dùng đã xem, thích, lưu
- Gợi ý công thức tương tự (cùng category, cùng ingredients)

**B. Gợi ý dựa trên nguyên liệu có sẵn:**

- Người dùng nhập danh sách nguyên liệu đang có
- Tìm công thức có thể nấu với nguyên liệu đó

**C. Personalized recommendations:**

- Học từ hành vi người dùng (collaborative filtering)
- Gợi ý công thức phổ biến trong cộng đồng
- Gợi ý từ những người mình follow

**D. Trending recipes:**

- Công thức được like/save nhiều nhất tuần này
- Công thức mới nổi

#### **Công nghệ sử dụng:**

- **Phase 1 (MVP):** Algorithm cơ bản (SQL queries, sorting)
- **Phase 2:** Machine Learning model (collaborative filtering)
- **Phase 3:** OpenAI Embeddings cho semantic search

---

### 3.4. Image Recognition for Recipe Categorization

#### **Mô tả:**

Tự động gợi ý category và tags khi người dùng upload ảnh món ăn.

#### **Quy trình hoạt động:**

1. Người dùng upload ảnh món ăn
2. AI phân tích ảnh và nhận diện món ăn
3. Tự động gợi ý:
   - Category (Breakfast, Lunch, Dinner, Dessert...)
   - Tags (Asian, Italian, Spicy, Vegetarian...)
4. Người dùng có thể chấp nhận hoặc chỉnh sửa

#### **Công nghệ sử dụng:**

- OpenAI GPT-4 Vision API
- Google Cloud Vision API (Label Detection)

---

## 👥 IV. CÁC ACTORS CỦA HỆ THỐNG

### 4.1. User (Người dùng)

#### **Mô tả:**

Người dùng chính của ứng dụng, đã đăng ký tài khoản.

#### **Quyền hạn:**

✅ Đăng ký, đăng nhập, quản lý tài khoản  
✅ Tạo, chỉnh sửa, xóa công thức của chính mình  
✅ Xem tất cả công thức công khai trong hệ thống  
✅ Tìm kiếm, lọc, sắp xếp công thức  
✅ Like/Unlike công thức  
✅ Save/Unsave công thức  
✅ Chia sẻ công thức  
✅ Follow/Unfollow người dùng khác  
✅ Xem profile của người khác  
✅ Cập nhật profile cá nhân (avatar, bio, tên)  
✅ Sử dụng AI Scanner để quét nguyên liệu  
✅ Sử dụng AI Generator để tạo công thức  
✅ Xem gợi ý công thức cá nhân hóa

#### **Hành vi điển hình:**

1. Đăng nhập vào app
2. Xem feed công thức mới nhất
3. Like/Save công thức yêu thích
4. Tìm kiếm công thức theo nguyên liệu
5. Tạo công thức mới và chia sẻ
6. Follow những người dùng có công thức hay
7. Quay lại xem công thức đã save để nấu

---

### 4.2. Content Creator (Người sáng tạo nội dung)

#### **Mô tả:**

User có nhiều followers, tạo nhiều công thức chất lượng cao, có ảnh hưởng trong cộng đồng.

#### **Đặc điểm:**

- Có nhiều followers (> 1000)
- Đăng công thức thường xuyên
- Công thức có nhiều likes và saves
- Ảnh chất lượng cao, mô tả chi tiết

#### **Quyền hạn:**

- Giống User thường
- **Có thể có:** Verified badge (✓) bên cạnh username
- **Future:** Featured on homepage, priority in recommendations

#### **Vai trò trong hệ thống:**

- Tạo nội dung chất lượng thu hút người dùng
- Tăng engagement trong cộng đồng
- Truyền cảm hứng cho người dùng khác

---

### 4.3. Guest (Khách - Chưa đăng nhập)

#### **Mô tả:**

Người dùng chưa đăng ký/đăng nhập, truy cập app lần đầu.

#### **Quyền hạn:**

✅ Xem danh sách công thức công khai (limited)  
✅ Xem chi tiết công thức  
❌ Không thể Like, Save, Comment  
❌ Không thể Follow user  
❌ Không thể tạo công thức  
❌ Không thể sử dụng AI features

#### **Mục đích:**

- Xem preview để quyết định đăng ký
- Đọc công thức từ link chia sẻ

#### **Flow:**

1. Mở app → Hiển thị một số công thức sample
2. Tap vào công thức → Hiển thị chi tiết
3. Tap Like/Save/Create → Redirect to Login/Register

---

### 4.4. Admin (Quản trị viên) - Future Feature

#### **Mô tả:**

Người quản lý hệ thống, kiểm duyệt nội dung.

#### **Quyền hạn:**

✅ Tất cả quyền của User  
✅ Xem, chỉnh sửa, xóa **bất kỳ** công thức nào  
✅ Quản lý người dùng:

- Xem danh sách tất cả users
- Khóa/mở khóa tài khoản
- Xóa user
  ✅ Quản lý nội dung:
- Kiểm duyệt công thức mới (nếu có moderation)
- Xóa công thức vi phạm
- Feature/Unfeature công thức
  ✅ Quản lý danh mục, tags  
  ✅ Xem thống kê, báo cáo:
- Số lượng users, recipes, likes, saves
- Traffic, engagement metrics
  ✅ Quản lý cài đặt hệ thống

#### **Truy cập:**

- Admin Panel (Web dashboard)
- Hoặc app với role-based access

---

## 💻 V. CÔNG NGHỆ SỬ DỤNG ĐỂ PHÁT TRIỂN ỨNG DỤNG

### 5.1. 🖥️ BACKEND (Server-side)

#### **Runtime & Framework**

| Công nghệ      | Version | Mục đích                                        |
| -------------- | ------- | ----------------------------------------------- |
| **Node.js**    | v20+    | JavaScript runtime cho server                   |
| **Express.js** | v4.19+  | Web framework, routing, middleware              |
| **TypeScript** | v5.4+   | Strongly-typed JavaScript, tăng độ tin cậy code |

#### **Database & ORM**

| Công nghệ     | Version | Mục đích                        |
| ------------- | ------- | ------------------------------- |
| **MySQL**     | v8.0+   | Relational database chính       |
| **Sequelize** | v6.37+  | ORM (Object-Relational Mapping) |
| **mysql2**    | v3.9+   | MySQL client cho Node.js        |

#### **Authentication & Security**

| Công nghệ        | Version | Mục đích                            |
| ---------------- | ------- | ----------------------------------- |
| **jsonwebtoken** | v9.0+   | JWT token generation & verification |
| **bcryptjs**     | v3.0+   | Password hashing (salt rounds: 10)  |
| **CORS**         | v2.8+   | Cross-Origin Resource Sharing       |

#### **File Upload**

| Công nghệ  | Version | Mục đích                                      |
| ---------- | ------- | --------------------------------------------- |
| **Multer** | v2.0+   | Multipart/form-data handling cho upload files |

#### **Dependency Injection**

| Công nghệ  | Version | Mục đích                           |
| ---------- | ------- | ---------------------------------- |
| **Awilix** | v10.0+  | DI Container, quản lý dependencies |

#### **API Documentation**

| Công nghệ              | Version | Mục đích                                 |
| ---------------------- | ------- | ---------------------------------------- |
| **swagger-jsdoc**      | v6.2+   | Generate OpenAPI specs từ JSDoc comments |
| **swagger-ui-express** | v5.0+   | Serve Swagger UI documentation           |

#### **Utilities**

| Công nghệ  | Version | Mục đích                         |
| ---------- | ------- | -------------------------------- |
| **dotenv** | v16.4+  | Environment variables management |
| **uuid**   | v9.0+   | Generate unique IDs              |

#### **Development Tools**

| Công nghệ   | Version | Mục đích                               |
| ----------- | ------- | -------------------------------------- |
| **nodemon** | v3.1+   | Auto-reload khi code thay đổi          |
| **ts-node** | v10.9+  | Execute TypeScript directly            |
| **ESLint**  | Latest  | Code linting, enforce coding standards |

---

### 5.2. 📱 MOBILE APP (Frontend)

#### **Framework & Core**

| Công nghệ        | Version | Mục đích                                          |
| ---------------- | ------- | ------------------------------------------------- |
| **React Native** | v0.81+  | Cross-platform mobile development (iOS & Android) |
| **Expo**         | ~54.0   | Development platform, tooling, services           |
| **React**        | v19.1+  | UI library (declarative components)               |

#### **Navigation**

| Công nghệ                | Version | Mục đích                      |
| ------------------------ | ------- | ----------------------------- |
| **Expo Router**          | ~6.0    | File-based routing system     |
| **React Navigation**     | v7+     | Stack, Tab, Drawer navigation |
| **react-native-screens** | ~4.16   | Native screen optimization    |

#### **State Management**

| Công nghệ   | Version | Mục đích                              |
| ----------- | ------- | ------------------------------------- |
| **Zustand** | v5.0+   | Lightweight state management (stores) |

#### **Styling**

| Công nghệ       | Version | Mục đích                      |
| --------------- | ------- | ----------------------------- |
| **NativeWind**  | v4.2+   | Tailwind CSS cho React Native |
| **TailwindCSS** | v3.4+   | Utility-first CSS framework   |

#### **HTTP Client**

| Công nghệ | Version | Mục đích                             |
| --------- | ------- | ------------------------------------ |
| **Axios** | v1.13+  | Promise-based HTTP client, API calls |

#### **Storage**

| Công nghệ        | Version | Mục đích                           |
| ---------------- | ------- | ---------------------------------- |
| **AsyncStorage** | v2.2+   | Local storage cho tokens, settings |

#### **UI Components & Animations**

| Công nghệ                        | Version | Mục đích                                     |
| -------------------------------- | ------- | -------------------------------------------- |
| **Expo Vector Icons**            | v15+    | Icon library (FontAwesome, MaterialIcons...) |
| **React Native Gesture Handler** | ~2.28   | Touch gesture handling                       |
| **React Native Reanimated**      | ~4.1    | Smooth animations, 60fps                     |

#### **Media & Assets**

| Công nghệ             | Version | Mục đích                   |
| --------------------- | ------- | -------------------------- |
| **Expo Image Picker** | Latest  | Chọn ảnh từ gallery/camera |
| **Expo Font**         | ~14.0   | Custom fonts               |

#### **Development Tools**

| Công nghệ      | Version | Mục đích     |
| -------------- | ------- | ------------ |
| **TypeScript** | ~5.9    | Type safety  |
| **ESLint**     | v9+     | Code linting |

---

### 5.3. 🛠️ DevOps & Tools

#### **Version Control**

| Công nghệ  | Mục đích                              |
| ---------- | ------------------------------------- |
| **Git**    | Source code version control           |
| **GitHub** | Code repository, collaboration, CI/CD |

#### **Package Manager**

| Công nghệ          | Mục đích                      |
| ------------------ | ----------------------------- |
| **npm** / **yarn** | JavaScript package management |

#### **Testing (Future)**

| Công nghệ                        | Mục đích                     |
| -------------------------------- | ---------------------------- |
| **Jest**                         | JavaScript testing framework |
| **React Native Testing Library** | Component testing            |
| **Supertest**                    | API endpoint testing         |

#### **Code Quality**

| Công nghệ    | Mục đích                         |
| ------------ | -------------------------------- |
| **ESLint**   | Linting, code style enforcement  |
| **Prettier** | Code formatting                  |
| **Husky**    | Git hooks (pre-commit, pre-push) |

#### **Deployment**

| Service                                                       | Mục đích                    |
| ------------------------------------------------------------- | --------------------------- |
| **Backend Hosting:** Railway / Render / Heroku / AWS EC2      | Deploy Node.js backend      |
| **Database:** PlanetScale / AWS RDS / Railway                 | MySQL hosting               |
| **Mobile Build:** Expo EAS Build                              | Build Android APK & iOS IPA |
| **App Distribution:** App Store (iOS) / Google Play (Android) | Publish app                 |

---

### 5.4. 📊 Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    MOBILE APP (React Native + Expo)      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │   Screens   │  │  Components │  │   Stores    │     │
│  │  (Views)    │  │   (UI)      │  │  (Zustand)  │     │
│  └─────────────┘  └─────────────┘  └─────────────┘     │
│         │                  │                │            │
│         └──────────────────┴────────────────┘            │
│                         │                                │
│                  ┌──────▼──────┐                        │
│                  │ API Service │                        │
│                  │  (Axios)    │                        │
│                  └──────┬──────┘                        │
└─────────────────────────┼────────────────────────────────┘
                          │ HTTPS/REST API
                          │
┌─────────────────────────▼────────────────────────────────┐
│              BACKEND (Node.js + Express + TypeScript)     │
│  ┌───────────┐  ┌────────────┐  ┌──────────────┐        │
│  │  Routes   │→ │ Controllers│→ │   Services   │        │
│  └───────────┘  └────────────┘  └──────┬───────┘        │
│                                         │                │
│                                  ┌──────▼───────┐        │
│                                  │ Repositories │        │
│                                  └──────┬───────┘        │
│                                         │                │
│  ┌──────────────────────────────────────▼─────┐         │
│  │            Sequelize ORM                    │         │
│  └──────────────────┬──────────────────────────┘         │
└─────────────────────┼────────────────────────────────────┘
                      │
┌─────────────────────▼────────────────────────────────────┐
│                  MySQL Database                          │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐           │
│  │ Users  │ │Recipes │ │ Likes  │ │ Follows│           │
│  └────────┘ └────────┘ └────────┘ └────────┘           │
└──────────────────────────────────────────────────────────┘

      ┌──────────────────────────────────┐
      │   External APIs (AI Services)    │
      │  - OpenAI (GPT-4, Vision)        │
      │  - Google Cloud Vision           │
      │  - Cloudinary (Image Storage)    │
      └──────────────────────────────────┘
```

---

## 🌐 VI. API BÊN NGOÀI (EXTERNAL APIs)

### 6.1. OpenAI API

#### **Tổng quan**

OpenAI cung cấp các AI models mạnh mẽ cho xử lý ngôn ngữ tự nhiên và hình ảnh.

#### **Services sử dụng:**

**A. GPT-4 Vision API**

- **Mục đích:** AI Ingredient Scanner, nhận diện món ăn từ ảnh
- **Endpoint:** `https://api.openai.com/v1/chat/completions`
- **Model:** `gpt-4-vision-preview` hoặc `gpt-4o`
- **Input:** Image URL + Text prompt
- **Output:** JSON với danh sách nguyên liệu, món ăn nhận diện được
- **Use case:**
  - Quét ảnh nguyên liệu → trả về danh sách tên + số lượng
  - Upload ảnh món ăn → gợi ý category, tags

**B. GPT-4 Turbo API (Chat Completions)**

- **Mục đích:** AI Recipe Generator
- **Endpoint:** `https://api.openai.com/v1/chat/completions`
- **Model:** `gpt-4-turbo` hoặc `gpt-4o`
- **Input:** Text prompt (mô tả món ăn muốn nấu)
- **Output:** JSON structured response
  ```json
  {
    "title": "Gà Xào Chua Ngọt Kiểu Thái",
    "description": "...",
    "ingredients": [...],
    "steps": [...],
    "tips": "..."
  }
  ```
- **Use case:** Generate công thức từ mô tả của user

#### **Authentication:**

- API Key (Bearer Token)
- Lưu trong `.env`: `OPENAI_API_KEY=sk-...`
- Gửi trong header: `Authorization: Bearer sk-...`

#### **Pricing (Tham khảo - Feb 2026):**

| Service      | Giá                                                       |
| ------------ | --------------------------------------------------------- |
| GPT-4o       | ~$2.50 / 1M input tokens, ~$10 / 1M output tokens         |
| GPT-4 Turbo  | ~$10 / 1M input tokens, ~$30 / 1M output tokens           |
| GPT-4 Vision | ~$0.01 / image (low detail), ~$0.03 / image (high detail) |

#### **Free Tier:**

- Không có free tier
- Pay-as-you-go
- Có thể set usage limits để tránh chi phí quá cao

#### **Rate Limits:**

- Depends on account tier
- Typically: 3,500 - 10,000 requests/minute

---

### 6.2. Google Cloud Vision API

#### **Tổng quan**

Backup cho OpenAI Vision, dùng khi cần giảm chi phí hoặc tăng độ tin cậy.

#### **Services sử dụng:**

**A. Label Detection**

- **Mục đích:** Phát hiện objects/labels trong ảnh
- **Endpoint:** `https://vision.googleapis.com/v1/images:annotate`
- **Input:** Base64 encoded image
- **Output:** Danh sách labels với confidence score
- **Use case:** Nhận diện nguyên liệu từ ảnh

**B. Object Localization**

- **Mục đích:** Xác định vị trí của objects trong ảnh
- **Use case:** Đếm số lượng nguyên liệu trong ảnh

**C. Text Detection (OCR)**

- **Mục đích:** Đọc text từ ảnh (nếu cần đọc nhãn sản phẩm)
- **Use case:** Đọc thông tin dinh dưỡng từ bao bì

#### **Authentication:**

- Google Cloud Service Account
- JSON key file
- API Key (alternative)

#### **Pricing:**

| Feature             | Free Tier            | Giá sau free tier    |
| ------------------- | -------------------- | -------------------- |
| Label Detection     | 1,000 requests/month | $1.50 / 1,000 images |
| Object Localization | 1,000 requests/month | $1.50 / 1,000 images |
| Text Detection      | 1,000 requests/month | $1.50 / 1,000 images |

#### **Rate Limits:**

- 1,800 requests/minute (default)

---

### 6.3. Cloudinary (Image Storage & Optimization)

#### **Tổng quan**

Cloud-based image and video management platform.

#### **Features sử dụng:**

**A. Image Upload**

- Upload ảnh từ mobile app hoặc backend
- Hỗ trợ: Direct upload, signed upload, unsigned upload
- Auto-generate unique URL

**B. Image Transformation**

- Resize, crop ảnh tự động
- Format conversion (JPEG → WebP)
- Quality optimization
- Watermark (future)

**C. CDN Delivery**

- Phân phối ảnh qua CDN toàn cầu
- Tốc độ tải nhanh
- Auto-cache

#### **Use case trong app:**

- Lưu trữ avatar người dùng
- Lưu trữ ảnh món ăn (recipe images)
- Lưu trữ ảnh các bước nấu (step images)

#### **Authentication:**

- Cloud Name
- API Key
- API Secret

#### **Pricing:**

| Tier | Storage | Bandwidth    | Transformations | Giá       |
| ---- | ------- | ------------ | --------------- | --------- |
| Free | 25 GB   | 25 GB/month  | 25,000/month    | $0        |
| Plus | 250 GB  | 250 GB/month | 250,000/month   | $99/month |

**Khuyến nghị:** Bắt đầu với Free tier

---

### 6.4. AWS S3 (Alternative cho Cloudinary)

#### **Tổng quan**

Amazon Simple Storage Service - Object storage service.

#### **Features:**

- Upload/download files
- Bucket permissions (public/private)
- Lifecycle policies (auto-delete old files)
- CDN integration (CloudFront)

#### **Use case:**

- Lưu trữ ảnh (tương tự Cloudinary)
- Backup database

#### **Pricing:**

| Service           | Giá                              |
| ----------------- | -------------------------------- |
| Storage           | $0.023 / GB / month (first 50TB) |
| PUT requests      | $0.005 / 1,000 requests          |
| GET requests      | $0.0004 / 1,000 requests         |
| Data transfer OUT | $0.09 / GB (first 10TB)          |

**Free Tier (12 tháng đầu):**

- 5 GB storage
- 20,000 GET requests
- 2,000 PUT requests

---

### 6.5. Firebase Cloud Messaging (FCM) - Future Feature

#### **Tổng quan**

Push notification service cho mobile apps.

#### **Use case:**

- Thông báo khi có người like công thức của bạn
- Thông báo khi có người follow bạn
- Thông báo khi người bạn follow đăng công thức mới
- Reminder: "Bạn chưa tạo công thức tuần này"

#### **Features:**

- Send notification to specific device
- Send to topic (broadcast)
- Data messages
- Scheduled notifications

#### **Pricing:**

- **Hoàn toàn miễn phí**

#### **Platform support:**

- iOS (APNs)
- Android (FCM)
- Web (service workers)

---

### 6.6. SendGrid / AWS SES (Email Service) - Future Feature

#### **Tổng quan**

Email delivery service cho transactional emails.

#### **Use case:**

- Email xác thực khi đăng ký
- Email reset password
- Email thông báo (alternative cho push notification)
- Weekly newsletter (công thức nổi bật)

#### **SendGrid:**

| Tier       | Emails/day    | Giá       |
| ---------- | ------------- | --------- |
| Free       | 100           | $0        |
| Essentials | 100,000/month | $15/month |

#### **AWS SES:**

- $0.10 / 1,000 emails
- Free tier: 62,000 emails/month (khi gửi từ EC2)

---

### 6.7. API Integration Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    MOBILE APP                           │
└────────────────────┬────────────────────────────────────┘
                     │
                     │ REST API
                     ▼
┌─────────────────────────────────────────────────────────┐
│                  BACKEND SERVER                         │
│                                                         │
│  ┌──────────────────────────────────────────────┐      │
│  │          AI Service Layer                    │      │
│  │  ┌────────────┐  ┌────────────┐             │      │
│  │  │  scanImage │  │ generateRec│             │      │
│  │  └─────┬──────┘  └─────┬──────┘             │      │
│  └────────┼───────────────┼────────────────────┘      │
│           │               │                            │
│           ▼               ▼                            │
│  ┌────────────────┐ ┌──────────────┐                  │
│  │  OpenAI API    │ │  Google CV   │                  │
│  │  Integration   │ │  Integration │                  │
│  └────────────────┘ └──────────────┘                  │
│                                                         │
│  ┌──────────────────────────────────────────────┐      │
│  │        Upload Service Layer                  │      │
│  │  ┌────────────┐  ┌────────────┐             │      │
│  │  │ uploadImage│  │ deleteImage│             │      │
│  │  └─────┬──────┘  └────────────┘             │      │
│  └────────┼─────────────────────────────────────┘      │
│           │                                            │
│           ▼                                            │
│  ┌────────────────┐                                    │
│  │  Cloudinary    │                                    │
│  │  / AWS S3      │                                    │
│  └────────────────┘                                    │
└─────────────────────────────────────────────────────────┘
```

---

## 📝 VII. NOTES & RECOMMENDATIONS

### 7.1. Về AI Features

#### **Chi phí:**

- OpenAI API có chi phí cao
- **Khuyến nghị Phase 1 (MVP):**
  - Implement UI/UX cho AI features
  - Dùng **mock data** để demo
  - Chỉ integrate API thật khi có budget hoặc demo cho khách hàng

#### **Alternatives:**

- Google Cloud Vision có free tier tốt (1000 requests/month)
- Có thể kết hợp: Dùng Google CV cho basic tasks, OpenAI cho advanced tasks

---

### 7.2. Về Image Storage

#### **Khuyến nghị:**

- **Phase 1:** Dùng Cloudinary free tier (25GB)
- Compress ảnh trước khi upload (giảm 50-70% dung lượng)
- Set image quality: 80-85% (đủ đẹp, nhẹ hơn)
- Resize ảnh về kích thước chuẩn (VD: max width 1080px)

---

### 7.3. Về Security

#### **Best Practices:**

- **NEVER** commit `.env` file lên Git
- Sử dụng `.env.example` để team biết cần config gì
- Rotate API keys định kỳ
- Implement rate limiting để tránh abuse
- Validate tất cả input từ client
- Sanitize data trước khi lưu vào DB

---

### 7.4. Về Performance

#### **Backend:**

- Sử dụng pagination cho list APIs (limit 20-50 items/page)
- Index các columns hay query (user_id, created_at, category)
- Cache kết quả thường dùng (Redis - future)
- Optimize database queries (avoid N+1 problem)

#### **Mobile:**

- Lazy load images (load khi scroll đến)
- Cache images locally
- Debounce search input (300-500ms)
- Implement infinite scroll (tốt hơn pagination buttons)

---

## 🎯 VIII. SUMMARY

### Tóm tắt dự án:

**DishGram** là một ứng dụng mạng xã hội chia sẻ công thức nấu ăn với các tính năng:

✅ **Chức năng cơ bản:** Auth, Profile, Recipe CRUD, Feed, Search, Social (Like/Save/Follow)

🤖 **Chức năng AI:**

- Quét nguyên liệu từ ảnh (OpenAI Vision / Google Cloud Vision)
- Tạo công thức từ mô tả (GPT-4)
- Gợi ý công thức thông minh
- Nhận diện món ăn tự động

👥 **Actors:** User, Content Creator, Guest, Admin (future)

💻 **Tech Stack:**

- **Backend:** Node.js + Express + TypeScript + MySQL + Sequelize
- **Mobile:** React Native + Expo + Zustand + NativeWind
- **AI:** OpenAI API, Google Cloud Vision
- **Storage:** Cloudinary / AWS S3
- **Notifications:** FCM (future)

🌐 **External APIs:**

- OpenAI (GPT-4, Vision)
- Google Cloud (Vision, Speech-to-Text)
- Cloudinary (Image storage)
- AWS S3 (Alternative)
- Firebase, SendGrid (Future)

---

**Tài liệu này sẽ được cập nhật khi có thay đổi trong dự án.**

---

_Ngày tạo: 03/02/2026_  
_Version: 1.0_

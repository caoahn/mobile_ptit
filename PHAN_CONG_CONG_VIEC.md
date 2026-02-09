# BẢN PHÂN CÔNG CÔNG VIỆC DỰ ÁN - DISHGRAM

**Dự án:** DishGram - Ứng dụng mạng xã hội chia sẻ công thức nấu ăn  
**Ngày lập:** 03/02/2026  
**Nhóm phát triển:** 4 thành viên

---

## 📋 I. TỔNG QUAN DỰ ÁN

### 1.1. Mô tả dự án

DishGram là một ứng dụng mạng xã hội cho phép người dùng:

- Tạo và chia sẻ công thức nấu ăn
- Khám phá công thức từ cộng đồng
- Lưu trữ công thức yêu thích
- Quét nguyên liệu từ hình ảnh sử dụng AI
- Dịch cuộc họp/âm thanh thời gian thực (tính năng bổ sung)
- Tương tác xã hội (theo dõi, thích, bình luận)

---

## 🎯 II. CÁC CHỨC NĂNG CƠ BẢN

### 2.1. Quản lý tài khoản & Xác thực (Authentication)

- ✅ Đăng ký tài khoản (email, username, password)
- ✅ Đăng nhập/Đăng xuất
- ✅ Quên mật khẩu & đặt lại mật khẩu
- ✅ Xác thực JWT (Access Token & Refresh Token)
- ✅ Quản lý phiên đăng nhập

### 2.2. Quản lý hồ sơ người dùng (User Profile)

- ✅ Xem thông tin cá nhân
- ✅ Cập nhật thông tin (tên, bio, avatar)
- ✅ Theo dõi/Bỏ theo dõi người dùng khác
- ✅ Xem danh sách following/followers
- ✅ Xem công thức đã tạo của người dùng

### 2.3. Quản lý công thức (Recipe Management)

- ✅ Tạo công thức mới
  - Tiêu đề, mô tả, hình ảnh
  - Danh mục (Breakfast, Lunch, Dinner, Dessert...)
  - Thời gian chuẩn bị & nấu
  - Số phần ăn
  - Danh sách nguyên liệu (tên, số lượng, đơn vị)
  - Các bước thực hiện (có hình ảnh minh họa)
  - Mẹo nhỏ (Chef's Tips)
- ✅ Chỉnh sửa công thức
- ✅ Xóa công thức
- ✅ Xem chi tiết công thức

### 2.4. Khám phá & Tìm kiếm (Discovery & Search)

- ✅ Feed công thức (Home feed)
  - Sắp xếp theo thời gian tạo
  - Phân trang (infinite scroll)
- ✅ Tìm kiếm công thức
  - Theo tên món ăn
  - Theo nguyên liệu
  - Theo danh mục
  - Theo tác giả
- ✅ Lọc công thức (filter)
  - Theo thời gian chuẩn bị
  - Theo độ khó
  - Theo đánh giá

### 2.5. Tương tác xã hội (Social Interactions)

- ✅ Thích (Like) công thức
- ✅ Lưu (Save/Bookmark) công thức
- ✅ Chia sẻ công thức
- ✅ Xem danh sách công thức đã lưu
- ✅ Đếm số lượt thích, lưu

### 2.6. Upload & Quản lý Media

- ✅ Upload hình ảnh (avatar, recipe images, step images)
- ✅ Validation file (size, format)
- ✅ Lưu trữ URL hình ảnh

---

## 🤖 III. CÁC CHỨC NĂNG AI

### 3.1. Quét nguyên liệu từ hình ảnh (AI Ingredient Scanner)

- 🔄 **Công nghệ:** OpenAI Vision API / Google Cloud Vision API
- **Tính năng:**
  - Chụp hoặc tải ảnh nguyên liệu lên
  - AI nhận diện tên nguyên liệu
  - Ước lượng số lượng (nếu có thể)
  - Trả về danh sách nguyên liệu với độ tin cậy
  - Cho phép người dùng chỉnh sửa kết quả

### 3.2. Dịch âm thanh/cuộc họp thời gian thực (Meeting Transcription)

- 🔄 **Công nghệ:** Whisper API (OpenAI) hoặc Google Speech-to-Text
- **Tính năng:**
  - Tạo phòng họp
  - Ghi âm thời gian thực
  - Dịch âm thanh sang văn bản (Speech-to-Text)
  - Hỗ trợ đa ngôn ngữ
  - Lưu trữ bản ghi và transcript
  - Chia sẻ phòng họp với người khác (mã phòng)

### 3.3. Gợi ý công thức thông minh (Recipe Recommendation)

- 🔄 **Công nghệ:** AI Model hoặc Algorithm cơ bản
- **Tính năng:**
  - Gợi ý công thức dựa trên lịch sử xem
  - Gợi ý dựa trên nguyên liệu có sẵn
  - Personalized recommendations

### 3.4. Tạo công thức từ mô tả (AI Recipe Generator)

- 🔄 **Công nghệ:** GPT-4 API
- **Tính năng:**
  - Người dùng mô tả món ăn muốn nấu
  - AI tự động tạo công thức hoàn chỉnh
  - Bao gồm nguyên liệu và các bước

---

## 👥 IV. CÁC ACTORS CỦA HỆ THỐNG

### 4.1. User (Người dùng thường)

**Vai trò:** Sử dụng ứng dụng để tạo, chia sẻ, khám phá công thức
**Quyền hạn:**

- Đăng ký, đăng nhập
- Tạo, chỉnh sửa, xóa công thức của chính mình
- Xem, tìm kiếm công thức của người khác
- Thích, lưu, chia sẻ công thức
- Theo dõi người dùng khác
- Cập nhật hồ sơ cá nhân
- Sử dụng AI Scanner để quét nguyên liệu
- Tạo và tham gia phòng họp/dịch

### 4.2. Content Creator (Người sáng tạo nội dung)

**Vai trò:** User nhưng có nhiều followers, tạo nhiều công thức chất lượng
**Quyền hạn:** Giống User + Có badge/verified status (nếu implement)

### 4.3. Admin (Quản trị viên) - Future feature

**Vai trò:** Quản lý hệ thống, kiểm duyệt nội dung
**Quyền hạn:**

- Xem, xóa bất kỳ công thức nào
- Quản lý người dùng (khóa/mở khóa tài khoản)
- Xem thống kê, báo cáo
- Quản lý danh mục, tags

### 4.4. Guest (Khách) - Future feature

**Vai trò:** Người dùng chưa đăng nhập
**Quyền hạn:**

- Xem công thức công khai
- Không thể tương tác (like, save, comment)

---

## 💻 V. CÔNG NGHỆ SỬ DỤNG ĐỂ PHÁT TRIỂN ỨNG DỤNG

### 5.1. Backend (Server-side)

#### **Framework & Runtime**

- **Node.js** (v20+): JavaScript runtime
- **Express.js** (v4.19+): Web framework cho Node.js
- **TypeScript** (v5.4+): Strongly-typed JavaScript

#### **Database**

- **MySQL** (v8.0+): Relational database
- **Sequelize ORM** (v6.37+): Object-Relational Mapping

#### **Authentication & Security**

- **JWT (jsonwebtoken)**: Token-based authentication
- **bcryptjs**: Password hashing
- **CORS**: Cross-Origin Resource Sharing

#### **File Upload**

- **Multer** (v2.0+): Multipart/form-data handling

#### **Real-time Communication**

- **Socket.IO** (v4.7+): WebSocket library cho real-time communication

#### **Dependency Injection**

- **Awilix** (v10.0+): DI container

#### **API Documentation**

- **Swagger (swagger-jsdoc, swagger-ui-express)**: OpenAPI documentation

#### **Development Tools**

- **Nodemon**: Auto-reload khi development
- **ts-node**: TypeScript execution
- **ESLint**: Code linting

---

### 5.2. Mobile App (Frontend)

#### **Framework & Library**

- **React Native** (v0.81+): Cross-platform mobile framework
- **Expo** (~54.0): React Native development platform
- **React** (v19.1+): UI library

#### **Navigation**

- **Expo Router** (~6.0): File-based routing
- **React Navigation**: Native navigation

#### **State Management**

- **Zustand** (v5.0+): Lightweight state management

#### **Styling**

- **NativeWind** (v4.2+): Tailwind CSS for React Native
- **TailwindCSS** (v3.4+): Utility-first CSS framework

#### **HTTP Client**

- **Axios** (v1.13+): Promise-based HTTP client

#### **Storage**

- **AsyncStorage** (@react-native-async-storage): Local storage

#### **UI Components**

- **Expo Vector Icons**: Icon library
- **React Native Gesture Handler**: Gesture handling
- **React Native Reanimated**: Animation library

#### **Development Tools**

- **TypeScript**: Type safety
- **ESLint**: Code linting

---

### 5.3. DevOps & Tools

#### **Version Control**

- **Git**: Version control system
- **GitHub/GitLab**: Code repository

#### **Package Manager**

- **npm/yarn**: JavaScript package manager

#### **Environment Variables**

- **dotenv**: Environment configuration

#### **Testing** (Future)

- **Jest**: JavaScript testing framework
- **React Native Testing Library**: Component testing

#### **Deployment** (Future)

- **Backend:** Railway / Render / Heroku / AWS EC2
- **Database:** PlanetScale / AWS RDS
- **Mobile:** Expo EAS Build + App Store / Google Play

---

## 🌐 VI. API BÊN NGOÀI (EXTERNAL APIs)

### 6.1. OpenAI API

**Mục đích:** AI Ingredient Scanner, Recipe Generation, Text Analysis  
**Endpoints sử dụng:**

- **GPT-4 Vision API**: Nhận diện nguyên liệu từ hình ảnh
- **GPT-4 Chat Completions**: Tạo công thức từ mô tả
- **Whisper API**: Speech-to-Text cho meeting transcription

**Pricing:** Pay-per-use

- GPT-4 Vision: ~$0.01/image
- GPT-4 Turbo: ~$0.01/1K tokens
- Whisper: ~$0.006/minute

**Authentication:** API Key (Bearer Token)

---

### 6.2. Google Cloud Vision API (Alternative)

**Mục đích:** Nhận diện đối tượng trong hình ảnh (backup cho OpenAI)  
**Features:**

- Label Detection: Phát hiện nhãn/đối tượng
- Object Localization: Xác định vị trí đối tượng
- Text Detection: OCR (nếu cần đọc chữ trên bao bì)

**Pricing:** Free tier: 1000 requests/month

---

### 6.3. Google Speech-to-Text API (Alternative)

**Mục đích:** Dịch âm thanh sang văn bản cho meeting feature  
**Features:**

- Real-time streaming recognition
- Hỗ trợ 125+ ngôn ngữ
- Tự động phát hiện ngôn ngữ

**Pricing:** Free tier: 60 minutes/month

---

### 6.4. Cloudinary / AWS S3 (Image Storage)

**Mục đích:** Lưu trữ hình ảnh (avatar, recipe images)  
**Features:**

- Upload và lưu trữ ảnh
- Tự động optimize, resize ảnh
- CDN delivery

**Cloudinary:**

- Free tier: 25GB storage, 25GB bandwidth/month

**AWS S3:**

- Pay-as-you-go: ~$0.023/GB storage

---

### 6.5. Firebase Cloud Messaging (FCM) - Future

**Mục đích:** Push notifications  
**Features:**

- Gửi thông báo đến thiết bị mobile
- Thông báo khi có người thích, comment, follow

**Pricing:** Free

---

### 6.6. SendGrid / AWS SES (Email Service) - Future

**Mục đích:** Gửi email xác thực, đặt lại mật khẩu  
**SendGrid:**

- Free tier: 100 emails/day

**AWS SES:**

- $0.10/1000 emails

---

## 👨‍💻 VII. PHÂN CÔNG CÔNG VIỆC CHI TIẾT

### 📊 Phân công theo chức năng

---

## **THÀNH VIÊN 1: CAO TUẤN ANH**

### 🎯 Vai trò: **Backend Lead & Authentication Specialist**

### Công việc chi tiết:

#### **A. Authentication & Authorization System (100%)**

- [ ] **A1. User Registration API**
  - Endpoint: `POST /api/auth/register`
  - Validate email, username, password
  - Hash password với bcrypt
  - Tạo user record trong database
  - Response: user info (không có password)
  - Thời gian: **2 ngày**

- [ ] **A2. User Login API**
  - Endpoint: `POST /api/auth/login`
  - Xác thực email & password
  - Generate JWT access token (1 hour expiry)
  - Generate JWT refresh token (7 days expiry)
  - Lưu refresh token vào database
  - Response: tokens + user info
  - Thời gian: **2 ngày**

- [ ] **A3. Refresh Token API**
  - Endpoint: `POST /api/auth/refresh-token`
  - Verify refresh token
  - Check token trong DB (chưa bị revoke)
  - Generate new access & refresh token
  - Invalidate old refresh token
  - Thời gian: **1 ngày**

- [ ] **A4. Logout API**
  - Endpoint: `POST /api/auth/logout`
  - Revoke refresh token trong database
  - Thời gian: **0.5 ngày**

- [ ] **A5. Forgot Password & Reset Password**
  - Endpoint: `POST /api/auth/forgot-password`
  - Endpoint: `POST /api/auth/reset-password`
  - Generate reset token
  - (Optional) Gửi email với reset link
  - Xác thực token và update password
  - Thời gian: **2 ngày**

- [ ] **A6. Auth Middleware**
  - Middleware xác thực JWT token
  - Attach user info vào request
  - Handle token expiration, invalid token
  - Thời gian: **1 ngày**

#### **B. User Management System (100%)**

- [ ] **B1. Get User Profile API**
  - Endpoint: `GET /api/users/:userId`
  - Lấy thông tin user (public info)
  - Bao gồm stats: số công thức, followers, following
  - Thời gian: **1 ngày**

- [ ] **B2. Update User Profile API**
  - Endpoint: `PUT /api/users/profile`
  - Cập nhật: full_name, bio, avatar_url
  - Validation input
  - Thời gian: **1.5 ngày**

- [ ] **B3. Get Current User API**
  - Endpoint: `GET /api/users/me`
  - Lấy thông tin user đang đăng nhập
  - Thời gian: **0.5 ngày**

#### **C. Database Setup (Phụ trách chính)**

- [ ] **C1. Setup MySQL Database**
  - Tạo database schema
  - Setup Sequelize ORM
  - Config database connection
  - Thời gian: **1 ngày**

- [ ] **C2. User & Token Models**
  - Model: User (id, username, email, password_hash, full_name, bio, avatar_url)
  - Model: RefreshToken (id, user_id, token_hash, expires_at)
  - Sequelize associations
  - Thời gian: **1 ngày**

#### **D. Server Setup & Configuration**

- [ ] **D1. Express Server Setup**
  - Setup Express app
  - CORS configuration
  - Body parser, JSON middleware
  - Error handling middleware
  - Thời gian: **1 ngày**

- [ ] **D2. Environment Configuration**
  - Setup .env file
  - Config: DB connection, JWT secret, PORT
  - Thời gian: **0.5 ngày**

- [ ] **D3. Dependency Injection Container (Awilix)**
  - Setup DI container
  - Register services, repositories
  - Thời gian: **1 ngày**

#### **E. Testing & Documentation**

- [ ] **E1. API Testing (Postman/Thunder Client)**
  - Test tất cả auth endpoints
  - Tạo test cases
  - Thời gian: **1 ngày**

- [ ] **E2. Swagger Documentation**
  - Setup Swagger
  - Document auth APIs
  - Document user APIs
  - Thời gian: **1 ngày**

### ⏱️ **Tổng thời gian ước tính: 18 ngày**

---

## **THÀNH VIÊN 2: LÊ MINH BÁU**

### 🎯 Vai trò: **Backend Developer & Recipe System Specialist**

### Công việc chi tiết:

#### **A. Recipe Management System (100%)**

- [ ] **A1. Create Recipe API**
  - Endpoint: `POST /api/recipes`
  - Input: title, description, image_url, category, prep_time, cook_time, servings, tips
  - Tạo recipe record
  - Tạo ingredients records (batch insert)
  - Tạo recipe_steps records (batch insert)
  - Transaction handling (rollback nếu lỗi)
  - Thời gian: **3 ngày**

- [ ] **A2. Get Recipe Detail API**
  - Endpoint: `GET /api/recipes/:recipeId`
  - Lấy recipe + ingredients + steps
  - Include user info (tác giả)
  - Include stats: likes, saves
  - Sequelize eager loading (include)
  - Thời gian: **1.5 ngày**

- [ ] **A3. Update Recipe API**
  - Endpoint: `PUT /api/recipes/:recipeId`
  - Chỉ tác giả mới được update
  - Update recipe info
  - Update ingredients (delete old, insert new)
  - Update steps (delete old, insert new)
  - Transaction handling
  - Thời gian: **2.5 ngày**

- [ ] **A4. Delete Recipe API**
  - Endpoint: `DELETE /api/recipes/:recipeId`
  - Chỉ tác giả mới được xóa
  - Cascade delete ingredients, steps, likes, saves
  - Thời gian: **1 ngày**

- [ ] **A5. Get User Recipes API**
  - Endpoint: `GET /api/users/:userId/recipes`
  - Lấy tất cả recipes của một user
  - Pagination (limit, offset)
  - Sort by created_at DESC
  - Thời gian: **1.5 ngày**

#### **B. Recipe Feed & Discovery (100%)**

- [ ] **B1. Get Recipe Feed API**
  - Endpoint: `GET /api/recipes/feed`
  - Lấy danh sách recipes (public)
  - Pagination (page, limit)
  - Sort by created_at DESC
  - Include user info, stats
  - Thời gian: **2 ngày**

- [ ] **B2. Search Recipes API**
  - Endpoint: `GET /api/recipes/search?q={query}`
  - Tìm theo title (LIKE query)
  - Tìm theo category
  - Tìm theo ingredient name (JOIN với ingredients table)
  - Pagination
  - Thời gian: **2.5 ngày**

- [ ] **B3. Filter Recipes API**
  - Endpoint: `GET /api/recipes?category={category}&maxPrepTime={time}`
  - Lọc theo category
  - Lọc theo prep_time, cook_time
  - Lọc theo servings
  - Combine với search
  - Thời gian: **2 ngày**

#### **C. Database Models (Recipe-related)**

- [ ] **C1. Recipe Model**
  - Schema: id, user_id, title, description, image_url, category, prep_time, cook_time, servings, tips, created_at, updated_at
  - Associations: belongsTo User, hasMany Ingredients, hasMany RecipeSteps, hasMany Likes, hasMany SavedRecipes
  - Thời gian: **1 ngày**

- [ ] **C2. Ingredient Model**
  - Schema: id, recipe_id, name, amount, unit
  - Association: belongsTo Recipe
  - Thời gian: **0.5 ngày**

- [ ] **C3. RecipeStep Model**
  - Schema: id, recipe_id, step_number, title, description, image_url
  - Association: belongsTo Recipe
  - Thời gian: **0.5 ngày**

#### **D. Social Interactions (Recipe-related)**

- [ ] **D1. Like Recipe API**
  - Endpoint: `POST /api/recipes/:recipeId/like`
  - Tạo like record
  - Tăng like count (hoặc count từ database)
  - Prevent duplicate like (unique constraint)
  - Thời gian: **1 ngày**

- [ ] **D2. Unlike Recipe API**
  - Endpoint: `DELETE /api/recipes/:recipeId/like`
  - Xóa like record
  - Thời gian: **0.5 ngày**

- [ ] **D3. Save Recipe API**
  - Endpoint: `POST /api/recipes/:recipeId/save`
  - Tạo saved_recipe record
  - Thời gian: **1 ngày**

- [ ] **D4. Unsave Recipe API**
  - Endpoint: `DELETE /api/recipes/:recipeId/save`
  - Xóa saved_recipe record
  - Thời gian: **0.5 ngày**

- [ ] **D5. Get Saved Recipes API**
  - Endpoint: `GET /api/users/me/saved-recipes`
  - Lấy danh sách recipes đã save
  - JOIN với recipes table
  - Pagination
  - Thời gian: **1.5 ngày**

#### **E. Database Models (Social)**

- [ ] **E1. Like Model**
  - Schema: user_id, recipe_id, created_at
  - Primary key: (user_id, recipe_id)
  - Associations
  - Thời gian: **0.5 ngày**

- [ ] **E2. SavedRecipe Model**
  - Schema: user_id, recipe_id, created_at
  - Primary key: (user_id, recipe_id)
  - Associations
  - Thời gian: **0.5 ngày**

### ⏱️ **Tổng thời gian ước tính: 22 ngày**

---

## **THÀNH VIÊN 3: LÊ THÙY ÁNH**

### 🎯 Vai trò: **Mobile Developer Lead & UI/UX Specialist**

### Công việc chi tiết:

#### **A. Authentication Screens (100%)**

- [ ] **A1. Login Screen**
  - UI: Email/Username input, Password input, Remember me checkbox
  - Form validation
  - Call API: `POST /api/auth/login`
  - Lưu tokens vào AsyncStorage
  - Navigate to Home sau khi login thành công
  - Error handling (sai password, user không tồn tại)
  - Thời gian: **2 ngày**

- [ ] **A2. Register Screen**
  - UI: Email, Username, Password, Confirm Password inputs
  - Form validation (email format, password match, min length)
  - Call API: `POST /api/auth/register`
  - Auto-login sau khi register thành công
  - Navigate to Home
  - Thời gian: **2 ngày**

- [ ] **A3. Forgot Password Screen**
  - UI: Email input
  - Call API: `POST /api/auth/forgot-password`
  - Hiển thị success message
  - Navigate to Login
  - Thời gian: **1 ngày**

- [ ] **A4. Auth State Management (Zustand)**
  - Store: authStore (user, tokens, isAuthenticated)
  - Actions: login, logout, register, refreshToken
  - Persist state với AsyncStorage
  - Thời gian: **1.5 ngày**

#### **B. User Profile Screens (100%)**

- [ ] **B1. Profile Screen (Own Profile)**
  - UI: Avatar, Username, Bio, Stats (recipes, followers, following)
  - Tab: My Recipes, Saved Recipes
  - Edit Profile button
  - Logout button
  - Call API: `GET /api/users/me`
  - Thời gian: **2.5 ngày**

- [ ] **B2. Edit Profile Screen**
  - UI: Avatar upload, Full name input, Bio textarea
  - Image picker (camera/gallery)
  - Call API: `PUT /api/users/profile`
  - Update authStore sau khi save
  - Thời gian: **2 ngày**

- [ ] **B3. User Profile Screen (Other Users)**
  - UI: Avatar, Username, Bio, Stats
  - Follow/Unfollow button
  - Tab: User's Recipes
  - Call API: `GET /api/users/:userId`
  - Call API: `POST /api/users/:userId/follow`
  - Thời gian: **2 ngày**

#### **C. Recipe Detail & View Screens (100%)**

- [ ] **C1. Recipe Detail Screen**
  - UI Sections:
    - Header: Image, Title, Author info
    - Stats: Prep time, Cook time, Servings
    - Ingredients list (checkable)
    - Steps (numbered, với hình ảnh nếu có)
    - Chef's Tips
    - Actions: Like, Save, Share buttons
  - Call API: `GET /api/recipes/:recipeId`
  - Call API: `POST /api/recipes/:recipeId/like`
  - Call API: `POST /api/recipes/:recipeId/save`
  - Thời gian: **3.5 ngày**

- [ ] **C2. Recipe Card Component (Reusable)**
  - UI: Image, Title, Author, Stats (likes, saves)
  - Tap to navigate to Recipe Detail
  - Sử dụng trong Feed, Search, Profile
  - Thời gian: **1.5 ngày**

#### **D. Navigation Setup (100%)**

- [ ] **D1. Auth Navigation**
  - Stack: Login, Register, Forgot Password
  - Thời gian: **0.5 ngày**

- [ ] **D2. Main Tab Navigation**
  - Tabs: Home (Feed), Discover, Create, Saved, Profile
  - Tab icons với Expo Vector Icons
  - Thời gian: **1 ngày**

- [ ] **D3. Navigation Guards**
  - Redirect to Login nếu chưa authenticated
  - Check auth state từ AsyncStorage khi app start
  - Thời gian: **1 ngày**

#### **E. Common UI Components (100%)**

- [ ] **E1. Button Component**
  - Variants: primary, secondary, outline
  - Loading state
  - Disabled state
  - Thời gian: **1 ngày**

- [ ] **E2. Input Component**
  - Props: placeholder, value, onChange, error
  - Variants: text, email, password
  - Error message display
  - Thời gian: **1 ngày**

- [ ] **E3. Container Component**
  - Safe area wrapper
  - Padding, margin helpers
  - Thời gian: **0.5 ngày**

- [ ] **E4. Loading Indicator**
  - Full screen loading
  - Inline loading spinner
  - Thời gian: **0.5 ngày**

#### **F. API Client Setup (100%)**

- [ ] **F1. Axios Client Configuration**
  - Base URL configuration
  - Request interceptor (attach JWT token)
  - Response interceptor (handle 401, refresh token)
  - Error handling
  - File: `src/services/api/client.ts`
  - Thời gian: **2 ngày**

- [ ] **F2. Auth API Service**
  - Functions: login, register, logout, forgotPassword
  - TypeScript types cho request/response
  - File: `src/services/api/auth.ts`
  - Thời gian: **1 ngày**

### ⏱️ **Tổng thời gian ước tính: 25 ngày**

---

## **THÀNH VIÊN 4: NGUYỄN THU ANH**

### 🎯 Vai trò: **Mobile Developer & Feature Integration Specialist**

### Công việc chi tiết:

#### **A. Home Feed & Discovery Screens (100%)**

- [ ] **A1. Home Feed Screen**
  - UI: List of Recipe Cards (infinite scroll)
  - Pull-to-refresh
  - Call API: `GET /api/recipes/feed?page={page}&limit=10`
  - Pagination logic (load more khi scroll đến cuối)
  - Empty state (khi chưa có recipes)
  - Thời gian: **3 ngày**

- [ ] **A2. Discover/Search Screen**
  - UI: Search bar, Category filters
  - Debounced search input
  - Call API: `GET /api/recipes/search?q={query}`
  - Display search results (RecipeCard list)
  - Recent searches (lưu local)
  - Thời gian: **2.5 ngày**

- [ ] **A3. Filter Modal/Sheet**
  - UI: Category picker, Prep time slider, Servings picker
  - Apply filters to search
  - Call API với query params
  - Thời gian: **2 ngày**

#### **B. Create & Edit Recipe Screens (100%)**

- [ ] **B1. Create Recipe Screen (Form - Part 1)**
  - UI Section 1: Basic Info
    - Title input
    - Description textarea
    - Category picker (dropdown)
    - Image upload (camera/gallery)
  - Form validation
  - Multi-step form (stepper UI)
  - Thời gian: **2.5 ngày**

- [ ] **B2. Create Recipe Screen (Form - Part 2)**
  - UI Section 2: Details
    - Prep time input (number)
    - Cook time input (number)
    - Servings input (number)
  - Thời gian: **1 ngày**

- [ ] **B3. Create Recipe Screen (Form - Part 3)**
  - UI Section 3: Ingredients
    - Dynamic form list (add/remove ingredients)
    - Input: Name, Amount, Unit
    - Reorderable list
  - Thời gian: **2 ngày**

- [ ] **B4. Create Recipe Screen (Form - Part 4)**
  - UI Section 4: Steps
    - Dynamic form list (add/remove steps)
    - Input: Step number, Title, Description, Image
    - Reorderable list
  - Thời gian: **2 ngày**

- [ ] **B5. Create Recipe Screen (Form - Part 5)**
  - UI Section 5: Tips & Preview
    - Tips textarea
    - Preview recipe button
    - Submit button
  - Call API: `POST /api/recipes`
  - Handle image upload
  - Navigate to Recipe Detail sau khi tạo thành công
  - Thời gian: **2 ngày**

- [ ] **B6. Edit Recipe Screen**
  - Tương tự Create Recipe Screen
  - Pre-fill form với data hiện tại
  - Call API: `PUT /api/recipes/:recipeId`
  - Thời gian: **2.5 ngày**

#### **C. Saved Recipes Screen (100%)**

- [ ] **C1. Saved Recipes Screen**
  - UI: List of saved Recipe Cards
  - Call API: `GET /api/users/me/saved-recipes`
  - Unsave action (swipe to delete hoặc button)
  - Empty state (chưa save recipe nào)
  - Thời gian: **2 ngày**

#### **D. Social Features (Mobile)**

- [ ] **D1. Follow System Integration**
  - Follow/Unfollow button component
  - Call API: `POST /api/users/:userId/follow`
  - Call API: `DELETE /api/users/:userId/follow`
  - Update UI sau khi follow/unfollow
  - Thời gian: **1.5 ngày**

- [ ] **D2. Followers/Following List Screen**
  - UI: List of users
  - Call API: `GET /api/users/:userId/followers`
  - Call API: `GET /api/users/:userId/following`
  - Navigate to User Profile khi tap
  - Thời gian: **2 ngày**

#### **E. Recipe API Service (Mobile)**

- [ ] **E1. Recipe API Service**
  - Functions: getRecipeFeed, getRecipeDetail, createRecipe, updateRecipe, deleteRecipe
  - Functions: searchRecipes, getSavedRecipes
  - Functions: likeRecipe, unlikeRecipe, saveRecipe, unsaveRecipe
  - TypeScript types
  - File: `src/services/api/recipe.ts`
  - Thời gian: **2.5 ngày**

#### **F. User API Service (Mobile)**

- [ ] **F1. User API Service**
  - Functions: getUserProfile, updateProfile, getCurrentUser
  - Functions: followUser, unfollowUser, getFollowers, getFollowing
  - TypeScript types
  - File: `src/services/api/user.ts`
  - Thời gian: **1.5 ngày**

#### **G. Image Upload Handling**

- [ ] **G1. Image Picker & Upload Utility**
  - Expo Image Picker integration
  - Compress image trước khi upload
  - Upload to server (hoặc Cloudinary)
  - Progress indicator
  - Thời gian: **2 ngày**

#### **H. State Management (Zustand Stores)**

- [ ] **H1. Recipe Store**
  - Store: recipes, currentRecipe, savedRecipes
  - Actions: fetchFeed, fetchRecipeDetail, createRecipe, likeRecipe, saveRecipe
  - Thời gian: **1.5 ngày**

- [ ] **H2. User Store**
  - Store: currentUser, visitedUser
  - Actions: fetchUserProfile, updateProfile, followUser
  - Thời gian: **1 ngày**

### ⏱️ **Tổng thời gian ước tính: 32 ngày**

---

## 📅 VIII. TIMELINE & MILESTONES

### Phase 1: Setup & Foundation (Tuần 1-2)

**Thời gian:** 10 ngày  
**Người phụ trách:** Tất cả

- **Cao Tuấn Anh:**
  - Database setup
  - Server setup
  - User & Token models
  - DI Container

- **Lê Minh Báu:**
  - Recipe, Ingredient, RecipeStep models
  - Like, SavedRecipe models

- **Lê Thùy Ánh:**
  - Project setup (Expo)
  - Common UI components (Button, Input, Container)
  - API Client configuration
  - Navigation setup

- **Nguyễn Thu Anh:**
  - TypeScript types setup
  - Zustand stores setup
  - Image upload utility

**Deliverable:** Project structure, Database schema, Basic UI components

---

### Phase 2: Authentication & User Management (Tuần 3-4)

**Thời gian:** 10 ngày  
**Người phụ trách:** Cao Tuấn Anh (Backend) + Lê Thùy Ánh (Mobile)

- **Backend (Cao Tuấn Anh):**
  - Auth APIs (Register, Login, Refresh, Logout, Forgot Password)
  - User APIs (Get profile, Update profile)
  - Auth middleware

- **Mobile (Lê Thùy Ánh):**
  - Login, Register, Forgot Password screens
  - Auth state management
  - Auth API service
  - Navigation guards

**Deliverable:** Hoàn chỉnh chức năng đăng ký, đăng nhập, quản lý user

---

### Phase 3: Recipe Management System (Tuần 5-7)

**Thời gian:** 15 ngày  
**Người phụ trách:** Lê Minh Báu (Backend) + Nguyễn Thu Anh (Mobile)

- **Backend (Lê Minh Báu):**
  - Recipe CRUD APIs
  - Recipe Feed, Search, Filter APIs
  - Like/Unlike, Save/Unsave APIs

- **Mobile (Nguyễn Thu Anh):**
  - Create/Edit Recipe screens (multi-step form)
  - Recipe API service
  - Recipe Store (Zustand)

**Deliverable:** Tạo, chỉnh sửa, xóa công thức

---

### Phase 4: Feed, Discovery & Social Features (Tuần 8-10)

**Thời gian:** 15 ngày  
**Người phụ trách:** Tất cả

- **Lê Thùy Ánh:**
  - Recipe Detail screen
  - Recipe Card component
  - Profile screens

- **Nguyễn Thu Anh:**
  - Home Feed screen
  - Search/Discover screen
  - Saved Recipes screen
  - Follow system integration

- **Backend Support (Cao Tuấn Anh & Lê Minh Báu):**
  - Follow/Unfollow APIs (nếu chưa có)
  - Bug fixes, optimization

**Deliverable:** Hoàn chỉnh MVP - Feed, Search, Profile, Social interactions

---

### Phase 5: AI Features Integration (Tuần 11-13)

**Thời gian:** 15 ngày  
**Người phụ trách:** Phân công sau

**AI Ingredient Scanner:**

- Backend: Tích hợp OpenAI Vision API
- Mobile: Screen quét nguyên liệu

**Meeting Transcription (Optional):**

- Backend: Meeting APIs, Socket.IO, Whisper API
- Mobile: Meeting room screens

**Người phụ trách:** Chưa phân công chi tiết, sẽ thảo luận lại sau Phase 4

---

### Phase 6: Testing, Polish & Deployment (Tuần 14-15)

**Thời gian:** 10 ngày  
**Người phụ trách:** Tất cả

- Integration testing
- Bug fixing
- UI/UX refinement
- Performance optimization
- Documentation
- Deployment (Backend + Mobile build)

---

## 📊 IX. PHÂN CÔNG TÓM TẮT

| Thành viên         | Vai trò chính     | Module phụ trách                                    | Thời gian ước tính |
| ------------------ | ----------------- | --------------------------------------------------- | ------------------ |
| **Cao Tuấn Anh**   | Backend Lead      | Authentication, User Management, Server Setup       | 18 ngày            |
| **Lê Minh Báu**    | Backend Developer | Recipe System, Social Interactions (Backend)        | 22 ngày            |
| **Lê Thùy Ánh**    | Mobile Lead       | Auth Screens, Profile, Recipe Detail, UI Components | 25 ngày            |
| **Nguyễn Thu Anh** | Mobile Developer  | Feed, Discovery, Create Recipe, Social (Mobile)     | 32 ngày            |

---

## 🎯 X. QUY TRÌNH LÀM VIỆC

### 10.1. Version Control (Git)

- **Main branch:** Code production-ready
- **Develop branch:** Code development
- **Feature branches:** `feature/<tên-chức-năng>`
- **Commit message format:** `[Module] Description` (VD: `[Auth] Add login API`)
- **Pull Request:** Cần 1 người review trước khi merge

### 10.2. Daily Workflow

1. **Daily Standup (10-15 phút):**
   - Hôm qua làm gì?
   - Hôm nay làm gì?
   - Có vấn đề gì cần support?

2. **Code Review:**
   - Mỗi PR cần ít nhất 1 người review
   - Review trong vòng 24h

3. **Testing:**
   - Test chức năng trước khi commit
   - Test integration khi merge các module

### 10.3. Communication

- **Tool:** Discord / Telegram / Zalo
- **Meeting:** 2 lần/tuần (Thứ 2, Thứ 5)
- **Documentation:** Cập nhật README, API docs

---

## ⚠️ XI. RỦI RO & GIẢI PHÁP

### Rủi ro 1: API bên ngoài (OpenAI) tốn phí

**Giải pháp:**

- Phase 1-4: Dùng mock data cho AI features
- Chỉ integrate API thật khi demo/production
- Sử dụng free tier của Google Cloud Vision (backup)

### Rủi ro 2: Timeline bị trễ

**Giải pháp:**

- Review progress mỗi tuần
- Adjust scope nếu cần (loại bỏ features không quan trọng)
- Ưu tiên MVP trước, AI features sau

### Rủi ro 3: Xung đột merge code

**Giải pháp:**

- Chia module rõ ràng, tránh edit cùng file
- Merge develop branch thường xuyên
- Code review kỹ

### Rủi ro 4: Thiếu kiến thức về công nghệ

**Giải pháp:**

- Pair programming khi gặp khó
- Share knowledge trong team
- Tận dụng tài liệu, tutorials

---

## 📌 XII. GHI CHÚ QUAN TRỌNG

1. **Code Quality:**
   - Tuân thủ coding convention (TypeScript, ESLint)
   - Write clean, readable code
   - Comment code khi cần thiết

2. **Security:**
   - KHÔNG commit .env file lên Git
   - KHÔNG hardcode sensitive data (API keys, passwords)
   - Validate mọi input từ client

3. **Performance:**
   - Optimize database queries (avoid N+1 problem)
   - Pagination cho list APIs
   - Image optimization trước khi upload

4. **Responsiveness:**
   - Test UI trên nhiều kích thước màn hình
   - Support cả iOS và Android

---

## ✅ XIII. CHECKLIST HOÀN THÀNH

### Backend

- [ ] Authentication system hoạt động
- [ ] Recipe CRUD APIs hoạt động
- [ ] Search & Filter APIs hoạt động
- [ ] Social APIs (like, save, follow) hoạt động
- [ ] Swagger documentation đầy đủ
- [ ] Database migrations & seeds
- [ ] Error handling middleware
- [ ] API testing (Postman collection)

### Mobile

- [ ] Auth screens hoạt động (login, register)
- [ ] Home feed hiển thị recipes
- [ ] Create/Edit recipe screens hoạt động
- [ ] Recipe detail screen đầy đủ thông tin
- [ ] Search & filter hoạt động
- [ ] Profile screens hoạt động
- [ ] Social features hoạt động (like, save, follow)
- [ ] Navigation flow mượt mà
- [ ] UI/UX polish

### Integration

- [ ] Mobile app kết nối thành công với Backend
- [ ] Authentication flow end-to-end
- [ ] Recipe flow end-to-end
- [ ] Social features end-to-end

---

## 🚀 XIV. NEXT STEPS

1. **Kick-off Meeting:**
   - Review bản phân công này
   - Thảo luận, điều chỉnh nếu cần
   - Confirm timeline

2. **Setup Environment:**
   - Clone repositories
   - Install dependencies
   - Setup database local

3. **Start Phase 1:**
   - Mỗi người bắt đầu tasks của mình
   - Daily standup từ ngày mai

---

**Lưu ý:** Bản phân công này là dự kiến ban đầu, có thể điều chỉnh linh hoạt theo tiến độ thực tế và khả năng của từng thành viên.

**Chúc team làm việc hiệu quả và hoàn thành dự án thành công! 🎉**

# Estimate Chức Năng React Native - Hệ Thống Dịch Cuộc Họp Thời Gian Thực

> **Dự án:** MVP Hệ thống dịch cuộc họp theo thời gian thực  
> **Platform:** React Native (iOS & Android)  
> **Ngày:** 17/01/2026

---

## **1. Authentication & User Management**

**Thời gian: 12-16 giờ**

### Màn hình & Chức năng:

- **Màn hình đăng ký (Register)**
  - Form: Email, Password, Confirm Password, Tên người dùng
  - Validation (email format, password strength)
  - Gửi OTP xác thực email (optional)
  - API: `POST /auth/register`
- **Màn hình đăng nhập (Login)**
  - Form: Email/Username, Password
  - Remember me checkbox
  - Link "Quên mật khẩu"
  - Social login (Google/Facebook - optional)
  - API: `POST /auth/login`
- **Màn hình quên mật khẩu (Forgot Password)**
  - Input email
  - Gửi OTP qua email
  - Verify OTP
  - Reset password form
  - API: `POST /auth/forgot-password`, `POST /auth/verify-otp`, `POST /auth/reset-password`
- **Màn hình đổi mật khẩu (Change Password)**
  - Form: Mật khẩu hiện tại, Mật khẩu mới, Xác nhận mật khẩu mới
  - Validation
  - API: `POST /auth/change-password`
- **Màn hình profile**
  - Hiển thị thông tin user (tên, email, avatar)
  - Edit profile
  - Logout
  - API: `GET /user/profile`, `PUT /user/profile`

### Token Management:

- Lưu JWT token vào AsyncStorage
- Auto refresh token khi expired
- Token interceptor cho API calls
- Auto logout khi token invalid
- Biometric authentication (FaceID/TouchID - optional)

### Tasks:

- [ ] Thiết kế UI các màn hình auth (Login, Register, Forgot Password)
- [ ] Form validation utilities
- [ ] Tích hợp API authentication
- [ ] JWT token management
- [ ] Secure storage (AsyncStorage encrypted)
- [ ] Auto refresh token mechanism
- [ ] Protected routes/navigation guards
- [ ] Session persistence
- [ ] Logout functionality
- [ ] Profile screen UI
- [ ] Social login integration (optional)
- [ ] Biometric authentication (optional)

---

## **2. Quản lý Phiên Họp (Meeting Management)**

**Thời gian: 8-12 giờ**

### Màn hình & Chức năng:

- **Màn hình tạo phòng họp mới**
  - Form nhập thông tin (tên cuộc họp, ngôn ngữ nguồn, ngôn ngữ đích)
  - Tạo meeting_id mới qua API
  - Navigation đến phòng họp
- **Màn hình tham gia phòng**
  - Input meeting_id
  - Validate và join phòng họp qua API
- **State Management**
  - Lưu meeting_id, language_source, language_target
  - Quản lý trạng thái kết nối

### Tasks:

- [ ] Thiết kế UI màn hình tạo phòng
- [ ] Thiết kế UI màn hình tham gia
- [ ] Tích hợp API tạo meeting
- [ ] Tích hợp API join meeting
- [ ] Validation form và error handling
- [ ] Navigation flow

---

## **3. Thu và Gửi Âm Thanh (Audio Recording)**

**Thời gian: 16-20 giờ**

### Chức năng:

- **Recording Module** (sử dụng `react-native-audio-recorder-player` hoặc `expo-av`)
  - Xin quyền microphone (iOS & Android)
  - Start/Stop recording
  - Hiển thị trạng thái đang ghi (waveform animation, timer)
  - Preview audio đã ghi
- **Audio Upload**
  - Convert audio sang định dạng .wav
  - Gửi audio chunk lên server (2-5 giây)
  - Upload audio file theo lượt phát biểu
  - Progress indicator khi upload
  - Error handling và retry logic

### Tasks:

- [ ] Setup thư viện audio recording
- [ ] Implement permission request
- [ ] Build recording UI component
- [ ] Implement start/stop recording logic
- [ ] Audio timer và waveform animation
- [ ] Audio file conversion
- [ ] Upload service với progress tracking
- [ ] Retry mechanism cho upload failures
- [ ] Testing trên iOS và Android

---

## **4. Hiển Thị Kết Quả Dịch (Real-time Display)**

**Thời gian: 12-16 giờ**

### UI Components:

- **Transcript View (Scrollable List)**
  - Hiển thị từng entry transcript theo timeline
  - Mỗi entry bao gồm:
    - Timestamp
    - Speaker turn number
    - Văn bản gốc (original_text)
    - Văn bản dịch (translated_text)
- **Real-time Update**
  - Auto-scroll khi có transcript mới
  - Loading indicator khi đang xử lý
  - Highlight entry mới nhất
- **Toggle View**
  - Chế độ xem chỉ bản dịch
  - Chế độ xem song song (gốc + dịch)
  - Chế độ xem chỉ ngôn ngữ gốc

### Tasks:

- [ ] Design transcript item component
- [ ] Implement FlatList/ScrollView với auto-scroll
- [ ] Real-time update mechanism (polling hoặc WebSocket)
- [ ] Loading states và animations
- [ ] Toggle view modes
- [ ] Timestamp formatting
- [ ] Empty state design
- [ ] Performance optimization (VirtualizedList)

---

## **5. Tích Hợp API (Backend Integration)**

**Thời gian: 8-12 giờ**

### API Services:

- **Authentication API**
  - `POST /auth/register` → đăng ký user mới
  - `POST /auth/login` → đăng nhập (trả về access_token + refresh_token)
  - `POST /auth/logout` → đăng xuất
  - `POST /auth/refresh-token` → làm mới access token
  - `POST /auth/forgot-password` → gửi OTP reset password
  - `POST /auth/verify-otp` → xác thực OTP
  - `POST /auth/reset-password` → đặt lại mật khẩu mới
  - `POST /auth/change-password` → đổi mật khẩu

- **User API**
  - `GET /user/profile` → lấy thông tin user
  - `PUT /user/profile` → cập nhật thông tin user
  - `POST /user/avatar` → upload avatar

- **Meeting API**
  - `POST /create-meeting` → tạo phòng mới (yêu cầu authentication)
  - `POST /join-meeting/:meeting_id` → tham gia phòng
  - `GET /meeting/:meeting_id` → lấy thông tin phòng
  - `GET /meetings/history` → lịch sử cuộc họp của user
- **Audio Processing API**
  - `POST /upload-audio` (multipart/form-data)
    - Body: audio file + meeting_id + speaker_turn
    - Response: { original_text, translated_text, timestamp }
- **Transcript API**
  - `GET /transcript/:meeting_id` → lấy toàn bộ biên bản
  - WebSocket (optional cho real-time) hoặc polling

### Tasks:

- [ ] Setup axios instance với base configuration
- [ ] Implement API service layer (auth, user, meeting, audio)
- [ ] JWT token interceptor (attach token to headers)
- [ ] Auto refresh token mechanism
- [ ] Authentication endpoints integration
- [ ] User profile endpoints
- [ ] Create meeting endpoints
- [ ] Audio upload với multipart/form-data
- [ ] Transcript fetching
- [ ] API error handling (401, 403, 500)
- [ ] Request/response interceptors
- [ ] Timeout configuration
- [ ] Retry logic cho failed requests

---

## **6. UI/UX Components**

**Thời gian: 12-16 giờ**

### Màn hình chính (Meeting Room):

- **Header**
  - Meeting ID display
  - Ngôn ngữ nguồn ↔ đích
  - Nút rời phòng/kết thúc
- **Center Content**
  - Transcript list/scroll view
  - Empty state khi chưa có transcript
- **Bottom Controls**
  - Nút ghi âm (Record/Stop) - lớn, nổi bật
  - Trạng thái recording (thời gian, animation)
  - Nút phát lại audio vừa ghi (optional)

- **Settings Panel**
  - Chọn ngôn ngữ nguồn/đích
  - Cài đặt âm thanh
  - Export transcript

### Tasks:

- [ ] Design system setup (colors, typography, spacing)
- [ ] Header component
- [ ] Recording button với animations
- [ ] Bottom controls bar
- [ ] Settings modal/screen
- [ ] Language picker component
- [ ] Confirmation dialogs
- [ ] Toast/Snackbar notifications
- [ ] Loading overlays

---

## **7. State Management & Storage**

**Thời gian: 6-8 giờ**

### Global State (Context API hoặc Redux):

- **Auth state**
  - user (id, email, name, avatar)
  - isAuthenticated
  - tokens (access_token, refresh_token)
  - loading states
- **Meeting state**
  - meeting_id, languages, status
  - participants
- **Transcript array** (danh sách tất cả entries)
- **Recording state** (isRecording, audioUri, duration)
- **Connection state** (loading, error)

### Secure Storage (react-native-keychain):

- JWT access token
- JWT refresh token
- User credentials (optional, nếu có "Remember me")

### Local Storage (AsyncStorage):

- User preferences (theme, language)
- Recent meeting_id
- Cache transcript (offline support)
- App settings

### Tasks:

- [ ] Setup Context API hoặc Redux store
- [ ] Define state structure (auth + meeting + transcript)
- [ ] Create actions/reducers cho authentication
- [ ] Implement Keychain utilities cho sensitive data
- [ ] Implement AsyncStorage utilities
- [ ] Auth persistence (auto-login)
- [ ] Cache management
- [ ] State hydration on app launch
- [ ] Clear state on logout

---

## **8. Error Handling & Edge Cases**

**Thời gian: 6-8 giờ**

### Xử lý:

- Network errors (upload failed, API timeout)
- Permission denied (microphone)
- Invalid meeting_id
- Audio recording errors
- Validation & user feedback (Toast/Alert)
- Retry mechanism cho API calls

### Tasks:

- [ ] Network error handling
- [ ] Permission flow (request, denied, settings)
- [ ] Form validation
- [ ] User-friendly error messages
- [ ] Retry logic với exponential backoff
- [ ] Offline mode handling
- [ ] Error boundary component
- [ ] Logging và debugging utilities

---

## **9. Testing & Polish**

**Thời gian: 8-12 giờ**

### Tasks:

- [ ] Unit tests cho utility functions
- [ ] Integration tests cho API calls
- [ ] Component testing với React Native Testing Library
- [ ] Manual testing trên iOS simulator/device
- [ ] Manual testing trên Android emulator/device
- [ ] Performance profiling
- [ ] Memory leak checks
- [ ] Accessibility testing (screen reader support)
- [ ] UI polish và animations
- [ ] Code review và refactoring

---

## **Tổng Estimate:**

| Chức năng                        | Giờ Thấp | Giờ Cao | Mức độ ưu tiên |
| -------------------------------- | -------- | ------- | -------------- |
| Authentication & User Management | 12       | 16      | Critical       |
| Quản lý phiên họp                | 8        | 12      | High           |
| Thu và gửi âm thanh              | 16       | 20      | Critical       |
| Hiển thị kết quả dịch            | 12       | 16      | Critical       |
| Tích hợp API                     | 8        | 12      | High           |
| UI/UX Components                 | 12       | 16      | Medium         |
| State Management                 | 6        | 8       | High           |
| Error Handling                   | 6        | 8       | Medium         |
| Testing & Polish                 | 8        | 12      | Medium         |
| **TỔNG**                         | **88**   | **120** |                |

### Thời gian ước tính:

- **Optimistic:** 88 giờ (~11 ngày làm việc)
- **Realistic:** 104 giờ (~13 ngày làm việc)
- **Pessimistic:** 120 giờ (~15 ngày làm việc)

---

## **Stack Công Nghệ Đề Xuất**

### Core:

- **Framework:** React Native 0.73+ (Expo hoặc React Native CLI)
- **Language:** TypeScript
- **Navigation:** React Navigation 6.x

### Audio:

- **Recording:** `react-native-audio-recorder-player` hoặc `expo-av`
- **Permissions:** `react-native-permissions`

### Authentication & Security:

- **Secure Storage:** `react-native-keychain` (cho tokens/credentials)
- **Biometric:** `react-native-biometrics` hoặc `expo-local-authentication`
- **Encryption:** `react-native-aes-crypto` (optional)

### Networking:

- **HTTP Client:** `axios`
- **Real-time (optional):** `socket.io-client`

### State Management:

- **Option 1:** Context API + useReducer (lightweight)
- **Option 2:** Redux Toolkit (scalable)

### Storage:

- **Local Storage:** `@react-native-async-storage/async-storage`

### UI Libraries (Optional):

- **Option 1:** React Native Paper (Material Design)
- **Option 2:** Native Base
- **Option 3:** Custom components với styled-components

### Dev Tools:

- **Testing:** Jest + React Native Testing Library
- **Linting:** ESLint + Prettier
- **Type Checking:** TypeScript

---

## **Phân Chia Sprint (Đề Xuất)**

### Sprint 0 (2-3 ngày): Setup & Authentication

- Setup project structure (TypeScript + Navigation)
- Design system basics
- Authentication screens (Login, Register, Forgot Password)
- JWT token management
- Protected navigation

### Sprint 1 (3-4 ngày): Meeting Management

- Meeting management screens (Create, Join)
- API integration layer
- Profile screen
- State management setup

### Sprint 2 (4-5 ngày): Core Features

- Audio recording implementation
- Audio upload functionality
- Transcript display
- Real-time updates

### Sprint 3 (3-4 ngày): Polish & Testing

- UI/UX improvements
- Error handling
- Comprehensive testing
- Bug fixes
- Performance optimization
- Security review

---

## **Rủi Ro và Giảm Thiểu**

| Rủi Ro                                | Mức độ | Giảm thiểu                                      |
| ------------------------------------- | ------ | ----------------------------------------------- |
| Token security và storage             | High   | Dùng react-native-keychain, không lưu plaintext |
| Audio recording khác biệt iOS/Android | High   | Testing sớm trên cả 2 nền tảng                  |
| Session management phức tạp           | Medium | Implement auto-refresh token mechanism          |
| File upload lớn timeout               | Medium | Implement chunked upload hoặc compression       |
| Performance với transcript dài        | Medium | VirtualizedList + pagination                    |
| Permission flow phức tạp              | Low    | Sử dụng library proven                          |
| Backend API chưa sẵn sàng             | Medium | Mock API để development song song               |
| Biometric auth iOS/Android khác nhau  | Low    | Sử dụng library cross-platform                  |

---

## **Notes:**

- Estimate trên giả định developer có kinh nghiệm React Native
- Chưa bao gồm thời gian setup môi trường phát triển
- Chưa bao gồm thời gian deploy và publishing lên stores
- Review và adjust estimate sau Sprint 1

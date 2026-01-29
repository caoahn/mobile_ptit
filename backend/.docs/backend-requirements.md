# Backend Requirements - Hệ Thống Dịch Cuộc Họp Thời Gian Thực

> **Technology Stack:** ExpressJS + MySQL  
> **Ngày:** 18/01/2026

---

## **1. Authentication & Authorization System**

### **1.1 User Registration**

- **Endpoint:** `POST /api/auth/register`
- **Request Body:**
  ```json
  {
    "email": "user@example.com",
    "username": "username",
    "password": "securePassword123",
    "confirmPassword": "securePassword123"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "message": "User registered successfully",
    "user": {
      "id": 1,
      "email": "user@example.com",
      "username": "username"
    }
  }
  ```
- **Database Tables:**
  - `users` (id, email, username, password_hash, created_at, updated_at, is_verified)

- **Business Logic:**
  - Validate email format
  - Check email uniqueness
  - Hash password với bcrypt (salt rounds: 10)
  - Tạo user record trong database
  - (Optional) Gửi email verification OTP

### **1.2 User Login**

- **Endpoint:** `POST /api/auth/login`
- **Request Body:**
  ```json
  {
    "email": "user@example.com",
    "password": "securePassword123"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "email": "user@example.com",
      "username": "username",
      "avatar_url": "https://..."
    }
  }
  ```
- **Database Tables:**
  - `refresh_tokens` (id, user_id, token_hash, expires_at, created_at)

- **Business Logic:**
  - Verify email và password
  - Generate JWT access token (expiry: 1 hour)
  - Generate JWT refresh token (expiry: 7 days)
  - Lưu refresh token hash vào database
  - Return tokens và user info

### **1.3 Refresh Token**

- **Endpoint:** `POST /api/auth/refresh-token`
- **Request Body:**
  ```json
  {
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "access_token": "new_access_token...",
    "refresh_token": "new_refresh_token..."
  }
  ```
- **Business Logic:**
  - Verify refresh token signature
  - Check token trong database (chưa bị revoke)
  - Generate new access token và refresh token
  - Invalidate old refresh token
  - Lưu new refresh token vào database

### **1.4 Logout**

- **Endpoint:** `POST /api/auth/logout`
- **Headers:** `Authorization: Bearer {access_token}`
- **Request Body:**
  ```json
  {
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "message": "Logged out successfully"
  }
  ```
- **Business Logic:**
  - Invalidate refresh token trong database
  - Clear session data

### **1.5 Forgot Password**

- **Endpoint:** `POST /api/auth/forgot-password`
- **Request Body:**
  ```json
  {
    "email": "user@example.com"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "message": "OTP sent to your email"
  }
  ```
- **Database Tables:**
  - `password_reset_tokens` (id, user_id, otp_hash, expires_at, created_at)

- **Business Logic:**
  - Verify email tồn tại
  - Generate 6-digit OTP
  - Hash OTP và lưu vào database (expiry: 10 phút)
  - Gửi OTP qua email (sử dụng nodemailer)

### **1.6 Verify OTP**

- **Endpoint:** `POST /api/auth/verify-otp`
- **Request Body:**
  ```json
  {
    "email": "user@example.com",
    "otp": "123456"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "reset_token": "temporary_reset_token..."
  }
  ```
- **Business Logic:**
  - Verify OTP hash trong database
  - Check expiration time
  - Generate temporary reset token (expiry: 15 phút)
  - Return reset token để dùng cho reset password

### **1.7 Reset Password**

- **Endpoint:** `POST /api/auth/reset-password`
- **Request Body:**
  ```json
  {
    "reset_token": "temporary_reset_token...",
    "new_password": "newSecurePassword123",
    "confirm_password": "newSecurePassword123"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "message": "Password reset successfully"
  }
  ```
- **Business Logic:**
  - Verify reset token
  - Validate new password
  - Hash new password
  - Update password trong database
  - Invalidate reset token
  - Invalidate all existing refresh tokens

### **1.8 Change Password**

- **Endpoint:** `POST /api/auth/change-password`
- **Headers:** `Authorization: Bearer {access_token}`
- **Request Body:**
  ```json
  {
    "current_password": "oldPassword123",
    "new_password": "newPassword456",
    "confirm_password": "newPassword456"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "message": "Password changed successfully"
  }
  ```
- **Business Logic:**
  - Authenticate user qua JWT
  - Verify current password
  - Hash new password
  - Update password
  - Invalidate all existing refresh tokens (force re-login)

---

## **2. User Management APIs**

### **2.1 Get User Profile**

- **Endpoint:** `GET /api/user/profile`
- **Headers:** `Authorization: Bearer {access_token}`
- **Response:**
  ```json
  {
    "success": true,
    "user": {
      "id": 1,
      "email": "user@example.com",
      "username": "username",
      "avatar_url": "https://...",
      "created_at": "2026-01-18T10:00:00Z",
      "total_meetings": 10
    }
  }
  ```

### **2.2 Update User Profile**

- **Endpoint:** `PUT /api/user/profile`
- **Headers:** `Authorization: Bearer {access_token}`
- **Request Body:**
  ```json
  {
    "username": "new_username",
    "email": "newemail@example.com"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "user": {
      "id": 1,
      "username": "new_username",
      "email": "newemail@example.com"
    }
  }
  ```

### **2.3 Upload Avatar**

- **Endpoint:** `POST /api/user/avatar`
- **Headers:** `Authorization: Bearer {access_token}`
- **Content-Type:** `multipart/form-data`
- **Request Body:**
  - `avatar` (file): Image file (JPEG, PNG)
- **Response:**
  ```json
  {
    "success": true,
    "avatar_url": "https://storage.../avatars/user_1_avatar.jpg"
  }
  ```
- **Business Logic:**
  - Validate file type (JPEG, PNG)
  - Validate file size (max 5MB)
  - Resize image to 500x500
  - Upload to storage (local/S3)
  - Update avatar_url trong database

---

## **3. Meeting Management APIs**

### **3.1 Create Meeting**

- **Endpoint:** `POST /api/meetings`
- **Headers:** `Authorization: Bearer {access_token}`
- **Request Body:**
  ```json
  {
    "meeting_name": "Team Standup",
    "language_source": "en",
    "language_target": "vi"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "meeting": {
      "meeting_id": "MTG-20260118-ABC123",
      "meeting_name": "Team Standup",
      "language_source": "en",
      "language_target": "vi",
      "host_id": 1,
      "created_at": "2026-01-18T10:00:00Z",
      "status": "active"
    }
  }
  ```
- **Database Tables:**
  - `meetings` (id, meeting_id, meeting_name, host_id, language_source, language_target, status, created_at, ended_at)

- **Business Logic:**
  - Generate unique meeting_id
  - Validate supported languages
  - Create meeting record
  - Add host as participant

### **3.2 Join Meeting**

- **Endpoint:** `POST /api/meetings/:meeting_id/join`
- **Headers:** `Authorization: Bearer {access_token}`
- **Response:**
  ```json
  {
    "success": true,
    "meeting": {
      "meeting_id": "MTG-20260118-ABC123",
      "meeting_name": "Team Standup",
      "language_source": "en",
      "language_target": "vi",
      "host": {
        "id": 1,
        "username": "host_user"
      },
      "participants_count": 3
    }
  }
  ```
- **Database Tables:**
  - `meeting_participants` (id, meeting_id, user_id, joined_at, left_at)

- **Business Logic:**
  - Verify meeting tồn tại và đang active
  - Add user vào participants
  - Return meeting info

### **3.3 Get Meeting Info**

- **Endpoint:** `GET /api/meetings/:meeting_id`
- **Headers:** `Authorization: Bearer {access_token}`
- **Response:**
  ```json
  {
    "success": true,
    "meeting": {
      "meeting_id": "MTG-20260118-ABC123",
      "meeting_name": "Team Standup",
      "language_source": "en",
      "language_target": "vi",
      "status": "active",
      "host": {
        "id": 1,
        "username": "host_user"
      },
      "participants": [
        {
          "id": 1,
          "username": "user1"
        },
        {
          "id": 2,
          "username": "user2"
        }
      ],
      "created_at": "2026-01-18T10:00:00Z"
    }
  }
  ```

### **3.4 Get Meeting History**

- **Endpoint:** `GET /api/meetings/history`
- **Headers:** `Authorization: Bearer {access_token}`
- **Query Params:**
  - `page` (default: 1)
  - `limit` (default: 20)
- **Response:**
  ```json
  {
    "success": true,
    "meetings": [
      {
        "meeting_id": "MTG-20260118-ABC123",
        "meeting_name": "Team Standup",
        "language_source": "en",
        "language_target": "vi",
        "created_at": "2026-01-18T10:00:00Z",
        "ended_at": "2026-01-18T11:00:00Z",
        "transcript_count": 25
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 5,
      "total_records": 100
    }
  }
  ```

### **3.5 End Meeting**

- **Endpoint:** `POST /api/meetings/:meeting_id/end`
- **Headers:** `Authorization: Bearer {access_token}`
- **Response:**
  ```json
  {
    "success": true,
    "message": "Meeting ended successfully"
  }
  ```
- **Business Logic:**
  - Verify user là host
  - Update meeting status thành "ended"
  - Set ended_at timestamp

---

## **4. Audio Processing & Speech-to-Text**

### **4.1 Upload Audio**

- **Endpoint:** `POST /api/audio/upload`
- **Headers:** `Authorization: Bearer {access_token}`
- **Content-Type:** `multipart/form-data`
- **Request Body:**
  - `audio` (file): Audio file (.wav, .mp3, .m4a)
  - `meeting_id` (string)
  - `speaker_turn` (integer)
- **Response:**
  ```json
  {
    "success": true,
    "transcript": {
      "id": 1,
      "meeting_id": "MTG-20260118-ABC123",
      "speaker_turn": 1,
      "original_text": "Hello everyone, let's start the meeting",
      "translated_text": "Xin chào mọi người, hãy bắt đầu cuộc họp",
      "timestamp": "2026-01-18T10:05:23Z",
      "audio_duration": 3.5
    }
  }
  ```
- **Database Tables:**
  - `transcripts` (id, meeting_id, speaker_turn, original_text, translated_text, audio_url, audio_duration, created_at)

- **Business Logic:**
  1. Validate audio file (format, size < 10MB)
  2. Save audio file to storage
  3. **Speech-to-Text Processing:**
     - Integrate với Google Cloud Speech-to-Text API
     - Hoặc OpenAI Whisper API
     - Input: Audio file + source language
     - Output: Transcribed text
  4. **Translation:**
     - Integrate với Google Cloud Translation API
     - Hoặc DeepL API
     - Input: Source text + target language
     - Output: Translated text
  5. Save transcript vào database
  6. Broadcast transcript đến meeting participants (WebSocket)
  7. Return transcript data

### **4.2 Batch Audio Processing (Optional)**

- **Endpoint:** `POST /api/audio/batch-upload`
- **Headers:** `Authorization: Bearer {access_token}`
- **Content-Type:** `multipart/form-data`
- **Request Body:**
  - `audios[]` (files): Multiple audio files
  - `meeting_id` (string)
- **Response:**
  ```json
  {
    "success": true,
    "transcripts": [
      {
        "speaker_turn": 1,
        "original_text": "...",
        "translated_text": "..."
      },
      {
        "speaker_turn": 2,
        "original_text": "...",
        "translated_text": "..."
      }
    ]
  }
  ```
- **Business Logic:**
  - Process multiple audio files concurrently
  - Use job queue (Bull/BullMQ) cho background processing

---

## **5. Transcript Management APIs**

### **5.1 Get Meeting Transcript**

- **Endpoint:** `GET /api/transcripts/:meeting_id`
- **Headers:** `Authorization: Bearer {access_token}`
- **Query Params:**
  - `from_turn` (integer, optional): Get từ speaker turn số X
  - `limit` (integer, default: 50)
- **Response:**
  ```json
  {
    "success": true,
    "transcripts": [
      {
        "id": 1,
        "speaker_turn": 1,
        "original_text": "Hello everyone",
        "translated_text": "Xin chào mọi người",
        "timestamp": "2026-01-18T10:05:23Z",
        "audio_url": "https://storage.../audio_1.wav",
        "audio_duration": 2.3
      },
      {
        "id": 2,
        "speaker_turn": 2,
        "original_text": "Good morning",
        "translated_text": "Chào buổi sáng",
        "timestamp": "2026-01-18T10:05:30Z",
        "audio_url": "https://storage.../audio_2.wav",
        "audio_duration": 1.8
      }
    ],
    "meeting": {
      "meeting_id": "MTG-20260118-ABC123",
      "meeting_name": "Team Standup",
      "language_source": "en",
      "language_target": "vi"
    }
  }
  ```

### **5.2 Export Transcript**

- **Endpoint:** `GET /api/transcripts/:meeting_id/export`
- **Headers:** `Authorization: Bearer {access_token}`
- **Query Params:**
  - `format` (string): "json" | "txt" | "pdf"
- **Response:**
  - File download (JSON, TXT, hoặc PDF)
- **Business Logic:**
  - Fetch all transcripts cho meeting
  - Format theo định dạng yêu cầu
  - Return file để download

### **5.3 Search Transcript**

- **Endpoint:** `GET /api/transcripts/:meeting_id/search`
- **Headers:** `Authorization: Bearer {access_token}`
- **Query Params:**
  - `q` (string): Search query
  - `language` (string): "source" | "target" | "both"
- **Response:**
  ```json
  {
    "success": true,
    "results": [
      {
        "id": 5,
        "speaker_turn": 5,
        "original_text": "Let's discuss the project timeline",
        "translated_text": "Hãy thảo luận về tiến độ dự án",
        "timestamp": "2026-01-18T10:15:00Z",
        "match_in": "source"
      }
    ]
  }
  ```

---

## **6. Real-time Updates (WebSocket)**

### **6.1 WebSocket Connection**

- **Endpoint:** `ws://localhost:3000` (hoặc Socket.IO)
- **Events:**

#### Client → Server:

```javascript
// Join meeting room
socket.emit("join_meeting", {
  meeting_id: "MTG-20260118-ABC123",
  access_token: "jwt_token...",
});

// Leave meeting
socket.emit("leave_meeting", {
  meeting_id: "MTG-20260118-ABC123",
});
```

#### Server → Client:

```javascript
// New transcript available
socket.on("new_transcript", (data) => {
  // data = {
  //   transcript: { id, speaker_turn, original_text, translated_text, timestamp }
  // }
});

// User joined meeting
socket.on("user_joined", (data) => {
  // data = { user: { id, username } }
});

// User left meeting
socket.on("user_left", (data) => {
  // data = { user: { id, username } }
});

// Meeting ended
socket.on("meeting_ended", () => {
  // Navigate user out of meeting
});
```

### **6.2 Implementation với Socket.IO:**

```javascript
// Server-side
io.on("connection", (socket) => {
  socket.on("join_meeting", async ({ meeting_id, access_token }) => {
    // Verify JWT token
    // Join socket room
    socket.join(meeting_id);

    // Broadcast to room
    io.to(meeting_id).emit("user_joined", { user });
  });

  // When new transcript created
  io.to(meeting_id).emit("new_transcript", { transcript });
});
```

---

## **7. Database Schema (MySQL)**

### **7.1 Users Table**

```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(100) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  avatar_url VARCHAR(500),
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email)
);
```

### **7.2 Refresh Tokens Table**

```sql
CREATE TABLE refresh_tokens (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  token_hash VARCHAR(255) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  is_revoked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_token_hash (token_hash)
);
```

### **7.3 Password Reset Tokens Table**

```sql
CREATE TABLE password_reset_tokens (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  otp_hash VARCHAR(255) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  is_used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id)
);
```

### **7.4 Meetings Table**

```sql
CREATE TABLE meetings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  meeting_id VARCHAR(50) UNIQUE NOT NULL,
  meeting_name VARCHAR(255) NOT NULL,
  host_id INT NOT NULL,
  language_source VARCHAR(10) NOT NULL,
  language_target VARCHAR(10) NOT NULL,
  status ENUM('active', 'ended') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ended_at TIMESTAMP NULL,
  FOREIGN KEY (host_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_meeting_id (meeting_id),
  INDEX idx_host_id (host_id),
  INDEX idx_status (status)
);
```

### **7.5 Meeting Participants Table**

```sql
CREATE TABLE meeting_participants (
  id INT PRIMARY KEY AUTO_INCREMENT,
  meeting_id VARCHAR(50) NOT NULL,
  user_id INT NOT NULL,
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  left_at TIMESTAMP NULL,
  FOREIGN KEY (meeting_id) REFERENCES meetings(meeting_id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_meeting_id (meeting_id),
  INDEX idx_user_id (user_id)
);
```

### **7.6 Transcripts Table**

```sql
CREATE TABLE transcripts (
  id INT PRIMARY KEY AUTO_INCREMENT,
  meeting_id VARCHAR(50) NOT NULL,
  speaker_turn INT NOT NULL,
  original_text TEXT NOT NULL,
  translated_text TEXT NOT NULL,
  audio_url VARCHAR(500),
  audio_duration DECIMAL(10, 2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (meeting_id) REFERENCES meetings(meeting_id) ON DELETE CASCADE,
  INDEX idx_meeting_id (meeting_id),
  INDEX idx_speaker_turn (speaker_turn),
  FULLTEXT idx_original_text (original_text),
  FULLTEXT idx_translated_text (translated_text)
);
```

---

## **8. External Services Integration**

### **8.1 Speech-to-Text Service**

**Option 1: Google Cloud Speech-to-Text**

```javascript
const speech = require("@google-cloud/speech");
const client = new speech.SpeechClient();

async function transcribeAudio(audioBuffer, languageCode) {
  const audio = {
    content: audioBuffer.toString("base64"),
  };
  const config = {
    encoding: "LINEAR16",
    sampleRateHertz: 16000,
    languageCode: languageCode, // e.g., 'en-US', 'vi-VN'
  };

  const [response] = await client.recognize({ audio, config });
  const transcription = response.results
    .map((result) => result.alternatives[0].transcript)
    .join("\n");

  return transcription;
}
```

**Option 2: OpenAI Whisper**

```javascript
const { OpenAI } = require("openai");
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function transcribeAudio(audioFilePath, language) {
  const transcription = await openai.audio.transcriptions.create({
    file: fs.createReadStream(audioFilePath),
    model: "whisper-1",
    language: language, // e.g., 'en', 'vi'
  });

  return transcription.text;
}
```

### **8.2 Translation Service**

**Option 1: Google Cloud Translation**

```javascript
const { Translate } = require("@google-cloud/translate").v2;
const translate = new Translate();

async function translateText(text, targetLanguage) {
  const [translation] = await translate.translate(text, targetLanguage);
  return translation;
}
```

**Option 2: DeepL API**

```javascript
const axios = require("axios");

async function translateText(text, sourceLang, targetLang) {
  const response = await axios.post("https://api-free.deepl.com/v2/translate", {
    auth_key: process.env.DEEPL_API_KEY,
    text: text,
    source_lang: sourceLang.toUpperCase(),
    target_lang: targetLang.toUpperCase(),
  });

  return response.data.translations[0].text;
}
```

### **8.3 Email Service (Nodemailer)**

```javascript
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function sendOTPEmail(email, otp) {
  await transporter.sendMail({
    from: '"Meeting Translator" <noreply@meetingtranslator.com>',
    to: email,
    subject: "Password Reset OTP",
    html: `
      <h2>Password Reset Request</h2>
      <p>Your OTP code is: <strong>${otp}</strong></p>
      <p>This code will expire in 10 minutes.</p>
    `,
  });
}
```

---

## **9. Middleware & Utilities**

### **9.1 Authentication Middleware**

```javascript
const jwt = require("jsonwebtoken");

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token provided",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { userId, email, username }
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};
```

### **9.2 Error Handling Middleware**

```javascript
const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};
```

### **9.3 Request Validation (express-validator)**

```javascript
const { body, validationResult } = require("express-validator");

const validateRegister = [
  body("email").isEmail().normalizeEmail(),
  body("username").isLength({ min: 3, max: 30 }).trim(),
  body("password").isLength({ min: 8 }),
  body("confirmPassword").custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error("Passwords do not match");
    }
    return true;
  }),
];

// Usage in route
app.post("/api/auth/register", validateRegister, (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  // Proceed with registration
});
```

### **9.4 File Upload Middleware (Multer)**

```javascript
const multer = require("multer");
const path = require("path");

// Avatar upload
const avatarStorage = multer.diskStorage({
  destination: "./uploads/avatars",
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(
      null,
      `user_${req.user.userId}_${uniqueSuffix}${path.extname(file.originalname)}`,
    );
  },
});

const uploadAvatar = multer({
  storage: avatarStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png/;
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase(),
    );
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error("Only images (JPEG, PNG) are allowed"));
  },
});

// Audio upload
const audioStorage = multer.diskStorage({
  destination: "./uploads/audio",
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `audio_${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const uploadAudio = multer({
  storage: audioStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /wav|mp3|m4a/;
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase(),
    );

    if (extname) {
      return cb(null, true);
    }
    cb(new Error("Only audio files (WAV, MP3, M4A) are allowed"));
  },
});
```

### **9.5 Rate Limiting**

```javascript
const rateLimit = require("express-rate-limit");

// General API rate limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Max 100 requests per windowMs
  message: "Too many requests from this IP, please try again later",
});

// Stricter limiter for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // Max 5 requests per windowMs
  message: "Too many authentication attempts, please try again later",
});

// Usage
app.use("/api/", apiLimiter);
app.use("/api/auth/login", authLimiter);
```

---

## **10. Environment Variables (.env)**

```env
# Server
NODE_ENV=development
PORT=3000

# Database
DB_HOST=localhost
DB_PORT=3306
DB_NAME=meeting_translator
DB_USER=root
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your_very_secure_jwt_secret_key_here
JWT_EXPIRES_IN=1h
REFRESH_TOKEN_SECRET=your_refresh_token_secret_key
REFRESH_TOKEN_EXPIRES_IN=7d

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# Google Cloud (Speech-to-Text & Translation)
GOOGLE_APPLICATION_CREDENTIALS=./google-credentials.json
GOOGLE_PROJECT_ID=your-project-id

# OpenAI (Whisper)
OPENAI_API_KEY=sk-...

# DeepL
DEEPL_API_KEY=your-deepl-api-key

# File Storage
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760

# CORS
CORS_ORIGIN=http://localhost:3000,https://yourapp.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

---

## **11. API Documentation (Swagger/OpenAPI)**

### **11.1 Setup Swagger**

```javascript
const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Meeting Translator API",
      version: "1.0.0",
      description: "Real-time meeting translation system API",
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Development server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
  apis: ["./routes/*.js"], // Path to API routes
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));
```

---

## **12. Estimate Thời Gian Backend Development**

| Module                               | Giờ Thấp | Giờ Cao |
| ------------------------------------ | -------- | ------- |
| **1. Project Setup & Configuration** | 4        | 6       |
| - ExpressJS setup                    |          |         |
| - MySQL connection & migrations      |          |         |
| - Environment variables              |          |         |
| - Folder structure                   |          |         |
| **2. Authentication System**         | 16       | 24      |
| - Register, Login, Logout            |          |         |
| - JWT token management               |          |         |
| - Refresh token mechanism            |          |         |
| - Forgot/Reset password với OTP      |          |         |
| - Change password                    |          |         |
| **3. User Management**               | 6        | 8       |
| - Profile CRUD                       |          |         |
| - Avatar upload                      |          |         |
| **4. Meeting Management**            | 8        | 12      |
| - Create/Join/End meeting            |          |         |
| - Meeting history                    |          |         |
| - Participants management            |          |         |
| **5. Audio Processing**              | 20       | 28      |
| - Audio upload endpoint              |          |         |
| - Speech-to-Text integration         |          |         |
| - Translation API integration        |          |         |
| - Background job processing          |          |         |
| **6. Transcript Management**         | 8        | 12      |
| - Get/Search transcripts             |          |         |
| - Export functionality               |          |         |
| **7. Real-time (WebSocket)**         | 8        | 12      |
| - Socket.IO setup                    |          |         |
| - Room management                    |          |         |
| - Event broadcasting                 |          |         |
| **8. Middleware & Security**         | 6        | 8       |
| - Auth middleware                    |          |         |
| - Validation                         |          |         |
| - Rate limiting                      |          |         |
| - Error handling                     |          |         |
| **9. API Documentation (Swagger)**   | 4        | 6       |
| **10. Testing**                      | 12       | 16      |
| - Unit tests                         |          |         |
| - Integration tests                  |          |         |
| - API testing                        |          |         |
| **TỔNG**                             | **92**   | **132** |

### **Thời gian ước tính:**

- **Optimistic:** 92 giờ (~11.5 ngày làm việc)
- **Realistic:** 112 giờ (~14 ngày làm việc)
- **Pessimistic:** 132 giờ (~16.5 ngày làm việc)

---

## **13. Deployment Checklist**

### **13.1 Production Requirements**

- [ ] Environment variables configured
- [ ] Database migrations completed
- [ ] SSL/TLS certificates installed
- [ ] CORS configured properly
- [ ] Rate limiting enabled
- [ ] Logging setup (Winston/Morgan)
- [ ] Error monitoring (Sentry)
- [ ] Database backups scheduled
- [ ] API documentation deployed
- [ ] Load testing completed
- [ ] Security audit completed

### **13.2 Monitoring & Logging**

```javascript
const winston = require("winston");

const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: "error.log", level: "error" }),
    new winston.transports.File({ filename: "combined.log" }),
  ],
});

if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  );
}
```

---

## **14. Security Best Practices**

- [ ] **Password Security:** Bcrypt với salt rounds >= 10
- [ ] **JWT Security:** Strong secret keys, short expiration times
- [ ] **SQL Injection Prevention:** Use parameterized queries (mysql2)
- [ ] **XSS Prevention:** Sanitize user inputs
- [ ] **CORS:** Whitelist trusted origins only
- [ ] **Rate Limiting:** Prevent brute force attacks
- [ ] **File Upload Security:** Validate file types, scan for malware
- [ ] **HTTPS Only:** Enforce SSL in production
- [ ] **Helmet.js:** Security headers middleware
- [ ] **Input Validation:** Validate all user inputs
- [ ] **Error Messages:** Don't expose sensitive info in errors
- [ ] **Session Management:** Secure token storage

---

## **Notes:**

- Estimate trên giả định developer có kinh nghiệm ExpressJS và MySQL
- External API costs (Google Cloud, OpenAI) chưa được tính
- Thời gian deployment và infrastructure setup chưa bao gồm
- Có thể cần thêm background job processing (Bull/BullMQ) nếu audio processing mất nhiều thời gian

# AI Ingredient Scanner - Hướng dẫn sử dụng

## Tổng quan

Feature này cho phép người dùng chụp ảnh các nguyên liệu và sử dụng AI để nhận diện tự động.

## Flow hoạt động

```
1. User nhấn nút Camera trong Search → Navigate đến Scanner
2. User chụp ảnh hoặc chọn từ thư viện
3. App upload ảnh lên Cloudinary
4. Backend gọi AI service để phân tích
5. AI trả về danh sách nguyên liệu đã phát hiện
6. Hiển thị kết quả trên màn hình
7. User có thể tìm công thức dựa trên nguyên liệu
```

## Cấu trúc Code

### Backend

**1. AI Service** (`backend/src/services/ai.service.ts`)
- `scanIngredients(imageUrl)`: Gửi URL ảnh đến AI service
- `waitForResult(jobId)`: Poll kết quả từ AI với retry logic
- Timeout: 40 lần retry x 1.5s = 60 giây

**2. Upload Controller** (`backend/src/controllers/upload.controller.ts`)
- `scanIngredientsFromImage()`: Endpoint chính
  - Upload ảnh lên Cloudinary
  - Gọi AI service với URL ảnh
  - Trả về kết quả combined

**3. Route** 
```
POST /api/upload/scan-ingredients
```

### Frontend

**1. Scanner Screen** (`my-app/app/(tabs)/scanner.tsx`)
- Sử dụng `expo-image-picker` để chụp/chọn ảnh
- Call API service để upload + scan
- Hiển thị kết quả với confidence score
- Navigate đến Search với nguyên liệu đã detect

**2. API Service** (`my-app/src/shared/services/api.service.ts`)
- `scanIngredientsFromImage(imageUri)`: Upload và scan
- `uploadImage(imageUri)`: Upload đơn thuần
- Xử lý FormData và error handling

## Cấu hình

### Backend `.env`
```bash
IP_ADDRESS=192.168.1.100
AI_PORT=5000
MAX_RETRY=40
```

### Frontend `.env`
```bash
EXPO_PUBLIC_API_URL=http://192.168.1.100:3000/api
```

**Lưu ý**: Thay IP address theo máy chủ của bạn
- Windows: Chạy `ipconfig` để xem IP
- Mac/Linux: Chạy `ifconfig` để xem IP

## Testing

1. Start backend:
```bash
cd backend
npm run dev
```

2. Start mobile app:
```bash
cd my-app
npm start
```

3. Mở app trên thiết bị/emulator
4. Vào tab Search → Nhấn icon Camera
5. Chụp ảnh nguyên liệu hoặc chọn từ thư viện
6. Đợi AI xử lý (có thể mất 30-60 giây)
7. Xem kết quả

## Error Handling

- **No file uploaded**: File không được chọn
- **Invalid image URL**: URL không hợp lệ
- **Detection timeout**: AI service quá lâu (>60s)
- **AI service error**: Lỗi từ AI server
- **Network error**: Mất kết nối

## Cải tiến trong tương lai

- [ ] Cache kết quả để tránh scan lại ảnh giống nhau
- [ ] Hiển thị bounding boxes trên ảnh
- [ ] Cho phép chỉnh sửa kết quả (thêm/xóa nguyên liệu)
- [ ] Lưu lịch sử scan
- [ ] Batch scan nhiều ảnh cùng lúc
- [ ] Tối ưu hiệu suất với image compression

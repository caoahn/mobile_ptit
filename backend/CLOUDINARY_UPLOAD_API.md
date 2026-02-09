# Cloudinary Upload API

## Đã tích hợp thành công Cloudinary vào backend!

### 📋 Các file đã tạo:

1. **config/cloudinary.ts** - Cấu hình Cloudinary
2. **services/cloudinary.service.ts** - Service xử lý upload/delete
3. **controllers/upload.controller.ts** - Controller cho upload APIs
4. **routes/upload.route.ts** - Routes định nghĩa endpoints
5. **middlewares/upload.middleware.ts** - Multer middleware (đã cập nhật)

---

## 🔧 Cấu hình

### 1. Cập nhật file `.env`:

```env
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

> **Lấy thông tin từ:** [Cloudinary Dashboard](https://cloudinary.com/console)

---

## 📡 API Endpoints

### 1. Upload Single Image

```http
POST /api/upload/image
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Request Body:**

- `image` (file) - Image file (JPEG, PNG, WEBP)
- `folder` (string, optional) - Cloudinary folder name (default: "recipes")

**Response:**

```json
{
  "success": true,
  "message": "Image uploaded successfully",
  "data": {
    "url": "https://res.cloudinary.com/xxx/image/upload/v123/recipes/image.jpg",
    "publicId": "recipes/image_abc123",
    "width": 1200,
    "height": 800,
    "format": "jpg",
    "resourceType": "image"
  }
}
```

**cURL Example:**

```bash
curl -X POST http://localhost:3000/api/upload/image \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "image=@/path/to/image.jpg" \
  -F "folder=recipes"
```

---

### 2. Upload Multiple Images

```http
POST /api/upload/images
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Request Body:**

- `images` (files[]) - Array of image files (max 10)
- `folder` (string, optional) - Cloudinary folder name

**Response:**

```json
{
  "success": true,
  "message": "Images uploaded successfully",
  "data": [
    {
      "url": "https://res.cloudinary.com/.../image1.jpg",
      "publicId": "recipes/image1_abc",
      "width": 1200,
      "height": 800,
      "format": "jpg",
      "resourceType": "image"
    },
    {
      "url": "https://res.cloudinary.com/.../image2.jpg",
      "publicId": "recipes/image2_def",
      "width": 800,
      "height": 600,
      "format": "jpg",
      "resourceType": "image"
    }
  ]
}
```

**cURL Example:**

```bash
curl -X POST http://localhost:3000/api/upload/images \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "images=@/path/to/image1.jpg" \
  -F "images=@/path/to/image2.jpg" \
  -F "folder=recipe-steps"
```

---

### 3. Delete Image

```http
DELETE /api/upload/image/:publicId
Authorization: Bearer <token>
```

**Parameters:**

- `publicId` (string) - Cloudinary public ID (URL encoded)

**Response:**

```json
{
  "success": true,
  "message": "Image deleted successfully",
  "data": null
}
```

**cURL Example:**

```bash
# Public ID: recipes/image_abc123
curl -X DELETE "http://localhost:3000/api/upload/image/recipes%2Fimage_abc123" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🎨 Features

### Tự động xử lý:

- ✅ **Resize** - Giới hạn max 1200x1200px
- ✅ **Quality** - Tối ưu quality tự động
- ✅ **Format** - Chuyển đổi format tối ưu (WebP nếu browser support)
- ✅ **Delete local file** - Xóa file tạm sau khi upload
- ✅ **Validation** - Chỉ chấp nhận JPEG, PNG, WEBP
- ✅ **File size limit** - Max 10MB

### Folder organization:

- `recipes/` - Ảnh món ăn chính
- `recipe-steps/` - Ảnh các bước thực hiện
- `avatars/` - Ảnh đại diện user
- Custom folder theo nhu cầu

---

## 💻 Sử dụng trong Code

### Upload ảnh khi tạo Recipe:

```typescript
// In RecipeService
async createRecipe(userId: number, data: CreateRecipeDTO, imageFile?: Express.Multer.File) {
  const transaction = await sequelize.transaction();

  try {
    let imageUrl = null;

    // Upload main image
    if (imageFile) {
      const uploadResult = await this.cloudinaryService.uploadImage(
        imageFile.path,
        'recipes'
      );
      imageUrl = uploadResult.url;
    }

    // Create recipe
    const recipe = await Recipe.create({
      user_id: userId,
      title: data.title,
      image_url: imageUrl,
      // ...
    }, { transaction });

    await transaction.commit();
    return recipe;

  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}
```

### Get optimized image URL:

```typescript
const optimizedUrl = cloudinaryService.getOptimizedUrl(
  "recipes/image_abc123",
  800, // width
  600, // height
);
// Returns: https://res.cloudinary.com/.../w_800,h_600,c_fill/.../image.jpg
```

---

## 🧪 Testing

### Postman/Thunder Client:

1. **Login** để lấy token
2. **Upload image:**
   - Method: POST
   - URL: `http://localhost:3000/api/upload/image`
   - Headers: `Authorization: Bearer <your_token>`
   - Body: form-data
     - Key: `image`, Type: File
     - Key: `folder`, Type: Text, Value: `recipes`

---

## ⚠️ Lưu ý

1. **Folder `uploads/temp`** sẽ tự động được tạo khi start server
2. **Local files** được xóa tự động sau khi upload lên Cloudinary
3. **Rate limits** - Cloudinary free tier có giới hạn:
   - 25 credits/month
   - 25GB storage
   - 25GB bandwidth
4. **Public ID** cần URL encode khi delete (dấu `/` thành `%2F`)

---

## 🚀 Next Steps

Bạn có thể:

1. Thêm image compression trước khi upload
2. Thêm watermark cho ảnh
3. Generate thumbnails tự động
4. Tạo API upload từ URL
5. Implement lazy loading cho ảnh

---

_API ready to use! 🎉_

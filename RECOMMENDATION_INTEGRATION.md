# Tích Hợp Recommendation System

Tài liệu tổng kết việc implement các API thu thập interaction và lấy gợi ý công thức cho người dùng.

---

## Tổng Quan Luồng Dữ Liệu

```
React Native App
      │
      │  POST /api/recommendations/track   (ghi nhận hành động)
      │  GET  /api/recommendations/feed    (lấy gợi ý)
      ▼
Backend Node.js  (backend/)
      │
      │  POST http://AI_SERVICE_URL/user/UpdateBatchUser
      │  GET  http://AI_SERVICE_URL/user/top-recipes/{user_id}
      ▼
Backend-AI  (Python / FastAPI)
```

---

## Các File Đã Tạo

### Backend Node.js

| File                                                | Mô tả                                                                   |
| --------------------------------------------------- | ----------------------------------------------------------------------- |
| `src/config/env.ts`                                 | Thêm `env.aiService.url` và `env.aiService.apiKey`                      |
| `src/dto/recommendation/interaction.request.ts`     | DTO cho request track interaction                                       |
| `src/dto/recommendation/recommendation.response.ts` | DTO cho response gợi ý                                                  |
| `src/interfaces/services/recommendation.service.ts` | Interface `IRecommendationService`                                      |
| `src/services/recommendation.service.ts`            | Gọi Backend-AI qua axios, bao gồm helper `mapViewEvent()`               |
| `src/controllers/recommendation.controller.ts`      | Controller xử lý 2 endpoint                                             |
| `src/routes/recommendation.route.ts`                | Định nghĩa route `/recommendations/track` và `/recommendations/feed`    |
| `src/routes/index.ts`                               | Đăng ký thêm `/recommendations`                                         |
| `src/container/index.ts`                            | Đăng ký `RecommendationService` + `RecommendationController` vào Awilix |

### Frontend React Native

| File                                                            | Mô tả                                                                                         |
| --------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `src/features/recommendation/types/recommendation.types.ts`     | Types: `InteractionEvent`, `TrackInteractionPayload`, `RecommendationData`, ...               |
| `src/features/recommendation/services/recommendationService.ts` | Hàm gọi API: `trackInteraction()`, `getRecommendations()`                                     |
| `src/features/recommendation/store/recommendationStore.ts`      | Zustand store: `recommendations`, `isLoading`, `fetchRecommendations()`, `trackInteraction()` |
| `src/features/recommendation/index.ts`                          | Barrel export của feature                                                                     |
| `src/features/index.ts`                                         | Thêm `export * as recommendation`                                                             |

---

## Biến Môi Trường Cần Thêm

Thêm vào file `.env` của backend:

```env
AI_SERVICE_URL=http://localhost:8000
AI_API_KEY=your_api_key_here
```

> Nếu môi trường local/dev chưa cần xác thực, để trống `AI_API_KEY` (header `X-API-Key` sẽ không được gửi).

---

## API Endpoints (Backend Node.js)

### POST `/api/recommendations/track`

Ghi nhận hành động của người dùng lên một công thức. Yêu cầu xác thực JWT.

**Headers:**

```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "recipe_id": 42,
  "event": "like"
}
```

**Với view event** (tự động convert `duration_s` → event tương ứng):

```json
{
  "recipe_id": 42,
  "event": "view",
  "duration_s": 45
}
```

| `duration_s` | Event được gửi lên AI      |
| ------------ | -------------------------- |
| `> 30s`      | `dwell_10s` (trọng số 2.5) |
| `5 – 30s`    | `view` (trọng số 1.0)      |
| `< 5s`       | `click` (trọng số 0.5)     |

Các event hợp lệ khác: `share` (5.0), `save` (4.0), `comment` (3.5), `like` (3.0), `skip` (0.0)

**Response:**

```json
{
  "success": true,
  "data": { "success": true, "updated_users": 1 }
}
```

---

### GET `/api/recommendations/feed?k=10`

Lấy danh sách công thức được gợi ý cho người dùng hiện tại. Yêu cầu xác thực JWT.

**Query params:**

- `k` (integer, mặc định 10): số lượng công thức muốn lấy

**Response:**

```json
{
  "success": true,
  "data": {
    "user_id": 101,
    "recommendations": [
      { "recipe_id": 1001, "score": 0.9321 },
      { "recipe_id": 1020, "score": 0.8877 }
    ],
    "count": 2
  }
}
```

> Nếu user chưa có embedding (chưa có interaction nào), Backend-AI trả về 404 — backend sẽ forward lỗi này. Frontend nên xử lý trường hợp `recommendations` rỗng.

---

## Hướng Dẫn Sử Dụng Trong Frontend

### Import

```ts
import { useRecommendationStore } from "@/src/features/recommendation";
// hoặc
import * as recommendation from "@/src/features/recommendation";
```

---

### Track Interaction

Gọi bất cứ khi nào người dùng thực hiện hành động lên công thức. Hàm này **fire-and-forget** — không throw lỗi ra UI.

```tsx
import { useRecommendationStore } from "@/src/features/recommendation";

function RecipeCard({ recipe }) {
  const { trackInteraction } = useRecommendationStore();

  const handleLike = async () => {
    await likeRecipe(recipe.id); // gọi API like hiện tại
    trackInteraction({ recipe_id: recipe.id, event: "like" }); // ghi nhận thêm
  };

  const handleSave = async () => {
    await saveRecipe(recipe.id);
    trackInteraction({ recipe_id: recipe.id, event: "save" });
  };

  const handleShare = () => {
    Share.share({ message: recipe.title });
    trackInteraction({ recipe_id: recipe.id, event: "share" });
  };

  // ...
}
```

**Track thời gian xem:**

```tsx
import { useEffect, useRef } from "react";
import { useRecommendationStore } from "@/src/features/recommendation";

function RecipeDetailScreen({ recipeId }) {
  const { trackInteraction } = useRecommendationStore();
  const startTimeRef = useRef(Date.now());

  useEffect(() => {
    return () => {
      const duration_s = (Date.now() - startTimeRef.current) / 1000;
      trackInteraction({ recipe_id: recipeId, event: "view", duration_s });
    };
  }, [recipeId]);

  // ...
}
```

---

### Lấy Danh Sách Gợi Ý

```tsx
import { useEffect } from "react";
import { useRecommendationStore } from "@/src/features/recommendation";
import { useAuthStore } from "@/src/features/auth";

function RecommendedFeedScreen() {
  const { isAuthenticated } = useAuthStore();
  const { recommendations, isLoading, fetchRecommendations } =
    useRecommendationStore();

  useEffect(() => {
    if (isAuthenticated) {
      fetchRecommendations(10);
    }
  }, [isAuthenticated]);

  if (isLoading) return <LoadingSpinner />;

  if (recommendations.length === 0) {
    return (
      <EmptyState message="Hãy khám phá thêm công thức để nhận gợi ý cá nhân hóa!" />
    );
  }

  // recommendations là mảng { recipe_id, score }
  // cần fetch chi tiết recipe từ recipe API hiện có
  return (
    <FlatList
      data={recommendations}
      keyExtractor={(item) => String(item.recipe_id)}
      renderItem={({ item }) => <RecipeCard recipeId={item.recipe_id} />}
    />
  );
}
```

---

## Lưu Ý Khi Tích Hợp

1. **Backend-AI phải đang chạy** trước khi các endpoint này hoạt động. Nếu Backend-AI chưa chạy, `/track` và `/feed` sẽ trả về lỗi 500 — không ảnh hưởng đến các API khác.

2. **User mới / chưa có embedding:** Endpoint `/feed` sẽ trả về lỗi 404 từ Backend-AI (`User not found in user_vector`). Frontend store xử lý trường hợp này bằng cách giữ `recommendations = []` thay vì throw lỗi.

3. **Không thay thế feed hiện tại:** Endpoint `/api/recipes` (feed chính) không bị thay đổi. Recommendation feed là tính năng bổ sung — có thể hiển thị ở tab riêng hoặc một section trong màn hình chính.

4. **Đồng bộ `recipe_id`:** `recipe_id` trong recommendation chính là `id` của recipe trong DB — có thể dùng trực tiếp với API `/api/recipes/:id`.

5. **Router user.py chưa được implement** trong Backend-AI (xem cảnh báo trong `API_USER_INTEGRATION.md`). Cần implement trước khi test end-to-end.

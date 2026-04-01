# Tổng kết Implementation Recommendation System

## Tổng quan luồng dữ liệu sau khi implement

```
React Native App (index.tsx)
        │
        │  GET /api/recipes/recommended?page=1&limit=10
        ▼
Backend Node.js
        │
        ├─ Gọi AI: GET /user/top-recipes/{userId}?k=(page×limit)
        │       │
        │       ├─ AI có data → slice đúng trang → source:"rec"
        │       └─ AI không có data / lỗi → getFeed() → source:"feed"
        ▼
Backend-AI (Python / FastAPI)
```

---

## Các thay đổi đã thực hiện

### 1. Backend Node.js

#### `src/interfaces/services/recommendation.service.ts`

- Thêm method `sendPostEmbedding(recipeId, imageUrl, text): Promise<void>`

#### `src/services/recommendation.service.ts`

- Implement `sendPostEmbedding` — gọi `POST /post/embedding` lên AI service (fire-and-forget, lỗi không block)

#### `src/interfaces/repositories/recipe.repository.ts`

- Thêm method `findByIds(ids: number[]): Promise<Recipe[]>`

#### `src/repositories/recipe.repository.ts`

- Implement `findByIds` — dùng `WHERE id IN (...)` batch query, giữ đúng thứ tự rank của AI

#### `src/interfaces/services/recipe.service.ts`

- Thêm interface `RecommendedFeedResponse` (extends `GetFeedResponse` + `source: "rec" | "feed"`)
- Thêm method `getRecommendedFeed(userId, page, limit): Promise<RecommendedFeedResponse>`

#### `src/services/recipe.service.ts`

- Inject `IRecommendationService` vào `RecipeService` constructor
- Trong `createRecipe`: sau khi tạo xong, gọi `recommendationService.sendPostEmbedding()` (fire-and-forget)
- Implement `getRecommendedFeed`:
  - Gọi AI lấy `page × limit` IDs ranked
  - Nếu AI có data: `findByIds(ids.slice(...))` → trả `source:"rec"` với đúng page
  - Nếu AI không có data hoặc lỗi: fallback về `getFeed()` → trả `source:"feed"`

#### `src/controllers/recipe.controller.ts`

- Thêm handler `getRecommendedFeed` — nhận `page`, `limit` (max 50), gọi service

#### `src/routes/recipe.routes.ts`

- Thêm route `GET /recipes/recommended` (yêu cầu auth)

---

### 2. Frontend React Native

#### `src/features/recipe/types/recipe.types.ts`

- Thêm `RecommendedFeedResponse` interface (extends `FeedResponse` + `source: "rec" | "feed"`)

#### `src/features/recipe/services/recipeService.ts`

- Thêm `getRecommendedFeed(page, limit)` — gọi `GET /recipes/recommended?page=&limit=`

#### `src/features/recipe/components/RecipeCard.tsx`

- `handleLike`: nếu `result.liked === true` → gọi `trackInteraction({ recipe_id, event: "like" })`
- `handleSave`: nếu `result.saved === true` → gọi `trackInteraction({ recipe_id, event: "save" })`

#### `app/recipe/[id].tsx`

- Thêm `useEffect` track view duration: ghi nhận thời điểm mount, khi unmount tính `duration_s` rồi gọi `trackInteraction({ recipe_id, event: "view", duration_s })`

#### `app/(tabs)/index.tsx`

- Bỏ `getFeed` riêng, dùng 1 hàm `getRecommendedFeed` cho cả initial load và load-more
- `loadInitial()`: gọi page 1, lưu `source` vào ref, set `feedLabel`
- `loadMore(nextPage)`: gọi tiếp các trang, append vào danh sách — hoạt động giống nhau cho cả `rec` và `feed` mode
- **TTL 5 phút**: khi đang ở `rec` mode, chuyển tab không re-probe AI (tránh latency); chỉ probe lại sau 5 phút hoặc khi pull-to-refresh
- Header hiện label **"Gợi ý cho bạn"** khi ở `rec` mode

#### `app/(tabs)/discover.tsx`

- Thay toàn bộ mock data bằng dữ liệu thực
- Gọi `getRecommendations(10)` khi mount; nếu có data → fetch từng recipe bằng `getRecipeById`; nếu không → fallback `getFeed`
- Header hiện avatar và tên thật của user từ `useAuthStore`

---

## Cơ chế hoạt động theo vòng đời user

| Giai đoạn                       | Feed mode                                             | Lý do                                     |
| ------------------------------- | ----------------------------------------------------- | ----------------------------------------- |
| Tạo account mới, chưa tương tác | `source:"feed"`                                       | AI chưa có vector của user                |
| Bắt đầu like / view / save      | tracking gửi lên AI qua `POST /recommendations/track` |                                           |
| Sau khi AI cập nhật user vector | `source:"rec"`                                        | AI trả về danh sách ranked                |
| Đăng recipe mới                 | `POST /post/embedding` tự động gọi                    | BE gọi fire-and-forget sau `createRecipe` |

---

## Cơ chế pagination trong rec mode

```
Page 1: AI cấp 10 IDs top 1–10,  hasMore: true
Page 2: AI cấp 20 IDs → slice 11–20, hasMore: true
Page 3: AI cấp 30 IDs → slice 21–30, hasMore: false  ← hết
```

> Mỗi load-more gọi AI với pool lớn hơn (`page × limit`). Chi phí thấp vì AI chỉ tra cứu vector, không generate.

---

## Interaction tracking đã wire

| Hành động                | Event gửi lên AI                                          | Nơi xử lý                        |
| ------------------------ | --------------------------------------------------------- | -------------------------------- |
| Like bài viết            | `"like"`                                                  | `RecipeCard.tsx`                 |
| Save bài viết            | `"save"`                                                  | `RecipeCard.tsx`                 |
| Xem chi tiết recipe      | `"view"` + `duration_s`                                   | `recipe/[id].tsx` unmount        |
| Backend map `duration_s` | `> 30s → "dwell_10s"`, `5–30s → "view"`, `< 5s → "click"` | `recommendation.service.ts`      |
| Đăng recipe mới          | `POST /post/embedding` (tạo vector cho recipe)            | `recipe.service.ts` createRecipe |

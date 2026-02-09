# 🏗️ Project Structure - Feature-Based Architecture

## ✨ Tổng quan

Project đã được tái cấu trúc theo **Feature-Based Architecture** để:

- ✅ Dễ dàng scale khi thêm tính năng mới
- ✅ Code được tổ chức rõ ràng, dễ maintain
- ✅ Giảm dependencies giữa các modules
- ✅ Team có thể làm việc song song trên các features khác nhau

## 📂 Cấu trúc mới

```
src/
│
├── features/                    # 🎯 Feature Modules
│   ├── auth/                   # Authentication
│   │   ├── components/         # Auth-specific UI
│   │   ├── services/           # authService.ts - API calls
│   │   ├── store/              # authStore.ts - State management
│   │   ├── types/              # Type definitions
│   │   └── index.ts           # Export all
│   │
│   ├── recipe/                 # Recipe Management
│   │   ├── components/
│   │   ├── services/           # recipeService.ts
│   │   ├── store/              # recipeStore.ts
│   │   ├── types/
│   │   └── index.ts
│   │
│   └── index.ts               # Export all features
│
├── shared/                     # 🔧 Shared Resources
│   ├── components/            # UI Components (Button, Input...)
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Container.tsx
│   │   └── index.ts
│   │
│   ├── services/
│   │   └── api/
│   │       ├── client.ts      # Axios config + interceptors
│   │       └── index.ts
│   │
│   └── utils/
│       ├── validation.ts      # Email, password validation
│       ├── errorHandler.ts    # API error handling
│       └── index.ts
│
└── index.ts                   # Main export
```

## 🎯 Features hiện có

### 1. **Auth Feature** ✅

Hoàn chỉnh và sẵn sàng sử dụng:

- Login/Register/Logout
- Token management (access + refresh)
- Auto token refresh on 401
- User state management

**Cách dùng:**

```typescript
import { useAuthStore } from "@/src/features/auth/store/authStore";
import * as authService from "@/src/features/auth/services/authService";

const { user, login, logout } = useAuthStore();
```

### 2. **Recipe Feature** 🏗️

Skeleton đã sẵn sàng:

- Types đã define
- Store đã setup
- Service methods đã sẵn sàng
- Chỉ cần kết nối với backend API

**Cách dùng:**

```typescript
import { useRecipeStore } from "@/src/features/recipe/store/recipeStore";
import * as recipeService from "@/src/features/recipe/services/recipeService";
```

## 🔧 Shared Resources

### UI Components

```typescript
import { Button, Input, Container } from "@/src/shared/components";

<Button title="Click me" onPress={handleClick} variant="primary" />
<Input label="Email" value={email} onChangeText={setEmail} />
```

### API Client

```typescript
import apiClient from "@/src/shared/services/api/client";

// Tự động thêm Bearer token
const response = await apiClient.get("/recipes");
```

### Utils

```typescript
import { validateEmail, handleApiError } from "@/src/shared/utils";

if (!validateEmail(email)) {
  alert("Invalid email");
}
```

## 🚀 Thêm Feature mới

### Ví dụ: Tạo Profile Feature

1. **Tạo folder structure:**

```bash
mkdir -p src/features/profile/{components,services,store,types}
```

2. **Define types** (`profile/types/profile.types.ts`):

```typescript
export interface UserProfile {
  id: string;
  username: string;
  bio?: string;
  avatar_url?: string;
}
```

3. **Create store** (`profile/store/profileStore.ts`):

```typescript
import { create } from "zustand";
import { UserProfile } from "../types/profile.types";

interface ProfileState {
  profile: UserProfile | null;
  updateProfile: (profile: UserProfile) => void;
}

export const useProfileStore = create<ProfileState>((set) => ({
  profile: null,
  updateProfile: (profile) => set({ profile }),
}));
```

4. **Create service** (`profile/services/profileService.ts`):

```typescript
import apiClient from "@/src/shared/services/api/client";
import { UserProfile } from "../types/profile.types";

export const getProfile = async (id: string): Promise<UserProfile> => {
  const response = await apiClient.get(`/users/${id}`);
  return response.data.data;
};

export const updateProfile = async (
  id: string,
  data: Partial<UserProfile>,
): Promise<UserProfile> => {
  const response = await apiClient.put(`/users/${id}`, data);
  return response.data.data;
};
```

5. **Create index** (`profile/index.ts`):

```typescript
export * from "./store/profileStore";
export * from "./services/profileService";
export * from "./types";
```

6. **Sử dụng:**

```typescript
import { useProfileStore, getProfile } from "@/src/features/profile";
```

## 📖 Import Examples

### ✅ Recommended

```typescript
// Import from feature
import { useAuthStore } from "@/src/features/auth";
import { useRecipeStore } from "@/src/features/recipe";

// Import shared components
import { Button, Input } from "@/src/shared/components";

// Import utilities
import { validateEmail } from "@/src/shared/utils";
```

### ❌ Avoid

```typescript
// Don't use relative paths
import { useAuthStore } from "../../../features/auth/store/authStore";

// Don't import from old structure
import Button from "@/src/components/ui/Button"; // Old!
```

## 🔄 Migration Status

### ✅ Completed

- [x] Feature-based structure created
- [x] Auth feature migrated
- [x] Shared components setup
- [x] API client configuration
- [x] Utils organized
- [x] Import paths updated in screens

### ⏳ To Do (Optional)

- [ ] Delete old folders (after verification)
  - `src/components/` → Use `src/shared/components/`
  - `src/services/api/` → Use feature services
  - `src/store/` → Use feature stores
  - `src/types/` → Use feature types
  - `src/utils/` → Use `src/shared/utils/`

## 📚 Documentation

- [ARCHITECTURE.md](./ARCHITECTURE.md) - Chi tiết kiến trúc
- [shared/services/api/README.md](./shared/services/api/README.md) - API integration guide

## 🎯 Benefits

### 1. **Scalability**

Dễ dàng thêm features mới mà không ảnh hưởng code hiện có.

### 2. **Maintainability**

Code được nhóm theo feature, dễ tìm và sửa.

### 3. **Team Collaboration**

Nhiều người có thể làm việc trên các features khác nhau không bị conflict.

### 4. **Testability**

Mỗi feature có thể test độc lập.

### 5. **Code Reusability**

Shared components và utils được tái sử dụng dễ dàng.

---

**Happy Coding! 🚀**

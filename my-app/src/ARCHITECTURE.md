# Feature-Based Architecture

Dự án này được tổ chức theo kiến trúc **Feature-Based** để dễ dàng scale và maintain khi dự án lớn lên.

## 📁 Cấu trúc thư mục

```
src/
├── features/              # Các feature modules
│   ├── auth/             # Authentication feature
│   │   ├── components/   # Components riêng cho auth
│   │   ├── services/     # Auth API services
│   │   ├── store/        # Auth state management
│   │   ├── types/        # Auth type definitions
│   │   └── index.ts      # Export all auth modules
│   │
│   ├── recipe/           # Recipe feature (sẵn sàng sử dụng)
│   │   ├── components/   # Recipe components
│   │   ├── services/     # Recipe API services
│   │   ├── store/        # Recipe state management
│   │   ├── types/        # Recipe type definitions
│   │   └── index.ts      # Export all recipe modules
│   │
│   └── index.ts          # Export all features
│
├── shared/               # Code dùng chung cho toàn app
│   ├── components/       # UI components (Button, Input, Container...)
│   ├── services/         # Shared services
│   │   └── api/          # API client configuration
│   └── utils/            # Utility functions
│       ├── validation.ts # Validation helpers
│       └── errorHandler.ts # Error handling utilities
│
└── (legacy folders)      # Folders cũ sẽ xóa sau
    ├── components/
    ├── services/
    ├── store/
    ├── types/
    └── utils/
```

## 🎯 Nguyên tắc tổ chức

### 1. **Features** (Các tính năng độc lập)

Mỗi feature là một module độc lập chứa tất cả code liên quan:

- **Components**: UI components riêng cho feature
- **Services**: API calls và business logic
- **Store**: State management (Zustand stores)
- **Types**: TypeScript interfaces và types

**Ví dụ:**

```typescript
// Import toàn bộ auth feature
import {
  useAuthStore,
  login,
  register,
  LoginRequest,
} from "@/src/features/auth";

// Hoặc import cụ thể
import { useAuthStore } from "@/src/features/auth/store/authStore";
import * as authService from "@/src/features/auth/services/authService";
```

### 2. **Shared** (Code dùng chung)

Code được sử dụng bởi nhiều features khác nhau:

- UI components (Button, Input, Card...)
- Utilities (validation, formatting...)
- API client configuration
- Common types

**Ví dụ:**

```typescript
import { Button, Input, Container } from "@/src/shared/components";
import { validateEmail, handleApiError } from "@/src/shared/utils";
import apiClient from "@/src/shared/services/api/client";
```

## 🚀 Cách sử dụng

### Tạo feature mới

1. **Tạo cấu trúc folder:**

```bash
src/features/profile/
├── components/
├── services/
│   └── profileService.ts
├── store/
│   └── profileStore.ts
├── types/
│   └── profile.types.ts
└── index.ts
```

2. **Define types** (`types/profile.types.ts`):

```typescript
export interface UserProfile {
  id: string;
  username: string;
  email: string;
  bio?: string;
}
```

3. **Create store** (`store/profileStore.ts`):

```typescript
import { create } from "zustand";
import { UserProfile } from "../types/profile.types";

interface ProfileState {
  profile: UserProfile | null;
  setProfile: (profile: UserProfile) => void;
}

export const useProfileStore = create<ProfileState>((set) => ({
  profile: null,
  setProfile: (profile) => set({ profile }),
}));
```

4. **Create services** (`services/profileService.ts`):

```typescript
import apiClient from "@/src/shared/services/api/client";
import { UserProfile } from "../types/profile.types";

export const getProfile = async (id: string): Promise<UserProfile> => {
  const response = await apiClient.get(`/users/${id}`);
  return response.data.data;
};
```

5. **Export** (`index.ts`):

```typescript
export * from "./store/profileStore";
export * from "./services/profileService";
export * from "./types";
```

### Tạo shared component

```typescript
// src/shared/components/Card.tsx
import React from "react";
import { View, ViewProps } from "react-native";

interface CardProps extends ViewProps {
  elevation?: number;
}

const Card: React.FC<CardProps> = ({ children, elevation = 2, ...props }) => {
  return (
    <View
      className={`bg-white rounded-lg p-4 shadow-${elevation}`}
      {...props}
    >
      {children}
    </View>
  );
};

export default Card;
```

Sau đó export trong `src/shared/components/index.ts`:

```typescript
export { default as Card } from "./Card";
```

## 📝 Best Practices

### 1. **Separation of Concerns**

- Mỗi feature chỉ chứa code liên quan đến chính nó
- Code dùng chung nằm trong `shared/`
- Tránh dependencies giữa các features

### 2. **Import Paths**

```typescript
// ✅ Good
import { useAuthStore } from "@/src/features/auth";
import { Button } from "@/src/shared/components";

// ❌ Avoid
import { useAuthStore } from "../../features/auth/store/authStore";
```

### 3. **Index Files**

Mỗi feature/folder nên có file `index.ts` để export:

```typescript
// features/auth/index.ts
export * from "./store/authStore";
export * from "./services/authService";
export * from "./types";
```

### 4. **Naming Conventions**

- **Files**: camelCase (`authService.ts`, `recipeStore.ts`)
- **Components**: PascalCase (`Button.tsx`, `RecipeCard.tsx`)
- **Types**: PascalCase interfaces (`UserProfile`, `LoginRequest`)
- **Functions**: camelCase (`validateEmail`, `getRecipes`)

## 🔄 Migration từ cấu trúc cũ

Các folder cũ vẫn còn (để tương thích):

```
src/
├── components/   # ⚠️ Sẽ xóa - Dùng shared/components/
├── services/     # ⚠️ Sẽ xóa - Dùng features/*/services/
├── store/        # ⚠️ Sẽ xóa - Dùng features/*/store/
├── types/        # ⚠️ Sẽ xóa - Dùng features/*/types/
└── utils/        # ⚠️ Sẽ xóa - Dùng shared/utils/
```

**Khi nào xóa?** Sau khi tất cả imports đã được cập nhật.

## 📦 Features sẵn có

### ✅ Auth Feature

- Login, Register, Logout
- Token management
- Auth state với Zustand
- Auto token refresh

### ✅ Recipe Feature (Skeleton)

- Recipe CRUD operations
- Like/Unlike recipes
- Save/Unsave recipes
- Recipe state management

## 🎨 UI Components (Shared)

### Button

```typescript
import { Button } from "@/src/shared/components";

<Button
  title="Login"
  onPress={handleLogin}
  variant="primary"
  isLoading={loading}
/>
```

### Input

```typescript
import { Input } from "@/src/shared/components";

<Input
  label="Email"
  value={email}
  onChangeText={setEmail}
  keyboardType="email-address"
  error={errors.email}
/>
```

### Container

```typescript
import { Container } from "@/src/shared/components";

<Container safe>
  {/* Your content */}
</Container>
```

## 🛠 Utilities (Shared)

### Validation

```typescript
import { validateEmail, validatePassword } from "@/src/shared/utils";

const isValid = validateEmail("user@example.com");
const passwordCheck = validatePassword("MyPass123!");
```

### Error Handling

```typescript
import { handleApiError, getErrorMessage } from "@/src/shared/utils";

try {
  await someApiCall();
} catch (error) {
  const message = getErrorMessage(error);
  Alert.alert("Error", message);
}
```

## 🌐 API Client

Axios client được configure sẵn với:

- Auto token injection
- Auto token refresh on 401
- Centralized error handling

```typescript
import apiClient from "@/src/shared/services/api/client";

const response = await apiClient.get("/recipes");
```

## 📚 Thêm thông tin

- Xem [API Integration README](./shared/services/api/README.md) để biết cách gọi API
- Mỗi feature có thể có README riêng nếu cần

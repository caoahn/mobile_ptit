# 🚀 Quick Reference - Feature-Based Architecture

## 📦 Import Cheat Sheet

### Authentication

```typescript
// Store
import { useAuthStore } from "@/src/features/auth/store/authStore";

// Services
import * as authService from "@/src/features/auth/services/authService";
// or
import {
  login,
  register,
  logout,
} from "@/src/features/auth/services/authService";

// Types
import {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
} from "@/src/features/auth/types";
```

### Recipe (Ready to use)

```typescript
// Store
import { useRecipeStore } from "@/src/features/recipe/store/recipeStore";

// Services
import * as recipeService from "@/src/features/recipe/services/recipeService";

// Types
import { Recipe, RecipeResponse } from "@/src/features/recipe/types";
```

### Shared Components

```typescript
import { Button, Input, Container } from "@/src/shared/components";
```

### Shared Utils

```typescript
import {
  validateEmail,
  validatePassword,
  handleApiError,
} from "@/src/shared/utils";
```

### API Client

```typescript
import apiClient from "@/src/shared/services/api/client";
```

## 🎯 Common Patterns

### 1. Using Auth in a Screen

```typescript
import { useAuthStore } from "@/src/features/auth/store/authStore";
import * as authService from "@/src/features/auth/services/authService";
import { Button, Input } from "@/src/shared/components";

export default function LoginScreen() {
  const { login } = useAuthStore();

  const handleLogin = async () => {
    try {
      const response = await authService.login({ email, password });
      await login(response.user, response.access_token, response.refresh_token);
      router.push("/(tabs)");
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  return (
    <Input label="Email" value={email} onChangeText={setEmail} />
    <Button title="Login" onPress={handleLogin} />
  );
}
```

### 2. Protected API Call

```typescript
import apiClient from "@/src/shared/services/api/client";

// Token tự động được thêm vào header
const getMyRecipes = async () => {
  const response = await apiClient.get("/recipes/me");
  return response.data.data;
};
```

### 3. Using Recipe Store

```typescript
import { useRecipeStore } from "@/src/features/recipe/store/recipeStore";
import * as recipeService from "@/src/features/recipe/services/recipeService";

export default function RecipeScreen() {
  const { recipes, setRecipes } = useRecipeStore();

  useEffect(() => {
    const loadRecipes = async () => {
      const data = await recipeService.getRecipes();
      setRecipes(data);
    };
    loadRecipes();
  }, []);

  return (
    <FlatList
      data={recipes}
      renderItem={({ item }) => <RecipeCard recipe={item} />}
    />
  );
}
```

### 4. Form Validation

```typescript
import { validateEmail, validatePassword } from "@/src/shared/utils";

const handleSubmit = () => {
  if (!validateEmail(email)) {
    setError("Invalid email");
    return;
  }

  const passwordCheck = validatePassword(password);
  if (!passwordCheck.isValid) {
    setError(passwordCheck.errors[0]);
    return;
  }

  // Proceed with submission
};
```

### 5. Error Handling

```typescript
import { getErrorMessage } from "@/src/shared/utils";

try {
  await someApiCall();
} catch (error) {
  const message = getErrorMessage(error);
  Alert.alert("Error", message);
}
```

## 📂 Folder Structure at a Glance

```
src/
├── features/
│   ├── auth/           → Login, Register, Auth state
│   ├── recipe/         → Recipe CRUD, Lists
│   └── [new-feature]/  → Easy to add!
│
├── shared/
│   ├── components/     → Button, Input, Container
│   ├── services/api/   → Axios client
│   └── utils/          → Validation, Error handling
│
└── [old folders]       → Will be removed
```

## ⚡ Quick Commands

### Add new feature

```bash
# Create structure
mkdir -p src/features/profile/{components,services,store,types}

# Create files
touch src/features/profile/types/profile.types.ts
touch src/features/profile/store/profileStore.ts
touch src/features/profile/services/profileService.ts
touch src/features/profile/index.ts
```

### Test imports

```typescript
// In any screen/component
import { useAuthStore } from "@/src/features/auth/store/authStore";
import { Button } from "@/src/shared/components";
```

## 🎨 Component Examples

### Button

```typescript
<Button
  title="Submit"
  onPress={handlePress}
  variant="primary"       // primary | secondary | danger | outline
  size="md"              // sm | md | lg
  isLoading={loading}
  disabled={!isValid}
/>
```

### Input

```typescript
<Input
  label="Email"
  placeholder="user@example.com"
  value={email}
  onChangeText={setEmail}
  keyboardType="email-address"
  autoCapitalize="none"
  error={errors.email}
/>
```

### Container

```typescript
<Container safe>  {/* safe adds SafeAreaView */}
  <Text>Your content here</Text>
</Container>
```

## 🔐 Auth Flow

```typescript
// 1. Login
const response = await authService.login({ email, password });
await authStore.login(
  response.user,
  response.access_token,
  response.refresh_token,
);

// 2. Check auth on app start
useEffect(() => {
  authStore.checkAuth();
}, []);

// 3. Logout
await authStore.logout(); // Auto redirects to login
```

## 🧪 Testing Checklist

- [ ] Import auth store: `import { useAuthStore } from "@/src/features/auth/store/authStore"`
- [ ] Import shared components: `import { Button } from "@/src/shared/components"`
- [ ] API calls work with token injection
- [ ] Token auto-refresh on 401
- [ ] Validation helpers work
- [ ] Error handling works

---

💡 **Tip**: Bookmark this file for quick reference!

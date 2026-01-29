import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { create } from "zustand";

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: User, token: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,

  login: async (user, token) => {
    await AsyncStorage.setItem("access_token", token);
    await AsyncStorage.setItem("user_profile", JSON.stringify(user));
    set({ user, token, isAuthenticated: true });
  },

  logout: async () => {
    await AsyncStorage.removeItem("access_token");
    await AsyncStorage.removeItem("user_profile");
    set({ user: null, token: null, isAuthenticated: false });
    router.replace("/(auth)/login");
  },

  checkAuth: async () => {
    set({ isLoading: true });
    try {
      const token = await AsyncStorage.getItem("access_token");
      const userStr = await AsyncStorage.getItem("user_profile");
      if (token && userStr) {
        set({ token, user: JSON.parse(userStr), isAuthenticated: true });
      } else {
        set({ token: null, user: null, isAuthenticated: false });
      }
    } catch (error) {
      console.error("Auth check failed", error);
      set({ token: null, user: null, isAuthenticated: false });
    } finally {
      set({ isLoading: false });
    }
  },
}));

import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import Constants from "expo-constants";
import { authEvents, AUTH_EVENTS } from "./authEvents";

const API_URL =
  Constants.expoConfig?.extra?.apiUrl ||
  process.env.EXPO_PUBLIC_API_URL ||
  "http://localhost:3000/api";

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// Request interceptor for API calls
apiClient.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor for API calls
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized - try to refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = await AsyncStorage.getItem("refresh_token");
        if (!refreshToken) {
          // No refresh token, emit logout event
          authEvents.emit(AUTH_EVENTS.UNAUTHORIZED);
          return Promise.reject(error);
        }

        // Call refresh token API
        const response = await axios.post(`${API_URL}/auth/refresh-token`, {
          refreshToken,
        });

        const { access_token, refresh_token } = response.data.data;

        // Save new tokens
        await AsyncStorage.setItem("access_token", access_token);
        await AsyncStorage.setItem("refresh_token", refresh_token);

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed, emit logout event
        await AsyncStorage.removeItem("access_token");
        await AsyncStorage.removeItem("refresh_token");
        await AsyncStorage.removeItem("user_profile");
        authEvents.emit(AUTH_EVENTS.UNAUTHORIZED);
        return Promise.reject(refreshError);
      }
    }

    // Handle 403 Forbidden
    if (error.response?.status === 403) {
      // Token is invalid or expired
      await AsyncStorage.removeItem("access_token");
      await AsyncStorage.removeItem("refresh_token");
      await AsyncStorage.removeItem("user_profile");
      authEvents.emit(AUTH_EVENTS.UNAUTHORIZED);
    }

    return Promise.reject(error);
  },
);

export default apiClient;

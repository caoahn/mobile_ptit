import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const API_URL = "https://api.example.com/v1"; // Replace with your actual API URL

const client = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// Request interceptor for API calls
client.interceptors.request.use(
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
client.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Handle 401 Unauthorized (optional: refresh token logic)
    if (error.response?.status === 401) {
      // await AsyncStorage.removeItem('access_token');
      // router.replace('/(auth)/login');
    }
    return Promise.reject(error);
  },
);

export default client;

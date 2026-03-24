import { LoginRequest, RegisterRequest } from "../types/auth.request";
import { ApiResponse, AuthResponse } from "../types/auth.response";
import { UserProfileResponse } from "../types/user.response";
import apiClient from "@/src/shared/services/api/client";

export const login = async ({
  email,
  password,
}: LoginRequest): Promise<AuthResponse> => {
  const response = await apiClient.post<ApiResponse<AuthResponse>>(
    "/auth/login",
    {
      email,
      password,
    },
  );
  return response.data.data;
};

export const register = async ({
  username,
  email,
  password,
  full_name,
}: RegisterRequest): Promise<UserProfileResponse> => {
  const response = await apiClient.post<ApiResponse<UserProfileResponse>>(
    "/auth/register",
    { username, email, password, full_name },
  );
  return response.data.data;
};

export const refreshToken = async (
  refreshToken: string,
): Promise<AuthResponse> => {
  const response = await apiClient.post<ApiResponse<AuthResponse>>(
    "/auth/refresh-token",
    { refreshToken },
  );
  return response.data.data;
};

export const logout = async (): Promise<void> => {
  // Optional: Call logout endpoint if you have one
  // await apiClient.post('/auth/logout');
  return Promise.resolve();
};

export const getCurrentUser = async (): Promise<UserProfileResponse> => {
  const response =
    await apiClient.get<ApiResponse<UserProfileResponse>>("/auth/me");
  return response.data.data;
};

export const sendOtp = async (email: string) => {
  const res = await apiClient.post("/auth/forgot-password", { email });
  return res.data;
};

export const verifyOtp = async (email: string, otp: string) => {
  const res = await apiClient.post("/auth/verify-otp", { email, otp });
  return res.data;
};

export const resetPassword = async (email: string, password: string) => {
  const res = await apiClient.post("/auth/reset-password", { email, password });
  return res.data;
};

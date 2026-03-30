import apiClient from "@/src/shared/services/api/client";
import { ApiResponse } from "../types/auth.response";
import { UserProfileResponse } from "../types/user.response";

export const getProfile = async () => {
  const res = await apiClient.get("/users/profile");
  return res.data.data;
};

export const updateProfile = async (data: {
  full_name: string;
  username: string;
  bio: string;
  email: string;
  avatar_url?: string;
}) => {
  const res = await apiClient.put("/users/profile", data);
  return res.data.data;
};

interface SearchUsersResponse {
  success: boolean;
  data: UserProfileResponse[];
}

export const searchUsers = async (
  query: string,
  limit: number = 10,
): Promise<UserProfileResponse[]> => {
  const params = new URLSearchParams({ q: query, limit: limit.toString() });
  const response = await apiClient.get<SearchUsersResponse>(
    `/users/search?${params.toString()}`,
  );
  return response.data.data;
};

export const followUser = async (userId: number): Promise<void> => {
  await apiClient.post<ApiResponse<null>>(`/users/${userId}/follow`);
};

export const unfollowUser = async (userId: number): Promise<void> => {
  await apiClient.delete<ApiResponse<null>>(`/users/${userId}/follow`);
};

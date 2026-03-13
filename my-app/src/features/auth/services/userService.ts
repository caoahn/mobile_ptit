import apiClient from "@/src/shared/services/api/client";
import { UserProfileResponse } from "../types/user.response";

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

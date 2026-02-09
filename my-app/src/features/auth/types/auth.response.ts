import { UserProfileResponse } from "./user.response";

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: UserProfileResponse;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

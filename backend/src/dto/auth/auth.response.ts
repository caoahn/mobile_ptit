import { UserProfileResponse } from "../user/user.response";

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: UserProfileResponse;
}

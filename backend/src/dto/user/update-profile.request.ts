export interface UpdateProfileRequest {
  username: string;
  email: string;
  full_name?: string;
  bio?: string;
  avatar_url?: string;
}

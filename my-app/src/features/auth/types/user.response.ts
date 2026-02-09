export interface UserProfileResponse {
  id: string;
  username: string;
  email: string;
  full_name?: string;
  bio?: string;
  avatar_url?: string;
  created_at?: string;
  updated_at?: string;
  followers_count?: number;
  following_count?: number;
  recipes_count?: number;
}

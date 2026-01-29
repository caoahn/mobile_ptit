export interface UserProfileResponse {
  id: number;
  username: string;
  email: string;
  full_name?: string;
  bio?: string;
  avatar_url?: string;
  created_at: Date;
  updated_at: Date;
  followers_count?: number;
  following_count?: number;
  recipes_count?: number;
}

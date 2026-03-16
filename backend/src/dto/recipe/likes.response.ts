export interface RecipeLikeUserResponse {
  id: number;
  username: string;
  full_name?: string;
  avatar_url?: string;
  is_following: boolean;
  is_current_user: boolean;
}

export interface GetRecipeLikesResponse {
  users: RecipeLikeUserResponse[];
  total: number;
}

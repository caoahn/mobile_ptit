// Recipe types will be defined here

export interface Recipe {
  id: string;
  title: string;
  description: string;
  image_url?: string;
  cooking_time?: number;
  servings?: number;
  difficulty?: "easy" | "medium" | "hard";
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface CreateRecipeRequest {
  title: string;
  description: string;
  cooking_time?: number;
  servings?: number;
  difficulty?: "easy" | "medium" | "hard";
  ingredients: string[];
  steps: string[];
}

export interface RecipeResponse extends Recipe {
  user: {
    id: string;
    username: string;
    avatar_url?: string;
  };
  likes_count: number;
  comments_count: number;
  is_liked?: boolean;
  is_saved?: boolean;
}

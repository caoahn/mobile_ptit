// Recipe types

export interface Chef {
  id: number;
  username: string;
  avatar_url?: string;
}

export interface Tag {
  id: number;
  name: string;
  slug: string;
}

export interface Ingredient {
  id: number;
  name: string;
  amount: string;
  unit: string;
}

export interface RecipeStep {
  id: number;
  order: number;
  description: string;
  image_url?: string;
}

export interface Recipe {
  id: number;
  title: string;
  description: string;
  category: string;
  image_url?: string;
  cook_time: number;
  chef?: Chef;
  tags: Tag[];
  likes_count: number;
  comments_count: number;
  created_at: string;
  is_liked?: boolean;
  is_saved?: boolean;
}

export interface RecipeDetail extends Recipe {
  ingredients: Ingredient[];
  steps: RecipeStep[];
  difficulty?: "Easy" | "Medium" | "Hard";
  updated_at: string;
}

export interface FeedResponse {
  recipes: Recipe[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface Comment {
  id: number;
  content: string;
  user: Chef;
  parent_comment_id?: number;
  created_at: string;
  replies?: Comment[];
}

// Create Recipe types (for API requests)
export interface CreateIngredientRequest {
  name: string;
  amount: string;
  unit: string;
}

export interface CreateStepRequest {
  order: number;
  description: string;
  image_url?: string;
}

export interface CreateRecipeRequest {
  title: string;
  description: string;
  category: string;
  image_url?: string;
  difficulty: "Easy" | "Medium" | "Hard";
  cook_time: number;
  ingredients: CreateIngredientRequest[];
  steps: CreateStepRequest[];
  tags?: string[];
}

export interface RecipeResponse extends Recipe {
  user: Chef;
  likes_count: number;
  comments_count: number;
  is_liked?: boolean;
  is_saved?: boolean;
}

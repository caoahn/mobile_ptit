export interface IngredientResponse {
  id: number;
  name: string;
  amount: string;
  unit: string;
}

export interface RecipeStepResponse {
  id: number;
  order: number;
  description: string;
  image_url?: string;
}

export interface TagResponse {
  id: number;
  name: string;
  slug: string;
}

export interface ChefResponse {
  id: number;
  username: string;
  avatar_url?: string;
}

export interface RecipeResponse {
  id: number;
  title: string;
  description: string;
  category: string;
  image_url?: string;
  difficulty: "Easy" | "Medium" | "Hard";
  cooking_time: number;
  calories?: number;
  chef?: ChefResponse;
  ingredients: IngredientResponse[];
  steps: RecipeStepResponse[];
  tags: TagResponse[];
  created_at: Date;
  updated_at: Date;
  is_liked?: boolean;
  is_saved?: boolean;
}

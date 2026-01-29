import { IngredientResponse, RecipeStepResponse } from "./recipe.response";

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
  cooking_time: number;
  calories?: number;
  ingredients: CreateIngredientRequest[];
  steps: CreateStepRequest[];
}

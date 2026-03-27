import {
  CreateIngredientRequest,
  CreateStepRequest,
} from "./create-recipe.request";

export interface UpdateIngredientRequest extends CreateIngredientRequest {
  id?: number;
}

export interface UpdateStepRequest extends CreateStepRequest {
  id?: number;
}

export interface UpdateRecipeRequest {
  title?: string;
  description?: string;
  category?: string;
  image_url?: string;
  difficulty?: "Easy" | "Medium" | "Hard";
  cook_time?: number;
  servings?: number;
  calories?: number;
  ingredients?: UpdateIngredientRequest[];
  steps?: UpdateStepRequest[];
  tags?: string[]; 
}

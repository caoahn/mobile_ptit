import {
  CreateIngredientRequest,
  CreateStepRequest,
} from "./create-recipe.request";

export interface UpdateRecipeRequest {
  title?: string;
  description?: string;
  category?: string;
  image_url?: string;
  difficulty?: "Easy" | "Medium" | "Hard";
  cooking_time?: number;
  calories?: number;
  ingredients?: CreateIngredientRequest[]; // Full replace or partial update strategy? Usually full replace for simplicity in DTO
  steps?: CreateStepRequest[];
}

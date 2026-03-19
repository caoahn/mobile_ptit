import { UpdateRecipeRequest } from "../../dto/recipe/update-recipe.request";
import { RecipeResponse } from "../../dto/recipe/recipe.response";

export interface IRecipeService {

  updateRecipe(
    recipeId: number,
    userId: number,
    data: UpdateRecipeRequest
  ): Promise<RecipeResponse | any | null>;

  getRecipeDetail(
    recipeId: number,
    userId?: number
  ): Promise<RecipeResponse | any | null>;

  deleteRecipe(
    recipeId: number,
    userId: number
  ): Promise<void>;
}
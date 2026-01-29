import { CreateRecipeRequest } from "../../dto/recipe/create-recipe.request";
import { RecipeResponse } from "../../dto/recipe/recipe.response";
import { GetFeedResponse } from "../../dto/recipe/feed.response";

export interface IRecipeService {
  createRecipe(
    userId: number,
    data: CreateRecipeRequest,
  ): Promise<RecipeResponse>;
  getFeed(
    page: number,
    limit: number,
    category?: string,
  ): Promise<GetFeedResponse>;
  getRecipeDetail(id: number, userId?: number): Promise<RecipeResponse | null>;
  searchRecipes(query: string): Promise<RecipeResponse[]>;
  getUserRecipes(userId: number): Promise<RecipeResponse[]>;
  toggleLike(userId: number, recipeId: number): Promise<boolean>;
  toggleSave(userId: number, recipeId: number): Promise<boolean>;
  getSavedRecipes(userId: number): Promise<RecipeResponse[]>;
}

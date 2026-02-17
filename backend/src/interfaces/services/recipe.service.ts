import { CreateRecipeRequest } from "../../dto/recipe/create-recipe.request";
import { CreateCommentRequest } from "../../dto/recipe/create-comment.request";
import {
  RecipeResponse,
  CommentResponse,
} from "../../dto/recipe/recipe.response";
import { GetFeedResponse } from "../../dto/recipe/feed.response";
import { GetCommentsResponse } from "../../dto/recipe/comments.response";

export interface IRecipeService {
  createRecipe(
    userId: number,
    data: CreateRecipeRequest,
  ): Promise<RecipeResponse>;
  getFeed(
    page: number,
    limit: number,
    category?: string,
    userId?: number,
  ): Promise<GetFeedResponse>;
  getRecipeDetail(id: number, userId?: number): Promise<RecipeResponse | null>;
  searchRecipes(query: string, userId?: number): Promise<RecipeResponse[]>;
  getUserRecipes(
    userId: number,
    requestUserId?: number,
  ): Promise<RecipeResponse[]>;
  toggleLike(userId: number, recipeId: number): Promise<boolean>;
  toggleSave(userId: number, recipeId: number): Promise<boolean>;
  getSavedRecipes(userId: number): Promise<RecipeResponse[]>;
  getRecipeComments(
    recipeId: number,
    page: number,
    limit: number,
  ): Promise<GetCommentsResponse>;
  createComment(
    userId: number,
    recipeId: number,
    data: CreateCommentRequest,
  ): Promise<CommentResponse>;
}

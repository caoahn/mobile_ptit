import { CreateRecipeRequest } from "../../dto/recipe/create-recipe.request";
import { CreateCommentRequest } from "../../dto/recipe/create-comment.request";
import {
  RecipeResponse,
  CommentResponse,
} from "../../dto/recipe/recipe.response";
import { GetFeedResponse } from "../../dto/recipe/feed.response";
import { GetCommentsResponse } from "../../dto/recipe/comments.response";
import { GetRecipeLikesResponse } from "../../dto/recipe/likes.response";

export interface RecommendedFeedResponse extends GetFeedResponse {
  source: "rec" | "feed";
}

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
    time?: string,
    sort?: string,
    tag?: string,
  ): Promise<GetFeedResponse>;
  getRecommendedFeed(
    userId: number,
    page?: number,
    limit?: number,
    seenIds?: number[],
  ): Promise<RecommendedFeedResponse>;
  getFollowingFeed(
    userId: number,
    page: number,
    limit: number,
  ): Promise<GetFeedResponse>;
  getRecipeDetail(id: number, userId?: number): Promise<RecipeResponse | null>;
  searchRecipes(
    query: string,
    page?: number,
    limit?: number,
    userId?: number,
  ): Promise<GetFeedResponse>;
  getUserRecipes(
    userId: number,
    requestUserId?: number,
  ): Promise<RecipeResponse[]>;
  toggleLike(userId: number, recipeId: number): Promise<boolean>;
  toggleSave(userId: number, recipeId: number): Promise<boolean>;
  getSavedRecipes(userId: number): Promise<RecipeResponse[]>;
  getRecipeLikes(
    recipeId: number,
    requestUserId?: number,
  ): Promise<GetRecipeLikesResponse>;
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
  updateComment(
    userId: number,
    commentId: number,
    content: string,
  ): Promise<CommentResponse>;
  deleteComment(userId: number, commentId: number): Promise<void>;
}

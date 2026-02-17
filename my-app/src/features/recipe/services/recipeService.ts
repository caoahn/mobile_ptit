import apiClient from "@/src/shared/services/api/client";
import { ApiResponse } from "@/src/features/auth/types/auth.response";
import {
  Recipe,
  RecipeDetail,
  CreateRecipeRequest,
  FeedResponse,
  Comment,
  CommentsResponse,
} from "../types/recipe.types";

export const getFeed = async (
  page: number = 1,
  limit: number = 10,
  category?: string,
): Promise<FeedResponse> => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });
  if (category) params.append("category", category);

  const response = await apiClient.get<FeedResponse>(
    `/recipes?${params.toString()}`,
  );
  return response.data;
};

export const getRecipeById = async (id: number): Promise<RecipeDetail> => {
  const response = await apiClient.get<RecipeDetail>(`/recipes/${id}`);
  return response.data;
};

export const getRecipeComments = async (
  id: number,
  page: number = 1,
  limit: number = 10,
): Promise<CommentsResponse> => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });
  const response = await apiClient.get<CommentsResponse>(
    `/recipes/${id}/comments?${params.toString()}`,
  );
  return response.data;
};

export const createComment = async (
  recipeId: number,
  content: string,
  parent_comment_id?: number,
): Promise<Comment> => {
  const response = await apiClient.post<Comment>(
    `/recipes/${recipeId}/comments`,
    { content, parent_comment_id },
  );
  return response.data;
};

export const createRecipe = async (
  data: CreateRecipeRequest,
): Promise<Recipe> => {
  const response = await apiClient.post<Recipe>("/recipes", data);
  return response.data;
};

export const updateRecipe = async (
  id: number,
  data: Partial<CreateRecipeRequest>,
): Promise<Recipe> => {
  const response = await apiClient.put<ApiResponse<Recipe>>(
    `/recipes/${id}`,
    data,
  );
  return response.data.data;
};

export const deleteRecipe = async (id: number): Promise<void> => {
  await apiClient.delete(`/recipes/${id}`);
};

export const toggleLike = async (id: number): Promise<{ liked: boolean }> => {
  const response = await apiClient.post<{ liked: boolean }>(
    `/recipes/${id}/like`,
  );
  return response.data;
};

export const toggleSave = async (id: number): Promise<{ saved: boolean }> => {
  const response = await apiClient.post<{ saved: boolean }>(
    `/recipes/${id}/save`,
  );
  return response.data;
};

export const likeRecipe = async (id: number): Promise<void> => {
  await apiClient.post(`/recipes/${id}/like`);
};

export const unlikeRecipe = async (id: number): Promise<void> => {
  await apiClient.delete(`/recipes/${id}/like`);
};

export const saveRecipe = async (id: number): Promise<void> => {
  await apiClient.post(`/recipes/${id}/save`);
};

export const unsaveRecipe = async (id: number): Promise<void> => {
  await apiClient.delete(`/recipes/${id}/save`);
};

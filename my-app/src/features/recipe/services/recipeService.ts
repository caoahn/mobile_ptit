import apiClient from "@/src/shared/services/api/client";
import { ApiResponse } from "@/src/features/auth/types/auth.response";
import {
  Recipe,
  RecipeResponse,
  CreateRecipeRequest,
} from "../types/recipe.types";

export const getRecipes = async (): Promise<RecipeResponse[]> => {
  const response =
    await apiClient.get<ApiResponse<RecipeResponse[]>>("/recipes");
  return response.data.data;
};

export const getRecipeById = async (id: string): Promise<RecipeResponse> => {
  const response = await apiClient.get<ApiResponse<RecipeResponse>>(
    `/recipes/${id}`,
  );
  return response.data.data;
};

export const createRecipe = async (
  data: CreateRecipeRequest,
): Promise<Recipe> => {
  const response = await apiClient.post<ApiResponse<Recipe>>("/recipes", data);
  return response.data.data;
};

export const updateRecipe = async (
  id: string,
  data: Partial<CreateRecipeRequest>,
): Promise<Recipe> => {
  const response = await apiClient.put<ApiResponse<Recipe>>(
    `/recipes/${id}`,
    data,
  );
  return response.data.data;
};

export const deleteRecipe = async (id: string): Promise<void> => {
  await apiClient.delete(`/recipes/${id}`);
};

export const likeRecipe = async (id: string): Promise<void> => {
  await apiClient.post(`/recipes/${id}/like`);
};

export const unlikeRecipe = async (id: string): Promise<void> => {
  await apiClient.delete(`/recipes/${id}/like`);
};

export const saveRecipe = async (id: string): Promise<void> => {
  await apiClient.post(`/recipes/${id}/save`);
};

export const unsaveRecipe = async (id: string): Promise<void> => {
  await apiClient.delete(`/recipes/${id}/save`);
};

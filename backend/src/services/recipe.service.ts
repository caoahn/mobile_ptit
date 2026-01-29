import { IRecipeRepository } from "../interfaces/repositories/recipe.repository";
import { Recipe, RecipeCreationAttributes } from "../models/index";
import { IRecipeService } from "../interfaces/services/recipe.service";
import { CreateRecipeRequest } from "../dto/recipe/create-recipe.request";
import { RecipeResponse } from "../dto/recipe/recipe.response";
import { GetFeedResponse } from "../dto/recipe/feed.response";

export class RecipeService implements IRecipeService {
  constructor(private readonly recipeRepository: IRecipeRepository) {}

  private toDTO(recipe: Recipe): RecipeResponse {
    const raw = recipe.toJSON() as any;
    return {
      id: raw.id,
      title: raw.title,
      description: raw.description,
      category: raw.category,
      image_url: raw.image_url,
      difficulty: raw.difficulty,
      cooking_time: raw.cooking_time,
      calories: raw.calories,
      chef: raw.chef
        ? {
            id: raw.chef.id,
            username: raw.chef.username,
            avatar_url: raw.chef.avatar_url,
          }
        : undefined,
      ingredients: raw.ingredients
        ? raw.ingredients.map((i: any) => ({
            id: i.id,
            name: i.name,
            amount: i.amount,
            unit: i.unit,
          }))
        : [],
      steps: raw.steps
        ? raw.steps.map((s: any) => ({
            id: s.id,
            order: s.order,
            description: s.description,
            image_url: s.image_url,
          }))
        : [],
      created_at: raw.created_at,
      updated_at: raw.updated_at,
      is_liked: false, // Default
      is_saved: false, // Default
    };
  }

  async createRecipe(
    userId: number,
    data: CreateRecipeRequest,
  ): Promise<RecipeResponse> {
    const { ingredients, steps, ...recipeData } = data;
    const newRecipe: RecipeCreationAttributes = {
      ...recipeData,
      user_id: userId,
    };
    const created = await this.recipeRepository.create(
      newRecipe,
      ingredients,
      steps,
    );
    return this.toDTO(created);
  }

  async getFeed(
    page: number,
    limit: number,
    category?: string,
  ): Promise<GetFeedResponse> {
    const { rows, count } = await this.recipeRepository.findAll(
      page,
      limit,
      category,
    );
    return {
      rows: rows.map((r) => this.toDTO(r)),
      count,
    };
  }

  async getRecipeDetail(
    id: number,
    userId?: number,
  ): Promise<RecipeResponse | null> {
    const recipe = await this.recipeRepository.findById(id);
    if (!recipe) return null;

    const dto = this.toDTO(recipe);

    if (userId) {
      // TODO: Implement actual check
      dto.is_liked = false;
      dto.is_saved = false;
    }

    return dto;
  }

  async searchRecipes(query: string): Promise<RecipeResponse[]> {
    const recipes = await this.recipeRepository.search(query);
    return recipes.map((r) => this.toDTO(r));
  }

  async getUserRecipes(userId: number): Promise<RecipeResponse[]> {
    const recipes = await this.recipeRepository.findByUserId(userId);
    return recipes.map((r) => this.toDTO(r));
  }

  async toggleLike(userId: number, recipeId: number): Promise<boolean> {
    try {
      await this.recipeRepository.likeRecipe(userId, recipeId);
      return true;
    } catch (e) {
      await this.recipeRepository.unlikeRecipe(userId, recipeId);
      return false;
    }
  }

  async toggleSave(userId: number, recipeId: number): Promise<boolean> {
    try {
      await this.recipeRepository.saveRecipe(userId, recipeId);
      return true;
    } catch (e) {
      await this.recipeRepository.unsaveRecipe(userId, recipeId);
      return false;
    }
  }

  async getSavedRecipes(userId: number): Promise<RecipeResponse[]> {
    const recipes = await this.recipeRepository.getSavedRecipes(userId);
    return recipes.map((r) => this.toDTO(r));
  }
}

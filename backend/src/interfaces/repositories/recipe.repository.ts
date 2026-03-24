import {
  Recipe,
  RecipeCreationAttributes,
  RecipeAttributes,
  RecipeStepCreationAttributes,
  Like,
} from "../../models/index";

export interface IRecipeRepository {
  create(
    recipe: RecipeCreationAttributes,
    ingredients: any[],
    steps: any[],
    tags?: string[],
  ): Promise<Recipe>;
  findAll(
    page: number,
    limit: number,
    category?: string,
    time?: string,
    sort?: string
  ): Promise<{ rows: Recipe[]; count: number }>;
  findById(id: number): Promise<Recipe | null>;
  update(id: number, data: Partial<RecipeAttributes>): Promise<Recipe | null>;
  delete(id: number): Promise<void>;
  search(
    query: string,
    page?: number,
    limit?: number,
  ): Promise<{ rows: Recipe[]; count: number }>;
  findByUserId(userId: number): Promise<Recipe[]>;
  getFollowingFeed(
    userId: number,
    page: number,
    limit: number,
  ): Promise<{ rows: Recipe[]; count: number }>;
  likeRecipe(userId: number, recipeId: number): Promise<void>;
  unlikeRecipe(userId: number, recipeId: number): Promise<void>;
  getRecipeLikes(recipeId: number): Promise<Like[]>;
  saveRecipe(userId: number, recipeId: number): Promise<void>;
  unsaveRecipe(userId: number, recipeId: number): Promise<void>;
  getSavedRecipes(userId: number): Promise<Recipe[]>;
  replaceSteps(
    recipeId: number,
    steps: any[],
  ): Promise<void>;
  replaceIngredients(recipeId: number, ingredients: any[]): Promise<void>;
}

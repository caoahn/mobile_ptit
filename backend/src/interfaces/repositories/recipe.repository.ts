import {
  Recipe,
  RecipeCreationAttributes,
  RecipeAttributes,
} from "../../models/index";

export interface IRecipeRepository {
  create(
    recipe: RecipeCreationAttributes,
    ingredients: any[],
    steps: any[],
  ): Promise<Recipe>;
  findAll(
    page: number,
    limit: number,
    category?: string,
  ): Promise<{ rows: Recipe[]; count: number }>;
  findById(id: number): Promise<Recipe | null>;
  update(id: number, data: Partial<RecipeAttributes>): Promise<Recipe | null>;
  delete(id: number): Promise<void>;
  search(query: string): Promise<Recipe[]>;
  findByUserId(userId: number): Promise<Recipe[]>;
  likeRecipe(userId: number, recipeId: number): Promise<void>;
  unlikeRecipe(userId: number, recipeId: number): Promise<void>;
  saveRecipe(userId: number, recipeId: number): Promise<void>;
  unsaveRecipe(userId: number, recipeId: number): Promise<void>;
  getSavedRecipes(userId: number): Promise<Recipe[]>;
}

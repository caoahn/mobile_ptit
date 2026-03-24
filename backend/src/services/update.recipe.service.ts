import { IRecipeRepository } from "../interfaces/repositories/recipe.repository";
import { UpdateRecipeRequest } from "../dto/recipe/update-recipe.request";
import { RecipeResponse } from "../dto/recipe/recipe.response";
import { IUpdateRecipeService } from "../interfaces/services/update.recipe.service";

export class UpdateRecipeService implements IUpdateRecipeService {
  constructor(private readonly recipeRepository: IRecipeRepository) {}

  async updateRecipe(
    recipeId: number,
    userId: number,
    data: UpdateRecipeRequest,
  ): Promise<RecipeResponse | null> {
    const recipe = await this.recipeRepository.findById(recipeId);

    if (!recipe) throw new Error("Recipe not found");

    if (recipe.user_id !== userId) throw new Error("Unauthorized");

    await this.recipeRepository.update(recipeId, {
      title: data.title,
      description: data.description,
      category: data.category,
      image_url: data.image_url,
      cook_time: data.cooking_time,
      servings: data.servings,
    });

    if (data.steps) {
      const steps = data.steps.map((step, index) => ({
        recipe_id: recipeId,
        step_number: index + 1,
        title: step.title,
        description: step.description,
        image_url: step.image_url,
      }));

      await this.recipeRepository.replaceSteps(recipeId, steps);
    }

    return this.recipeRepository.findById(
      recipeId,
    ) as Promise<RecipeResponse | null>;
  }

  async deleteRecipe(recipeId: number, userId: number): Promise<void> {
    const recipe = await this.recipeRepository.findById(recipeId);

    if (!recipe) throw new Error("Recipe not found");

    if (recipe.user_id !== userId) throw new Error("Unauthorized");

    await this.recipeRepository.delete(recipeId);
  }
}

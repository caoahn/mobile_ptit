import { Recipe } from "../models/recipe.model";
import { RecipeStep } from "../models/recipe_step.model";
import { UpdateRecipeRequest } from "../dto/recipe/update-recipe.request";
import { RecipeResponse } from "../dto/recipe/recipe.response";
import { IRecipeService } from "../interfaces/services/update.recipe.service";

export class RecipeService implements IRecipeService {

  
  async updateRecipe(
    recipeId: number,
    userId: number,
    data: UpdateRecipeRequest
  ): Promise<RecipeResponse | null> {

    console.log(Object.keys(Recipe.associations));

    console.log("SERVICE UPDATE START");

    const recipe = await Recipe.findByPk(recipeId);

    if (!recipe) throw new Error("Recipe not found");

    if (recipe.user_id !== userId) throw new Error("Unauthorized");

    await recipe.update({
      title: data.title,
      description: data.description,
      category: data.category,
      image_url: data.image_url,
      cook_time: data.cooking_time,
    });

    if (data.steps) {
      await RecipeStep.destroy({
        where: { recipe_id: recipeId },
      });

      const steps = data.steps.map((step, index) => ({
        recipe_id: recipeId,
        step_number: index + 1,
        title: step.title,
        description: step.description,
        image_url: step.image_url,
      }));

      await RecipeStep.bulkCreate(steps);
    }

    const updatedRecipe = await Recipe.findByPk(recipeId, {
      include: [
  {
    model: RecipeStep,
    as: "steps", // ⚠️ thêm dòng này
  },
],
    });

    console.log("SERVICE UPDATE DONE");

    return updatedRecipe as any;
  }

  async getRecipeDetail(recipeId: number): Promise<RecipeResponse | null> {

    const recipe = await Recipe.findByPk(recipeId, {
      include: [
  {
    model: RecipeStep,
    as: "steps", // ⚠️ thêm dòng này
  },
],
    });

    return recipe as any;
  }

  async deleteRecipe(recipeId: number, userId: number): Promise<void> {

    const recipe = await Recipe.findByPk(recipeId);

    if (!recipe) throw new Error("Recipe not found");

    if (recipe.user_id !== userId) throw new Error("Unauthorized");

    await RecipeStep.destroy({
      where: { recipe_id: recipeId },
    });

    await recipe.destroy();
  }
}
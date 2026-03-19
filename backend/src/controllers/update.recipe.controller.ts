import { Request, Response, NextFunction } from "express";
import { IRecipeService } from "../interfaces/services/update.recipe.service";

export class UpdateRecipeController {
  constructor(private readonly recipeService: IRecipeService) {}

  updateRecipe = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const recipeId = parseInt(req.params.id);
      const userId = (req as any).user.id;

      console.log("UPDATE REQUEST RECEIVED");
    console.log("Recipe ID:", recipeId);
    console.log("User ID:", userId);
    console.log("Body:", JSON.stringify(req.body, null, 2));


      const recipe = await this.recipeService.updateRecipe(
        recipeId,
        userId,
        req.body
      );

      console.log("UPDATE RESULT:", recipe);

      res.json({
        success: true,
        data: recipe,
      });
    } catch (error) {
      console.log("UPDATE ERROR:", error);
      next(error);
    }
  };

  getRecipeDetail = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const recipeId = parseInt(req.params.id);

      const recipe = await this.recipeService.getRecipeDetail(recipeId);

      res.json({
        success: true,
        data: recipe,
      });
    } catch (error) {
      next(error);
    }
  };

  deleteRecipe = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const recipeId = parseInt(req.params.id);
      const userId = (req as any).user.id;

      await this.recipeService.deleteRecipe(recipeId, userId);

      res.json({
        success: true,
        message: "Recipe deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  };
}
import { Request, Response, NextFunction } from "express";
import { IUpdateRecipeService } from "../interfaces/services/update.recipe.service";

export class UpdateRecipeController {
  constructor(private readonly updateRecipeService: IUpdateRecipeService) {}

  updateRecipe = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const recipeId = parseInt(req.params.id);
      const userId = (req as any).user.id;

      const recipe = await this.updateRecipeService.updateRecipe(
        recipeId,
        userId,
        req.body,
      );

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

      await this.updateRecipeService.deleteRecipe(recipeId, userId);

      res.json({
        success: true,
        message: "Recipe deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  };
}

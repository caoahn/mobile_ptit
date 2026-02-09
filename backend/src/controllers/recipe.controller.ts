import { Request, Response, NextFunction } from "express";
import { IRecipeService } from "../interfaces/services/recipe.service";
import { CreateRecipeRequest } from "../dto/recipe/create-recipe.request";
import { GetFeedRequest } from "../dto/recipe/feed.request";

export class RecipeController {
  constructor(private readonly recipeService: IRecipeService) {}

  createRecipe = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Assuming authMiddleware attaches user to req.user
      const userId = (req as any).user.id;
      const recipeData: CreateRecipeRequest = req.body;
      console.log("Tags received in controller:", recipeData.tags);
      const recipe = await this.recipeService.createRecipe(userId, recipeData);
      res.status(201).json(recipe);
    } catch (error) {
      next(error);
    }
  };

  getFeed = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const category = req.query.category as string;

      const result = await this.recipeService.getFeed(page, limit, category);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  getRecipeDetail = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user?.id; // Optional auth
      const result = await this.recipeService.getRecipeDetail(
        parseInt(req.params.id),
        userId,
      );
      if (!result) {
        return res.status(404).json({ message: "Recipe not found" });
      }
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  searchRecipes = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const query = (req.query.q as string) || "";
      const result = await this.recipeService.searchRecipes(query);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  getUserRecipes = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = parseInt(req.params.id);
      const result = await this.recipeService.getUserRecipes(userId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  toggleLike = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user.id;
      const recipeId = parseInt(req.params.id);
      const liked = await this.recipeService.toggleLike(userId, recipeId);
      res.json({ liked });
    } catch (error) {
      next(error);
    }
  };

  toggleSave = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user.id;
      const recipeId = parseInt(req.params.id);
      const saved = await this.recipeService.toggleSave(userId, recipeId);
      res.json({ saved });
    } catch (error) {
      next(error);
    }
  };

  getMySavedRecipes = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const userId = (req as any).user.id;
      const result = await this.recipeService.getSavedRecipes(userId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };
}

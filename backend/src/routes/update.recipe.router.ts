import { Router } from "express";
import { UpdateRecipeController } from "../controllers/update.recipe.controller";
import { RecipeService } from "../services/update.recipe.service";

const router = Router();

const recipeService = new RecipeService();
const recipeController = new UpdateRecipeController(recipeService);

router.get("/:id", recipeController.getRecipeDetail);
router.put("/:id", recipeController.updateRecipe);
router.delete("/:id", recipeController.deleteRecipe);

export default router;
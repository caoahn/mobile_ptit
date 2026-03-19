import { Router } from "express";
import container from "../container";
import { UpdateRecipeController } from "../controllers/update.recipe.controller";

const router = Router();

const recipeController = container.resolve<UpdateRecipeController>(
  "updateRecipeController",
);

router.put("/:id", recipeController.updateRecipe);
router.delete("/:id", recipeController.deleteRecipe);

export default router;

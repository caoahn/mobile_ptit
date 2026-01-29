import { Router } from "express";
import container from "../container";
import { authMiddleware } from "../middlewares/auth.middleware";
import { RecipeController } from "../controllers/recipe.controller";

const recipeRouter = Router();
const recipeController =
  container.resolve<RecipeController>("recipeController");

recipeRouter.get("/", recipeController.getFeed);
recipeRouter.get("/search", recipeController.searchRecipes);
recipeRouter.get("/:id", recipeController.getRecipeDetail);
recipeRouter.post("/", authMiddleware, recipeController.createRecipe);
recipeRouter.put("/:id", authMiddleware, (req, res) =>
  res.send("Update logic here"),
); // TODO
recipeRouter.delete("/:id", authMiddleware, (req, res) =>
  res.send("Delete logic here"),
); // TODO

recipeRouter.post("/:id/like", authMiddleware, recipeController.toggleLike);
recipeRouter.delete("/:id/like", authMiddleware, recipeController.toggleLike); // Toggle handles both

recipeRouter.post("/:id/save", authMiddleware, recipeController.toggleSave);
recipeRouter.delete("/:id/save", authMiddleware, recipeController.toggleSave); // Toggle handles both

export default recipeRouter;

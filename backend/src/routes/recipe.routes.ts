import { Router } from "express";
import container from "../container";
import { authMiddleware } from "../middlewares/auth.middleware";
import { RecipeController } from "../controllers/recipe.controller";

const recipeRouter = Router();
const recipeController =
  container.resolve<RecipeController>("recipeController");

/**
 * @swagger
 * /recipes:
 *   get:
 *     summary: Get recipe feed
 *     tags: [Recipes]
 *     responses:
 *       200:
 *         description: List of recipes
 */
recipeRouter.get("/", recipeController.getFeed);

/**
 * @swagger
 * /recipes/search:
 *   get:
 *     summary: Search recipes
 *     tags: [Recipes]
 *     parameters:
 *       - in: query
 *         name: query
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Search results
 */
recipeRouter.get("/search", recipeController.searchRecipes);

/**
 * @swagger
 * /recipes/{id}:
 *   get:
 *     summary: Get recipe detail
 *     tags: [Recipes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Recipe details
 */
recipeRouter.get("/:id", recipeController.getRecipeDetail);

/**
 * @swagger
 * /recipes:
 *   post:
 *     summary: Create a new recipe
 *     tags: [Recipes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Recipe created
 */
recipeRouter.post("/", authMiddleware, recipeController.createRecipe);

/**
 * @swagger
 * /recipes/{id}:
 *   put:
 *     summary: Update a recipe
 *     tags: [Recipes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Recipe updated
 */
recipeRouter.put("/:id", authMiddleware, (req, res) =>
  res.send("Update logic here"),
); // TODO

/**
 * @swagger
 * /recipes/{id}:
 *   delete:
 *     summary: Delete a recipe
 *     tags: [Recipes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Recipe deleted
 */
recipeRouter.delete("/:id", authMiddleware, (req, res) =>
  res.send("Delete logic here"),
); // TODO

/**
 * @swagger
 * /recipes/{id}/like:
 *   post:
 *     summary: Like a recipe
 *     tags: [Recipes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Recipe liked
 */
recipeRouter.post("/:id/like", authMiddleware, recipeController.toggleLike);

/**
 * @swagger
 * /recipes/{id}/like:
 *   delete:
 *     summary: Unlike a recipe
 *     tags: [Recipes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Recipe unliked
 */
recipeRouter.delete("/:id/like", authMiddleware, recipeController.toggleLike); // Toggle handles both

/**
 * @swagger
 * /recipes/{id}/save:
 *   post:
 *     summary: Save a recipe
 *     tags: [Recipes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Recipe saved
 */
recipeRouter.post("/:id/save", authMiddleware, recipeController.toggleSave);

/**
 * @swagger
 * /recipes/{id}/save:
 *   delete:
 *     summary: Unsave a recipe
 *     tags: [Recipes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Recipe unsaved
 */
recipeRouter.delete("/:id/save", authMiddleware, recipeController.toggleSave); // Toggle handles both

export default recipeRouter;

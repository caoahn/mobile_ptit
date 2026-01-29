import { Router } from "express";
import container from "../container";
import { UserController } from "../controllers/user.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { RecipeController } from "../controllers/recipe.controller";

const router = Router();
const userController = container.resolve<UserController>("userController");
const recipeController =
  container.resolve<RecipeController>("recipeController");

router.use(authMiddleware);

/**
 * @swagger
 * /users/profile:
 *   get:
 *     summary: Get current user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile
 */
router.get("/me", userController.getProfile); // Alias for /profile matching API design "auth/me" usually
router.get("/profile", userController.getProfile);

/**
 * @swagger
 * /users/profile:
 *   put:
 *     summary: Update user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               full_name:
 *                 type: string
 *               bio:
 *                 type: string
 *               avatar_url:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated
 */
router.put("/profile", userController.updateProfile);

/**
 * @swagger
 * /users/{id}/follow:
 *   post:
 *     summary: Follow a user
 *     tags: [Users]
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
 *         description: Followed successfully
 */
router.post("/:id/follow", userController.followUser);

/**
 * @swagger
 * /users/{id}/follow:
 *   delete:
 *     summary: Unfollow a user
 *     tags: [Users]
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
 *         description: Unfollowed successfully
 */
router.delete("/:id/follow", userController.unfollowUser);

/**
 * @swagger
 * /users/{id}/followers:
 *   get:
 *     summary: Get followers of a user
 *     tags: [Users]
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
 *         description: List of followers
 */
router.get("/:id/followers", userController.getFollowers);

/**
 * @swagger
 * /users/{id}/following:
 *   get:
 *     summary: Get users followed by a user
 *     tags: [Users]
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
 *         description: List of following users
 */
router.get("/:id/following", userController.getFollowing);

/**
 * @swagger
 * /users/{id}/recipes:
 *   get:
 *     summary: Get recipes by a user
 *     tags: [Users]
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
 *         description: List of recipes
 */
router.get("/:id/recipes", recipeController.getUserRecipes);

/**
 * @swagger
 * /users/me/saved:
 *   get:
 *     summary: Get saved recipes
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of saved recipes
 */
router.get("/me/saved", recipeController.getMySavedRecipes);

export default router;

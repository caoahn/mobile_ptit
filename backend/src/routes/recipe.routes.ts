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
 *     summary: Create a new recipe post
 *     description: Create a complete recipe with ingredients, cooking steps, and tags
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
 *               - ingredients
 *               - steps
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Phở Bò Hà Nội"
 *                 description: Tên món ăn
 *               description:
 *                 type: string
 *                 example: "Món phở bò truyền thống của Hà Nội với nước dùng thơm ngon"
 *                 description: Mô tả món ăn
 *               image_url:
 *                 type: string
 *                 example: "https://example.com/pho-bo.jpg"
 *                 description: URL ảnh món ăn
 *               category:
 *                 type: string
 *                 example: "Món chính"
 *                 description: Danh mục món ăn
 *               prep_time:
 *                 type: integer
 *                 example: 30
 *                 description: Thời gian chuẩn bị (phút)
 *               cook_time:
 *                 type: integer
 *                 example: 120
 *                 description: Thời gian nấu (phút)
 *               servings:
 *                 type: integer
 *                 example: 4
 *                 description: Số khẩu phần
 *               tips:
 *                 type: string
 *                 example: "Nên hầm xương trong 3-4 tiếng để có nước dùng đậm đà"
 *                 description: Mẹo nấu nướng
 *               ingredients:
 *                 type: array
 *                 description: Danh sách nguyên liệu
 *                 items:
 *                   type: object
 *                   required:
 *                     - name
 *                   properties:
 *                     name:
 *                       type: string
 *                       example: "Thịt bò"
 *                     amount:
 *                       type: string
 *                       example: "500"
 *                     unit:
 *                       type: string
 *                       example: "gram"
 *               steps:
 *                 type: array
 *                 description: Các bước thực hiện
 *                 items:
 *                   type: object
 *                   required:
 *                     - step_number
 *                     - description
 *                   properties:
 *                     step_number:
 *                       type: integer
 *                       example: 1
 *                     title:
 *                       type: string
 *                       example: "Chuẩn bị nguyên liệu"
 *                     description:
 *                       type: string
 *                       example: "Rửa sạch thịt bò, thái lát mỏng"
 *                     image_url:
 *                       type: string
 *                       example: "https://example.com/step1.jpg"
 *               tags:
 *                 type: array
 *                 description: Danh sách tên tags (tự động tạo mới nếu chưa có)
 *                 items:
 *                   type: string
 *                 example: ["món việt", "thịt bò", "món nóng"]
 *     responses:
 *       201:
 *         description: Recipe created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Recipe created successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     title:
 *                       type: string
 *                     description:
 *                       type: string
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized - Invalid token
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

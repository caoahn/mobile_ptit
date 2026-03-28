import { Router } from "express";
import container from "../container";
import { authMiddleware } from "../middlewares/auth.middleware";
import { RecommendationController } from "../controllers/recommendation.controller";

const recommendationRouter = Router();
const recommendationController = container.resolve<RecommendationController>(
  "recommendationController",
);

/**
 * @swagger
 * /recommendations/track:
 *   post:
 *     summary: Track a user interaction on a recipe
 *     tags: [Recommendations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - recipe_id
 *               - event
 *             properties:
 *               recipe_id:
 *                 type: integer
 *               event:
 *                 type: string
 *                 enum: [share, save, comment, like, dwell_10s, view, click, skip]
 *               duration_s:
 *                 type: number
 *                 description: View duration in seconds (only for event=view)
 *     responses:
 *       200:
 *         description: Interaction tracked successfully
 */
recommendationRouter.post(
  "/track",
  authMiddleware,
  recommendationController.trackInteraction,
);

/**
 * @swagger
 * /recommendations/feed:
 *   get:
 *     summary: Get personalized recipe recommendations for the current user
 *     tags: [Recommendations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: k
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of recommendations to return
 *     responses:
 *       200:
 *         description: List of recommended recipe IDs with scores
 */
recommendationRouter.get(
  "/feed",
  authMiddleware,
  recommendationController.getRecommendations,
);

export default recommendationRouter;

import { Router } from "express";
import container from "../container";
import upload from "../middlewares/upload.middleware";
import { UtilController } from "../controllers/util.controller";

const utilRouter = Router();
const utilController = container.resolve<UtilController>("utilController");

/**
 * @swagger
 * /upload:
 *   post:
 *     summary: Upload a file
 *     tags: [Utils]
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: File uploaded
 */
utilRouter.post("/upload", upload.single("file"), utilController.uploadImage);

/**
 * @swagger
 * /ai/scan-ingredients:
 *   post:
 *     summary: Scan ingredients from image
 *     tags: [Utils]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - imageUrl
 *             properties:
 *               imageUrl:
 *                 type: string
 *     responses:
 *       200:
 *         description: List of detected ingredients
 */
utilRouter.post("/ai/scan-ingredients", utilController.scanIngredients);

export default utilRouter;

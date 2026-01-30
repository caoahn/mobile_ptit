import { Router } from "express";
import container from "../container";
import { AudioController } from "../controllers/audio.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import upload from "../middlewares/upload.middleware";

const router = Router();
const audioController = container.resolve<AudioController>("audioController");

router.use(authMiddleware);

/**
 * @swagger
 * /audio/upload:
 *   post:
 *     summary: Upload an audio file
 *     tags: [Audio]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               audio:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Audio uploaded
 */
router.post("/upload", upload.single("audio"), audioController.upload);

export default router;

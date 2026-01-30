import { Router } from "express";
import container from "../container";
import { TranscriptController } from "../controllers/transcript.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();
const transcriptController = container.resolve<TranscriptController>(
  "transcriptController",
);

router.use(authMiddleware);

/**
 * @swagger
 * /transcripts/{meetingId}:
 *   get:
 *     summary: Get transcript by meeting ID
 *     tags: [Transcripts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: meetingId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Transcript details
 */
router.get("/:meetingId", transcriptController.getByMeeting);

export default router;

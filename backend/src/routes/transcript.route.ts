import { Router } from "express";
import container from "../container";
import { TranscriptController } from "../controllers/transcript.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();
const transcriptController = container.resolve<TranscriptController>(
  "transcriptController",
);

router.use(authMiddleware);

router.get("/:meetingId", transcriptController.getByMeeting);

export default router;

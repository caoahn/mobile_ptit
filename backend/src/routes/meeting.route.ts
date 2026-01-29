import { Router } from "express";
import container from "../container";
import { MeetingController } from "../controllers/meeting.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();
const meetingController =
  container.resolve<MeetingController>("meetingController");

router.use(authMiddleware);

router.post("/", meetingController.create);
router.get("/:meetingId", meetingController.get);
router.post("/:meetingId/join", meetingController.join);
router.post("/:meetingId/end", meetingController.end);

export default router;

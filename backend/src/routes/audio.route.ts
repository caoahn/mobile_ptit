import { Router } from "express";
import container from "../container";
import { AudioController } from "../controllers/audio.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import upload from "../middlewares/upload.middleware";

const router = Router();
const audioController = container.resolve<AudioController>("audioController");

router.use(authMiddleware);

router.post("/upload", upload.single("audio"), audioController.upload);

export default router;

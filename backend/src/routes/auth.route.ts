import { Router } from "express";
import container from "../container";
import { AuthController } from "../controllers/auth.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
const router = Router();
const authController = container.resolve<AuthController>("authController");

router.post("/register", authController.register);

router.post("/login", authController.login);

router.post("/refresh-token", authController.refreshToken);

router.get("/me", authMiddleware, authController.me);

export default router;

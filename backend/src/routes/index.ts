import { Router } from "express";
import authRoute from "./auth.route";
import userRoute from "./user.route";
import recipeRoute from "./recipe.routes";
import utilRoute from "./util.routes";
import uploadRoute from "./upload.route";
import notificationRoute from "./notification.route";

const router = Router();

router.use("/auth", authRoute);
router.use("/users", userRoute);
router.use("/recipes", recipeRoute);
router.use("/upload", uploadRoute);
router.use("/notifications", notificationRoute);
router.use("/", utilRoute);

export default router;

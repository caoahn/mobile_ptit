import { Router } from "express";
import authRoute from "./auth.route";
import userRoute from "./user.route";
import recipeRoute from "./recipe.routes";
import utilRoute from "./util.routes";
import uploadRoute from "./upload.route";
import notificationRoute from "./notification.route";
import otpRoute from "./otp.routes";
import updateRecipeRoute from "./recipe-update.router";
import recommendationRoute from "./recommendation.route";

const router = Router();

router.use("/auth", authRoute);
router.use("/users", userRoute);
router.use("/auth", otpRoute);
router.use("/recipes", recipeRoute);
router.use("/upload", uploadRoute);
router.use("/notifications", notificationRoute);
router.use("/", utilRoute);
router.use("/recipes", updateRecipeRoute);
router.use("/recommendations", recommendationRoute);

export default router;

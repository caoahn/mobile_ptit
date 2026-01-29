import { Router } from "express";
import authRoute from "./auth.route";
import userRoute from "./user.route";
import meetingRoute from "./meeting.route";
import audioRoute from "./audio.route";
import transcriptRoute from "./transcript.route";
import recipeRoute from "./recipe.routes";
import utilRoute from "./util.routes";

const router = Router();

router.use("/auth", authRoute);
router.use("/users", userRoute); // Changed to plural
router.use("/meetings", meetingRoute); // Changed to plural to match conventions usually, or singular? previous was /api/meetings likely
router.use("/audio", audioRoute);
router.use("/transcripts", transcriptRoute);
router.use("/recipes", recipeRoute);
router.use("/", utilRoute);

export default router;

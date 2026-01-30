import { Router } from "express";
import container from "../container";
import { MeetingController } from "../controllers/meeting.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();
const meetingController =
  container.resolve<MeetingController>("meetingController");

router.use(authMiddleware);

/**
 * @swagger
 * /meetings:
 *   post:
 *     summary: Create a new meeting
 *     tags: [Meetings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Meeting created
 */
router.post("/", meetingController.create);

/**
 * @swagger
 * /meetings/{meetingId}:
 *   get:
 *     summary: Get meeting details
 *     tags: [Meetings]
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
 *         description: Meeting details
 */
router.get("/:meetingId", meetingController.get);

/**
 * @swagger
 * /meetings/{meetingId}/join:
 *   post:
 *     summary: Join a meeting
 *     tags: [Meetings]
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
 *         description: Joined meeting
 */
router.post("/:meetingId/join", meetingController.join);

/**
 * @swagger
 * /meetings/{meetingId}/end:
 *   post:
 *     summary: End a meeting
 *     tags: [Meetings]
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
 *         description: Meeting ended
 */
router.post("/:meetingId/end", meetingController.end);

export default router;

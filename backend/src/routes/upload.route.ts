import { Router } from "express";
import container from "../container";
import { UploadController } from "../controllers/upload.controller";
import upload from "../middlewares/upload.middleware";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();
const uploadController =
  container.resolve<UploadController>("uploadController");

// All upload routes require authentication
// router.use(authMiddleware);

/**
 * @swagger
 * /upload/image:
 *   post:
 *     summary: Upload single image
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Image file (JPEG, PNG, WEBP)
 *               folder:
 *                 type: string
 *                 description: Cloudinary folder name
 *                 default: recipes
 *     responses:
 *       200:
 *         description: Image uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Image uploaded successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     url:
 *                       type: string
 *                       example: https://res.cloudinary.com/xxx/image/upload/v123/recipes/image.jpg
 *                     publicId:
 *                       type: string
 *                       example: recipes/image_abc123
 *                     width:
 *                       type: number
 *                       example: 1200
 *                     height:
 *                       type: number
 *                       example: 800
 *                     format:
 *                       type: string
 *                       example: jpg
 *                     resourceType:
 *                       type: string
 *                       example: image
 *       400:
 *         description: No file uploaded or invalid file type
 *       401:
 *         description: Unauthorized
 */
router.post("/image", upload.single("image"), uploadController.uploadImage);

/**
 * @swagger
 * /upload/images:
 *   post:
 *     summary: Upload multiple images
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Array of image files (max 10)
 *               folder:
 *                 type: string
 *                 description: Cloudinary folder name
 *                 default: recipes
 *     responses:
 *       200:
 *         description: Images uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Images uploaded successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       url:
 *                         type: string
 *                       publicId:
 *                         type: string
 *                       width:
 *                         type: number
 *                       height:
 *                         type: number
 *                       format:
 *                         type: string
 *                       resourceType:
 *                         type: string
 *       400:
 *         description: No files uploaded
 *       401:
 *         description: Unauthorized
 */
router.post(
  "/images",
  upload.array("images", 10),
  uploadController.uploadMultipleImages,
);

/**
 * @swagger
 * /upload/image/{publicId}:
 *   delete:
 *     summary: Delete image by public ID
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: publicId
 *         required: true
 *         schema:
 *           type: string
 *         description: Cloudinary public ID (URL encoded, e.g., recipes%2Fimage_abc123)
 *         example: recipes%2Fimage_abc123
 *     responses:
 *       200:
 *         description: Image deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Image deleted successfully
 *                 data:
 *                   type: null
 *       400:
 *         description: Public ID is required
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Image not found
 */
router.delete("/image/:publicId(*)", uploadController.deleteImage);

export default router;

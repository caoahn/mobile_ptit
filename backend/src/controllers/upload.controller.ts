import { Request, Response, NextFunction } from "express";
import { CloudinaryService } from "../services/cloudinary.service";
import { sendSuccess, sendError } from "../utils/response";

export class UploadController {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  /**
   * Upload single image
   * POST /upload/image
   */
  uploadImage = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.file) {
        return sendError(res, 400, "No file uploaded");
      }

      const folder = (req.body.folder as string) || "recipes";

      const result = await this.cloudinaryService.uploadImage(
        req.file.path,
        folder,
      );

      sendSuccess(res, result, "Image uploaded successfully");
    } catch (error) {
      next(error);
    }
  };

  /**
   * Upload multiple images
   * POST /upload/images
   */
  uploadMultipleImages = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
        return sendError(res, 400, "No files uploaded");
      }

      const folder = (req.body.folder as string) || "recipes";
      const filePaths = req.files.map((file) => file.path);

      const results = await this.cloudinaryService.uploadMultipleImages(
        filePaths,
        folder,
      );

      sendSuccess(res, results, "Images uploaded successfully");
    } catch (error) {
      next(error);
    }
  };

  /**
   * Delete image
   * DELETE /upload/image/:publicId
   */
  deleteImage = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { publicId } = req.params;

      if (!publicId) {
        return sendError(res, 400, "Public ID is required");
      }

      // Decode publicId (might contain slashes)
      const decodedPublicId = decodeURIComponent(publicId);

      await this.cloudinaryService.deleteImage(decodedPublicId);

      sendSuccess(res, null, "Image deleted successfully");
    } catch (error) {
      next(error);
    }
  };
}

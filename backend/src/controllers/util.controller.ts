import { Request, Response, NextFunction } from "express";
import { IAIService } from "../services/ai.service";

export class UtilController {
  constructor(private readonly aiService: IAIService) {}

  uploadImage = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      // Return URL assuming static file serving is set up
      // If served at /uploads
      const url = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
      res.json({ url });
    } catch (error) {
      next(error);
    }
  };

  scanIngredients = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { imageUrl } = req.body;
      if (!imageUrl) {
        return res.status(400).json({ message: "Image URL required" });
      }
      const result = await this.aiService.scanIngredients(imageUrl);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };
}

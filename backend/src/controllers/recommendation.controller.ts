import { Request, Response, NextFunction } from "express";
import { IRecommendationService } from "../interfaces/services/recommendation.service";
import { TrackInteractionRequest } from "../dto/recommendation/interaction.request";
import { mapViewEvent } from "../services/recommendation.service";

export class RecommendationController {
  constructor(private readonly recommendationService: IRecommendationService) {}

  trackInteraction = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const userId = (req as any).user.id as number;
      const { recipe_id, event, duration_s } =
        req.body as TrackInteractionRequest;

      let resolvedEvent = event;
      if (event === "view" && duration_s !== undefined) {
        resolvedEvent = mapViewEvent(duration_s);
      }

      const result = await this.recommendationService.trackInteraction(
        userId,
        recipe_id,
        resolvedEvent,
      );
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };

  getRecommendations = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const userId = (req as any).user.id as number;
      const k = parseInt(req.query.k as string) || 10;
      const result = await this.recommendationService.getRecommendations(
        userId,
        k,
      );
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };
}

import { RecommendationResponse } from "../../dto/recommendation/recommendation.response";

export interface IRecommendationService {
  trackInteraction(
    userId: number,
    recipeId: number,
    event: string,
  ): Promise<{ success: boolean; updated_users: number }>;
  getRecommendations(
    userId: number,
    k?: number,
  ): Promise<RecommendationResponse>;
  sendPostEmbedding(
    recipeId: number,
    imageUrl: string,
    text: string,
  ): Promise<void>;
}

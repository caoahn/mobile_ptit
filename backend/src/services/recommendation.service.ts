import axios from "axios";
import { env } from "../config/env";
import { IRecommendationService } from "../interfaces/services/recommendation.service";
import { RecommendationResponse } from "../dto/recommendation/recommendation.response";
import { InteractionEvent } from "../dto/recommendation/interaction.request";

export function mapViewEvent(duration_s: number): InteractionEvent {
  if (duration_s > 30) return "dwell_10s";
  if (duration_s >= 5) return "view";
  return "click";
}

export class RecommendationService implements IRecommendationService {
  private readonly aiBaseUrl: string;
  private readonly aiApiKey: string;

  constructor() {
    this.aiBaseUrl = env.aiService.url;
    this.aiApiKey = env.aiService.apiKey;
  }

  private get headers() {
    return {
      "Content-Type": "application/json",
      ...(this.aiApiKey ? { "X-API-Key": this.aiApiKey } : {}),
    };
  }

  async trackInteraction(
    userId: number,
    recipeId: number,
    event: string,
  ): Promise<{ success: boolean; updated_users: number }> {
    const response = await axios.post(
      `${this.aiBaseUrl}/user/UpdateBatchUser`,
      {
        users: [
          {
            user_id: userId,
            interactions: [{ item_id: recipeId, event }],
          },
        ],
      },
      { headers: this.headers, timeout: 10_000 },
    );
    return response.data;
  }

  async getRecommendations(
    userId: number,
    k: number = 10,
  ): Promise<RecommendationResponse> {
    const response = await axios.get(
      `${this.aiBaseUrl}/user/top-recipes/${userId}?k=${k}`,
      { headers: this.headers, timeout: 10_000 },
    );
    const data = response.data;
    const raw: [number, number][] = data.result?.recommendations ?? [];
    return {
      success: data.success,
      user_id: userId,
      recommendations: raw.map(([recipe_id, score]) => ({ recipe_id, score })),
      count: raw.length,
    };
  }

  async sendPostEmbedding(
    recipeId: number,
    imageUrl: string,
    text: string,
  ): Promise<void> {
    try {
      await axios.post(
        `${this.aiBaseUrl}/post/embedding`,
        {
          post_id: recipeId,
          list_image_url: imageUrl ? [imageUrl] : [],
          text: text || undefined,
        },
        { headers: this.headers, timeout: 15_000 },
      );
    } catch (err) {
      // Fire-and-forget: log but do not fail recipe creation
      console.error(
        `[RecommendationService] sendPostEmbedding failed for recipe ${recipeId}:`,
        (err as any)?.message,
      );
    }
  }
}

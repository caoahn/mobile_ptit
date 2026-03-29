export type InteractionEvent =
  | "share"
  | "save"
  | "comment"
  | "like"
  | "dwell_10s"
  | "view"
  | "click"
  | "skip";

export interface TrackInteractionPayload {
  recipe_id: number;
  event: InteractionEvent;
  duration_s?: number;
}

export interface RecipeRecommendation {
  recipe_id: number;
  score: number;
}

export interface RecommendationData {
  user_id: number;
  recommendations: RecipeRecommendation[];
  count: number;
}

export interface RecommendationApiResponse {
  success: boolean;
  data: RecommendationData;
}

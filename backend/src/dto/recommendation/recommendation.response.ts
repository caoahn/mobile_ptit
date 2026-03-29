export interface RecipeRecommendation {
  recipe_id: number;
  score: number;
}

export interface RecommendationResponse {
  success: boolean;
  user_id: number;
  recommendations: RecipeRecommendation[];
  count: number;
}

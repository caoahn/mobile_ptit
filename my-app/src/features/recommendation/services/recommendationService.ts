import apiClient from "@/src/shared/services/api/client";
import {
  TrackInteractionPayload,
  RecommendationApiResponse,
} from "../types/recommendation.types";

export const trackInteraction = async (
  payload: TrackInteractionPayload,
): Promise<void> => {
  await apiClient.post("/recommendations/track", payload);
};

export const getRecommendations = async (
  k: number = 10,
): Promise<RecommendationApiResponse> => {
  const response = await apiClient.get<RecommendationApiResponse>(
    `/recommendations/feed?k=${k}`,
  );
  return response.data;
};

import { create } from "zustand";
import {
  RecipeRecommendation,
  TrackInteractionPayload,
} from "../types/recommendation.types";
import {
  getRecommendations,
  trackInteraction as trackInteractionApi,
} from "../services/recommendationService";

interface RecommendationState {
  recommendations: RecipeRecommendation[];
  isLoading: boolean;
  fetchRecommendations: (k?: number) => Promise<void>;
  trackInteraction: (payload: TrackInteractionPayload) => Promise<void>;
}

export const useRecommendationStore = create<RecommendationState>((set) => ({
  recommendations: [],
  isLoading: false,

  fetchRecommendations: async (k = 10) => {
    set({ isLoading: true });
    try {
      const response = await getRecommendations(k);
      set({ recommendations: response.data?.recommendations ?? [] });
    } catch {
      // user may not have an embedding yet — keep existing state
    } finally {
      set({ isLoading: false });
    }
  },

  trackInteraction: async (payload) => {
    try {
      await trackInteractionApi(payload);
    } catch {
      // fire-and-forget: don't surface tracking errors to the UI
    }
  },
}));

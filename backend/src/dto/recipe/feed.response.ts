import { RecipeFeedItemResponse } from "./recipe.response";

export interface GetFeedResponse {
  recipes: RecipeFeedItemResponse[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

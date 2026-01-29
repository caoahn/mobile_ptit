import { RecipeResponse } from "./recipe.response";

export interface GetFeedResponse {
  rows: RecipeResponse[];
  count: number;
}

import { CommentResponse } from "./recipe.response";

export interface GetCommentsResponse {
  comments: CommentResponse[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

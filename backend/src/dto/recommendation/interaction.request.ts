export type InteractionEvent =
  | "share"
  | "save"
  | "comment"
  | "like"
  | "dwell_10s"
  | "view"
  | "click"
  | "skip";

export interface TrackInteractionRequest {
  recipe_id: number;
  event: InteractionEvent;
  duration_s?: number;
}

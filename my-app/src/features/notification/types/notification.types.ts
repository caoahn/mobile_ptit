export type NotificationType = "like" | "comment" | "follow" | "rating";

export interface NotificationActor {
  id: number;
  username: string;
  avatar_url?: string;
}

export interface NotificationRecipe {
  id: number;
  title: string;
  image_url?: string;
}

export interface NotificationComment {
  id: number;
  content: string;
}

export interface Notification {
  id: number;
  type: NotificationType;
  is_read: boolean;
  created_at: string;
  actor: NotificationActor;
  recipe?: NotificationRecipe;
  comment?: NotificationComment;
}

export interface NotificationListResponse {
  notifications: Notification[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
  unread_count: number;
}

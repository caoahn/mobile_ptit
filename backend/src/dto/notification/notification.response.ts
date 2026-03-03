export interface NotificationResponse {
  id: number;
  type: "like" | "comment" | "follow" | "rating";
  is_read: boolean;
  created_at: Date;

  // Thông tin người thực hiện
  actor: {
    id: number;
    username: string;
    avatar_url?: string;
  };

  // Thông tin bài viết (nếu có)
  recipe?: {
    id: number;
    title: string;
    image_url?: string;
  };

  // Thông tin comment (nếu type = comment)
  comment?: {
    id: number;
    content: string;
  };
}

export interface NotificationListResponse {
  notifications: NotificationResponse[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
  unread_count: number;
}

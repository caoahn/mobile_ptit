import {
  NotificationResponse,
  NotificationListResponse,
} from "../../dto/notification/notification.response";

export interface INotificationService {
  /**
   * Tạo thông báo mới (internal use)
   */
  createNotification(
    userId: number,
    type: "like" | "comment" | "follow" | "rating",
    actorId: number,
    recipeId?: number,
    commentId?: number,
  ): Promise<void>;

  /**
   * Lấy danh sách thông báo
   */
  getUserNotifications(
    userId: number,
    page: number,
    limit: number,
  ): Promise<NotificationListResponse>;

  /**
   * Đánh dấu đã đọc
   */
  markAsRead(notificationId: number, userId: number): Promise<boolean>;

  /**
   * Đánh dấu tất cả đã đọc
   */
  markAllAsRead(userId: number): Promise<number>;

  /**
   * Đếm thông báo chưa đọc
   */
  getUnreadCount(userId: number): Promise<number>;

  /**
   * Xóa thông báo
   */
  deleteNotification(notificationId: number, userId: number): Promise<boolean>;
}

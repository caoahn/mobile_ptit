import {
  Notification,
  NotificationCreationAttributes,
} from "../../models/notification.model";

export interface INotificationRepository {
  /**
   * Tạo thông báo mới
   */
  create(data: NotificationCreationAttributes): Promise<Notification>;

  /**
   * Lấy thông báo theo ID
   */
  findById(notificationId: number): Promise<Notification | null>;

  /**
   * Lấy danh sách thông báo của user (có phân trang)
   */
  findByUserId(
    userId: number,
    page: number,
    limit: number,
  ): Promise<{ rows: Notification[]; count: number }>;

  /**
   * Đánh dấu thông báo đã đọc
   */
  markAsRead(notificationId: number, userId: number): Promise<boolean>;

  /**
   * Đánh dấu tất cả thông báo đã đọc
   */
  markAllAsRead(userId: number): Promise<number>;

  /**
   * Đếm số thông báo chưa đọc
   */
  countUnread(userId: number): Promise<number>;

  /**
   * Xóa thông báo
   */
  delete(notificationId: number, userId: number): Promise<boolean>;
}

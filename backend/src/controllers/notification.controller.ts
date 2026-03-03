import { Request, Response, NextFunction } from "express";
import { INotificationService } from "../interfaces/services/notification.service";
import { sendSuccess } from "../utils/response";

export class NotificationController {
  constructor(private readonly notificationService: INotificationService) {}

  /**
   * GET /api/notifications
   * Lấy danh sách thông báo
   */
  getNotifications = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const userId = (req as any).user.id;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const result = await this.notificationService.getUserNotifications(
        userId,
        page,
        limit,
      );

      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/notifications/unread-count
   * Đếm số thông báo chưa đọc
   */
  getUnreadCount = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user.id;
      const count = await this.notificationService.getUnreadCount(userId);

      sendSuccess(res, { count });
    } catch (error) {
      next(error);
    }
  };

  /**
   * PUT /api/notifications/:id/read
   * Đánh dấu đã đọc
   */
  markAsRead = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user.id;
      const notificationId = parseInt(req.params.id);

      const success = await this.notificationService.markAsRead(
        notificationId,
        userId,
      );

      if (!success) {
        return res.status(404).json({ message: "Notification not found" });
      }

      sendSuccess(res, { message: "Marked as read" });
    } catch (error) {
      next(error);
    }
  };

  /**
   * PUT /api/notifications/read-all
   * Đánh dấu tất cả đã đọc
   */
  markAllAsRead = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user.id;
      const count = await this.notificationService.markAllAsRead(userId);

      sendSuccess(res, { message: `Marked ${count} notifications as read` });
    } catch (error) {
      next(error);
    }
  };

  /**
   * DELETE /api/notifications/:id
   * Xóa thông báo
   */
  deleteNotification = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const userId = (req as any).user.id;
      const notificationId = parseInt(req.params.id);

      const success = await this.notificationService.deleteNotification(
        notificationId,
        userId,
      );

      if (!success) {
        return res.status(404).json({ message: "Notification not found" });
      }

      sendSuccess(res, { message: "Notification deleted" });
    } catch (error) {
      next(error);
    }
  };
}

import { INotificationService } from "../interfaces/services/notification.service";
import { INotificationRepository } from "../interfaces/repositories/notification.repository";
import {
  NotificationResponse,
  NotificationListResponse,
} from "../dto/notification/notification.response";
import { ISocketService } from "../interfaces/services/socket.service";

export class NotificationService implements INotificationService {
  constructor(
    private readonly notificationRepository: INotificationRepository,
    private readonly socketService: ISocketService,
  ) {}

  async createNotification(
    userId: number,
    type: "like" | "comment" | "follow" | "rating",
    actorId: number,
    recipeId?: number,
    commentId?: number,
  ): Promise<void> {
    // Không tạo notification nếu user tự like/comment bài viết của mình
    if (userId === actorId) {
      return;
    }

    // Tạo notification trong database
    const notification = await this.notificationRepository.create({
      user_id: userId,
      type,
      actor_id: actorId,
      recipe_id: recipeId,
      comment_id: commentId,
      is_read: false,
    });

    // Emit realtime notification qua Socket.IO
    const notificationData = await this.getNotificationById(notification.id);
    if (notificationData) {
      this.socketService.emitToUser(
        userId,
        "new_notification",
        notificationData,
      );
    }
  }

  private async getNotificationById(
    id: number,
  ): Promise<NotificationResponse | null> {
    const notification = await this.notificationRepository.findById(id);
    if (!notification) return null;

    return this.toDTO(notification);
  }

  async getUserNotifications(
    userId: number,
    page: number = 1,
    limit: number = 20,
  ): Promise<NotificationListResponse> {
    const { rows, count } = await this.notificationRepository.findByUserId(
      userId,
      page,
      limit,
    );

    const unread_count = await this.notificationRepository.countUnread(userId);

    const notifications = rows.map((n) => this.toDTO(n));

    return {
      notifications,
      total: count,
      page,
      limit,
      hasMore: page * limit < count,
      unread_count,
    };
  }

  async markAsRead(notificationId: number, userId: number): Promise<boolean> {
    return await this.notificationRepository.markAsRead(notificationId, userId);
  }

  async markAllAsRead(userId: number): Promise<number> {
    return await this.notificationRepository.markAllAsRead(userId);
  }

  async getUnreadCount(userId: number): Promise<number> {
    return await this.notificationRepository.countUnread(userId);
  }

  async deleteNotification(
    notificationId: number,
    userId: number,
  ): Promise<boolean> {
    return await this.notificationRepository.delete(notificationId, userId);
  }

  private toDTO(notification: any): NotificationResponse {
    const raw = notification.toJSON ? notification.toJSON() : notification;

    return {
      id: raw.id,
      type: raw.type,
      is_read: raw.is_read,
      created_at: raw.created_at,
      actor: {
        id: raw.actor?.id,
        username: raw.actor?.username,
        avatar_url: raw.actor?.avatar_url,
      },
      recipe: raw.recipe
        ? {
            id: raw.recipe.id,
            title: raw.recipe.title,
            image_url: raw.recipe.image_url,
          }
        : undefined,
      comment: raw.comment
        ? {
            id: raw.comment.id,
            content: raw.comment.content,
          }
        : undefined,
    };
  }
}

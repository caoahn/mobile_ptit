import { INotificationRepository } from "../interfaces/repositories/notification.repository";
import {
  Notification,
  NotificationCreationAttributes,
} from "../models/notification.model";
import { User } from "../models/user.model";
import { Recipe } from "../models/recipe.model";
import { Comment } from "../models/comment.model";

export class NotificationRepository implements INotificationRepository {
  async create(data: NotificationCreationAttributes): Promise<Notification> {
    return await Notification.create(data);
  }

  async findById(notificationId: number): Promise<Notification | null> {
    return await Notification.findByPk(notificationId, {
      include: [
        {
          model: User,
          as: "actor",
          attributes: ["id", "username", "avatar_url"],
        },
        {
          model: Recipe,
          as: "recipe",
          attributes: ["id", "title", "image_url"],
          required: false,
        },
        {
          model: Comment,
          as: "comment",
          attributes: ["id", "content"],
          required: false,
        },
      ],
    });
  }

  async findByUserId(
    userId: number,
    page: number = 1,
    limit: number = 20,
  ): Promise<{ rows: Notification[]; count: number }> {
    const offset = (page - 1) * limit;

    const { rows, count } = await Notification.findAndCountAll({
      where: { user_id: userId },
      include: [
        {
          model: User,
          as: "actor",
          attributes: ["id", "username", "avatar_url"],
        },
        {
          model: Recipe,
          as: "recipe",
          attributes: ["id", "title", "image_url"],
          required: false,
        },
        {
          model: Comment,
          as: "comment",
          attributes: ["id", "content"],
          required: false,
        },
      ],
      order: [["created_at", "DESC"]],
      limit,
      offset,
    });

    return { rows, count };
  }

  async markAsRead(notificationId: number, userId: number): Promise<boolean> {
    const [affectedCount] = await Notification.update(
      { is_read: true },
      {
        where: {
          id: notificationId,
          user_id: userId,
        },
      },
    );
    return affectedCount > 0;
  }

  async markAllAsRead(userId: number): Promise<number> {
    const [affectedCount] = await Notification.update(
      { is_read: true },
      {
        where: {
          user_id: userId,
          is_read: false,
        },
      },
    );
    return affectedCount;
  }

  async countUnread(userId: number): Promise<number> {
    return await Notification.count({
      where: {
        user_id: userId,
        is_read: false,
      },
    });
  }

  async delete(notificationId: number, userId: number): Promise<boolean> {
    const deleted = await Notification.destroy({
      where: {
        id: notificationId,
        user_id: userId,
      },
    });
    return deleted > 0;
  }
}

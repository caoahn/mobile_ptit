import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/database";

export interface NotificationAttributes {
  id: number;
  user_id: number;
  type: "like" | "comment" | "follow" | "rating";
  actor_id: number;
  recipe_id?: number;
  comment_id?: number;
  is_read: boolean;
  created_at?: Date;
}

export interface NotificationCreationAttributes extends Optional<
  NotificationAttributes,
  "id" | "recipe_id" | "comment_id" | "is_read" | "created_at"
> {}

export class Notification
  extends Model<NotificationAttributes, NotificationCreationAttributes>
  implements NotificationAttributes
{
  public id!: number;
  public user_id!: number;
  public type!: "like" | "comment" | "follow" | "rating";
  public actor_id!: number;
  public recipe_id?: number;
  public comment_id?: number;
  public is_read!: boolean;
  public readonly created_at!: Date;
}

Notification.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM("like", "comment", "follow", "rating"),
      allowNull: false,
    },
    actor_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    recipe_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
    },
    comment_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
    },
    is_read: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: "notifications",
    timestamps: true,
    updatedAt: false,
    underscored: true,
  },
);

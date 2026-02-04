import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/database";

export interface CommentAttributes {
  id: number;
  recipe_id: number;
  user_id: number;
  parent_comment_id?: number;
  content: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface CommentCreationAttributes extends Optional<
  CommentAttributes,
  "id" | "parent_comment_id" | "created_at" | "updated_at"
> {}

export class Comment
  extends Model<CommentAttributes, CommentCreationAttributes>
  implements CommentAttributes
{
  public id!: number;
  public recipe_id!: number;
  public user_id!: number;
  public parent_comment_id?: number;
  public content!: string;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

Comment.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    recipe_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    parent_comment_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: "comments",
    timestamps: true,
    underscored: true,
  },
);

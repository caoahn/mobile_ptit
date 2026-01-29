import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/database";

export interface LikeAttributes {
  user_id: number;
  recipe_id: number;
  created_at?: Date;
}

export interface LikeCreationAttributes extends Optional<
  LikeAttributes,
  "created_at"
> {}

export class Like
  extends Model<LikeAttributes, LikeCreationAttributes>
  implements LikeAttributes
{
  public user_id!: number;
  public recipe_id!: number;
  public readonly created_at!: Date;
}

Like.init(
  {
    user_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      allowNull: false,
    },
    recipe_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: "likes",
    timestamps: true, // Only createdAt is managed manually if we use timestamps: true, but updateAt might not be needed.
    updatedAt: false,
    underscored: true,
  },
);

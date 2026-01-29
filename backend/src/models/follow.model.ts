import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/database";

export interface FollowAttributes {
  follower_id: number;
  following_id: number;
  created_at?: Date;
}

export interface FollowCreationAttributes extends Optional<
  FollowAttributes,
  "created_at"
> {}

export class Follow
  extends Model<FollowAttributes, FollowCreationAttributes>
  implements FollowAttributes
{
  public follower_id!: number;
  public following_id!: number;
  public readonly created_at!: Date;
}

Follow.init(
  {
    follower_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      allowNull: false,
    },
    following_id: {
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
    tableName: "follows",
    timestamps: true,
    updatedAt: false,
    underscored: true,
  },
);

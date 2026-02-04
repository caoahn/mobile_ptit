import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/database";

export interface RatingAttributes {
  user_id: number;
  recipe_id: number;
  rating: number;
  review_text?: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface RatingCreationAttributes extends Optional<
  RatingAttributes,
  "review_text" | "created_at" | "updated_at"
> {}

export class Rating
  extends Model<RatingAttributes, RatingCreationAttributes>
  implements RatingAttributes
{
  public user_id!: number;
  public recipe_id!: number;
  public rating!: number;
  public review_text?: string;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

Rating.init(
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
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 5,
      },
    },
    review_text: {
      type: DataTypes.TEXT,
      allowNull: true,
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
    tableName: "ratings",
    timestamps: true,
    underscored: true,
  },
);

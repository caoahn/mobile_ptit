import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/database";

export interface RecipeAttributes {
  id: number;
  user_id: number;
  title: string;
  description?: string;
  image_url?: string;
  category?: string;
  prep_time?: number;
  cook_time?: number;
  servings?: number;
  tips?: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface RecipeCreationAttributes extends Optional<
  RecipeAttributes,
  | "id"
  | "description"
  | "image_url"
  | "category"
  | "prep_time"
  | "cook_time"
  | "servings"
  | "tips"
  | "created_at"
  | "updated_at"
> {}

export class Recipe
  extends Model<RecipeAttributes, RecipeCreationAttributes>
  implements RecipeAttributes
{
  public id!: number;
  public user_id!: number;
  public title!: string;
  public description?: string;
  public image_url?: string;
  public category?: string;
  public prep_time?: number;
  public cook_time?: number;
  public servings?: number;
  public tips?: string;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

Recipe.init(
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
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    image_url: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    category: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    prep_time: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    cook_time: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    servings: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    tips: {
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
    tableName: "recipes",
    timestamps: true,
    underscored: true,
  },
);

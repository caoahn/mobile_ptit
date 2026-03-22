import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/database";

export interface IngredientAttributes {
  id: number;
  recipe_id: number;
  name: string;
  amount?: string;
  unit?: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface IngredientCreationAttributes extends Optional<
  IngredientAttributes,
  "id" | "amount" | "unit" | "created_at" | "updated_at"
> {}

export class Ingredient
  extends Model<IngredientAttributes, IngredientCreationAttributes>
  implements IngredientAttributes
{
  public id!: number;
  public recipe_id!: number;
  public name!: string;
  public amount?: string;
  public unit?: string;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

Ingredient.init(
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
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    amount: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    unit: {
      type: DataTypes.STRING(50),
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
    tableName: "ingredients",
    timestamps: true,
    paranoid: true,
    underscored: true,
  },
);

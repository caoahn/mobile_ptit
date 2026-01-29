import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/database";

export interface IngredientAttributes {
  id: number;
  recipe_id: number;
  name: string;
  amount?: string;
  unit?: string;
}

export interface IngredientCreationAttributes extends Optional<
  IngredientAttributes,
  "id" | "amount" | "unit"
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
  },
  {
    sequelize,
    tableName: "ingredients",
    timestamps: false, // No createdAt/updatedAt in design
    underscored: true,
  },
);

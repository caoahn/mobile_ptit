import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/database";

export interface RecipeStepAttributes {
  id: number;
  recipe_id: number;
  step_number: number;
  title?: string;
  description?: string;
  image_url?: string;
}

export interface RecipeStepCreationAttributes extends Optional<
  RecipeStepAttributes,
  "id" | "title" | "description" | "image_url"
> {}

export class RecipeStep
  extends Model<RecipeStepAttributes, RecipeStepCreationAttributes>
  implements RecipeStepAttributes
{
  public id!: number;
  public recipe_id!: number;
  public step_number!: number;
  public title?: string;
  public description?: string;
  public image_url?: string;
}

RecipeStep.init(
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
    step_number: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    image_url: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "recipe_steps",
    timestamps: false,
    underscored: true,
  },
);

import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/database";

export interface SavedRecipeAttributes {
  user_id: number;
  recipe_id: number;
  created_at?: Date;
}

export interface SavedRecipeCreationAttributes extends Optional<
  SavedRecipeAttributes,
  "created_at"
> {}

export class SavedRecipe
  extends Model<SavedRecipeAttributes, SavedRecipeCreationAttributes>
  implements SavedRecipeAttributes
{
  public user_id!: number;
  public recipe_id!: number;
  public readonly created_at!: Date;
}

SavedRecipe.init(
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
    tableName: "saved_recipes",
    timestamps: true,
    updatedAt: false,
    underscored: true,
  },
);

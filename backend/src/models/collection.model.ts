import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/database";

// --- Collection Model ---

export interface CollectionAttributes {
  id: number;
  user_id: number;
  name: string;
  description?: string;
  image_url?: string;
  is_public: boolean;
  created_at?: Date;
  updated_at?: Date;
}

export interface CollectionCreationAttributes extends Optional<
  CollectionAttributes,
  "id" | "description" | "image_url" | "is_public" | "created_at" | "updated_at"
> {}

export class Collection
  extends Model<CollectionAttributes, CollectionCreationAttributes>
  implements CollectionAttributes
{
  public id!: number;
  public user_id!: number;
  public name!: string;
  public description?: string;
  public image_url?: string;
  public is_public!: boolean;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

Collection.init(
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
    name: {
      type: DataTypes.STRING(100),
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
    is_public: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
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
    tableName: "collections",
    timestamps: true,
    underscored: true,
  },
);

// --- CollectionRecipe Model ---

export interface CollectionRecipeAttributes {
  collection_id: number;
  recipe_id: number;
  added_at?: Date;
}

export interface CollectionRecipeCreationAttributes extends Optional<
  CollectionRecipeAttributes,
  "added_at"
> {}

export class CollectionRecipe
  extends Model<CollectionRecipeAttributes, CollectionRecipeCreationAttributes>
  implements CollectionRecipeAttributes
{
  public collection_id!: number;
  public recipe_id!: number;
  public readonly added_at!: Date;
}

CollectionRecipe.init(
  {
    collection_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      allowNull: false,
    },
    recipe_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      allowNull: false,
    },
    added_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: "collection_recipes",
    timestamps: true,
    createdAt: "added_at",
    updatedAt: false,
    underscored: true,
  },
);

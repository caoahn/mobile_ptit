import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/database";

// --- Tag Model ---

export interface TagAttributes {
  id: number;
  name: string;
  slug: string;
  created_at?: Date;
}

export interface TagCreationAttributes extends Optional<
  TagAttributes,
  "id" | "created_at"
> {}

export class Tag
  extends Model<TagAttributes, TagCreationAttributes>
  implements TagAttributes
{
  public id!: number;
  public name!: string;
  public slug!: string;
  public readonly created_at!: Date;
}

Tag.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    slug: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: "tags",
    timestamps: true,
    updatedAt: false,
    underscored: true,
  },
);

// --- RecipeTag Model ---

export interface RecipeTagAttributes {
  recipe_id: number;
  tag_id: number;
  created_at?: Date;
}

export interface RecipeTagCreationAttributes extends Optional<
  RecipeTagAttributes,
  "created_at"
> {}

export class RecipeTag
  extends Model<RecipeTagAttributes, RecipeTagCreationAttributes>
  implements RecipeTagAttributes
{
  public recipe_id!: number;
  public tag_id!: number;
  public readonly created_at!: Date;
}

RecipeTag.init(
  {
    recipe_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      allowNull: false,
    },
    tag_id: {
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
    tableName: "recipe_tags",
    timestamps: true,
    updatedAt: false,
    underscored: true,
  },
);

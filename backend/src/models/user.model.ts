import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/database";

export interface UserAttributes {
  id: number;
  username: string;
  email: string;
  password_hash: string;
  full_name?: string;
  bio?: string;
  avatar_url?: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface UserCreationAttributes extends Optional<
  UserAttributes,
  "id" | "full_name" | "bio" | "avatar_url" | "created_at" | "updated_at"
> {}

export class User
  extends Model<UserAttributes, UserCreationAttributes>
  implements UserAttributes
{
  public id!: number;
  public username!: string;
  public email!: string;
  public password_hash!: string;
  public full_name?: string;
  public bio?: string;
  public avatar_url?: string;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;

  toJSON() {
    const values = { ...this.get() } as any;
    delete values.password_hash;
    delete values.createdAt;
    delete values.updatedAt;
    return values;
  }
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    password_hash: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    full_name: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    bio: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    avatar_url: {
      type: DataTypes.STRING(255),
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
    tableName: "users",
    timestamps: true,
    underscored: true,
  },
);

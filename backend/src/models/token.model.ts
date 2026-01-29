import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/database";

// --- RefreshToken Model ---

export interface RefreshTokenAttributes {
  id: number;
  user_id: number;
  token_hash: string;
  expires_at: Date;
  is_revoked: boolean;
  created_at?: Date;
}

export interface RefreshTokenCreationAttributes extends Optional<
  RefreshTokenAttributes,
  "id" | "is_revoked" | "created_at"
> {}

export class RefreshToken
  extends Model<RefreshTokenAttributes, RefreshTokenCreationAttributes>
  implements RefreshTokenAttributes
{
  public id!: number;
  public user_id!: number;
  public token_hash!: string;
  public expires_at!: Date;
  public is_revoked!: boolean;
  public readonly created_at!: Date;
}

RefreshToken.init(
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
    token_hash: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    is_revoked: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: "refresh_tokens",
    timestamps: true,
    updatedAt: false,
    underscored: true,
  },
);

// --- PasswordResetToken Model ---

export interface PasswordResetTokenAttributes {
  id: number;
  user_id: number;
  otp_hash: string;
  expires_at: Date;
  is_used: boolean;
  created_at?: Date;
}

export interface PasswordResetTokenCreationAttributes extends Optional<
  PasswordResetTokenAttributes,
  "id" | "is_used" | "created_at"
> {}

export class PasswordResetToken
  extends Model<
    PasswordResetTokenAttributes,
    PasswordResetTokenCreationAttributes
  >
  implements PasswordResetTokenAttributes
{
  public id!: number;
  public user_id!: number;
  public otp_hash!: string;
  public expires_at!: Date;
  public is_used!: boolean;
  public readonly created_at!: Date;
}

PasswordResetToken.init(
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
    otp_hash: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    is_used: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: "password_reset_tokens",
    timestamps: true,
    updatedAt: false,
    underscored: true,
  },
);

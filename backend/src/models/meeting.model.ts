import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/database";
import { User } from "./user.model";

// --- Meeting Model ---

export interface MeetingAttributes {
  id: number;
  meeting_id: string;
  meeting_name: string;
  host_id: number;
  language_source: string;
  language_target: string;
  status: "active" | "ended";
  created_at?: Date;
  ended_at?: Date;
}

export interface MeetingCreationAttributes extends Optional<
  MeetingAttributes,
  "id" | "status" | "created_at" | "ended_at"
> {}

export class Meeting
  extends Model<MeetingAttributes, MeetingCreationAttributes>
  implements MeetingAttributes
{
  public id!: number;
  public meeting_id!: string;
  public meeting_name!: string;
  public host_id!: number;
  public language_source!: string;
  public language_target!: string;
  public status!: "active" | "ended";
  public readonly created_at!: Date;
  public readonly ended_at!: Date;
}

Meeting.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    meeting_id: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },
    meeting_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    host_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    language_source: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },
    language_target: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("active", "ended"),
      allowNull: false,
      defaultValue: "active",
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    ended_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "meetings",
    timestamps: true,
    updatedAt: false, // Only created_at is strictly needed based on interface, but usually updated_at is good. Interface doesn't have it.
    underscored: true,
  },
);

// --- MeetingParticipant Model ---

export interface MeetingParticipantAttributes {
  id: number;
  meeting_id: string; // This seems to be the UUID string, not the PK ID of meetings table.
  user_id: number;
  joined_at?: Date;
  left_at?: Date;
}

export interface MeetingParticipantCreationAttributes extends Optional<
  MeetingParticipantAttributes,
  "id" | "joined_at" | "left_at"
> {}

export class MeetingParticipant
  extends Model<
    MeetingParticipantAttributes,
    MeetingParticipantCreationAttributes
  >
  implements MeetingParticipantAttributes
{
  public id!: number;
  public meeting_id!: string;
  public user_id!: number;
  public readonly joined_at!: Date;
  public readonly left_at!: Date;
}

MeetingParticipant.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    meeting_id: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    user_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    joined_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    left_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "meeting_participants",
    timestamps: false,
    underscored: true,
  },
);

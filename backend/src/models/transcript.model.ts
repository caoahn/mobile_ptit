import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/database";

export interface TranscriptAttributes {
  id: number;
  meeting_id: string;
  speaker_turn: number;
  original_text: string;
  translated_text: string;
  audio_url?: string;
  audio_duration?: number;
  created_at?: Date;
}

export interface TranscriptCreationAttributes extends Optional<
  TranscriptAttributes,
  "id" | "created_at"
> {}

export class Transcript
  extends Model<TranscriptAttributes, TranscriptCreationAttributes>
  implements TranscriptAttributes
{
  public id!: number;
  public meeting_id!: string;
  public speaker_turn!: number;
  public original_text!: string;
  public translated_text!: string;
  public audio_url?: string;
  public audio_duration?: number;
  public readonly created_at!: Date;
}

Transcript.init(
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
    speaker_turn: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    original_text: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    translated_text: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    audio_url: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    audio_duration: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: "transcripts",
    timestamps: true,
    updatedAt: false,
    underscored: true,
  },
);

import {
  Transcript,
  TranscriptAttributes,
  TranscriptCreationAttributes,
} from "../models/transcript.model";
import { ITranscriptRepository } from "../interfaces/repositories/transcript.repository";

export class TranscriptRepository implements ITranscriptRepository {
  async create(transcript: TranscriptCreationAttributes): Promise<Transcript> {
    return Transcript.create(transcript);
  }

  async getByMeetingId(
    meetingId: string,
    limit: number,
    offset: number,
  ): Promise<Transcript[]> {
    return Transcript.findAll({
      where: { meeting_id: meetingId },
      order: [["speaker_turn", "ASC"]],
      limit,
      offset,
    });
  }
}

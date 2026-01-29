import { TranscriptRepository } from "../repositories/transcript.repository";
import {
  Transcript,
  TranscriptCreationAttributes,
} from "../models/transcript.model";
import { ITranscriptService } from "../interfaces/services/transcript.service";

export class TranscriptService implements ITranscriptService {
  constructor(private readonly transcriptRepository: TranscriptRepository) {}

  async saveTranscript(
    data: TranscriptCreationAttributes,
  ): Promise<Transcript> {
    return this.transcriptRepository.create(data);
  }

  async getTranscripts(
    meetingId: string,
    limit: number = 50,
    offset: number = 0,
  ): Promise<Transcript[]> {
    return this.transcriptRepository.getByMeetingId(meetingId, limit, offset);
  }
}

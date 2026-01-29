import {
  Transcript,
  TranscriptCreationAttributes,
} from "../../models/transcript.model";

export interface ITranscriptService {
  saveTranscript(data: TranscriptCreationAttributes): Promise<Transcript>;
  getTranscripts(
    meetingId: string,
    limit?: number,
    offset?: number,
  ): Promise<Transcript[]>;
}

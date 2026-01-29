import {
  Transcript,
  TranscriptCreationAttributes,
} from "../../models/transcript.model";

export interface ITranscriptRepository {
  create(transcript: TranscriptCreationAttributes): Promise<Transcript>;
  getByMeetingId(
    meetingId: string,
    limit: number,
    offset: number,
  ): Promise<Transcript[]>;
}

export interface ISocketService {
  init(server: any): void;
  broadcastTranscript(meetingId: string, transcript: any): void;
}

import { Meeting, MeetingAttributes } from "../../models/meeting.model";
import { User } from "../../models/user.model";

export interface IMeetingRepository {
  create(meeting: MeetingAttributes): Promise<Meeting>;
  findByMeetingId(meetingId: string): Promise<Meeting | null>;
  getParticipants(meetingId: string): Promise<User[]>;
  addParticipant(participant: {
    meeting_id: string;
    user_id: number;
  }): Promise<void>;
  endMeeting(meetingId: string): Promise<void>;
  getHistory(
    userId: number,
    limit: number,
    offset: number,
  ): Promise<{ meetings: Meeting[]; total: number }>;
}

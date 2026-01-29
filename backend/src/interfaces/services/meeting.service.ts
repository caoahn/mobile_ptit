import { Meeting, MeetingAttributes } from "../../models/meeting.model";

export interface IMeetingService {
  createMeeting(
    data: Partial<MeetingAttributes>,
    userId: number,
  ): Promise<Meeting>;
  joinMeeting(meetingId: string, userId: number): Promise<Meeting>;
  getMeetingInfo(meetingId: string): Promise<any>;
  endMeeting(meetingId: string, userId: number): Promise<void>;
}

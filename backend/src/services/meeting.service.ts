import { MeetingRepository } from "../repositories/meeting.repository";
import { Meeting, MeetingAttributes } from "../models/meeting.model";
import { v4 as uuidv4 } from "uuid";
import { IMeetingService } from "../interfaces/services/meeting.service";

export class MeetingService implements IMeetingService {
  constructor(private readonly meetingRepository: MeetingRepository) {}

  async createMeeting(
    data: Partial<MeetingAttributes>,
    userId: number,
  ): Promise<Meeting> {
    const meetingId = `MTG-${Date.now()}-${uuidv4().substring(0, 6).toUpperCase()}`;
    const newMeeting: MeetingAttributes = {
      id: 0, // Placeholder ID, will be ignored/overwritten by DB auto-increment or omitted if using creation attributes correctly
      meeting_id: meetingId,
      meeting_name: data.meeting_name || "Untitled Meeting",
      host_id: userId,
      language_source: data.language_source || "en",
      language_target: data.language_target || "vi",
      status: "active",
    };

    const createdMeeting = await this.meetingRepository.create(newMeeting);

    await this.meetingRepository.addParticipant({
      meeting_id: meetingId,
      user_id: userId,
    });

    return createdMeeting;
  }

  async joinMeeting(meetingId: string, userId: number): Promise<Meeting> {
    const meeting = await this.meetingRepository.findByMeetingId(meetingId);
    if (!meeting) {
      throw new Error("Meeting not found");
    }
    if (meeting.status !== "active") {
      throw new Error("Meeting has ended");
    }

    await this.meetingRepository.addParticipant({
      meeting_id: meetingId,
      user_id: userId,
    });

    return meeting;
  }

  async getMeetingInfo(meetingId: string): Promise<any> {
    const meeting = await this.meetingRepository.findByMeetingId(meetingId);
    if (!meeting) return null;

    const participants =
      await this.meetingRepository.getParticipants(meetingId);
    return { ...meeting, participants };
  }

  async endMeeting(meetingId: string, userId: number): Promise<void> {
    const meeting = await this.meetingRepository.findByMeetingId(meetingId);
    if (!meeting) throw new Error("Meeting not found");
    if (meeting.host_id !== userId) throw new Error("Unauthorized");

    await this.meetingRepository.endMeeting(meetingId);
  }
}

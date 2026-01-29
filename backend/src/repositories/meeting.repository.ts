import { Op } from "sequelize";
import {
  Meeting,
  MeetingAttributes,
  MeetingParticipant,
} from "../models/meeting.model";
import { User } from "../models/user.model";
import { IMeetingRepository } from "../interfaces/repositories/meeting.repository";

export class MeetingRepository implements IMeetingRepository {
  async create(meeting: MeetingAttributes): Promise<Meeting> {
    const {
      meeting_id,
      meeting_name,
      host_id,
      language_source,
      language_target,
    } = meeting;

    return Meeting.create({
      meeting_id,
      meeting_name,
      host_id,
      language_source,
      language_target,
      status: "active",
    });
  }

  async findByMeetingId(meetingId: string): Promise<Meeting | null> {
    return Meeting.findOne({ where: { meeting_id: meetingId } });
  }

  /*
   * Note: This method assumes the existence of a User model and users table.
   * It joins the meeting_participants table with the users table to retrieve
   * participant details.
   */
  async getParticipants(meetingId: string): Promise<User[]> {
    const participants = await MeetingParticipant.findAll({
      where: { meeting_id: meetingId, left_at: { [Op.is]: null } as any },
      include: [{ model: User, required: true }],
    });

    // Extract User from the included model.
    // Since we didn't strictly type the inclusion property in the class, we cast to any.
    return participants.map((p) => (p as any).User as User);
  }

  async addParticipant(participant: {
    meeting_id: string;
    user_id: number;
  }): Promise<void> {
    await MeetingParticipant.create({
      meeting_id: participant.meeting_id,
      user_id: participant.user_id,
    });
  }

  async endMeeting(meetingId: string): Promise<void> {
    await Meeting.update(
      { status: "ended", ended_at: new Date() },
      { where: { meeting_id: meetingId } },
    );
  }

  async getHistory(
    userId: number,
    limit: number,
    offset: number,
  ): Promise<{ meetings: Meeting[]; total: number }> {
    const { rows, count } = await Meeting.findAndCountAll({
      include: [
        {
          model: MeetingParticipant,
          where: { user_id: userId },
          required: true,
          attributes: [], // We don't necessarily need participant data in the result, just for filtering
        },
      ],
      order: [["created_at", "DESC"]],
      limit,
      offset,
      distinct: true, // Important for accurate count with include
    });

    return { meetings: rows, total: count };
  }
}

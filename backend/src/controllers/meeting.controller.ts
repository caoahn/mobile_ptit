import { Request, Response, NextFunction } from "express";
import { MeetingService } from "../services/meeting.service";
import { sendSuccess, sendCreated, sendError } from "../utils/response";

export class MeetingController {
  constructor(private readonly meetingService: MeetingService) {}

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // @ts-ignore
      const userId = (req.user as any).id;
      const meeting = await this.meetingService.createMeeting(req.body, userId);
      sendCreated(res, meeting);
    } catch (error) {
      next(error);
    }
  };

  join = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // @ts-ignore
      const userId = (req.user as any).id;
      const { meetingId } = req.params;
      const meeting = await this.meetingService.joinMeeting(meetingId, userId);
      sendSuccess(res, meeting, "Joined meeting successfully");
    } catch (error) {
      next(error);
    }
  };

  get = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { meetingId } = req.params;
      const meeting = await this.meetingService.getMeetingInfo(meetingId);
      if (!meeting) {
        return sendError(res, 404, "Meeting not found");
      }
      sendSuccess(res, meeting);
    } catch (error) {
      next(error);
    }
  };

  end = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // @ts-ignore
      const userId = (req.user as any).id;
      const { meetingId } = req.params;
      await this.meetingService.endMeeting(meetingId, userId);
      sendSuccess(res, null, "Meeting ended");
    } catch (error) {
      next(error);
    }
  };
}

import { Request, Response, NextFunction } from "express";
import { TranscriptService } from "../services/transcript.service";
import { sendSuccess } from "../utils/response";

export class TranscriptController {
  constructor(private readonly transcriptService: TranscriptService) {}

  getByMeeting = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { meetingId } = req.params;
      const { limit, offset } = req.query;
      const transcripts = await this.transcriptService.getTranscripts(
        meetingId,
        parseInt(limit as string) || 50,
        parseInt(offset as string) || 0,
      );
      sendSuccess(res, transcripts);
    } catch (error) {
      next(error);
    }
  };
}

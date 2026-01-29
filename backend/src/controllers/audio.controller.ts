import { Request, Response, NextFunction } from "express";
import { AudioService } from "../services/audio.service";
import { TranscriptService } from "../services/transcript.service";
import { SocketService } from "../services/socket.service";
import { sendSuccess } from "../utils/response";

export class AudioController {
  constructor(
    private readonly audioService: AudioService,
    private readonly transcriptService: TranscriptService,
    private readonly socketService: SocketService,
  ) {}

  upload = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.file) throw new Error("No audio file provided");
      const { meeting_id, speaker_turn } = req.body;

      // Mock processing
      const { original_text, translated_text } =
        await this.audioService.processAudio(
          req.file.path,
          "en", // Should get from meeting info or req.body
          "vi",
        );

      const transcript = await this.transcriptService.saveTranscript({
        id: 0, // Placeholder
        meeting_id,
        speaker_turn: parseInt(speaker_turn),
        original_text,
        translated_text,
        audio_url: req.file.path, // Assuming local path or URL
        audio_duration: 0, // process audio to get duration
      });

      // Broadcast to meeting
      this.socketService.broadcastTranscript(meeting_id, transcript);

      sendSuccess(res, transcript, "Audio processed successfully");
    } catch (error) {
      next(error);
    }
  };
}

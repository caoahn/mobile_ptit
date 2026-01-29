import { Server as SocketIOServer, Socket } from "socket.io";
import { ISocketService } from "../interfaces/services/socket.service";

export class SocketService implements ISocketService {
  private io: SocketIOServer | null = null;

  init(server: any) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
      },
    });

    this.io.on("connection", (socket: Socket) => {
      console.log("User connected:", socket.id);

      socket.on("join_meeting", ({ meeting_id, user_id }) => {
        socket.join(meeting_id);
        console.log(`User ${user_id} joined meeting ${meeting_id}`);
        this.io?.to(meeting_id).emit("user_joined", { user_id });
      });

      socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
      });
    });
  }

  broadcastTranscript(meetingId: string, transcript: any) {
    if (this.io) {
      this.io.to(meetingId).emit("new_transcript", transcript);
    }
  }
}

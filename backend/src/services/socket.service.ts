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

      // User join vào room của họ để nhận notifications
      socket.on("join", ({ userId }: { userId: number }) => {
        console.log(`User ${userId} joined with socket ${socket.id}`);
        socket.join(`user_${userId}`);
      });

      socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
        // Socket.IO tự động remove socket khỏi tất cả rooms
      });
    });
  }

  /**
   * Emit notification đến user cụ thể
   * Socket.IO sẽ gửi đến TẤT CẢ các connections (tabs/devices) của user đó
   */
  emitToUser(userId: number, event: string, data: any): void {
    if (this.io) {
      this.io.to(`user_${userId}`).emit(event, data);
      console.log(`Emitted ${event} to user ${userId}:`, data);
    }
  }
}

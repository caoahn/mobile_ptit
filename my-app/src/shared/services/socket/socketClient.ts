import { io, Socket } from "socket.io-client";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";

// Lấy base URL từ config (có /api), loại bỏ /api để lấy root URL cho socket
const BASE_URL =
  Constants.expoConfig?.extra?.apiUrl ||
  process.env.EXPO_PUBLIC_API_URL ||
  "http://192.168.1.211:3000/api";

const SOCKET_URL = BASE_URL.replace(/\/api$/, "");

class SocketClient {
  private socket: Socket | null = null;
  private userId: string | null = null;

  /**
   * Kết nối Socket.IO với server
   */
  async connect(userId: string): Promise<void> {
    if (this.socket?.connected) {
      console.log("Socket already connected");
      return;
    }

    this.userId = userId;

    // Lấy token để authenticate (nếu cần)
    const token = await AsyncStorage.getItem("access_token");

    this.socket = io(SOCKET_URL, {
      transports: ["websocket"],
      auth: {
        token,
      },
    });

    this.socket.on("connect", () => {
      console.log("✅ Socket connected:", this.socket?.id);

      // Join vào room của user để nhận notifications
      this.socket?.emit("join", { userId: this.userId });
    });

    this.socket.on("disconnect", (reason: string) => {
      console.log("Socket disconnected:", reason);
    });

    this.socket.on("connect_error", (error: Error) => {
      console.error("Socket connection error:", error);
    });
  }

  /**
   * Ngắt kết nối
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.userId = null;
      console.log("Socket disconnected manually");
    }
  }

  /**
   * Lắng nghe event từ server
   */
  on(event: string, callback: (data: any) => void): void {
    this.socket?.on(event, callback);
  }

  /**
   * Hủy lắng nghe event
   */
  off(event: string, callback?: (data: any) => void): void {
    this.socket?.off(event, callback);
  }

  /**
   * Emit event đến server
   */
  emit(event: string, data: any): void {
    this.socket?.emit(event, data);
  }

  /**
   * Kiểm tra trạng thái kết nối
   */
  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

// Export singleton instance
export const socketClient = new SocketClient();

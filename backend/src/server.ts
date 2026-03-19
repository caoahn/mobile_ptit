import { createServer } from "http";
import app from "./app";
import { env } from "./config/env";
import { logger } from "./utils/logger";
import { connectDB } from "./config/database";
import container from "./container";
import { SocketService } from "./services/socket.service";
import dotenv from "dotenv";

dotenv.config();

const startServer = async () => {
  await connectDB();

  // Tạo HTTP server
  const httpServer = createServer(app);

  // Init Socket.IO
  const socketService = container.resolve<SocketService>("socketService");
  socketService.init(httpServer);

  // Listen
  httpServer.listen(Number(env.port), "0.0.0.0", () => {
    logger.info(`Server is running in ${env.nodeEnv} mode on port ${env.port}`);
    logger.info(
      `Swagger documentation available at http://localhost:${env.port}/api`,
    );
    logger.info(`Socket.IO server is ready`);
  });
};

startServer();

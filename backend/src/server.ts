import app from "./app";
import { env } from "./config/env";
import { logger } from "./utils/logger";
import { connectDB } from "./config/database";

const startServer = async () => {
  await connectDB();
  app.listen(Number(env.port), "0.0.0.0", () => {
    logger.info(`Server is running in ${env.nodeEnv} mode on port ${env.port}`);
  });
};

startServer();

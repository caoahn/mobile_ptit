import app from "./app";
import { env } from "./config/env";
import { logger } from "./utils/logger";
import { connectDB } from "./config/database";

const startServer = async () => {
  await connectDB();
  app.listen(env.port, () => {
    logger.info(`Server is running in ${env.nodeEnv} mode on port ${env.port}`);
    logger.info(`Swagger UI available at http://localhost:${env.port}/api`);
  });
};

startServer();

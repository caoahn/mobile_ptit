import { Sequelize } from "sequelize";
import { env } from "./env";
import { logger } from "../utils/logger";

export const sequelize = new Sequelize(
  env.db.name,
  env.db.user,
  env.db.password,
  {
    host: env.db.host,
    dialect: "mysql",
    logging: false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  },
);

export const connectDB = async () => {
  try {
    await sequelize.authenticate();
    logger.info("Database connected successfully via Sequelize");
    await sequelize.sync({
      alter: true,
    });
    logger.info("Database synchronized");
  } catch (err) {
    logger.error("Database connection failed", err);
    process.exit(1);
  }
};

import { Request, Response, NextFunction } from "express";
import { sendError } from "../utils/response";
import { logger } from "../utils/logger";

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  logger.error("Unhandled Error", err);
  sendError(res, err.status || 500, err.message || "Internal Server Error");
};

import { Request, Response, NextFunction } from "express";
import { sendError } from "../utils/response";

// Simple validation middleware placeholder
// Can integrated with Joi or express-validator
export const validate =
  (schema: any) => (req: Request, res: Response, next: NextFunction) => {
    // Implement validation logic
    next();
  };

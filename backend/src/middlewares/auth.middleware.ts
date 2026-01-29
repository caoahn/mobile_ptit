import { Request, Response, NextFunction } from "express";
import { TokenService } from "../services/token.service";
import { sendError } from "../utils/response";
import container from "../container";

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return sendError(res, 401, "Unauthorized");

  const tokenService = container.resolve<TokenService>("tokenService");

  try {
    const user = tokenService.verifyToken(token, "access");
    (req as any).user = user;
    next();
  } catch (err) {
    return sendError(res, 403, "Forbidden");
  }
};

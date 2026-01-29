import { Response } from "express";
import { ApiResponse } from "../types/api";

export const sendResponse = <T>(
  res: Response,
  statusCode: number,
  success: boolean,
  message: string,
  data?: T,
) => {
  const response: ApiResponse<T> = {
    success,
    message,
    data,
  };
  return res.status(statusCode).json(response);
};

export const sendSuccess = <T>(
  res: Response,
  data: T,
  message: string = "Success",
) => {
  return sendResponse(res, 200, true, message, data);
};

export const sendCreated = <T>(
  res: Response,
  data: T,
  message: string = "Created successfully",
) => {
  return sendResponse(res, 201, true, message, data);
};

export const sendError = (
  res: Response,
  statusCode: number,
  message: string,
  error?: any,
) => {
  // In production, might want to hide internal error details
  return sendResponse(res, statusCode, false, message, error);
};

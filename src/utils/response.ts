import { Response } from "express";

export const sendError = (
  res: Response,
  status: number,
  message: string,
  error?: unknown,
): void => {
  const errorMessage = error instanceof Error ? error.message : String(error);
  res.status(status).json({ message, error: errorMessage });
};

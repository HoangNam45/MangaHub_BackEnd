import { Request, Response, NextFunction } from "express";
import { HttpError } from "http-errors";

export function errorHandler(
  err: HttpError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error(`[ERROR] ${err.status || 500} - ${err.message}`);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
}

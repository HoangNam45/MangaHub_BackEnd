import { NextFunction } from "express";
import createError from "http-errors";
export const handleError = (error: unknown, next: NextFunction) => {
  const message =
    error instanceof Error ? error.message : "An unknown error occurred";
  next(createError(500, message));
};

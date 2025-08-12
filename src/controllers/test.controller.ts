import { Request, Response, NextFunction } from "express";
import createError from "http-errors";

export const test = async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.json({ success: true, message: "Test success" });
  } catch (error) {
    next(createError(500, "Login failed"));
  }
};

import { Request, Response, NextFunction } from "express";
import createError from "http-errors";
import { verifyAccessToken, TokenPayload } from "../services/jwt.service";
import { User } from "../models/User";

// Extend Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

    if (!token) {
      return next(createError(401, "Access token required"));
    }

    const decoded = verifyAccessToken(token);
    if (!decoded) {
      return next(createError(403, "Invalid or expired token"));
    }

    req.user = decoded;
    next();
  } catch (error) {
    next(createError(403, "Invalid token"));
  }
};

export const optionalAuthentication = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];

    if (token) {
      const decoded = verifyAccessToken(token);
      if (decoded) {
        req.user = decoded;
      }
    }

    next();
  } catch (error) {
    // Continue without authentication if token is invalid
    next();
  }
};

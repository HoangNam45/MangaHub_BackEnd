import jwt, { SignOptions } from "jsonwebtoken";
import { IUser } from "../types/user";

export interface TokenPayload {
  userId: string;
  email: string;
  name: string;
  isEmailVerified: boolean;
}

export const generateAccessToken = (user: IUser): string => {
  const payload: TokenPayload = {
    userId: user._id as string,
    email: user.email,
    name: user.name,
    isEmailVerified: user.isEmailVerified,
  };

  const secret = process.env.JWT_ACCESS_SECRET;
  if (!secret) throw new Error("JWT_ACCESS_SECRET is not defined");

  const options: SignOptions = {
    expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m",
  } as SignOptions;

  return jwt.sign(payload, secret, options);
};

export const generateRefreshToken = (user: IUser): string => {
  const payload: TokenPayload = {
    userId: user._id as string,
    email: user.email,
    name: user.name,
    isEmailVerified: user.isEmailVerified,
  };

  const secret = process.env.JWT_REFRESH_SECRET;
  if (!secret) throw new Error("JWT_REFRESH_SECRET is not defined");

  const options: SignOptions = {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
  } as SignOptions;

  return jwt.sign(payload, secret, options);
};

export const verifyAccessToken = (token: string): TokenPayload | null => {
  try {
    const secret = process.env.JWT_ACCESS_SECRET;
    if (!secret) throw new Error("JWT_ACCESS_SECRET is not defined");

    return jwt.verify(token, secret) as TokenPayload;
  } catch (error) {
    return null;
  }
};

export const verifyRefreshToken = (token: string): TokenPayload | null => {
  try {
    const secret = process.env.JWT_REFRESH_SECRET;
    if (!secret) throw new Error("JWT_REFRESH_SECRET is not defined");

    return jwt.verify(token, secret) as TokenPayload;
  } catch (error) {
    return null;
  }
};

export const generateTokenPair = (user: IUser) => {
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  return {
    accessToken,
    refreshToken,
    expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m",
  };
};

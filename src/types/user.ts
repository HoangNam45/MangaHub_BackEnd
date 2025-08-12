import { Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  isEmailVerified: boolean;
  verificationCode?: string;
  verificationCodeExpires?: Date;
  provider: "local" | "google" | "facebook";
  // OAuth fields
  googleId?: string;
  facebookId?: string;
  avatar?: string;
  refreshTokens: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

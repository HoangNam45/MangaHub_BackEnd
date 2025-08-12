import mongoose, { Schema } from "mongoose";
import { IUser } from "../types/user";

const UserSchema: Schema<IUser> = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, select: false },
    isEmailVerified: { type: Boolean, default: false },
    provider: {
      type: String,
      enum: ["local", "google", "facebook"],
      default: "local",
    },
    // OAuth fields
    googleId: { type: String, unique: true, sparse: true },
    facebookId: { type: String, unique: true, sparse: true },
    avatar: { type: String },
    refreshTokens: [{ type: String }],
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>("User", UserSchema);

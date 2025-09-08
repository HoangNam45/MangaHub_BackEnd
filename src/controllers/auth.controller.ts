import { Request, Response, NextFunction } from "express";
import { handleError } from "../utils/handleError";
import {
  setRefreshTokenCookie,
  clearRefreshTokenCookie,
} from "../utils/cookieHelper";
import createError from "http-errors";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import {
  sendVerificationEmail,
  generateVerificationCode,
  saveEmailVerificationCode,
  getEmailVerificationCode,
  deleteEmailVerificationCode,
} from "../services/email.service";
import { User } from "../models/User";
import {
  generateTokenPair,
  generateAccessToken,
  TokenPayload,
  verifyRefreshToken,
} from "../services/jwt.service";

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, name, password } = req.body;

    // Validate input
    if (!email || !name) {
      return next(createError(400, "Email and name are required"));
    }

    // If password is provided, validate it (minimum 6 characters)
    if (password && password.length < 6) {
      return next(
        createError(400, "Password must be at least 6 characters long")
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      if (existingUser.isEmailVerified) {
        return next(createError(400, "User with this email already exists"));
      } else {
        // User exists but not verified, update info and resend verification code
        existingUser.name = name; // Cập nhật tên mới

        // Hash and update password if provided
        if (password) {
          const saltRounds = 12;
          existingUser.password = await bcrypt.hash(password, saltRounds);
        }

        await existingUser.save();

        const code = generateVerificationCode();
        await saveEmailVerificationCode(email, code);
        await sendVerificationEmail(email, code);
        return res.status(200).json({
          message:
            "User information updated. Verification code resent to email",
          userId: existingUser._id,
        });
      }
    }

    // Hash password if provided
    let hashedPassword: string | undefined;
    if (password) {
      const saltRounds = 12;
      hashedPassword = await bcrypt.hash(password, saltRounds);
    }

    // Create new user (unverified)
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      isEmailVerified: false,
    });

    await newUser.save();

    // Send verification code
    const code = generateVerificationCode();
    await saveEmailVerificationCode(email, code);
    await sendVerificationEmail(email, code);

    res.status(201).json({
      message: "User registered. Verification code sent to email",
      userId: newUser._id,
    });
  } catch (error) {
    handleError(error, next);
  }
};

export const verifyEmail = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, verificationCode } = req.body;
    console.log("Verifying email:", email, "with code:", verificationCode);

    if (!email || !verificationCode) {
      return next(createError(400, "Email and verification code are required"));
    }

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return next(createError(404, "User not found"));
    }

    // Check if already verified
    if (user.isEmailVerified) {
      return next(createError(400, "Email is already verified"));
    }

    // Get stored verification code
    const storedCode = await getEmailVerificationCode(email);
    if (!storedCode) {
      return next(
        createError(400, "Verification code has expired or is invalid")
      );
    }

    // Verify code
    if (storedCode !== verificationCode) {
      return next(createError(400, "Invalid verification code"));
    }

    // Update user verification status
    user.isEmailVerified = true;
    await user.save();

    // Clean up verification code
    await deleteEmailVerificationCode(email);

    // Generate JWT tokens for auto-login
    const tokens = generateTokenPair(user);

    // Replace all refresh tokens with new one (single session only)
    user.refreshTokens = [tokens.refreshToken];
    await user.save();

    // Set refresh token as httpOnly cookie
    setRefreshTokenCookie(res, tokens.refreshToken);

    res.status(200).json({
      message: "Email verified successfully. You are now logged in!",
      verified: true,
      userId: user._id,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isEmailVerified: user.isEmailVerified,
      },
      accessToken: tokens.accessToken,
      expiresIn: tokens.expiresIn,
    });
  } catch (error) {
    handleError(error, next);
  }
};

export const resendVerification = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email } = req.body;

    // Validate input
    if (!email) {
      return next(createError(400, "Email is required"));
    }

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return next(createError(404, "User not found"));
    }

    // Check if already verified
    if (user.isEmailVerified) {
      return next(createError(400, "Email is already verified"));
    }

    // Generate and send new verification code
    const code = generateVerificationCode();
    await saveEmailVerificationCode(email, code);
    await sendVerificationEmail(email, code);

    res.status(200).json({
      message: "Verification code resent to email",
      userId: user._id,
    });
  } catch (error) {
    handleError(error, next);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return next(createError(400, "Email and password are required"));
    }

    // Find user and include password field for verification
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return next(createError(401, "Invalid credentials"));
    }

    // Check if email is verified
    if (!user.isEmailVerified) {
      return next(
        createError(401, "Please verify your email before logging in")
      );
    }

    // Verify password
    if (!user.password) {
      return next(
        createError(
          401,
          "Password not set. Please use social login or reset password"
        )
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return next(createError(401, "Invalid credentials"));
    }

    // Generate tokens
    const tokens = generateTokenPair(user);

    // Replace all refresh tokens with new one (single session only)
    user.refreshTokens = [tokens.refreshToken];
    await user.save();

    // Set refresh token as httpOnly cookie
    setRefreshTokenCookie(res, tokens.refreshToken);

    res.status(200).json({
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isEmailVerified: user.isEmailVerified,
      },
      accessToken: tokens.accessToken,
      expiresIn: tokens.expiresIn,
    });
  } catch (error) {
    handleError(error, next);
  }
};

export const refreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get refresh token from cookie or request body
    let refreshToken = req.cookies.refreshToken || req.body.refresh_token;

    if (!refreshToken) {
      return next(createError(401, "Refresh token not provided"));
    }

    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);
    if (!decoded) {
      return next(createError(401, "Invalid refresh token"));
    }

    // Find user and check if refresh token exists in database
    const user = await User.findById(decoded.userId);
    if (!user || !user.refreshTokens.includes(refreshToken)) {
      return next(createError(401, "Invalid refresh token"));
    }

    // Generate only new access token (keep existing refresh token)
    const accessToken = generateAccessToken(user);

    res.status(200).json({
      message: "Token refreshed successfully",
      accessToken: accessToken,
      expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m",
    });
  } catch (error) {
    handleError(error, next);
  }
};

export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get refresh token from cookie
    const refreshToken = req.cookies.refreshToken;

    if (refreshToken) {
      // Remove refresh token from user's token list
      const decoded = verifyRefreshToken(refreshToken);
      if (decoded) {
        const user = await User.findById(decoded.userId);
        if (user) {
          user.refreshTokens = user.refreshTokens.filter(
            (token) => token !== refreshToken
          );
          await user.save();
        }
      }
    }

    // Clear refresh token cookie
    clearRefreshTokenCookie(res);

    res.status(200).json({
      message: "Logout successful",
    });
  } catch (error) {
    handleError(error, next);
  }
};

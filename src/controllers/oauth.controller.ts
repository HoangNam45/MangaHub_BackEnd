import { Request, Response, NextFunction } from "express";
import { handleError } from "../utils/handleError";
import { setRefreshTokenCookie } from "../utils/cookieHelper";
import { generateTokenPair } from "../services/jwt.service";
import { User } from "../models/User";

// Handle successful OAuth login
export const handleOAuthSuccess = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user as any;

    if (!user) {
      // Redirect to frontend with error
      return res.redirect(
        `${process.env.FRONTEND_URL}/login?error=auth_failed`
      );
    }

    // Find the full user document to update refresh tokens
    const fullUser = await User.findById(user.id);
    if (!fullUser) {
      return res.redirect(
        `${process.env.FRONTEND_URL}/login?error=user_not_found`
      );
    }

    // Generate tokens
    const tokens = generateTokenPair(fullUser);

    // Replace all refresh tokens with new one (single session only)
    fullUser.refreshTokens = [tokens.refreshToken];
    await fullUser.save();

    // Set refresh token as httpOnly cookie
    setRefreshTokenCookie(res, tokens.refreshToken);

    // Redirect to frontend với access token
    const redirectUrl = `${process.env.FRONTEND_URL}/api/auth/callback?token=${
      tokens.accessToken
    }&user=${encodeURIComponent(JSON.stringify(user))}`;
    res.redirect(redirectUrl);
  } catch (error) {
    console.error("OAuth Success Handler Error:", error);
    res.redirect(
      `${process.env.FRONTEND_URL}/api/auth/callback?error=server_error`
    );
  }
};

// Handle OAuth failure
export const handleOAuthFailure = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error("OAuth Authentication Failed");
  res.redirect(
    `${process.env.FRONTEND_URL}/api/auth/callback?error=auth_failed`
  );
};

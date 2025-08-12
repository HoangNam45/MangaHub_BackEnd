import { Router } from "express";
import {
  register,
  verifyEmail,
  resendVerification,
  login,
  refreshToken,
  logout,
} from "../controllers/auth.controller";
import oauthRoutes from "./oauth.routes";

const router = Router();

// Traditional auth routes
router.post("/register", register);
router.post("/verify-email", verifyEmail);
router.post("/resend-verification", resendVerification);
router.post("/login", login);
router.post("/refresh-token", refreshToken);
router.post("/logout", logout);

// OAuth routes
router.use("/", oauthRoutes);

export default router;

import { Router } from "express";
import passport from "passport";
import {
  handleOAuthSuccess,
  handleOAuthFailure,
} from "../controllers/oauth.controller";

const router = Router();

// Google OAuth routes
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: "/api/v1/auth/failure",
  }),
  handleOAuthSuccess
);

// Facebook OAuth routes
router.get(
  "/facebook",
  passport.authenticate("facebook", {
    scope: ["email"],
  })
);

router.get(
  "/facebook/callback",
  passport.authenticate("facebook", {
    session: false,
    failureRedirect: "/api/v1/auth/failure",
  }),
  handleOAuthSuccess
);

// Handle OAuth failure
router.get("/failure", handleOAuthFailure);

export default router;

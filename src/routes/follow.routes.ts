import { Router } from "express";
import { followController } from "../controllers/follow.controller";
import { authenticateToken } from "../middlewares/auth.middleware";

const router = Router();

// All follow routes require authentication
router.use(authenticateToken);

// POST /api/follow/:mangaId - Follow a manga
router.post("/:mangaId", followController.followManga);

// DELETE /api/follow/:mangaId - Unfollow a manga
router.delete("/:mangaId", followController.unfollowManga);

// GET /api/follow/:mangaId/status - Check follow status
router.get("/:mangaId/status", followController.getFollowStatus);

// GET /api/follow/details - Get all followed manga with details
router.get("/details", followController.getFollowedManga);

// GET /api/follow - Get followed manga IDs only (without details)
router.get("/", followController.getFollowedMangaIds);

export default router;

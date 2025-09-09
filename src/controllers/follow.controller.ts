import { Request, Response, NextFunction } from "express";
import { User } from "../models/User";
import { handleError } from "../utils/handleError";
import createError from "http-errors";
import { mangaService } from "../services/manga.service";

// Extend Request interface to include user info from auth middleware
interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
  };
}

export const followController = {
  // POST /api/follow/:mangaId - Follow a manga
  async followManga(req: Request, res: Response, next: NextFunction) {
    try {
      const { mangaId } = req.params;
      const userId = (req as AuthenticatedRequest).user?.userId;

      if (!userId) {
        return next(createError(401, "Authentication required"));
      }

      if (!mangaId) {
        return next(createError(400, "Manga ID is required"));
      }

      // Validate manga ID format (UUID v4)
      // const uuidRegex =
      //   /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      // if (!uuidRegex.test(mangaId)) {
      //   return next(createError(400, "Invalid manga ID format"));
      // }

      // Verify manga exists on MangaDx
      try {
        await mangaService.getMangaById(mangaId);
      } catch (error) {
        return next(createError(404, "Manga not found on MangaDx"));
      }

      // Find user and check if already following
      const user = await User.findById(userId);
      if (!user) {
        return next(createError(404, "User not found"));
      }

      if (user.followedManga.includes(mangaId)) {
        return res.status(200).json({
          success: true,
          message: "Already following this manga",
          isFollowing: true,
          mangaId,
        });
      }

      // Add manga to followed list
      user.followedManga.push(mangaId);
      await user.save();

      res.status(200).json({
        success: true,
        message: "Successfully followed manga",
        isFollowing: true,
        mangaId,
      });
    } catch (error) {
      handleError(error, next);
    }
  },

  // DELETE /api/follow/:mangaId - Unfollow a manga
  async unfollowManga(req: Request, res: Response, next: NextFunction) {
    try {
      const { mangaId } = req.params;
      const userId = (req as AuthenticatedRequest).user?.userId;

      if (!userId) {
        return next(createError(401, "Authentication required"));
      }

      if (!mangaId) {
        return next(createError(400, "Manga ID is required"));
      }

      // Find user
      const user = await User.findById(userId);
      if (!user) {
        return next(createError(404, "User not found"));
      }

      // Check if user is following this manga
      if (!user.followedManga.includes(mangaId)) {
        return res.status(200).json({
          success: true,
          message: "Not following this manga",
          isFollowing: false,
          mangaId,
        });
      }

      // Remove manga from followed list
      user.followedManga = user.followedManga.filter((id) => id !== mangaId);
      await user.save();

      res.status(200).json({
        success: true,
        message: "Successfully unfollowed manga",
        isFollowing: false,
        mangaId,
      });
    } catch (error) {
      handleError(error, next);
    }
  },

  // GET /api/follow/:mangaId/status - Check if user is following a manga
  async getFollowStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { mangaId } = req.params;
      const userId = (req as AuthenticatedRequest).user?.userId;

      if (!userId) {
        return next(createError(401, "Authentication required"));
      }

      if (!mangaId) {
        return next(createError(400, "Manga ID is required"));
      }

      // Find user
      const user = await User.findById(userId);
      if (!user) {
        return next(createError(404, "User not found"));
      }

      const isFollowing = user.followedManga.includes(mangaId);

      res.status(200).json({
        success: true,
        isFollowing,
        mangaId,
      });
    } catch (error) {
      handleError(error, next);
    }
  },

  // GET /api/follow - Get all followed manga IDs (without details)
  async getFollowedMangaIds(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as AuthenticatedRequest).user?.userId;

      if (!userId) {
        return next(createError(401, "Authentication required"));
      }

      // Find user
      const user = await User.findById(userId);
      if (!user) {
        return next(createError(404, "User not found"));
      }

      res.status(200).json({
        success: true,
        message: "Followed manga IDs retrieved successfully",
        data: user.followedManga,
        total: user.followedManga.length,
      });
    } catch (error) {
      handleError(error, next);
    }
  },

  // GET /api/follow/details - Get all followed manga with details
  async getFollowedManga(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as AuthenticatedRequest).user?.userId;
      const { limit = 999, offset = 0 } = req.query;

      if (!userId) {
        return next(createError(401, "Authentication required"));
      }

      // Find user
      const user = await User.findById(userId);
      if (!user) {
        return next(createError(404, "User not found"));
      }

      const totalFollowed = user.followedManga.length;

      // Apply pagination to manga IDs
      const paginatedMangaIds = user.followedManga.slice(
        Number(offset),
        Number(offset) + Number(limit)
      );

      // Fetch manga details for each followed manga
      const mangaDetailsPromises = paginatedMangaIds.map(async (mangaId) => {
        try {
          return await mangaService.getMangaById(mangaId);
        } catch (error) {
          console.warn(`Failed to fetch manga ${mangaId}:`, error);
          return null;
        }
      });

      const mangaDetails = await Promise.all(mangaDetailsPromises);

      // Filter out failed requests
      const validManga = mangaDetails.filter((manga) => manga !== null);

      res.status(200).json({
        success: true,
        message: "Followed manga retrieved successfully",
        data: validManga,
        pagination: {
          total: totalFollowed,
          limit: Number(limit),
          offset: Number(offset),
          hasNext: Number(offset) + Number(limit) < totalFollowed,
        },
      });
    } catch (error) {
      handleError(error, next);
    }
  },
};

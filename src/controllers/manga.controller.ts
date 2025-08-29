import { Request, Response } from "express";
import { mangaService } from "../services/manga.service";

export const mangaController = {
  // GET /api/manga - Lấy danh sách manga
  async getMangaList(req: Request, res: Response) {
    try {
      const {
        limit = 15,
        offset = 0,
        order = "desc",
        language = "en",
      } = req.query;

      const params = {
        limit: Number(limit),
        offset: Number(offset),
        order: { latestUploadedChapter: order as "asc" | "desc" },
        availableTranslatedLanguage: Array.isArray(language)
          ? (language as string[])
          : [language as string],
        includes: ["cover_art", "author"],
      };

      const result = await mangaService.fetchMangaList(params);

      res.status(200).json({
        success: true,
        message: "Manga list fetched successfully",
        data: result.data,
        pagination: {
          total: result.total,
          limit: Number(limit),
          offset: Number(offset),
          hasNext: Number(offset) + Number(limit) < result.total,
        },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "Failed to fetch manga list",
        error: error.message,
      });
    }
  },

  // GET /api/manga/search - Tìm kiếm manga
  async searchManga(req: Request, res: Response) {
    try {
      const { q: query, limit = 25, offset = 0, language = "en" } = req.query;

      if (!query || typeof query !== "string") {
        return res.status(400).json({
          success: false,
          message: "Search query is required",
        });
      }

      const params = {
        limit: Number(limit),
        offset: Number(offset),
        availableTranslatedLanguage: Array.isArray(language)
          ? (language as string[])
          : [language as string],
        includes: ["cover_art", "author", "artist"],
      };

      const result = await mangaService.searchManga(query, params);

      res.status(200).json({
        success: true,
        message: "Manga search completed successfully",
        data: result.data,
        pagination: {
          total: result.total,
          limit: Number(limit),
          offset: Number(offset),
          hasNext: Number(offset) + Number(limit) < result.total,
        },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "Failed to search manga",
        error: error.message,
      });
    }
  },

  // GET /api/manga/:id - Lấy thông tin chi tiết manga
  async getMangaById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: "Manga ID is required",
        });
      }

      const manga = await mangaService.getMangaById(id);

      res.status(200).json({
        success: true,
        message: "Manga details fetched successfully",
        data: manga,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "Failed to fetch manga details",
        error: error.message,
      });
    }
  },
};

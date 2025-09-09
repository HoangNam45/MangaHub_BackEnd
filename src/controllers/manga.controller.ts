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
        status,
        includedTags,
      } = req.query;

      const params = {
        limit: Number(limit),
        offset: Number(offset),
        order: { latestUploadedChapter: order as "asc" | "desc" },
        availableTranslatedLanguage: Array.isArray(language)
          ? (language as string[])
          : [language as string],
        includes: ["cover_art", "author"],
        ...(status && {
          status: Array.isArray(status)
            ? (status as string[])
            : typeof status === "string" && status.includes(",")
            ? status.split(",").map((s) => s.trim())
            : [status as string],
        }),
        ...(includedTags && {
          includedTags: Array.isArray(includedTags)
            ? (includedTags as string[])
            : typeof includedTags === "string" && includedTags.includes(",")
            ? includedTags.split(",").map((tag) => tag.trim())
            : [includedTags as string],
        }),
      };
      console.log("Fetch manga list with params:", params);

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
      const {
        q: query,
        limit = 15,
        offset = 0,
        language = "en",
        status,
        includedTags,
      } = req.query;

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
        ...(status && {
          status: Array.isArray(status)
            ? (status as string[])
            : typeof status === "string" && status.includes(",")
            ? status.split(",").map((s) => s.trim())
            : [status as string],
        }),
        ...(includedTags && {
          includedTags: Array.isArray(includedTags)
            ? (includedTags as string[])
            : typeof includedTags === "string" && includedTags.includes(",")
            ? includedTags.split(",").map((tag) => tag.trim())
            : [includedTags as string],
        }),
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

  // GET /api/manga/:id/detail - Lấy thông tin chi tiết manga với chapters
  async getMangaDetail(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { limit = 999999, offset = 0 } = req.query;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: "Manga ID is required",
        });
      }

      const result = await mangaService.getMangaDetail(
        id,
        Number(limit),
        Number(offset)
      );

      res.status(200).json({
        success: true,
        message: "Manga details with chapters fetched successfully",
        data: {
          manga: result.manga,
          chapters: result.chapters,
          pagination: {
            totalChapters: result.totalChapters,
            limit: Number(limit),
            offset: Number(offset),
            hasNext: Number(offset) + Number(limit) < result.totalChapters,
          },
        },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "Failed to fetch manga details with chapters",
        error: error.message,
      });
    }
  },

  // GET /api/manga/chapter/:id/images - Lấy ảnh của chapter
  async getChapterImages(req: Request, res: Response) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: "Chapter ID is required",
        });
      }

      const result = await mangaService.getChapterImages(id);

      res.status(200).json({
        success: true,
        message: "Chapter images fetched successfully",
        data: {
          chapterId: result.chapterId,
          totalPages: result.images.length,
          images: result.images,
          server: {
            baseUrl: result.baseUrl,
            hash: result.hash,
          },
        },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "Failed to fetch chapter images",
        error: error.message,
      });
    }
  },

  // GET /api/manga/:id/all-chapters - Lấy toàn bộ chapters của manga
  async getAllChapters(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { language = "en" } = req.query;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: "Manga ID is required",
        });
      }

      const languageArray = Array.isArray(language)
        ? (language as string[])
        : [language as string];

      const chapters = await mangaService.getAllChapters(id, languageArray);

      res.status(200).json({
        success: true,
        message: "All chapters fetched successfully",
        data: {
          mangaId: id,
          totalChapters: chapters.length,
          chapters: chapters,
        },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "Failed to fetch all chapters",
        error: error.message,
      });
    }
  },
};

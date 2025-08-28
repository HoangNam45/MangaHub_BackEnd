import axios from "axios";
import type {
  Manga,
  MangaListResponse,
  FetchMangaParams,
} from "../types/manga";

// Tạo một axios instance riêng cho MangaDex API
const mangaDexClient = axios.create({
  baseURL: process.env.MANGADEX_API_URL || "https://api.mangadex.org",
});

export const mangaService = {
  // Fetch manga list từ MangaDex API
  async fetchMangaList(
    params: FetchMangaParams = {}
  ): Promise<MangaListResponse> {
    try {
      const {
        limit = 25,
        offset = 0,
        order = { latestUploadedChapter: "desc" },
        availableTranslatedLanguage = ["en"],
        includes = ["cover_art", "author", "artist"],
      } = params;

      const response = await mangaDexClient.get("/manga", {
        params: {
          limit,
          offset,
          "order[latestUploadedChapter]": order.latestUploadedChapter,
          "availableTranslatedLanguage[]": availableTranslatedLanguage,
          "includes[]": includes,
        },
      });

      const mangaWithCovers: Manga[] = response.data.data.map(
        (manga: Manga) => {
          const coverRel = manga.relationships.find(
            (r) => r.type === "cover_art"
          );
          const fileName = (coverRel?.attributes as any)?.fileName;

          const coverUrl = fileName
            ? `https://uploads.mangadex.org/covers/${manga.id}/${fileName}`
            : null;

          const authorList = manga.relationships
            .filter((r) => r.type === "author" || r.type === "artist")
            .map((r) => {
              const n = (r.attributes as any)?.name;
              return typeof n === "string" ? n : n?.en;
            })
            .filter(Boolean) as string[];

          const author = authorList.length ? authorList.join(", ") : "Unknown";

          return { ...manga, coverUrl: coverUrl || undefined, author };
        }
      );

      return {
        data: mangaWithCovers,
        total: response.data.total || 0,
      };
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          "Failed to fetch manga data"
      );
    }
  },

  // Search manga
  async searchManga(
    query: string,
    params: Omit<FetchMangaParams, "order"> = {}
  ): Promise<MangaListResponse> {
    try {
      const {
        limit = 25,
        offset = 0,
        availableTranslatedLanguage = ["en"],
        includes = ["cover_art", "author", "artist"],
      } = params;

      const response = await mangaDexClient.get("/manga", {
        params: {
          title: query,
          limit,
          offset,
          "availableTranslatedLanguage[]": availableTranslatedLanguage,
          "includes[]": includes,
        },
      });

      const mangaWithCovers: Manga[] = response.data.data.map(
        (manga: Manga) => {
          const coverRel = manga.relationships.find(
            (r) => r.type === "cover_art"
          );
          const fileName = (coverRel?.attributes as any)?.fileName;

          const coverUrl = fileName
            ? `https://uploads.mangadex.org/covers/${manga.id}/${fileName}`
            : null;

          const authorList = manga.relationships
            .filter((r) => r.type === "author" || r.type === "artist")
            .map((r) => {
              const n = (r.attributes as any)?.name;
              return typeof n === "string" ? n : n?.en;
            })
            .filter(Boolean) as string[];

          const author = authorList.length ? authorList.join(", ") : "Unknown";

          return { ...manga, coverUrl: coverUrl || undefined, author };
        }
      );

      return {
        data: mangaWithCovers,
        total: response.data.total || 0,
      };
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          "Failed to search manga"
      );
    }
  },

  // Fetch manga by ID
  async getMangaById(id: string): Promise<Manga> {
    try {
      const response = await mangaDexClient.get(`/manga/${id}`, {
        params: {
          "includes[]": ["cover_art", "author", "artist"],
        },
      });

      const manga = response.data.data;
      const coverRel = manga.relationships.find(
        (r: any) => r.type === "cover_art"
      );
      const fileName = (coverRel?.attributes as any)?.fileName;

      const coverUrl = fileName
        ? `https://uploads.mangadex.org/covers/${manga.id}/${fileName}`
        : null;

      const authorList = manga.relationships
        .filter((r: any) => r.type === "author" || r.type === "artist")
        .map((r: any) => {
          const n = (r.attributes as any)?.name;
          return typeof n === "string" ? n : n?.en;
        })
        .filter(Boolean) as string[];

      const author = authorList.length ? authorList.join(", ") : "Unknown";

      return { ...manga, coverUrl: coverUrl || undefined, author };
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          "Failed to fetch manga details"
      );
    }
  },
};

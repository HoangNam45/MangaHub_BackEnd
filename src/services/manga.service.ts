import axios from "axios";
import { SocksProxyAgent } from "socks-proxy-agent";
import type {
  Manga,
  MangaListResponse,
  FetchMangaParams,
  Chapter,
  MangaDetailResponse,
  ChapterImagesResponse,
} from "../types/manga";

const useProxy = process.env.NODE_ENV === "production";

const warpProxy = "socks5h://warp:1080";

const agent = useProxy ? new SocksProxyAgent(warpProxy) : undefined;

// Tạo một axios instance riêng cho MangaDex API
const mangaDexClient = axios.create({
  baseURL: process.env.MANGADEX_API_URL || "https://api.mangadex.org",
  timeout: 20000, // 20 giây
  ...(useProxy && agent ? { httpAgent: agent, httpsAgent: agent } : {}),
});

export const mangaService = {
  // Fetch manga list từ MangaDex API
  async fetchMangaList(
    params: FetchMangaParams = {}
  ): Promise<MangaListResponse> {
    try {
      const {
        limit = 15,
        offset = 0,
        order = { latestUploadedChapter: "desc" },
        availableTranslatedLanguage = ["en"],
        includes = ["cover_art", "author"],
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

  // Fetch manga details with chapters
  async getMangaDetail(
    id: string,
    limit: number = 100,
    offset: number = 0
  ): Promise<MangaDetailResponse> {
    try {
      // Get manga info
      const manga = await this.getMangaById(id);

      // Get chapters
      const chaptersResponse = await mangaDexClient.get(`/manga/${id}/feed`, {
        params: {
          limit,
          offset,
          "order[volume]": "desc",
          "order[chapter]": "desc",
          "translatedLanguage[]": ["en"],
        },
      });

      const chapters: Chapter[] = chaptersResponse.data.data.map(
        (chapter: any) => ({
          id: chapter.id,
          type: chapter.type,
          attributes: {
            title:
              chapter.attributes.title ||
              `Chapter ${chapter.attributes.chapter}`,
            volume: chapter.attributes.volume || "",
            chapter: chapter.attributes.chapter || "",
            pages: chapter.attributes.pages || 0,
            translatedLanguage: chapter.attributes.translatedLanguage || "en",
            uploader: chapter.attributes.uploader || "",
            externalUrl: chapter.attributes.externalUrl || null,
            createdAt: chapter.attributes.createdAt || "",
            updatedAt: chapter.attributes.updatedAt || "",
            publishAt: chapter.attributes.publishAt || "",
            readableAt: chapter.attributes.readableAt || "",
          },
          relationships: chapter.relationships || [],
        })
      );

      return {
        manga,
        chapters,
        totalChapters: chaptersResponse.data.total || 0,
      };
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          "Failed to fetch manga details with chapters"
      );
    }
  },

  // Fetch chapter images
  async getChapterImages(chapterId: string): Promise<ChapterImagesResponse> {
    try {
      // First get the chapter reading server info
      const serverResponse = await mangaDexClient.get(
        `/at-home/server/${chapterId}`
      );

      const { baseUrl, chapter } = serverResponse.data;
      const { hash, data, dataSaver } = chapter;

      // Create image URLs
      const images = data.map((filename: string, index: number) => ({
        page: index + 1,
        filename,
        url: `${baseUrl}/data/${hash}/${filename}`,
      }));

      return {
        chapterId,
        hash,
        data,
        dataSaver,
        baseUrl,
        images,
      };
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          "Failed to fetch chapter images"
      );
    }
  },
};

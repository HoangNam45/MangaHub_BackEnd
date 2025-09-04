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
        status,
        includedTags,
      } = params;

      // Tạo URLSearchParams để xử lý multiple values cho cùng 1 key
      const searchParams = new URLSearchParams();

      // Basic params
      searchParams.append("limit", limit.toString());
      searchParams.append("offset", offset.toString());
      searchParams.append(
        "order[latestUploadedChapter]",
        order.latestUploadedChapter || "desc"
      );

      // Language params (multiple values)
      availableTranslatedLanguage.forEach((lang) => {
        searchParams.append("availableTranslatedLanguage[]", lang);
      });

      // Includes params (multiple values)
      includes.forEach((include) => {
        searchParams.append("includes[]", include);
      });

      // Status params (multiple values)
      if (status && status.length > 0) {
        status.forEach((s) => {
          searchParams.append("status[]", s);
        });
      }

      // IncludedTags params (multiple values)
      if (includedTags && includedTags.length > 0) {
        includedTags.forEach((tag) => {
          searchParams.append("includedTags[]", tag);
        });
      }

      const response = await mangaDexClient.get(
        `/manga?${searchParams.toString()}`
      );

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
        status,
        includedTags,
      } = params;

      // Tạo URLSearchParams để xử lý multiple values cho cùng 1 key
      const searchParams = new URLSearchParams();

      // Basic params
      searchParams.append("title", query);
      searchParams.append("limit", limit.toString());
      searchParams.append("offset", offset.toString());

      // Language params (multiple values)
      availableTranslatedLanguage.forEach((lang) => {
        searchParams.append("availableTranslatedLanguage[]", lang);
      });

      // Includes params (multiple values)
      includes.forEach((include) => {
        searchParams.append("includes[]", include);
      });

      // Status params (multiple values)
      if (status && status.length > 0) {
        status.forEach((s) => {
          searchParams.append("status[]", s);
        });
      }

      // IncludedTags params (multiple values)
      if (includedTags && includedTags.length > 0) {
        includedTags.forEach((tag) => {
          searchParams.append("includedTags[]", tag);
        });
      }

      const response = await mangaDexClient.get(
        `/manga?${searchParams.toString()}`
      );

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
    limit: number = 999999,
    offset: number = 0
  ): Promise<MangaDetailResponse> {
    try {
      // Get manga info
      const manga = await this.getMangaById(id);

      // Get all chapters using auto-pagination
      const allChapters = await this.getAllChapters(id, ["en"]);

      // Apply manual pagination for response (if limit < total, apply pagination)
      const startIndex = offset;
      const endIndex =
        limit >= allChapters.length ? allChapters.length : offset + limit;
      const paginatedChapters = allChapters.slice(startIndex, endIndex);
      console.log(
        `Total chapters: ${allChapters.length}, Returned: ${paginatedChapters.length}, Limit: ${limit}, Offset: ${offset}`
      );

      return {
        manga,
        chapters: paginatedChapters,
        totalChapters: allChapters.length,
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

  // Fetch all chapters of a manga (auto-paginate)
  async getAllChapters(
    mangaId: string,
    language: string[] = ["en"]
  ): Promise<Chapter[]> {
    try {
      const limit = 100;
      let offset = 0;
      let total = 0;
      let allChapters: Chapter[] = [];

      do {
        const response = await mangaDexClient.get(`/manga/${mangaId}/feed`, {
          params: {
            limit,
            offset,
            "order[volume]": "desc",
            "order[chapter]": "desc",
            "translatedLanguage[]": language,
          },
        });

        const chapters: Chapter[] = response.data.data.map((chapter: any) => ({
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
        }));

        allChapters = allChapters.concat(chapters);
        total = response.data.total || 0;
        offset += limit;
        console.log(total, allChapters.length);

        // Thêm delay nhỏ để tránh rate limit
        if (allChapters.length < total) {
          await new Promise((resolve) => setTimeout(resolve, 200));
        }
      } while (allChapters.length < total);

      return allChapters;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          "Failed to fetch all chapters"
      );
    }
  },
};

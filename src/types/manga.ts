export interface MangaAttributes {
  title: {
    [key: string]: string;
  };
  altTitles: Array<{
    [key: string]: string;
  }>;
  description: {
    [key: string]: string;
  };
  isLocked: boolean;
  links: {
    [key: string]: string;
  };
  originalLanguage: string;
  lastVolume: string;
  lastChapter: string;
  publicationDemographic: string;
  status: string;
  year: number;
  contentRating: string;
  tags: Array<{
    id: string;
    type: string;
    attributes: {
      name: {
        [key: string]: string;
      };
      description: {
        [key: string]: string;
      };
      group: string;
      version: number;
    };
  }>;
  state: string;
  chapterNumbersResetOnNewVolume: boolean;
  createdAt: string;
  updatedAt: string;
  version: number;
  availableTranslatedLanguages: string[];
  latestUploadedChapter: string;
}

export interface MangaRelationship {
  id: string;
  type: string;
  attributes?: any;
}

export interface Manga {
  id: string;
  type: string;
  attributes: MangaAttributes;
  relationships: MangaRelationship[];
  coverUrl?: string;
  author?: string;
}

export interface MangaListResponse {
  data: Manga[];
  total: number;
}

export interface FetchMangaParams {
  limit?: number;
  offset?: number;
  order?: {
    latestUploadedChapter?: "asc" | "desc";
  };
  availableTranslatedLanguage?: string[];
  includes?: string[];
}

export interface ChapterAttributes {
  title: string;
  volume: string;
  chapter: string;
  pages: number;
  translatedLanguage: string;
  uploader: string;
  externalUrl: string | null;
  createdAt: string;
  updatedAt: string;
  publishAt: string;
  readableAt: string;
}

export interface Chapter {
  id: string;
  type: string;
  attributes: ChapterAttributes;
  relationships: MangaRelationship[];
}

export interface MangaDetailResponse {
  manga: Manga;
  chapters: Chapter[];
  totalChapters: number;
}

export interface ChapterImage {
  page: number;
  filename: string;
  url: string;
}

export interface ChapterImagesResponse {
  chapterId: string;
  hash: string;
  data: string[];
  dataSaver: string[];
  baseUrl: string;
  images: ChapterImage[];
}

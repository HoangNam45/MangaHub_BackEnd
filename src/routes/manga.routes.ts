import { Router } from "express";
import { mangaController } from "../controllers/manga.controller";

const router = Router();

// GET /api/manga - Lấy danh sách manga
router.get("/", mangaController.getMangaList);

// GET /api/manga/search - Tìm kiếm manga
router.get("/search", mangaController.searchManga);

// GET /api/manga/:id/detail - Lấy chi tiết manga với chapters
router.get("/:id/detail", mangaController.getMangaDetail);

// GET /api/manga/:id/all-chapters - Lấy toàn bộ chapters của manga
router.get("/:id/all-chapters", mangaController.getAllChapters);

// GET /api/manga/chapter/:id/images - Lấy ảnh của chapter
router.get("/chapter/:id/images", mangaController.getChapterImages);

// GET /api/manga/:id - Lấy chi tiết manga theo ID
router.get("/:id", mangaController.getMangaById);

export default router;

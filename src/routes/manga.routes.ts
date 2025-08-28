import { Router } from "express";
import { mangaController } from "../controllers/manga.controller";

const router = Router();

// GET /api/manga - Lấy danh sách manga
router.get("/", mangaController.getMangaList);

// GET /api/manga/search - Tìm kiếm manga
router.get("/search", mangaController.searchManga);

// GET /api/manga/:id - Lấy chi tiết manga theo ID
router.get("/:id", mangaController.getMangaById);

export default router;

import { Router } from "express";
import testRoutes from "./test.routes";
import authRoutes from "./auth.routes";
import mangaRoutes from "./manga.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/test", testRoutes);
router.use("/manga", mangaRoutes);

export default router;

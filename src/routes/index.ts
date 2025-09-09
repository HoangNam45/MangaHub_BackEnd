import { Router } from "express";
import testRoutes from "./test.routes";
import authRoutes from "./auth.routes";
import mangaRoutes from "./manga.routes";
import followRoutes from "./follow.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/test", testRoutes);
router.use("/manga", mangaRoutes);
router.use("/follow", followRoutes);

export default router;

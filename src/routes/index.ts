import { Router } from "express";
import testRoutes from "./test.routes";
import authRoutes from "./auth.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/test", testRoutes);

export default router;

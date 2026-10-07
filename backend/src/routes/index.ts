import { Router } from "express";
import adminRoutes from "./admin.routes";
import authRoutes from "./auth.routes";
import gameRoutes from "./game.routes";
import lessonRoutes from "./lesson.routes";
import progressRoutes from "./progress.routes";

const router = Router();

router.get("/health", (_req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

router.use("/auth", authRoutes);
router.use("/games", gameRoutes);
router.use("/lessons", lessonRoutes);
router.use("/progress", progressRoutes);
router.use("/admin", adminRoutes);

export default router;

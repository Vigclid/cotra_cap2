import { Router } from "express";
import adminRoutes from "./admin.routes";
import authRoutes from "./auth.routes";
import characterRoutes from "./character.routes";
import gameRoutes from "./game.routes";
import lessonRoutes from "./lesson.routes";
import progressRoutes from "./progress.routes";
import teacherRoutes from "./teacher.routes";

const router = Router();

router.get("/health", (_req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

router.use("/auth", authRoutes);
router.use("/games", gameRoutes);
router.use("/lessons", lessonRoutes);
router.use("/characters", characterRoutes);
router.use("/progress", progressRoutes);
router.use("/teacher", teacherRoutes);
router.use("/admin", adminRoutes);

export default router;

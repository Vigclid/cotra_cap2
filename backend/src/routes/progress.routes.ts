import { Router } from "express";
import { addExp, addWpmRecord, getDrafts, getMyProgress, saveDraft } from "../controllers/progress.controller";
import { checkRole, verifyToken } from "../middlewares/auth";

const router = Router();

// Tiến độ cá nhân: CHỈ học sinh. Giáo viên/admin xem tiến độ qua /api/admin/students.
router.use(verifyToken, checkRole("student"));

router.get("/me", getMyProgress);
router.get("/draft/:lessonId", getDrafts);
router.post("/draft", saveDraft);
router.post("/exp", addExp);
router.post("/wpm", addWpmRecord);

export default router;

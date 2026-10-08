import { Router } from "express";
import { evaluateStudent, getAnalytics } from "../controllers/teacher.controller";
import { checkRole, verifyToken } from "../middlewares/auth";

const router = Router();

// Trang phân tích lớp: chỉ giáo viên và admin.
router.use(verifyToken, checkRole("teacher", "admin"));

router.get("/analytics", getAnalytics);
router.post("/ai-evaluate/:studentId", evaluateStudent);

export default router;

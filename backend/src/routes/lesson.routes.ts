import { Router } from "express";
import { getLesson, listLessons } from "../controllers/lesson.controller";
import { checkRole, verifyToken } from "../middlewares/auth";

const router = Router();

// Nội dung bài học là chỉ-đọc: học sinh học, giáo viên/admin xem trước nên cả 3 role đều được phép.
router.use(verifyToken, checkRole("student", "teacher", "admin"));

router.get("/", listLessons);
router.get("/:id", getLesson);

export default router;

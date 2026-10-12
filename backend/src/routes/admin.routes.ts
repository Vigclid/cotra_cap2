import { Router } from "express";
import {
  createLesson,
  deleteLesson,
  listLessonsAdmin,
  listStudents,
  updateLesson,
  updateStudent,
} from "../controllers/admin.controller";
import { checkRole, verifyToken } from "../middlewares/auth";
import adminGameRoutes from "./adminGames.routes";

const router = Router();

// Toàn bộ nhóm /api/admin: phải đăng nhập (verifyToken) VÀ là giáo viên hoặc admin (checkRole).
router.use(verifyToken, checkRole("teacher", "admin"));

router.get("/lessons", listLessonsAdmin);
router.post("/lessons", createLesson);
router.put("/lessons/:id", updateLesson);
router.delete("/lessons/:id", deleteLesson);

router.get("/students", listStudents);
router.put("/students/:id", updateStudent);
router.use("/games", adminGameRoutes);

export default router;

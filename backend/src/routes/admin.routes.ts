import { Router } from "express";
import {
  createLesson,
  deleteLesson,
  listLessonsAdmin,
  listStudents,
  updateLesson,
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
router.use("/games", adminGameRoutes);

export default router;

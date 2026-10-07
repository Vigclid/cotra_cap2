import { Router } from "express";
import { login, me, register } from "../controllers/auth.controller";
import { verifyToken } from "../middlewares/auth";

const router = Router();

router.post("/register", register); // Công khai – giáo viên phải kèm đúng mã
router.post("/login", login); // Công khai
router.get("/me", verifyToken, me); // Mọi role đã đăng nhập

export default router;

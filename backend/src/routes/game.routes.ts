import { Router } from "express";
import { quiz, spelling, typing } from "../controllers/game.controller";
import { verifyToken } from "../middlewares/auth";

const router = Router();

// Học sinh (và mọi tài khoản đã đăng nhập) chỉ được đọc đề để chơi.
router.use(verifyToken);

router.get("/spelling", spelling.list);
router.get("/typing", typing.list);
router.get("/quiz", quiz.list);

export default router;

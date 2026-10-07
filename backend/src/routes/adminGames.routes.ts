import { Router } from "express";
import { quiz, spelling, typing } from "../controllers/game.controller";

/**
 * Gắn dưới /api/admin (đã có verifyToken + checkRole("teacher", "admin")).
 * Học sinh gọi các route này nhận 403.
 */
const router = Router();

router.get("/spelling", spelling.list);
router.post("/spelling", spelling.create);
router.put("/spelling/:id", spelling.update);
router.delete("/spelling/:id", spelling.remove);

router.get("/typing", typing.list);
router.post("/typing", typing.create);
router.put("/typing/:id", typing.update);
router.delete("/typing/:id", typing.remove);

router.get("/quiz", quiz.list);
router.post("/quiz", quiz.create);
router.put("/quiz/:id", quiz.update);
router.delete("/quiz/:id", quiz.remove);

export default router;

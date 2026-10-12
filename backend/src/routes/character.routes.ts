import { Router } from "express";
import { listCharacters } from "../controllers/character.controller";
import { checkRole, verifyToken } from "../middlewares/auth";

const router = Router();

router.use(verifyToken, checkRole("student", "teacher", "admin"));
router.get("/", listCharacters);

export default router;

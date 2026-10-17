import { Router } from "express";
import { getCharacterBySlug, listCharacters } from "../controllers/character.controller";
import { checkRole, verifyToken } from "../middlewares/auth";

const router = Router();

router.use(verifyToken, checkRole("student", "teacher", "admin"));
router.get("/", listCharacters);
router.get("/:slug", getCharacterBySlug);

export default router;

import type { RequestHandler } from "express";
import { Character, type ICharacter } from "../models/Character";
import { HttpError } from "../utils/HttpError";

/** Dấu vết trích dẫn sót lại khi nhập liệu, ví dụ `[cite: 28, 34]`. */
const CITE_MARK = /\s*\[cite:[^\]]*\]/gi;

const cleanText = (value: string) => value.replace(CITE_MARK, "").replace(/[ \t]{2,}/g, " ").trim();

type PublicCharacter = Pick<
  ICharacter,
  "slug" | "name" | "work" | "author" | "grade" | "lesson" | "emoji" | "gradient" | "tagline" | "sampleQuestions"
>;

function toPublicCharacter(character: PublicCharacter) {
  return {
    id: character.slug,
    name: character.name,
    work: character.work,
    author: character.author,
    grade: character.grade,
    lesson: character.lesson,
    emoji: character.emoji,
    gradient: character.gradient,
    tagline: cleanText(character.tagline),
    sampleQuestions: (character.sampleQuestions ?? []).map(cleanText).filter(Boolean),
  };
}

/**
 * GET /api/characters – toàn bộ nhân vật, mảng phẳng đã sắp theo khối rồi theo bài.
 * Frontend tự nhóm thành "Nhân vật Lớp 6", "Nhân vật Lớp 7", ...
 */
export const listCharacters: RequestHandler = async (_req, res) => {
  const characters = await Character.find().sort({ grade: 1, lesson: 1, name: 1 }).select("-__v").lean();
  res.json({ characters: characters.map(toPublicCharacter) });
};

/** GET /api/characters/:slug – một nhân vật theo slug (khớp `characterId` mà frontend gửi lên AI). */
export const getCharacterBySlug: RequestHandler = async (req, res) => {
  const raw = Array.isArray(req.params.slug) ? req.params.slug[0] : req.params.slug;
  const slug = typeof raw === "string" ? raw.trim() : "";
  if (!slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    throw new HttpError(400, "Mã nhân vật không hợp lệ");
  }

  const character = await Character.findOne({ slug }).select("-__v").lean();
  if (!character) throw new HttpError(404, "Không tìm thấy nhân vật này!");
  res.json({ character: toPublicCharacter(character) });
};

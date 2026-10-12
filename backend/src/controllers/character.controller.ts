import type { RequestHandler } from "express";
import { Character } from "../models/Character";

/**
 * GET /api/characters – toàn bộ nhân vật, mảng phẳng đã sắp theo khối rồi theo bài.
 * Frontend tự nhóm thành "Nhân vật Lớp 6", "Nhân vật Lớp 7", ...
 * Không trả persona: câu chuyện và hội thoại vẫn tra theo `id` ở server AI.
 */
export const listCharacters: RequestHandler = async (_req, res) => {
  const characters = await Character.find().sort({ grade: 1, lesson: 1, name: 1 }).select("-__v").lean();
  res.json({
    characters: characters.map((character) => ({
      id: character.slug,
      name: character.name,
      work: character.work,
      author: character.author,
      grade: character.grade,
      lesson: character.lesson,
      emoji: character.emoji,
      gradient: character.gradient,
      tagline: character.tagline,
      sampleQuestions: character.sampleQuestions,
    })),
  });
};

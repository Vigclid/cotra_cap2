import { NextResponse } from "next/server";
import { callGemini, countWords, hasApiKey, sleep, type Turn } from "@/lib/ai";
import { getCharacter } from "@/lib/characters";
import { mockChat, mockLessonHint, mockOutline, mockRewrite, mockStory } from "@/lib/mocks";
import {
  LESSON_HINT_SYSTEM_PROMPT,
  OUTLINE_SYSTEM_PROMPT,
  REWRITE_SYSTEM_PROMPT,
  characterChatPrompt,
  characterStoryPrompt,
} from "@/lib/prompts";
import {
  MAX_CHAT_CHARS,
  MAX_CHAT_TURNS,
  MAX_DRAFT_CHARS,
  MAX_PARAGRAPH_WORDS,
  MAX_TOPIC_CHARS,
  type ChatMessage,
  type RewriteResult,
} from "@/lib/types";
import { API_URL, normalizeLessonDetail } from "@/utils/apiClient";

/**
 * Endpoint dùng chung: POST /api/ai
 * Body: { actionType: "outline" | "rewrite" | "character_story" | "character_chat" | "lesson_hint", payload: {...} }
 */
export async function POST(req: Request) {
  // proxy.ts đã chặn theo Content-Length; kiểm tra lại ở đây cho trường hợp body gửi dạng chunked.
  const raw = await req.text().catch(() => "");
  if (raw.length > MAX_BODY_CHARS) {
    return NextResponse.json({ error: "Nội dung gửi lên quá dài, em rút gọn lại nhé!" }, { status: 413 });
  }
  const body = safeJson(raw);
  const actionType = body?.actionType;
  const payload = body?.payload ?? {};
  const demo = !hasApiKey();

  try {
    switch (actionType) {
      /* ---------------- Máy tạo Dàn Ý ---------------- */
      case "outline": {
        const topic = str(payload.topic).trim();
        if (topic.length < 5) return bad("Em nhập đề bài dài hơn một chút nhé!");
        if (topic.length > MAX_TOPIC_CHARS) return bad(`Đề bài hơi dài, em rút gọn dưới ${MAX_TOPIC_CHARS} kí tự nhé!`);

        if (demo) return ok({ outline: mockOutline(topic) }, 900);
        const outline = await callGemini({
          systemPrompt: OUTLINE_SYSTEM_PROMPT,
          turns: [{ role: "user", text: `Đề bài: "${topic}"` }],
        });
        return ok({ outline });
      }

      /* ---------------- Trợ lý Gỡ Bí ---------------- */
      case "rewrite": {
        const paragraph = str(payload.paragraph).trim();
        const words = countWords(paragraph);
        if (words < 10) return bad("Đoạn văn hơi ngắn, em viết ít nhất 10 chữ để cô góp ý nhé!");
        if (words > MAX_PARAGRAPH_WORDS) return bad(`Đoạn văn dài ${words} chữ, em rút gọn dưới ${MAX_PARAGRAPH_WORDS} chữ nhé!`);

        if (demo) return ok({ result: mockRewrite(paragraph) }, 1100);
        const raw = await callGemini({
          systemPrompt: REWRITE_SYSTEM_PROMPT,
          turns: [{ role: "user", text: `Đoạn văn của em:\n"""\n${paragraph}\n"""` }],
          json: true,
        });
        return ok({ result: normalizeRewrite(JSON.parse(stripCodeFence(raw))) });
      }

      /* ---------------- Chuyện chưa kể ---------------- */
      case "character_story": {
        const character = getCharacter(str(payload.characterId));
        if (!character) return bad("Không tìm thấy nhân vật này!");

        if (demo) return ok({ story: mockStory(character) }, 1200);
        const story = await callGemini({
          systemPrompt: characterStoryPrompt(character),
          turns: [{ role: "user", text: `Kể cho em nghe một chuyện chưa kể về ${character.name} nhé!` }],
          temperature: 1,
        });
        return ok({ story });
      }

      /* ---------------- Hỏi đáp nhập vai ---------------- */
      case "character_chat": {
        const character = getCharacter(str(payload.characterId));
        if (!character) return bad("Không tìm thấy nhân vật này!");

        const messages: ChatMessage[] = Array.isArray(payload.messages) ? payload.messages : [];
        const turns: Turn[] = messages
          .slice(-MAX_CHAT_TURNS)
          .filter((m) => m && (m.role === "user" || m.role === "character") && typeof m.text === "string")
          .map((m) => ({ role: m.role === "user" ? "user" : "model", text: m.text.slice(0, MAX_CHAT_CHARS * 3) }));

        // Gemini yêu cầu hội thoại bắt đầu bằng "user" và kết thúc bằng "user".
        while (turns.length && turns[0].role !== "user") turns.shift();
        const last = turns.at(-1);
        if (!last || last.role !== "user" || !last.text.trim()) return bad("Em hãy nhập câu hỏi nhé!");
        if (last.text.length > MAX_CHAT_CHARS) return bad(`Câu hỏi dài quá, em viết dưới ${MAX_CHAT_CHARS} kí tự nhé!`);

        if (demo) return ok({ reply: mockChat(character, last.text) }, 800);
        const reply = await callGemini({
          systemPrompt: characterChatPrompt(character),
          turns,
          temperature: 0.9,
        });
        return ok({ reply });
      }

      /* ---------------- Cô giáo AI gợi ý câu hỏi đọc hiểu ---------------- */
      case "lesson_hint": {
        const lookup = await fetchLessonQuestion(
          req.headers.get("authorization"),
          Number(payload.lessonId),
          Number(payload.textIndex),
          Number(payload.questionIndex),
        );
        if (lookup === "unauthorized") {
          return NextResponse.json({ error: "Phiên đăng nhập đã hết hạn, em đăng nhập lại nhé!" }, { status: 401 });
        }
        if (!lookup) return bad("Không tìm thấy câu hỏi này!");
        const found = lookup;
        const draft = str(payload.draft).trim();
        if (draft.length > MAX_DRAFT_CHARS) return bad(`Vở nháp dài quá, em rút gọn còn tối đa ${MAX_DRAFT_CHARS} kí tự nhé!`);

        if (demo) return ok({ hint: mockLessonHint(found.text.name, draft) }, 900);
        const hint = await callGemini({
          systemPrompt: LESSON_HINT_SYSTEM_PROMPT,
          turns: [
            {
              role: "user",
              text: [
                `Bài học: ${found.lesson.title} (${found.lesson.theme})`,
                `Văn bản: ${found.text.name}`,
                `Câu hỏi: ${found.question}`,
                draft ? `Vở nháp của em:\n"""\n${draft}\n"""` : "Vở nháp của em: (em chưa viết gì)",
              ].join("\n"),
            },
          ],
        });
        return ok({ hint });
      }

      default:
        return bad("actionType không hợp lệ.");
    }
  } catch (err) {
    console.error(`[api/ai] ${actionType}:`, err);
    return NextResponse.json(
      { error: "Cô Cú đang hơi bận, em thử lại sau ít phút nhé!" },
      { status: 502 },
    );
  }

  async function ok(data: object, demoDelay = 0) {
    if (demo && demoDelay) await sleep(demoDelay);
    return NextResponse.json({ ...data, demo });
  }
}

const MAX_BODY_CHARS = 16 * 1024;

const str = (v: unknown) => (typeof v === "string" ? v : "");

/**
 * Câu hỏi luôn được tra từ Backend theo chỉ số (client không gửi nội dung câu hỏi lên),
 * dùng chính JWT của học sinh nên quyền đọc bài học được backend kiểm tra.
 */
async function fetchLessonQuestion(
  authorization: string | null,
  lessonId: number,
  textIndex: number,
  questionIndex: number,
) {
  if (!authorization) return "unauthorized" as const;
  if (![lessonId, textIndex, questionIndex].every(Number.isInteger)) return null;

  const res = await fetch(`${API_URL}/api/lessons/${lessonId}`, {
    headers: { Authorization: authorization },
    cache: "no-store",
  });
  if (res.status === 401) return "unauthorized" as const;
  if (!res.ok) return null;

  const lesson = normalizeLessonDetail((await res.json().catch(() => null))?.lesson);
  const text = lesson.texts[textIndex];
  const question = text?.questions[questionIndex];
  return text && question ? { lesson, text, question } : null;
}

function safeJson(raw: string) {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

const bad = (error: string) => NextResponse.json({ error }, { status: 400 });

function stripCodeFence(s: string) {
  return s.replace(/^\s*```(?:json)?/i, "").replace(/```\s*$/, "").trim();
}

/** Đảm bảo dữ liệu AI trả về luôn đúng shape mà frontend cần. */
function normalizeRewrite(data: Partial<RewriteResult>): RewriteResult {
  return {
    issues: Array.isArray(data.issues)
      ? data.issues.slice(0, 5).map((i) => ({
          type: str(i?.type) || "Diễn đạt",
          quote: str(i?.quote),
          explanation: str(i?.explanation),
          suggestion: str(i?.suggestion),
        }))
      : [],
    versions: Array.isArray(data.versions)
      ? data.versions
          .slice(0, 3)
          .map((v, idx) => ({
            title: str(v?.title) || `Cách viết ${idx + 1}`,
            text: str(v?.text),
            highlight: str(v?.highlight),
          }))
          .filter((v) => v.text)
      : [],
    encouragement: str(data.encouragement),
  };
}

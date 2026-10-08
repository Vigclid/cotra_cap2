import { env } from "../config/env";

export type AiSource = "gemini" | "openai";

const AI_TIMEOUT_MS = 25_000;

/**
 * Gọi model đang được cấu hình và yêu cầu JSON.
 * Trả về null khi server chưa có GEMINI_API_KEY lẫn OPENAI_API_KEY.
 * Gemini được ưu tiên vì đúng với phần AI còn lại của Trạm Sạc.
 */
export async function generateJson(
  systemPrompt: string,
  userPrompt: string,
): Promise<{ raw: string; source: AiSource } | null> {
  if (env.geminiApiKey) {
    return { raw: await callGemini(systemPrompt, userPrompt), source: "gemini" };
  }
  if (env.openaiApiKey) {
    return { raw: await callOpenAi(systemPrompt, userPrompt), source: "openai" };
  }
  return null;
}

async function callGemini(systemPrompt: string, userPrompt: string): Promise<string> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${env.geminiModel}:generateContent`,
    {
      method: "POST",
      signal: AbortSignal.timeout(AI_TIMEOUT_MS),
      headers: { "Content-Type": "application/json", "x-goog-api-key": env.geminiApiKey },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents: [{ role: "user", parts: [{ text: userPrompt }] }],
        generationConfig: { temperature: 0.4, responseMimeType: "application/json" },
      }),
    },
  );

  if (!res.ok) {
    throw new Error(`Gemini HTTP ${res.status}: ${await safeBody(res)}`);
  }

  const data = (await res.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };
  const text = data.candidates?.[0]?.content?.parts?.map((part) => part.text ?? "").join("").trim();
  if (!text) throw new Error("Gemini không trả về nội dung");
  return text;
}

async function callOpenAi(systemPrompt: string, userPrompt: string): Promise<string> {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    signal: AbortSignal.timeout(AI_TIMEOUT_MS),
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.openaiApiKey}`,
    },
    body: JSON.stringify({
      model: env.openaiModel,
      temperature: 0.4,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    }),
  });

  if (!res.ok) {
    throw new Error(`OpenAI HTTP ${res.status}: ${await safeBody(res)}`);
  }

  const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  const text = data.choices?.[0]?.message?.content?.trim();
  if (!text) throw new Error("OpenAI không trả về nội dung");
  return text;
}

async function safeBody(res: Response): Promise<string> {
  const text = await res.text().catch(() => "");
  return text.replace(/key=[^&\s]+/gi, "key=***").slice(0, 400);
}

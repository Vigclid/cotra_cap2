/**
 * Helper gọi AI ở phía server.
 * Mặc định dùng Google Gemini qua REST API (không cần cài SDK).
 * Chưa có GEMINI_API_KEY trong .env.local → /api/ai trả về dữ liệu giả lập (demo mode).
 */

export const hasApiKey = () => Boolean(process.env.GEMINI_API_KEY);

export type Turn = { role: "user" | "model"; text: string };

type CallOptions = {
  systemPrompt: string;
  /** Hội thoại nhiều lượt; lượt cuối phải là "user". */
  turns: Turn[];
  json?: boolean;
  temperature?: number;
};

export async function callGemini({ systemPrompt, turns, json, temperature = 0.7 }: CallOptions): Promise<string> {
  // 🔑 Chèn API key vào file .env.local: GEMINI_API_KEY=xxxx
  const apiKey = process.env.GEMINI_API_KEY!;
  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents: turns.map((t) => ({ role: t.role, parts: [{ text: t.text }] })),
        generationConfig: {
          temperature,
          ...(json && { responseMimeType: "application/json" }),
        },
      }),
    },
  );

  if (!res.ok) {
    throw new Error(`Gemini API lỗi ${res.status}: ${await res.text()}`);
  }

  const data = await res.json();
  const text: string | undefined = data?.candidates?.[0]?.content?.parts
    ?.map((p: { text?: string }) => p.text ?? "")
    .join("");
  if (!text) throw new Error("Gemini không trả về nội dung");
  return text;

  /* ---- Muốn dùng OpenAI thay thế? Thay khối trên bằng:
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      temperature,
      messages: [
        { role: "system", content: systemPrompt },
        ...turns.map((t) => ({ role: t.role === "model" ? "assistant" : "user", content: t.text })),
      ],
      ...(json && { response_format: { type: "json_object" } }),
    }),
  });
  const data = await res.json();
  return data.choices[0].message.content;
  ---- */
}

export const countWords = (text: string) => text.trim().split(/\s+/).filter(Boolean).length;

export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

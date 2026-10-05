"use client";

import { useState, type FormEvent } from "react";
import { BookOpen, Sparkles, Zap } from "lucide-react";
import { callAI, errorMessage } from "@/lib/api-client";
import { MAX_TOPIC_CHARS } from "@/lib/types";
import { MascotLoading } from "./Mascot";
import { BouncyButton, Card, CopyButton, DemoBadge, ErrorBox, Markdown } from "./ui";

const QUICK_PROMPTS = [
  "Tả quang cảnh trường em giờ ra chơi",
  "Phân tích nhân vật Lão Hạc",
  "Kể lại một trải nghiệm đáng nhớ của em",
  "Cảm nghĩ về người mẹ của em",
  "Thuyết minh về chiếc áo dài Việt Nam",
  "Suy nghĩ về tác hại của nghiện điện thoại",
  "Phân tích bài thơ Đồng chí",
  "Tả một cơn mưa rào mùa hạ",
];

export function OutlineTool({
  topic,
  setTopic,
  outline,
  setOutline,
  onSuccess,
}: {
  topic: string;
  setTopic: (v: string) => void;
  outline: string | null;
  setOutline: (v: string | null) => void;
  onSuccess: (input: string, outline: string) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [demo, setDemo] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const input = topic.trim();
    if (input.length < 5 || loading) return;
    setLoading(true);
    setError(null);
    setOutline(null);
    try {
      const data = await callAI({ actionType: "outline", payload: { topic: input } });
      setOutline(data.outline);
      setDemo(Boolean(data.demo));
      onSuccess(input, data.outline);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <form onSubmit={submit} className="space-y-4">
          <label htmlFor="topic" className="flex items-center gap-2 text-lg font-extrabold">
            <BookOpen className="h-5 w-5 text-sky-500" /> Đề bài của em là gì nhỉ?
          </label>
          <input
            id="topic"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            maxLength={MAX_TOPIC_CHARS}
            placeholder='VD: "Tả quang cảnh trường em giờ ra chơi"'
            className="w-full rounded-2xl border-2 border-sky-200/60 bg-sky-pastel/50 px-5 py-4 text-lg font-semibold outline-none transition placeholder:font-normal placeholder:text-ink/40 focus:border-sky-300 focus:bg-surface"
          />

          <div>
            <p className="mb-2 flex items-center gap-1 text-xs font-extrabold uppercase tracking-wider text-ink/50">
              <Zap className="h-3.5 w-3.5 text-amber-400" /> Quick Prompts – bấm để điền nhanh
            </p>
            <div className="flex flex-wrap gap-2">
              {QUICK_PROMPTS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setTopic(p)}
                  className={`rounded-full border-2 px-3.5 py-1.5 text-sm font-bold transition duration-300 ease-bounce hover:-translate-y-0.5 hover:scale-105 active:scale-95 ${
                    topic === p
                      ? "border-sky-300 bg-sky-pastel"
                      : "border-transparent bg-lemon-pastel/80 text-ink/75 hover:bg-lemon-pastel"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <BouncyButton
            loading={loading}
            disabled={topic.trim().length < 5}
            className="bg-sky-400 hover:bg-sky-500"
            icon={<Sparkles className="h-5 w-5" />}
            loadingText="Cô đang suy nghĩ..."
          >
            Lập dàn ý ngay
          </BouncyButton>
        </form>
      </Card>

      {error && <ErrorBox message={error} />}
      {loading && (
        <MascotLoading
          messages={[
            "Tớ đang đọc kĩ đề bài nè... 🔍",
            "Xác định kiểu bài trước đã! 🎯",
            "Đang sắp xếp mở bài – thân bài – kết bài 🧩",
            "Thêm vài bí kíp ghi điểm cho cậu 💡",
          ]}
        />
      )}

      {outline && !loading && (
        <Card className="animate-pop-in">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <h2 className="flex items-center gap-2 text-xl font-extrabold">
              📝 Dàn ý của em đây! {demo && <DemoBadge />}
            </h2>
            <CopyButton text={outline} />
          </div>
          <Markdown>{outline}</Markdown>
        </Card>
      )}
    </div>
  );
}

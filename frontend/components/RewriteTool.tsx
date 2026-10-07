"use client";

import { useState, type FormEvent } from "react";
import { Heart, Lightbulb, PenLine, TriangleAlert, WandSparkles } from "lucide-react";
import { callAI, errorMessage } from "@/lib/api-client";
import { MAX_PARAGRAPH_WORDS, type RewriteResult, type RewriteVersion } from "@/lib/types";
import { MascotLoading } from "./Mascot";
import { BouncyButton, Card, CopyButton, ErrorBox } from "./ui";

const countWords = (text: string) => text.trim().split(/\s+/).filter(Boolean).length;

const SAMPLE =
  "Giờ ra chơi trường em rất vui. Các bạn chơi rất vui. Bạn thì chơi nhảy dây, bạn thì chơi đá cầu, bạn thì chơi trốn tìm. Em thấy rất vui khi được chơi với các bạn.";

const VERSION_STYLES = [
  { card: "border-emerald-200 bg-mint-pastel dark:border-emerald-800", badge: "bg-emerald-300 text-emerald-900" },
  { card: "border-sky-200 bg-sky-pastel dark:border-sky-800", badge: "bg-sky-300 text-sky-900" },
  { card: "border-pink-200 bg-pink-pastel dark:border-pink-800", badge: "bg-pink-300 text-pink-900" },
];

export function RewriteTool({
  paragraph,
  setParagraph,
  result,
  setResult,
  onSuccess,
}: {
  paragraph: string;
  setParagraph: (v: string) => void;
  result: RewriteResult | null;
  setResult: (v: RewriteResult | null) => void;
  onSuccess: (input: string, result: RewriteResult) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const words = countWords(paragraph);
  const tooLong = words > MAX_PARAGRAPH_WORDS;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const input = paragraph.trim();
    if (words < 10 || tooLong || loading) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await callAI({ actionType: "rewrite", payload: { paragraph: input } });
      setResult(data.result);
      onSuccess(input, data.result);
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
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label htmlFor="paragraph" className="flex items-center gap-2 text-lg font-extrabold">
              <PenLine className="h-5 w-5 text-pink-500" /> Dán đoạn văn em đang bí vào đây nhé
            </label>
            <button
              type="button"
              onClick={() => setParagraph(SAMPLE)}
              className="rounded-full bg-lemon-pastel px-3 py-1 text-xs font-bold text-ink/70 transition duration-300 ease-bounce hover:-translate-y-0.5"
            >
              🎲 Dùng đoạn văn mẫu
            </button>
          </div>
          <textarea
            id="paragraph"
            value={paragraph}
            onChange={(e) => setParagraph(e.target.value)}
            rows={7}
            placeholder="VD: Giờ ra chơi trường em rất vui. Các bạn chơi rất vui..."
            className="w-full resize-y rounded-2xl border-2 border-pink-200/60 bg-pink-pastel/50 px-5 py-4 text-base leading-relaxed outline-none transition placeholder:text-ink/40 focus:border-pink-300 focus:bg-surface"
          />
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span
              className={`rounded-full px-3 py-1 text-sm font-bold ${
                tooLong ? "bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-300" : "bg-cream text-ink/60"
              }`}
            >
              {words}/{MAX_PARAGRAPH_WORDS} chữ {tooLong && "– dài quá rồi!"}
            </span>
            <BouncyButton
              loading={loading}
              disabled={words < 10 || tooLong}
              className="bg-pink-400 hover:bg-pink-500"
              icon={<WandSparkles className="h-5 w-5" />}
              loadingText="Cô đang đọc bài..."
            >
              Giúp mình viết hay hơn
            </BouncyButton>
          </div>
        </form>
      </Card>

      {error && <ErrorBox message={error} />}
      {loading && (
        <MascotLoading
          messages={[
            "Tớ đang soi từng câu một nè 🔎",
            "Ồ, hình như có từ bị lặp... 🤭",
            "Đang tìm từ láy thật xinh cho cậu 🌸",
            "Sắp có 3 cách viết mới toanh! ✨",
          ]}
        />
      )}

      {result && !loading && (
        <div className="space-y-6">
          {result.encouragement && (
            <Card className="flex animate-pop-in items-start gap-3 !bg-lemon-pastel">
              <Heart className="mt-0.5 h-6 w-6 shrink-0 fill-pink-300 text-pink-400" />
              <p className="font-semibold leading-relaxed">{result.encouragement}</p>
            </Card>
          )}

          <div>
            <h2 className="mb-3 flex items-center gap-2 text-xl font-extrabold">
              <TriangleAlert className="h-5 w-5 text-orange-500" /> Lỗi cần sửa
            </h2>
            {result.issues.length === 0 ? (
              <Card className="!bg-mint-pastel font-semibold">🎉 Cô không thấy lỗi nào đáng kể. Giỏi lắm!</Card>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {result.issues.map((issue, i) => (
                  <div
                    key={i}
                    style={{ animationDelay: `${i * 80}ms` }}
                    className="animate-pop-in rounded-2xl border-2 border-orange-200 bg-peach-pastel p-4 shadow-soft dark:border-orange-900"
                  >
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-orange-200 px-3 py-0.5 text-xs font-extrabold uppercase text-orange-800">
                        {issue.type}
                      </span>
                      {issue.quote && (
                        <span className="rounded-lg bg-red-100 px-2 py-0.5 text-sm font-semibold text-red-700 line-through decoration-red-400/60 dark:bg-red-950 dark:text-red-300">
                          “{issue.quote}”
                        </span>
                      )}
                    </div>
                    <p className="text-sm leading-relaxed text-ink/80">{issue.explanation}</p>
                    {issue.suggestion && (
                      <p className="mt-2 flex items-start gap-1.5 text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                        <Lightbulb className="mt-0.5 h-4 w-4 shrink-0" /> {issue.suggestion}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {result.versions.length > 0 && (
            <div>
              <h2 className="mb-3 text-xl font-extrabold">✨ Gợi ý viết lại</h2>
              <div className={`grid gap-4 ${result.versions.length >= 3 ? "lg:grid-cols-3" : "md:grid-cols-2"}`}>
                {result.versions.map((v, i) => (
                  <VersionCard key={i} index={i} version={v} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function VersionCard({ index, version }: { index: number; version: RewriteVersion }) {
  const style = VERSION_STYLES[index % VERSION_STYLES.length];
  return (
    <div
      style={{ animationDelay: `${index * 100}ms` }}
      className={`flex animate-pop-in flex-col rounded-2xl border-2 p-5 shadow-soft transition duration-300 ease-bounce hover:-translate-y-1 hover:shadow-pop ${style.card}`}
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <span className={`rounded-full px-3 py-1 text-sm font-extrabold ${style.badge}`}>Cách viết {index + 1}</span>
        <CopyButton text={version.text} />
      </div>
      <h3 className="mb-2 font-extrabold">{version.title}</h3>
      <p className="flex-1 whitespace-pre-line leading-relaxed">{version.text}</p>
      {version.highlight && (
        <p className="mt-4 rounded-xl bg-surface/70 px-3 py-2 text-sm font-semibold text-ink/70">💡 {version.highlight}</p>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { CharacterExplorer } from "@/components/CharacterExplorer";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { HistoryPanel } from "@/components/HistoryPanel";
import { OutlineTool } from "@/components/OutlineTool";
import { RewriteTool } from "@/components/RewriteTool";
import { useGamification } from "@/hooks/useGamification";
import { useHistory } from "@/hooks/useHistory";
import { useTheme } from "@/hooks/useTheme";
import type { HistoryItem, RewriteResult } from "@/lib/types";

type Tab = "outline" | "rewrite" | "characters";

const TABS: { id: Tab; emoji: string; title: string; subtitle: string; active: string }[] = [
  {
    id: "outline",
    emoji: "✨",
    title: "Máy tạo Dàn Ý",
    subtitle: "Nhập đề – có ngay dàn ý",
    active: "bg-sky-pastel ring-sky-300 dark:ring-sky-700",
  },
  {
    id: "rewrite",
    emoji: "🧚‍♀️",
    title: "Trợ lý Gỡ Bí",
    subtitle: "Sửa lỗi, gợi ý viết hay",
    active: "bg-pink-pastel ring-pink-300 dark:ring-pink-700",
  },
  {
    id: "characters",
    emoji: "🎭",
    title: "Nhân vật",
    subtitle: "Nghe chuyện & phỏng vấn",
    active: "bg-mint-pastel ring-emerald-300 dark:ring-emerald-700",
  },
];

export default function Home() {
  const [tab, setTab] = useState<Tab>("outline");
  const history = useHistory();
  const game = useGamification();
  const { theme, toggle } = useTheme();

  // State từng tính năng giữ ở trang để không mất khi đổi tab.
  const [topic, setTopic] = useState("");
  const [outline, setOutline] = useState<string | null>(null);
  const [paragraph, setParagraph] = useState("");
  const [rewrite, setRewrite] = useState<RewriteResult | null>(null);

  const openHistory = (item: HistoryItem) => {
    if (item.kind === "outline") {
      setTab("outline");
      setTopic(item.input);
      setOutline(item.result);
    } else {
      setTab("rewrite");
      setParagraph(item.input);
      setRewrite(item.result);
    }
    document.getElementById("workspace")?.scrollIntoView({ behavior: "smooth" });
  };

  const missions = Math.floor(game.exp / 10);

  return (
    <>
      <Background />
      <Header game={game} theme={theme} onToggleTheme={toggle} />

      <main className="mx-auto max-w-6xl space-y-8 px-4 pt-6 sm:px-6">
        <Hero
          streakText={
            missions === 0
              ? "Hoàn thành nhiệm vụ đầu tiên để nhận +10 EXP nhé! 🎁"
              : `Em đã hoàn thành ${missions} nhiệm vụ – đang là ${game.level.emoji} ${game.level.name}. Tiếp tục nào!`
          }
        />

        <nav id="workspace" className="grid scroll-mt-28 grid-cols-1 gap-3 sm:grid-cols-3" role="tablist">
          {TABS.map((t) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-3 rounded-2xl p-4 text-left shadow-soft transition duration-300 ease-bounce hover:-translate-y-1.5 hover:shadow-pop active:scale-95 ${
                tab === t.id ? `${t.active} -translate-y-1 ring-4` : "bg-surface/80"
              }`}
            >
              <span
                className={`text-4xl transition duration-300 ease-bounce ${tab === t.id ? "rotate-6 scale-110" : ""}`}
                aria-hidden
              >
                {t.emoji}
              </span>
              <span>
                <span className="block text-lg font-extrabold">{t.title}</span>
                <span className="block text-sm font-semibold text-ink/60">{t.subtitle}</span>
              </span>
            </button>
          ))}
        </nav>

        <div className={`grid gap-6 ${tab === "characters" ? "" : "lg:grid-cols-[1fr_300px]"}`}>
          <section role="tabpanel">
            {tab === "outline" && (
              <OutlineTool
                topic={topic}
                setTopic={setTopic}
                outline={outline}
                setOutline={setOutline}
                onSuccess={(input, result) => {
                  history.add({ kind: "outline", input, result });
                  game.addExp();
                }}
              />
            )}
            {tab === "rewrite" && (
              <RewriteTool
                paragraph={paragraph}
                setParagraph={setParagraph}
                result={rewrite}
                setResult={setRewrite}
                onSuccess={(input, result) => {
                  history.add({ kind: "rewrite", input, result });
                  game.addExp();
                }}
              />
            )}
            {tab === "characters" && <CharacterExplorer onSuccess={() => game.addExp()} />}
          </section>

          {tab !== "characters" && (
            <HistoryPanel
              items={history.items}
              onOpen={openHistory}
              onRemove={history.remove}
              onClear={history.clear}
            />
          )}
        </div>
      </main>

      <Footer />

      {game.levelUp && <LevelUpToast level={game.levelUp} onClose={game.dismissLevelUp} />}
    </>
  );
}

function LevelUpToast({
  level,
  onClose,
}: {
  level: ReturnType<typeof useGamification>["level"];
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-x-4 bottom-6 z-[60] mx-auto max-w-sm animate-pop-in" role="alert">
      <div className="flex items-center gap-4 rounded-2xl border-4 border-amber-200 bg-surface p-4 shadow-pop">
        <span className="animate-bounce text-5xl" aria-hidden>
          {level.emoji}
        </span>
        <div className="flex-1">
          <p className="text-xs font-extrabold uppercase tracking-widest text-amber-500">Lên cấp rồi! 🎉</p>
          <p className="text-lg font-black">
            Cấp {level.index + 1}: {level.name}
          </p>
        </div>
        <button
          onClick={onClose}
          className="rounded-full bg-amber-200 px-3 py-1.5 text-sm font-extrabold text-amber-900 transition duration-300 ease-bounce hover:scale-110"
        >
          Yay!
        </button>
      </div>
    </div>
  );
}

function Background() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden>
      <div className="absolute -left-24 -top-24 h-80 w-80 rounded-full bg-pink-pastel blur-3xl" />
      <div className="absolute -right-24 top-60 h-96 w-96 rounded-full bg-sky-pastel blur-3xl" />
      <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-mint-pastel/70 blur-3xl" />
    </div>
  );
}

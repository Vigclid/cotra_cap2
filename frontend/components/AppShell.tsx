"use client";

import { useEffect, useState } from "react";
import { AuthGate } from "@/components/AuthGate";
import { Background } from "@/components/Background";
import { CharacterExplorer } from "@/components/CharacterExplorer";
import { Footer } from "@/components/Footer";
import { GameCorner } from "@/components/games/GameCorner";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { HistoryPanel } from "@/components/HistoryPanel";
import { OutlineTool } from "@/components/OutlineTool";
import { RewriteTool } from "@/components/RewriteTool";
import { Roadmap } from "@/components/Roadmap";
import { MobileNav, Sidebar, type NavItem } from "@/components/Sidebar";
import { useGamification } from "@/hooks/useGamification";
import { useHistory } from "@/hooks/useHistory";
import { useTheme } from "@/hooks/useTheme";
import { INVITE_PARAM, extractRoomCode, isRoomCode } from "@/lib/race-shared";
import type { HistoryItem, RewriteResult } from "@/lib/types";

export type Tab = "roadmap" | "outline" | "rewrite" | "characters" | "games";

const TABS: NavItem<Tab>[] = [
  {
    id: "roadmap",
    emoji: "🗺️",
    title: "Lộ trình",
    short: "Lộ trình",
    subtitle: "Theo từng khối lớp",
    active: "bg-peach-pastel ring-orange-300 dark:ring-orange-700",
  },
  {
    id: "outline",
    emoji: "✨",
    title: "Máy tạo Dàn Ý",
    short: "Dàn ý",
    subtitle: "Nhập đề – có ngay dàn ý",
    active: "bg-sky-pastel ring-sky-300 dark:ring-sky-700",
  },
  {
    id: "rewrite",
    emoji: "🧚‍♀️",
    title: "Trợ lý Gỡ Bí",
    short: "Gỡ bí",
    subtitle: "Sửa lỗi, gợi ý viết hay",
    active: "bg-pink-pastel ring-pink-300 dark:ring-pink-700",
  },
  {
    id: "characters",
    emoji: "🎭",
    title: "Nhân vật",
    short: "Nhân vật",
    subtitle: "Nghe chuyện & phỏng vấn",
    active: "bg-mint-pastel ring-emerald-300 dark:ring-emerald-700",
  },
  {
    id: "games",
    emoji: "🎮",
    title: "Góc Giải Trí",
    short: "Giải trí",
    subtitle: "Mini-game nhận EXP",
    active: "bg-lemon-pastel ring-amber-300 dark:ring-amber-700",
  },
];

/** Các tab không cần cột Lịch sử bên phải. */
const FULL_WIDTH_TABS: Tab[] = ["roadmap", "characters", "games"];

/** Khung ứng dụng dùng chung cho "/" và "/roadmap" – chỉ khác tab mở mặc định. Yêu cầu đăng nhập. */
export function AppShell({ initialTab }: { initialTab: Tab }) {
  return (
    <AuthGate>
      <Workspace initialTab={initialTab} />
    </AuthGate>
  );
}

function Workspace({ initialTab }: { initialTab: Tab }) {
  const [tab, setTab] = useState<Tab>(initialTab);
  const history = useHistory();
  const game = useGamification();
  const { theme, toggle } = useTheme();

  // State từng tính năng giữ ở trang để không mất khi đổi tab.
  const [topic, setTopic] = useState("");
  const [outline, setOutline] = useState<string | null>(null);
  const [paragraph, setParagraph] = useState("");
  const [rewrite, setRewrite] = useState<RewriteResult | null>(null);
  const [raceInvite, setRaceInvite] = useState<string | null>(null);

  // Mở bằng link mời / quét QR (?race=ABCDE) → vào thẳng Góc Giải Trí › Đua Tốc Độ Gõ, điền sẵn mã phòng.
  useEffect(() => {
    const url = new URL(window.location.href);
    const code = extractRoomCode(url.searchParams.get(INVITE_PARAM) ?? "");
    if (!isRoomCode(code)) return;
    setRaceInvite(code);
    setTab("games");
    url.searchParams.delete(INVITE_PARAM);
    window.history.replaceState(null, "", url);
  }, []);

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
  const fullWidth = FULL_WIDTH_TABS.includes(tab);

  return (
    <>
      <Background />
      <Header game={game} theme={theme} onToggleTheme={toggle} />

      <div className="mx-auto flex max-w-7xl items-start gap-6 px-4 pt-6 sm:px-6">
        <Sidebar items={TABS} active={tab} onChange={setTab} />

        <main className="min-w-0 flex-1 space-y-8">
          <Hero
            streakText={
              !game.enabled
                ? "Chế độ xem trước dành cho thầy cô – tiến độ và EXP không được ghi lại. 👀"
                : missions === 0
                  ? "Hoàn thành nhiệm vụ đầu tiên để nhận +10 EXP nhé! 🎁"
                  : `Em đã hoàn thành ${missions} nhiệm vụ – đang là ${game.level.emoji} ${game.level.name}. Tiếp tục nào!`
            }
          />

          {/* Cột Lịch sử chỉ đứng cạnh nội dung khi đủ rộng (xl), nhỏ hơn thì xuống dưới. */}
          <div id="workspace" className={`grid scroll-mt-28 gap-6 ${fullWidth ? "" : "xl:grid-cols-[1fr_300px]"}`}>
            <section role="tabpanel" className="min-w-0">
              {tab === "roadmap" && <Roadmap onReward={game.addExp} preview={!game.enabled} />}
              {tab === "outline" && (
                <OutlineTool
                  topic={topic}
                  setTopic={setTopic}
                  outline={outline}
                  setOutline={setOutline}
                  onSuccess={(input, result) => {
                    history.add({ kind: "outline", input, result });
                    void game.addExp();
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
                    void game.addExp();
                  }}
                />
              )}
              {tab === "characters" && <CharacterExplorer onSuccess={() => void game.addExp()} />}
              {tab === "games" && <GameCorner key={raceInvite} onReward={game.addExp} raceInvite={raceInvite} />}
            </section>

            {!fullWidth && (
              <HistoryPanel
                items={history.items}
                onOpen={openHistory}
                onRemove={history.remove}
                onClear={history.clear}
              />
            )}
          </div>
        </main>
      </div>

      <Footer />
      <MobileNav items={TABS} active={tab} onChange={setTab} />

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
    <div className="fixed inset-x-4 bottom-24 z-[60] lg:bottom-6 mx-auto max-w-sm animate-pop-in" role="alert">
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

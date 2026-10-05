"use client";

import { useState } from "react";
import { History, Trash2 } from "lucide-react";
import type { HistoryItem } from "@/lib/types";

type Filter = "all" | HistoryItem["kind"];

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "Tất cả" },
  { id: "outline", label: "✨ Dàn ý" },
  { id: "rewrite", label: "🧚‍♀️ Gỡ bí" },
];

export function HistoryPanel({
  items,
  onOpen,
  onRemove,
  onClear,
}: {
  items: HistoryItem[];
  onOpen: (item: HistoryItem) => void;
  onRemove: (id: string) => void;
  onClear: () => void;
}) {
  const [filter, setFilter] = useState<Filter>("all");
  const shown = filter === "all" ? items : items.filter((i) => i.kind === filter);

  return (
    <aside className="h-fit rounded-2xl bg-surface/80 p-5 shadow-soft lg:sticky lg:top-24">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="flex items-center gap-2 font-extrabold">
          <History className="h-5 w-5 text-violet-400" /> Góc lịch sử
        </h2>
        {items.length > 0 && (
          <button
            onClick={() => confirm("Xóa toàn bộ lịch sử?") && onClear()}
            className="text-xs font-bold text-ink/40 transition hover:text-red-500"
          >
            Xóa hết
          </button>
        )}
      </div>

      <div className="mb-3 flex gap-1.5">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`rounded-full px-2.5 py-1 text-xs font-bold transition ${
              filter === f.id ? "bg-violet-200 text-violet-900" : "bg-cream text-ink/60 hover:bg-lemon-pastel"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {shown.length === 0 ? (
        <div className="rounded-xl bg-cream p-5 text-center text-sm font-semibold text-ink/50">
          <div className="mb-1 text-3xl" aria-hidden>
            🗂️
          </div>
          Chưa có gì cả. Thử lập dàn ý đầu tiên nhé!
        </div>
      ) : (
        <ul className="max-h-[55vh] space-y-2 overflow-y-auto pr-1">
          {shown.map((item) => (
            <li key={item.id} className="group relative">
              <button
                onClick={() => onOpen(item)}
                className={`w-full rounded-xl px-3 py-2.5 pr-9 text-left transition duration-300 ease-bounce hover:-translate-y-0.5 hover:shadow-soft ${
                  item.kind === "outline" ? "bg-sky-pastel/80" : "bg-pink-pastel/80"
                }`}
              >
                <span className="block text-xs font-bold text-ink/50">
                  {item.kind === "outline" ? "✨ Dàn ý" : "🧚‍♀️ Gỡ bí"} ·{" "}
                  {new Date(item.createdAt).toLocaleString("vi-VN", {
                    day: "2-digit",
                    month: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
                <span className="line-clamp-2 text-sm font-semibold">{item.input}</span>
              </button>
              <button
                onClick={() => onRemove(item.id)}
                aria-label="Xóa mục này"
                className="absolute right-2 top-2 rounded-full p-1 text-ink/30 transition hover:bg-surface hover:text-red-500 focus:opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}

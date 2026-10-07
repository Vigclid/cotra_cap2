"use client";

import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useLocalStorage } from "@/hooks/useLocalStorage";

export type NavItem<T extends string> = {
  id: T;
  emoji: string;
  title: string;
  /** Nhãn ngắn cho thanh điều hướng dưới đáy (mobile). */
  short: string;
  subtitle: string;
  active: string;
};

type NavProps<T extends string> = {
  items: NavItem<T>[];
  active: T;
  onChange: (id: T) => void;
};

/** Sidebar dọc cho màn hình lớn (≥ lg), thu gọn được về dạng chỉ còn icon. */
export function Sidebar<T extends string>({ items, active, onChange }: NavProps<T>) {
  const [collapsed, setCollapsed] = useLocalStorage("tram-sac-sidebar-collapsed", false);

  return (
    <aside
      className={`sticky top-24 hidden h-[calc(100vh-7.5rem)] shrink-0 flex-col rounded-[2rem] bg-surface/80 p-3 shadow-soft backdrop-blur transition-[width] duration-300 ease-bounce lg:flex ${
        collapsed ? "w-[88px]" : "w-64"
      }`}
    >
      <p
        className={`mb-2 overflow-hidden whitespace-nowrap px-3 pt-2 text-xs font-black uppercase tracking-widest text-ink/40 transition-opacity duration-200 ${
          collapsed ? "h-0 pt-0 opacity-0" : "opacity-100"
        }`}
      >
        Khu học tập
      </p>

      <nav className="flex flex-1 flex-col gap-2" role="tablist" aria-orientation="vertical">
        {items.map((t) => {
          const selected = active === t.id;
          return (
            <button
              key={t.id}
              role="tab"
              aria-selected={selected}
              aria-label={collapsed ? t.title : undefined}
              onClick={() => onChange(t.id)}
              className={`group relative flex items-center gap-3 rounded-2xl p-3 text-left transition duration-300 ease-bounce hover:translate-x-1 hover:shadow-soft active:scale-95 ${
                selected ? `${t.active} translate-x-1 shadow-soft ring-4` : "hover:bg-cream"
              } ${collapsed ? "justify-center" : ""}`}
            >
              <span
                className={`shrink-0 text-3xl transition duration-300 ease-bounce group-hover:rotate-6 ${selected ? "rotate-6 scale-110" : ""}`}
                aria-hidden
              >
                {t.emoji}
              </span>
              {!collapsed && (
                <span className="min-w-0 animate-pop-in">
                  <span className="block truncate font-extrabold">{t.title}</span>
                  <span className="block truncate text-xs font-semibold text-ink/55">{t.subtitle}</span>
                </span>
              )}
              {collapsed && (
                <span className="pointer-events-none absolute left-full z-40 ml-4 -translate-x-1 whitespace-nowrap rounded-xl bg-ink px-3 py-1.5 text-sm font-extrabold text-cream opacity-0 shadow-pop transition duration-200 group-hover:translate-x-0 group-hover:opacity-100">
                  {t.title}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <button
        onClick={() => setCollapsed((c) => !c)}
        aria-label={collapsed ? "Mở rộng thanh bên" : "Thu gọn thanh bên"}
        className={`mt-2 flex items-center gap-2 rounded-2xl p-3 text-sm font-extrabold text-ink/50 transition duration-300 ease-bounce hover:bg-cream hover:text-ink ${
          collapsed ? "justify-center" : ""
        }`}
      >
        {collapsed ? <PanelLeftOpen className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
        {!collapsed && "Thu gọn"}
      </button>
    </aside>
  );
}

/** Thanh điều hướng cố định dưới đáy cho mobile/tablet (< lg). */
export function MobileNav<T extends string>({ items, active, onChange }: NavProps<T>) {
  return (
    <nav
      className="fixed inset-x-3 bottom-3 z-40 flex justify-between gap-1 rounded-[1.75rem] border border-ink/5 bg-surface/90 p-1.5 shadow-pop backdrop-blur-md lg:hidden"
      role="tablist"
    >
      {items.map((t) => {
        const selected = active === t.id;
        return (
          <button
            key={t.id}
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(t.id)}
            className={`flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-2xl px-1 py-1.5 transition duration-300 ease-bounce active:scale-90 ${
              selected ? `${t.active} -translate-y-1 shadow-soft` : ""
            }`}
          >
            <span className={`text-2xl transition duration-300 ease-bounce ${selected ? "scale-110" : ""}`} aria-hidden>
              {t.emoji}
            </span>
            <span className={`w-full truncate text-center text-[11px] font-extrabold ${selected ? "" : "text-ink/55"}`}>
              {t.short}
            </span>
          </button>
        );
      })}
    </nav>
  );
}

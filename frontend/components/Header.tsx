"use client";

import Link from "next/link";
import { LayoutDashboard, LogOut, Moon, Sun } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import type { useGamification } from "@/hooks/useGamification";
import type { Role } from "@/types/api";

type Game = ReturnType<typeof useGamification>;

const ROLE_LABEL: Record<Role, string> = { student: "Học sinh", teacher: "👩‍🏫 Giáo viên", admin: "🛠️ Quản trị viên" };

export function Header({ game, theme, onToggleTheme }: { game: Game; theme: "light" | "dark"; onToggleTheme: () => void }) {
  const { exp, level, nextLevel, progress, gainKey, lastGain } = game;
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 border-b border-ink/5 bg-cream/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-4 gap-y-3 px-4 py-3 sm:px-6">
        {/* Logo */}
        <a href="#" className="group flex items-center gap-2.5">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-pink-300 to-sky-300 text-2xl shadow-soft transition duration-300 ease-bounce group-hover:-rotate-12 group-hover:scale-110">
            🚀
          </span>
          <span className="leading-tight">
            <span className="block text-lg font-black tracking-tight sm:text-xl">Trạm Sạc Ngữ Văn</span>
            <span className="block text-xs font-bold text-ink/50">Nạp năng lượng cho bài văn</span>
          </span>
        </a>

        {/* EXP bar – chỉ học sinh mới có EXP; giáo viên/admin thấy nhãn vai trò */}
        {!game.enabled ? (
          <span className="order-3 w-full rounded-full bg-sky-pastel px-4 py-2 text-center text-xs font-extrabold text-sky-800 sm:order-none sm:ml-auto sm:w-auto dark:text-sky-200">
            {user ? ROLE_LABEL[user.role] : ""} · Chế độ xem trước
          </span>
        ) : (
        <div className="order-3 w-full sm:order-none sm:ml-auto sm:w-72">
          <div className="mb-1 flex items-center justify-between text-xs font-extrabold">
            <span className="flex items-center gap-1">
              <span aria-hidden>{level.emoji}</span> Cấp {level.index + 1} · {level.name}
            </span>
            <span className="relative text-ink/60">
              {exp} EXP{nextLevel && ` / ${nextLevel.min}`}
              {gainKey > 0 && (
                <span
                  key={gainKey}
                  className="pointer-events-none absolute -top-1 right-0 animate-exp-gain font-black text-amber-500"
                  aria-hidden
                >
                  +{lastGain}
                </span>
              )}
            </span>
          </div>
          <div
            className="h-3 overflow-hidden rounded-full bg-surface shadow-inner"
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Tiến độ lên cấp"
          >
            <div
              className="h-full rounded-full bg-gradient-to-r from-pink-300 via-amber-300 to-emerald-300 transition-[width] duration-700 ease-bounce"
              style={{ width: `${Math.max(progress, 4)}%` }}
            />
          </div>
        </div>
        )}

        {/* Tài khoản */}
        {user && (
          <div className="ml-auto flex items-center gap-2 sm:ml-0">
            <span className="hidden max-w-40 truncate text-sm font-extrabold text-ink/70 md:block" title={user.username}>
              {user.fullName}
            </span>
            {(user.role === "teacher" || user.role === "admin") && (
              <Link
                href="/teacher/dashboard"
                className="inline-flex items-center gap-1.5 rounded-full bg-violet-200 px-3 py-2 text-sm font-extrabold text-violet-900 transition duration-300 ease-bounce hover:-translate-y-0.5"
              >
                <LayoutDashboard className="h-4 w-4" />
                <span className="hidden sm:inline">Quản lý game</span>
              </Link>
            )}
            <button
              onClick={logout}
              aria-label="Đăng xuất"
              title="Đăng xuất"
              className="grid h-11 w-11 place-items-center rounded-full bg-surface shadow-soft transition duration-300 ease-bounce hover:-translate-y-0.5 active:scale-90"
            >
              <LogOut className="h-5 w-5 text-pink-500" />
            </button>
          </div>
        )}

        {/* Dark / Light */}
        <button
          onClick={onToggleTheme}
          aria-label={theme === "dark" ? "Chuyển sang giao diện sáng" : "Chuyển sang giao diện tối"}
          className={`${user ? "" : "ml-auto"} grid h-11 w-11 place-items-center rounded-full bg-surface shadow-soft transition duration-300 ease-bounce hover:-translate-y-0.5 hover:rotate-12 active:scale-90 sm:ml-0`}
        >
          {theme === "dark" ? <Sun className="h-5 w-5 text-amber-300" /> : <Moon className="h-5 w-5 text-violet-500" />}
        </button>
      </div>
    </header>
  );
}

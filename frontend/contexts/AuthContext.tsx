"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { resetCharacters } from "@/hooks/useCharacters";
import { resetLessons } from "@/hooks/useLessons";
import type { User } from "@/types/api";
import { ApiError, TOKEN_KEY, UNAUTHORIZED_EVENT, api, clearToken, getToken, setToken } from "@/utils/apiClient";

/**
 * - loading: đang kiểm tra token đã lưu (GET /api/auth/me)
 * - offline: có token nhưng không gọi được backend → không đá ra login, cho thử lại
 */
export type AuthStatus = "loading" | "authenticated" | "unauthenticated" | "offline";

type AuthContextValue = {
  user: User | null;
  status: AuthStatus;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<User>;
  logout: () => void;
  /** Kiểm tra lại token (dùng cho nút "Thử lại" khi offline). */
  refresh: () => void;
  /** Ghi đè vài trường của user sau khi backend trả dữ liệu mới (vd: EXP). */
  patchUser: (patch: Partial<User>) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [attempt, setAttempt] = useState(0);

  // Khôi phục phiên từ token trong localStorage.
  useEffect(() => {
    if (!getToken()) {
      setStatus("unauthenticated");
      return;
    }
    const ctrl = new AbortController();
    api.auth
      .me(ctrl.signal)
      .then((me) => {
        setUser(me);
        setStatus("authenticated");
      })
      .catch((err) => {
        if (ctrl.signal.aborted) return;
        // 401 đã được apiClient xoá token + phát UNAUTHORIZED_EVENT; lỗi mạng thì giữ token lại.
        setStatus(err instanceof ApiError && err.status === 0 ? "offline" : "unauthenticated");
      });
    return () => ctrl.abort();
  }, [attempt]);

  const signOut = useCallback(
    (redirect: boolean) => {
      clearToken();
      resetLessons();
      resetCharacters();
      setUser(null);
      setStatus("unauthenticated");
      if (redirect && window.location.pathname !== "/login") router.replace("/login");
    },
    [router],
  );

  // Bất kỳ request nào bị 401 (token hết hạn/không hợp lệ) hoặc tab khác đăng xuất → về trang Login.
  useEffect(() => {
    const onUnauthorized = () => signOut(true);
    const onStorage = (e: StorageEvent) => e.key === TOKEN_KEY && !e.newValue && signOut(true);
    window.addEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
      window.removeEventListener("storage", onStorage);
    };
  }, [signOut]);

  const login = useCallback(async (username: string, password: string) => {
    const { token, user: me } = await api.auth.login(username, password);
    setToken(token);
    resetLessons();
    resetCharacters();
    setUser(me);
    setStatus("authenticated");
    return me;
  }, []);

  const logout = useCallback(() => signOut(true), [signOut]);

  const refresh = useCallback(() => {
    setStatus("loading");
    setAttempt((a) => a + 1);
  }, []);

  const patchUser = useCallback((patch: Partial<User>) => setUser((prev) => (prev ? { ...prev, ...patch } : prev)), []);

  const value = useMemo<AuthContextValue>(
    () => ({ user, status, isAuthenticated: status === "authenticated" && !!user, login, logout, refresh, patchUser }),
    [user, status, login, logout, refresh, patchUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth phải được dùng bên trong <AuthProvider>");
  return ctx;
}

"use client";

import { useCallback, useEffect, useState } from "react";

type Theme = "light" | "dark";

/** Đọc/ghi theme. Class "dark" trên <html> đã được set sẵn bởi script trong layout để tránh nháy màu. */
export function useTheme() {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    setTheme(document.documentElement.classList.contains("dark") ? "dark" : "light");
  }, []);

  const toggle = useCallback(() => {
    setTheme((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      document.documentElement.classList.toggle("dark", next === "dark");
      try {
        localStorage.setItem("tram-sac-theme", next);
      } catch {}
      return next;
    });
  }, []);

  return { theme, toggle };
}

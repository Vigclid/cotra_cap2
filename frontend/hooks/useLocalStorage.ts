"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * State đồng bộ với localStorage.
 * - Lần render đầu dùng `initial` (khớp với HTML render ở server), sau đó mới đọc localStorage.
 * - `loaded` = true khi đã đọc xong, dùng để tránh xử lý nhầm lúc khởi tạo.
 * - Mọi truy cập localStorage đều bọc try/catch (chế độ ẩn danh, bị chặn cookie...).
 */
export function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw !== null) setValue(JSON.parse(raw));
    } catch {
      /* dữ liệu hỏng hoặc localStorage bị chặn → dùng giá trị mặc định */
    }
    setLoaded(true);
  }, [key]);

  const update = useCallback(
    (next: T | ((prev: T) => T)) =>
      setValue((prev) => {
        const resolved = typeof next === "function" ? (next as (p: T) => T)(prev) : next;
        try {
          localStorage.setItem(key, JSON.stringify(resolved));
        } catch {}
        return resolved;
      }),
    [key],
  );

  return [value, update, loaded] as const;
}

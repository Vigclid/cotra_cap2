import type { ReactNode } from "react";
import { AuthGate } from "@/components/AuthGate";

/**
 * Nhóm route sau đăng nhập: /roadmap, /teacher/*.
 * Token nằm trong localStorage nên server không đọc được — AuthGate kiểm tra ở client
 * và đẩy về /login khi chưa có phiên hợp lệ.
 */
export default function ProtectedLayout({ children }: { children: ReactNode }) {
  return <AuthGate>{children}</AuthGate>;
}

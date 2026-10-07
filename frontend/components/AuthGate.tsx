"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Background } from "./Background";
import { Mascot } from "./Mascot";
import { BouncyButton } from "./ui";

/**
 * Chỉ render `children` khi đã đăng nhập. Token nằm trong localStorage (proxy phía server không đọc được),
 * nên việc chặn route được làm ở client: chưa đăng nhập → /login.
 */
export function AuthGate({ children }: { children: ReactNode }) {
  const { status, refresh } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/login");
  }, [status, router]);

  if (status === "authenticated") return <>{children}</>;

  return (
    <div className="grid min-h-screen place-items-center px-4">
      <Background />
      {status === "offline" ? (
        <div className="flex max-w-md flex-col items-center gap-5 rounded-[2rem] bg-surface p-8 text-center shadow-soft">
          <Mascot message="Cô Cú không liên lạc được với Trạm Sạc rồi 📡" />
          <p className="text-sm font-semibold text-ink/60">Em kiểm tra kết nối mạng (hoặc nhờ thầy cô bật máy chủ) rồi thử lại nhé!</p>
          <BouncyButton type="button" onClick={refresh} className="bg-violet-400 hover:bg-violet-500" icon={<RefreshCw className="h-5 w-5" />}>
            Thử lại
          </BouncyButton>
        </div>
      ) : (
        <Mascot loading messages={["Đang mở cửa Trạm Sạc... 🚀", "Cô Cú đang kiểm tra thẻ học sinh 🪪"]} />
      )}
    </div>
  );
}

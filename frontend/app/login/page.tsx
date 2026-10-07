"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, LogIn } from "lucide-react";
import { Background } from "@/components/Background";
import { Mascot } from "@/components/Mascot";
import { BouncyButton, ErrorBox } from "@/components/ui";
import { useAuth } from "@/contexts/AuthContext";
import { apiErrorMessage } from "@/utils/apiClient";

const INPUT =
  "block w-full rounded-2xl border-2 border-violet-100 bg-cream/70 px-4 py-3 text-base font-semibold outline-none transition placeholder:text-ink/35 focus:border-violet-300 focus:bg-surface dark:border-white/10";

export default function LoginPage() {
  const router = useRouter();
  const { status, login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mở /login khi vẫn còn phiên hợp lệ → vào thẳng lộ trình (lúc vừa submit thì onSubmit tự chuyển trang).
  useEffect(() => {
    if (status === "authenticated" && !submitting) router.replace("/roadmap");
  }, [status, submitting, router]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError("Em nhập đủ tên đăng nhập và mật khẩu nhé!");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await login(username.trim(), password);
      router.push("/roadmap");
    } catch (err) {
      setError(apiErrorMessage(err));
      setSubmitting(false);
    }
  };

  return (
    <main className="grid min-h-screen place-items-center px-4 py-10">
      <Background />

      <div className="w-full max-w-md animate-pop-in">
        <div className="mb-6 flex flex-col items-center text-center">
          <span className="grid h-16 w-16 place-items-center rounded-3xl bg-gradient-to-br from-pink-300 to-sky-300 text-4xl shadow-soft">
            🚀
          </span>
          <h1 className="mt-4 text-3xl font-black tracking-tight">Trạm Sạc Ngữ Văn</h1>
          <p className="mt-1 text-sm font-bold text-ink/55">Đăng nhập để tiếp tục hành trình 10 chặng nhé!</p>
        </div>

        <form onSubmit={onSubmit} noValidate className="space-y-5 rounded-[2rem] bg-surface p-6 shadow-soft sm:p-8">
          <Mascot message={error ? "Cô Cú kiểm tra lại giúp em nhé 🦉" : "Chào em! Cô Cú đợi em mãi 💜"} size="sm" />

          <div>
            <label htmlFor="username" className="mb-1.5 block text-sm font-extrabold">
              Tên đăng nhập
            </label>
            <input
              id="username"
              name="username"
              autoComplete="username"
              autoCapitalize="none"
              spellCheck={false}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="vd: tranminhan"
              className={INPUT}
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1.5 block text-sm font-extrabold">
              Mật khẩu
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••"
                className={`${INPUT} pr-12`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                className="absolute inset-y-0 right-2 my-auto grid h-9 w-9 place-items-center rounded-full text-ink/50 transition hover:bg-cream hover:text-ink"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {error && (
            <div role="alert">
              <ErrorBox message={error} />
            </div>
          )}

          <BouncyButton
            loading={submitting || status === "loading"}
            loadingText={submitting ? "Đang đăng nhập..." : "Đang kiểm tra..."}
            className="w-full bg-violet-400 hover:bg-violet-500"
            icon={<LogIn className="h-5 w-5" />}
          >
            Đăng nhập
          </BouncyButton>

          <p className="text-center text-sm font-bold text-ink/55">
            Chưa có tài khoản?{" "}
            <Link href="/register" className="text-violet-600 underline-offset-2 hover:underline dark:text-violet-300">
              Đăng ký ngay
            </Link>
          </p>

          {process.env.NODE_ENV === "development" && (
            <p className="rounded-2xl bg-lemon-pastel/70 px-4 py-2.5 text-center text-xs font-bold text-amber-800 dark:text-amber-200">
              Tài khoản thử (sau khi chạy <code>npm run seed</code> ở backend): student / student123 · teacher / teacher123
            </p>
          )}
        </form>
      </div>
    </main>
  );
}

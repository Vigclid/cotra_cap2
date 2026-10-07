"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, UserPlus } from "lucide-react";
import { Background } from "@/components/Background";
import { Mascot } from "@/components/Mascot";
import { BouncyButton, ErrorBox } from "@/components/ui";
import { useAuth } from "@/contexts/AuthContext";
import { api, apiErrorMessage } from "@/utils/apiClient";

const INPUT =
  "block w-full rounded-2xl border-2 border-violet-100 bg-cream/70 px-4 py-3 text-base font-semibold outline-none transition placeholder:text-ink/35 focus:border-violet-300 focus:bg-surface dark:border-white/10";

type RoleChoice = "student" | "teacher";

export default function RegisterPage() {
  const router = useRouter();
  const { status } = useAuth();
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<RoleChoice>("student");
  const [teacherCode, setTeacherCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "authenticated" && !submitting) router.replace("/roadmap");
  }, [status, submitting, router]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !username.trim() || !password) {
      setError("Em nhập đủ họ tên, tên đăng nhập và mật khẩu nhé!");
      return;
    }
    if (password.length < 6) {
      setError("Mật khẩu cần ít nhất 6 ký tự.");
      return;
    }
    if (role === "teacher" && !teacherCode.trim()) {
      setError("Thầy cô nhập mã xác nhận giáo viên nhé!");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await api.auth.register({
        username: username.trim(),
        password,
        fullName: fullName.trim(),
        role,
        ...(role === "teacher" ? { teacherCode: teacherCode.trim() } : {}),
      });
      router.push("/login");
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
          <h1 className="mt-4 text-3xl font-black tracking-tight">Tạo tài khoản</h1>
          <p className="mt-1 text-sm font-bold text-ink/55">Học sinh vào học. Giáo viên cần mã xác nhận của nhà trường.</p>
        </div>

        <form onSubmit={onSubmit} noValidate className="space-y-5 rounded-[2rem] bg-surface p-6 shadow-soft sm:p-8">
          <Mascot message={error ? "Cô Cú kiểm tra lại giúp nhé 🦉" : "Chào mừng đến Trạm Sạc! 💜"} size="sm" />

          <fieldset>
            <legend className="mb-2 text-sm font-extrabold">Em là</legend>
            <div className="grid grid-cols-2 gap-2">
              {(
                [
                  { id: "student", emoji: "🎒", label: "Học sinh" },
                  { id: "teacher", emoji: "👩‍🏫", label: "Giáo viên" },
                ] as const
              ).map((choice) => (
                <label
                  key={choice.id}
                  className={`cursor-pointer rounded-2xl border-2 px-3 py-3 text-center font-extrabold transition ${
                    role === choice.id ? "border-violet-300 bg-violet-100 text-violet-900" : "border-transparent bg-cream text-ink/70"
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value={choice.id}
                    checked={role === choice.id}
                    onChange={() => setRole(choice.id)}
                    className="sr-only"
                  />
                  <span className="block text-2xl" aria-hidden>
                    {choice.emoji}
                  </span>
                  {choice.label}
                </label>
              ))}
            </div>
          </fieldset>

          <label className="block">
            <span className="mb-1.5 block text-sm font-extrabold">Họ và tên</span>
            <input value={fullName} onChange={(e) => setFullName(e.target.value)} autoComplete="name" placeholder="vd: Trần Minh An" className={INPUT} />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-extrabold">Tên đăng nhập</span>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              autoCapitalize="none"
              spellCheck={false}
              placeholder="chữ thường, số, dấu chấm hoặc _"
              className={INPUT}
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-extrabold">Mật khẩu</span>
            <span className="relative block">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                placeholder="ít nhất 6 ký tự"
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
            </span>
          </label>

          {role === "teacher" && (
            <label className="block animate-pop-in">
              <span className="mb-1.5 block text-sm font-extrabold">Mã xác nhận giáo viên</span>
              <input
                value={teacherCode}
                onChange={(e) => setTeacherCode(e.target.value)}
                autoComplete="off"
                placeholder="Mã nhà trường cấp"
                className={INPUT}
              />
              <span className="mt-1 block text-xs font-bold text-ink/45">Không có mã này thì không tạo được tài khoản giáo viên.</span>
            </label>
          )}

          {error && (
            <div role="alert">
              <ErrorBox message={error} />
            </div>
          )}

          <BouncyButton
            loading={submitting || status === "loading"}
            loadingText={submitting ? "Đang tạo tài khoản..." : "Đang kiểm tra..."}
            className="w-full bg-violet-400 hover:bg-violet-500"
            icon={<UserPlus className="h-5 w-5" />}
          >
            Đăng ký
          </BouncyButton>

          <p className="text-center text-sm font-bold text-ink/55">
            Đã có tài khoản?{" "}
            <Link href="/login" className="text-violet-600 underline-offset-2 hover:underline dark:text-violet-300">
              Đăng nhập
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}

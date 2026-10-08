"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, type SubmitHandler } from "react-hook-form";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import { AuthGate } from "@/components/AuthGate";
import { Background } from "@/components/Background";
import { BouncyButton, ErrorBox } from "@/components/ui";
import { useAuth } from "@/contexts/AuthContext";
import type { QuizItem, SpellingItem, TypingItem } from "@/types/api";
import { api, apiErrorMessage } from "@/utils/apiClient";

type TabId = "spelling" | "typing" | "quiz";

const TABS: { id: TabId; emoji: string; label: string; hint: string }[] = [
  { id: "spelling", emoji: "👮‍♂️", label: "Cảnh sát chính tả", hint: "Câu có một từ viết sai, kèm cách viết đúng và hai cách nhiễu." },
  { id: "typing", emoji: "⌨️", label: "Bàn phím siêu tốc", hint: "Đoạn văn ngắn để học sinh gõ lại." },
  { id: "quiz", emoji: "🧠", label: "Trắc nghiệm", hint: "Câu hỏi tác giả – tác phẩm với đúng 4 đáp án." },
];

const INPUT =
  "block w-full rounded-2xl border-2 border-violet-100 bg-cream/70 px-4 py-3 text-base font-semibold outline-none transition placeholder:text-ink/35 focus:border-violet-300 focus:bg-surface dark:border-white/10";

export default function TeacherDashboardPage() {
  return (
    <AuthGate>
      <Dashboard />
    </AuthGate>
  );
}

function Dashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<TabId>("spelling");

  useEffect(() => {
    if (user && user.role === "student") router.replace("/roadmap");
  }, [user, router]);

  if (!user || user.role === "student") return null;

  return (
    <div className="min-h-screen">
      <Background />
      <header className="sticky top-0 z-20 border-b border-ink/5 bg-cream/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 sm:px-6">
          <Link href="/roadmap" className="group flex items-center gap-2.5">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-pink-300 to-sky-300 text-2xl shadow-soft">🚀</span>
            <span className="leading-tight">
              <span className="block font-black">Trạm Sạc Ngữ Văn</span>
              <span className="block text-xs font-bold text-ink/50">Bảng điều khiển giáo viên</span>
            </span>
          </Link>
          <span className="ml-auto hidden text-sm font-extrabold text-ink/60 sm:block">{user.fullName}</span>
          <Link href="/teacher/analytics" className="rounded-full bg-sky-200 px-4 py-2 text-sm font-extrabold text-sky-950">
            Phân tích lớp
          </Link>
          <Link href="/roadmap" className="rounded-full bg-surface px-4 py-2 text-sm font-extrabold shadow-soft">
            Về lớp học
          </Link>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[240px_1fr]">
        <nav className="flex gap-2 overflow-x-auto lg:flex-col" aria-label="Loại mini-game">
          {TABS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              aria-current={tab === item.id ? "page" : undefined}
              className={`min-w-44 rounded-2xl px-4 py-3 text-left font-extrabold transition lg:min-w-0 ${
                tab === item.id ? "bg-violet-200 text-violet-950 shadow-soft" : "bg-surface text-ink/70"
              }`}
            >
              <span className="mr-2" aria-hidden>
                {item.emoji}
              </span>
              {item.label}
            </button>
          ))}
        </nav>
        <GameBoard key={tab} tab={tab} />
      </main>
    </div>
  );
}

function GameBoard({ tab }: { tab: TabId }) {
  const meta = TABS.find((item) => item.id === tab)!;
  const [rows, setRows] = useState<Array<SpellingItem | TypingItem | QuizItem>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [version, setVersion] = useState(0);
  const [editing, setEditing] = useState<SpellingItem | TypingItem | QuizItem | "new" | null>(null);
  const [removing, setRemoving] = useState<SpellingItem | TypingItem | QuizItem | null>(null);

  useEffect(() => {
    const ctrl = new AbortController();
    setLoading(true);
    setError(null);
    api.adminGames[tab]
      .list(ctrl.signal)
      .then((items) => setRows(items))
      .catch((err) => {
        if (!ctrl.signal.aborted) setError(apiErrorMessage(err));
      })
      .finally(() => {
        if (!ctrl.signal.aborted) setLoading(false);
      });
    return () => ctrl.abort();
  }, [tab, version]);

  const reload = () => setVersion((n) => n + 1);

  return (
    <section className="rounded-[2rem] bg-surface p-5 shadow-soft sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black">
            {meta.emoji} {meta.label}
          </h1>
          <p className="mt-1 max-w-xl text-sm font-semibold text-ink/55">{meta.hint}</p>
        </div>
        <BouncyButton type="button" onClick={() => setEditing("new")} className="bg-emerald-400 px-5 py-2.5 text-base hover:bg-emerald-500" icon={<Plus className="h-5 w-5" />}>
          Thêm mới
        </BouncyButton>
      </div>

      {error && (
        <div className="mt-4">
          <ErrorBox message={error} />
        </div>
      )}

      {loading ? (
        <p className="mt-8 text-center text-sm font-bold text-ink/50">Đang mở danh sách...</p>
      ) : rows.length === 0 ? (
        <p className="mt-8 rounded-2xl bg-cream px-4 py-8 text-center font-bold text-ink/55">Chưa có câu nào. Bấm “Thêm mới” để soạn câu đầu tiên.</p>
      ) : (
        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[36rem] text-left text-sm">
            <thead>
              <tr className="text-xs font-black uppercase tracking-wider text-ink/45">
                {tab === "spelling" && (
                  <>
                    <th className="px-3 py-2">Câu chứa lỗi</th>
                    <th className="px-3 py-2">Từ sai</th>
                    <th className="px-3 py-2">Từ đúng</th>
                  </>
                )}
                {tab === "typing" && (
                  <>
                    <th className="px-3 py-2">Tên trích đoạn</th>
                    <th className="px-3 py-2">Tác giả</th>
                    <th className="px-3 py-2">Nội dung</th>
                  </>
                )}
                {tab === "quiz" && (
                  <>
                    <th className="px-3 py-2">Câu hỏi</th>
                    <th className="px-3 py-2">Đáp án đúng</th>
                  </>
                )}
                <th className="px-3 py-2 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-t border-ink/5 align-top">
                  {tab === "spelling" && <SpellingCells item={row as SpellingItem} />}
                  {tab === "typing" && <TypingCells item={row as TypingItem} />}
                  {tab === "quiz" && <QuizCells item={row as QuizItem} />}
                  <td className="px-3 py-3 text-right">
                    <div className="inline-flex gap-2">
                      <button type="button" onClick={() => setEditing(row)} className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1.5 font-extrabold text-amber-900">
                        <Pencil className="h-3.5 w-3.5" /> Sửa
                      </button>
                      <button type="button" onClick={() => setRemoving(row)} className="inline-flex items-center gap-1 rounded-full bg-red-100 px-3 py-1.5 font-extrabold text-red-700">
                        <Trash2 className="h-3.5 w-3.5" /> Xoá
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <EditorModal
          tab={tab}
          item={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            reload();
          }}
        />
      )}

      {removing && (
        <ConfirmDelete
          onClose={() => setRemoving(null)}
          onConfirm={async () => {
            await api.adminGames[tab].remove(removing.id);
            setRemoving(null);
            reload();
          }}
        />
      )}
    </section>
  );
}

function SpellingCells({ item }: { item: SpellingItem }) {
  return (
    <>
      <td className="px-3 py-3 font-semibold">{item.sentence}</td>
      <td className="px-3 py-3 font-bold text-red-600">{item.wrongWord}</td>
      <td className="px-3 py-3 font-bold text-emerald-700">{item.correctWord}</td>
    </>
  );
}

function TypingCells({ item }: { item: TypingItem }) {
  return (
    <>
      <td className="px-3 py-3 font-extrabold">{item.title}</td>
      <td className="px-3 py-3 font-semibold">{item.author}</td>
      <td className="max-w-xs truncate px-3 py-3 font-semibold text-ink/70">{item.content}</td>
    </>
  );
}

function QuizCells({ item }: { item: QuizItem }) {
  return (
    <>
      <td className="px-3 py-3 font-semibold">{item.question}</td>
      <td className="px-3 py-3 font-bold text-emerald-700">
        {String.fromCharCode(65 + item.correctIndex)}. {item.options[item.correctIndex]}
      </td>
    </>
  );
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/40 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label={title}>
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-[2rem] bg-surface p-6 shadow-pop">
        <div className="mb-4 flex items-start justify-between gap-3">
          <h2 className="text-xl font-black">{title}</h2>
          <button type="button" onClick={onClose} aria-label="Đóng" className="grid h-9 w-9 place-items-center rounded-full bg-cream">
            <X className="h-4 w-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Field({ label, hint, error, children }: { label: string; hint?: string; error?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-extrabold">{label}</span>
      {children}
      {hint && !error && <span className="mt-1 block text-xs font-bold text-ink/45">{hint}</span>}
      {error && <span className="mt-1 block text-xs font-bold text-red-600">{error}</span>}
    </label>
  );
}

type SpellingValues = {
  sentence: string;
  wrongWord: string;
  correctWord: string;
  distractor1: string;
  distractor2: string;
  distractor3: string;
  tip: string;
};

type TypingValues = { title: string; author: string; content: string };

type QuizValues = { question: string; options: [string, string, string, string]; correctIndex: number; explain: string };

function EditorModal({
  tab,
  item,
  onClose,
  onSaved,
}: {
  tab: TabId;
  item: SpellingItem | TypingItem | QuizItem | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const title = item ? "Sửa câu hỏi" : "Thêm câu hỏi mới";
  return (
    <Modal title={title} onClose={onClose}>
      {tab === "spelling" && <SpellingEditor item={item as SpellingItem | null} onClose={onClose} onSaved={onSaved} />}
      {tab === "typing" && <TypingEditor item={item as TypingItem | null} onClose={onClose} onSaved={onSaved} />}
      {tab === "quiz" && <QuizEditor item={item as QuizItem | null} onClose={onClose} onSaved={onSaved} />}
    </Modal>
  );
}

function SpellingEditor({ item, onClose, onSaved }: { item: SpellingItem | null; onClose: () => void; onSaved: () => void }) {
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SpellingValues>({
    defaultValues: {
      sentence: item?.sentence ?? "",
      wrongWord: item?.wrongWord ?? "",
      correctWord: item?.correctWord ?? "",
      distractor1: item?.distractors[0] ?? "",
      distractor2: item?.distractors[1] ?? "",
      distractor3: item?.distractors[2] ?? "",
      tip: item?.tip ?? "",
    },
  });

  const onSubmit: SubmitHandler<SpellingValues> = async (values) => {
    setFormError(null);
    const distractors = [values.distractor1, values.distractor2, values.distractor3].map((v) => v.trim()).filter(Boolean);
    try {
      const body = {
        sentence: values.sentence.trim(),
        wrongWord: values.wrongWord.trim(),
        correctWord: values.correctWord.trim(),
        distractors,
        tip: values.tip.trim(),
      };
      if (item) await api.adminGames.spelling.update(item.id, body);
      else await api.adminGames.spelling.create(body);
      onSaved();
    } catch (err) {
      setFormError(apiErrorMessage(err));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Field label="Câu chứa lỗi" hint="Câu phải chứa đúng một lần từ viết sai." error={errors.sentence?.message}>
        <textarea rows={3} className={INPUT} {...register("sentence", { required: "Nhập câu có lỗi chính tả" })} />
      </Field>
      <Field label="Từ viết sai" error={errors.wrongWord?.message}>
        <input className={INPUT} {...register("wrongWord", { required: "Nhập từ đang viết sai trong câu" })} />
      </Field>
      <Field label="Từ viết đúng" error={errors.correctWord?.message}>
        <input className={INPUT} {...register("correctWord", { required: "Nhập cách viết đúng" })} />
      </Field>
      <Field label="Cách viết nhiễu 1" hint="Học sinh sẽ chọn giữa từ đúng và các cách nhiễu." error={errors.distractor1?.message}>
        <input className={INPUT} {...register("distractor1", { required: "Nhập một cách viết sai khác" })} />
      </Field>
      <Field label="Cách viết nhiễu 2" error={errors.distractor2?.message}>
        <input className={INPUT} {...register("distractor2", { required: "Nhập thêm một cách viết sai" })} />
      </Field>
      <Field label="Cách viết nhiễu 3 (không bắt buộc)">
        <input className={INPUT} {...register("distractor3")} />
      </Field>
      <Field label="Mẹo ghi nhớ (không bắt buộc)">
        <textarea rows={2} className={INPUT} {...register("tip")} />
      </Field>
      {formError && <ErrorBox message={formError} />}
      <FormActions saving={isSubmitting} onClose={onClose} />
    </form>
  );
}

function TypingEditor({ item, onClose, onSaved }: { item: TypingItem | null; onClose: () => void; onSaved: () => void }) {
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TypingValues>({
    defaultValues: { title: item?.title ?? "", author: item?.author ?? "", content: item?.content ?? "" },
  });

  const onSubmit: SubmitHandler<TypingValues> = async (values) => {
    setFormError(null);
    try {
      const body = { title: values.title.trim(), author: values.author.trim(), content: values.content.trim() };
      if (item) await api.adminGames.typing.update(item.id, body);
      else await api.adminGames.typing.create(body);
      onSaved();
    } catch (err) {
      setFormError(apiErrorMessage(err));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Field label="Tên trích đoạn" error={errors.title?.message}>
        <input className={INPUT} placeholder="vd: Chàng dế thanh niên" {...register("title", { required: "Nhập tên đoạn văn" })} />
      </Field>
      <Field label="Tác giả / nguồn" hint="Ví dụ: Dế Mèn phiêu lưu ký – Tô Hoài" error={errors.author?.message}>
        <input className={INPUT} {...register("author", { required: "Nhập tác giả hoặc tên tác phẩm" })} />
      </Field>
      <Field label="Đoạn văn học sinh sẽ gõ" hint="Nên là 1–2 câu, không quá dài." error={errors.content?.message}>
        <textarea rows={5} className={INPUT} {...register("content", { required: "Nhập nội dung đoạn văn" })} />
      </Field>
      {formError && <ErrorBox message={formError} />}
      <FormActions saving={isSubmitting} onClose={onClose} />
    </form>
  );
}

function QuizEditor({ item, onClose, onSaved }: { item: QuizItem | null; onClose: () => void; onSaved: () => void }) {
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<QuizValues>({
    defaultValues: {
      question: item?.question ?? "",
      options: [item?.options[0] ?? "", item?.options[1] ?? "", item?.options[2] ?? "", item?.options[3] ?? ""],
      correctIndex: item?.correctIndex ?? 0,
      explain: item?.explain ?? "",
    },
  });

  const onSubmit: SubmitHandler<QuizValues> = async (values) => {
    setFormError(null);
    try {
      const body = {
        question: values.question.trim(),
        options: values.options.map((option) => option.trim()),
        correctIndex: Number(values.correctIndex),
        explain: values.explain.trim(),
      };
      if (item) await api.adminGames.quiz.update(item.id, body);
      else await api.adminGames.quiz.create(body);
      onSaved();
    } catch (err) {
      setFormError(apiErrorMessage(err));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Field label="Câu hỏi" error={errors.question?.message}>
        <textarea rows={3} className={INPUT} {...register("question", { required: "Nhập câu hỏi" })} />
      </Field>
      {([0, 1, 2, 3] as const).map((index) => {
        const letter = "ABCD"[index];
        return (
        <Field key={letter} label={`Đáp án ${letter}`} error={errors.options?.[index]?.message}>
          <span className="flex items-center gap-3">
            <input
              type="radio"
              value={index}
              aria-label={`Đáp án ${letter} là đáp án đúng`}
              className="h-5 w-5 accent-emerald-500"
              {...register("correctIndex", { required: true, valueAsNumber: true })}
            />
            <input className={INPUT} placeholder={letter === "A" ? "Chọn nút tròn bên cạnh đáp án đúng" : ""} {...register(`options.${index}`, { required: `Nhập đáp án ${letter}` })} />
          </span>
        </Field>
        );
      })}
      <p className="text-xs font-bold text-ink/45">Bấm nút tròn cạnh đáp án đúng.</p>
      <Field label="Giải thích (không bắt buộc)">
        <textarea rows={2} className={INPUT} {...register("explain")} />
      </Field>
      {formError && <ErrorBox message={formError} />}
      <FormActions saving={isSubmitting} onClose={onClose} />
    </form>
  );
}

function FormActions({ saving, onClose }: { saving: boolean; onClose: () => void }) {
  return (
    <div className="flex justify-end gap-2 pt-2">
      <button type="button" onClick={onClose} className="rounded-full bg-cream px-5 py-2.5 font-extrabold">
        Huỷ
      </button>
      <BouncyButton loading={saving} loadingText="Đang lưu..." className="bg-violet-400 px-5 py-2.5 text-base hover:bg-violet-500">
        Lưu câu hỏi
      </BouncyButton>
    </div>
  );
}

function ConfirmDelete({ onClose, onConfirm }: { onClose: () => void; onConfirm: () => Promise<void> }) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  return (
    <Modal title="Xoá câu hỏi này?" onClose={onClose}>
      <p className="font-semibold text-ink/70">Học sinh sẽ không còn gặp câu này trong game. Thao tác không hoàn tác được.</p>
      {error && (
        <div className="mt-3">
          <ErrorBox message={error} />
        </div>
      )}
      <div className="mt-5 flex justify-end gap-2">
        <button type="button" onClick={onClose} className="rounded-full bg-cream px-5 py-2.5 font-extrabold">
          Giữ lại
        </button>
        <BouncyButton
          type="button"
          loading={saving}
          loadingText="Đang xoá..."
          className="bg-red-400 px-5 py-2.5 text-base hover:bg-red-500"
          onClick={() => {
            setSaving(true);
            setError(null);
            onConfirm().catch((err) => {
              setError(apiErrorMessage(err));
              setSaving(false);
            });
          }}
        >
          Xoá
        </BouncyButton>
      </div>
    </Modal>
  );
}

"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from "react";
import { BookHeart, MessageCircle, RefreshCw, Send, X } from "lucide-react";
import { callAI, errorMessage } from "@/lib/api-client";
import { useCharacters } from "@/hooks/useCharacters";
import { useLessons } from "@/hooks/useLessons";
import { useStudentGrade } from "@/hooks/useStudentGrade";
import { gradeLockMessage, groupByGrade, isGradeLocked } from "@/lib/grades";
import { toStage } from "@/lib/roadmap";
import { MAX_CHAT_CHARS, type ChatMessage } from "@/lib/types";
import type { CharacterSummary } from "@/types/api";
import { Mascot, MascotLoading } from "./Mascot";
import { BouncyButton, Card, CuteLock, DemoBadge, ErrorBox, LockToast, Markdown } from "./ui";

/**
 * Tên chủ điểm theo khối + số bài trong sách.
 * `character.lesson` là "Bài N" của khối đó, không phải lessonId toàn hệ thống.
 */
type StageLabel = { number: number; name: string };

/** `lesson` trên nhân vật có thể là lessonId (11, 12...) hoặc số "Bài N" trong sách. */
function useStageName() {
  const { lessons } = useLessons();
  return useMemo(() => {
    const rows = lessons ?? [];
    return (grade: number, lesson: number): StageLabel | undefined => {
      const inGrade = rows.filter((item) => item.grade === grade);
      const byId = inGrade.find((item) => item.lessonId === lesson);
      const byTitle = inGrade.find((item) => {
        const match = item.title.match(/^Bài\s*(\d+)/i);
        return match !== null && Number(match[1]) === lesson;
      });
      const found = byId ?? byTitle ?? [...inGrade].sort((a, b) => a.lessonId - b.lessonId)[lesson - 1];
      if (!found) return undefined;
      const titleNumber = found.title.match(/^Bài\s*(\d+)/i);
      const name = toStage(found).name.replace(/\s*\[cite:[^\]]*\]/gi, "").trim();
      return { number: titleNumber ? Number(titleNumber[1]) : lesson, name };
    };
  }, [lessons]);
}

function pickDefaultGrade(characters: CharacterSummary[], studentGrade: number | null): number | "all" {
  const grades = [...new Set(characters.map((character) => character.grade))].sort((a, b) => a - b);
  if (grades.length === 0) return "all";
  if (studentGrade === null) return grades[0];
  if (grades.includes(studentGrade)) return studentGrade;
  const open = grades.filter((grade) => grade <= studentGrade);
  return open.at(-1) ?? grades[0];
}

function groupByLesson(list: CharacterSummary[]) {
  const map = new Map<number, CharacterSummary[]>();
  for (const character of list) {
    const bucket = map.get(character.lesson);
    if (bucket) bucket.push(character);
    else map.set(character.lesson, [character]);
  }
  return [...map.entries()].sort((a, b) => a[0] - b[0]);
}

function FilterChip({
  active,
  locked = false,
  onClick,
  className = "",
  children,
}: {
  active: boolean;
  locked?: boolean;
  onClick: () => void;
  className?: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`rounded-full px-3 py-1.5 text-sm font-extrabold transition duration-300 ease-bounce hover:-translate-y-0.5 ${
        active ? "bg-violet-300 text-violet-950 shadow-soft" : locked ? "bg-amber-100 text-amber-900" : "bg-cream text-ink/70"
      } ${className}`}
    >
      {children}
    </button>
  );
}

export function CharacterExplorer({ onSuccess }: { onSuccess: () => void }) {
  const stageName = useStageName();
  const { characters, reload } = useCharacters();
  const { ready, grade: studentGrade } = useStudentGrade();
  const [pickedGrade, setPickedGrade] = useState<number | "all" | null>(null);
  const [lesson, setLesson] = useState<number | null>(null);
  const [selected, setSelected] = useState<CharacterSummary | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(toastTimer.current), []);

  const showToast = (message: string) => {
    setToast(message);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2800);
  };

  const gradeOptions = useMemo(() => {
    return groupByGrade(characters ?? []).map(([grade, list]) => ({ grade, count: list.length }));
  }, [characters]);
  const grade = pickedGrade ?? (characters ? pickDefaultGrade(characters, studentGrade) : "all");
  const lessonOptions = useMemo(() => {
    if (grade === "all" || !characters) return [];
    return groupByLesson(characters.filter((character) => character.grade === grade)).map(([lessonNumber, list]) => {
      const label = stageName(grade, lessonNumber);
      return {
        lesson: lessonNumber,
        number: label?.number ?? lessonNumber,
        name: label?.name,
        count: list.length,
      };
    });
  }, [characters, grade, stageName]);
  const visible = (characters ?? []).filter(
    (character) => (grade === "all" || character.grade === grade) && (lesson === null || character.lesson === lesson),
  );
  const groups = groupByGrade(visible);
  const activeLesson = lessonOptions.find((item) => item.lesson === lesson);
  const chooseGrade = (next: number | "all") => {
    setPickedGrade(next);
    setLesson(null);
  };

  const openCharacter = (character: CharacterSummary) => {
    if (!ready) return;
    if (isGradeLocked(studentGrade, character.grade)) {
      showToast(gradeLockMessage(character.grade, "nhân vật"));
      return;
    }
    setSelected(character);
  };

  if (!ready || !characters) {
    return (
      <Card className="flex flex-col items-center gap-4 py-12">
        <Mascot loading messages={["Cô Cú đang gọi các nhân vật ra sân khấu... 🎭", "Sắp xếp theo từng khối lớp ✨"]} />
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-extrabold">🎭 Trò chuyện & Khám phá Nhân vật</h2>
            <p className="text-sm font-semibold text-ink/60">
              {studentGrade === null
                ? "Thầy cô xem trước được mọi lớp. Chọn lớp, rồi chọn bài."
                : `Em đang học Lớp ${studentGrade}. Chọn lớp và bài để gặp đúng nhân vật.`}
            </p>
          </div>
          <button type="button" onClick={reload} aria-label="Tải lại nhân vật" className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-cream text-ink/60">
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>

        <div>
          <p className="mb-2 text-xs font-black uppercase tracking-wider text-ink/45">Chọn lớp</p>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Chọn lớp">
            <FilterChip active={grade === "all"} onClick={() => chooseGrade("all")}>
              Tất cả lớp
            </FilterChip>
            {gradeOptions.map((option) => {
              const locked = isGradeLocked(studentGrade, option.grade);
              return (
                <FilterChip key={option.grade} active={grade === option.grade} locked={locked && grade !== option.grade} onClick={() => chooseGrade(option.grade)}>
                  {locked ? "🔒 " : ""}Lớp {option.grade}
                  <span className={`ml-1.5 rounded-full px-1.5 py-0.5 text-[11px] ${grade === option.grade ? "bg-white/40" : "bg-white/70 text-ink/50"}`}>
                    {option.count}
                  </span>
                </FilterChip>
              );
            })}
          </div>
        </div>

        {grade !== "all" && (
          <div>
            <p className="mb-2 text-xs font-black uppercase tracking-wider text-ink/45">Chọn bài · Lớp {grade}</p>
            <div className="flex gap-2 overflow-x-auto pb-1" role="group" aria-label={`Chọn bài của Lớp ${grade}`}>
              <FilterChip active={lesson === null} onClick={() => setLesson(null)} className="shrink-0 self-stretch">
                Tất cả bài
              </FilterChip>
              {lessonOptions.map((option) => (
                <button
                  key={option.lesson}
                  type="button"
                  aria-pressed={lesson === option.lesson}
                  onClick={() => setLesson(option.lesson)}
                  className={`shrink-0 rounded-2xl px-3 py-2 text-left transition duration-300 ease-bounce hover:-translate-y-0.5 ${
                    lesson === option.lesson ? "bg-violet-300 text-violet-950 shadow-soft" : "bg-cream text-ink/70"
                  }`}
                >
                  <span className="block text-[11px] font-black uppercase tracking-wide">Bài {option.number}</span>
                  <span className="block max-w-44 truncate text-sm font-extrabold">{option.name ?? `${option.count} nhân vật`}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <p className="text-sm font-bold text-ink/55">
          {grade === "all"
            ? `Đang xem mọi lớp · ${visible.length} nhân vật. Chọn một lớp để lọc theo bài.`
            : lesson === null
              ? `Đang xem Lớp ${grade} · tất cả bài · ${visible.length} nhân vật.`
              : `Đang xem Lớp ${grade} · Bài ${activeLesson?.number ?? lesson}${activeLesson?.name ? `: ${activeLesson.name}` : ""} · ${visible.length} nhân vật.`}
        </p>
      </Card>

      {groups.length === 0 && (
        <Card className="py-10 text-center">
          <p className="font-extrabold">Chưa có nhân vật cho bộ lọc này</p>
        </Card>
      )}

      {groups.map(([grade, list]) => {
        const lockedGrade = isGradeLocked(studentGrade, grade);
        return (
          <section key={grade} className="space-y-3">
            <div className="flex items-center justify-between gap-3 px-1">
              <h3 className="text-lg font-black">Nhân vật Lớp {grade}</h3>
              {lockedGrade && (
                <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-extrabold text-amber-800">
                  🔒 {gradeLockMessage(grade, "nhân vật")}
                </span>
              )}
            </div>
            <div className="space-y-5">
              {groupByLesson(list).map(([lessonNumber, lessonCharacters]) => {
                const label = stageName(grade, lessonNumber);
                const shownNumber = label?.number ?? lessonNumber;
                return (
                  <div key={lessonNumber} className="space-y-3">
                    <h4 className="px-1 text-sm font-black text-ink/70">
                      Bài {shownNumber}
                      {label?.name ? ` · ${label.name}` : ""}
                      <span className="ml-2 font-bold text-ink/40">{lessonCharacters.length} nhân vật</span>
                    </h4>
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
                      {lessonCharacters.map((c, i) => {
                        const locked = isGradeLocked(studentGrade, c.grade);
                        const hint = gradeLockMessage(c.grade, "nhân vật");
                        return (
                          <div key={c.id} className="relative" style={{ animationDelay: `${i * 50}ms` }}>
                            <button
                              type="button"
                              disabled={locked}
                              onClick={() => openCharacter(c)}
                              className={`group w-full animate-pop-in overflow-hidden rounded-2xl bg-surface text-left shadow-soft transition duration-300 ease-bounce focus-visible:outline-4 focus-visible:outline-violet-300 disabled:cursor-not-allowed ${
                                locked ? "grayscale" : "hover:-translate-y-2 hover:rotate-1 hover:shadow-pop"
                              }`}
                            >
                              <div className={`relative grid aspect-[4/3] place-items-center bg-gradient-to-br ${c.gradient}`}>
                                <span className={`text-6xl drop-shadow-md transition duration-300 ease-bounce ${locked ? "opacity-40" : "group-hover:scale-125"}`}>
                                  {c.emoji}
                                </span>
                                <span className="absolute left-2 top-2 max-w-[calc(100%-1rem)] truncate rounded-full bg-white/80 px-2 py-0.5 text-[11px] font-extrabold text-slate-700">
                                  Lớp {c.grade} · Bài {stageName(c.grade, c.lesson)?.number ?? c.lesson}
                                </span>
                              </div>
                              <div className="p-3.5">
                                <h3 className="font-extrabold">{c.name}</h3>
                                <p className="line-clamp-1 text-xs font-bold text-ink/50">
                                  {c.work} · {c.author}
                                </p>
                                <p className="mt-1.5 line-clamp-2 text-sm text-ink/70">{c.tagline}</p>
                              </div>
                            </button>
                            {locked && (
                              <button
                                type="button"
                                onClick={() => showToast(hint)}
                                aria-label={hint}
                                className="absolute inset-0 z-10 cursor-not-allowed rounded-2xl"
                              >
                                <CuteLock hint={hint} />
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}

      {selected && (
        <CharacterModal key={selected.id} character={selected} onClose={() => setSelected(null)} onSuccess={onSuccess} />
      )}
      <LockToast message={toast} />
    </div>
  );
}

/* ------------------------------------------------------------------ */

type ModalTab = "story" | "chat";

function CharacterModal({
  character: c,
  onClose,
  onSuccess,
}: {
  character: CharacterSummary;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [tab, setTab] = useState<ModalTab>("story");
  const stageName = useStageName();
  const stage = stageName(c.grade, c.lesson);

  // Esc để đóng + khóa cuộn trang nền
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="character-title"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[92vh] w-full max-w-2xl animate-pop-in flex-col overflow-hidden rounded-t-[2rem] bg-cream shadow-pop sm:rounded-[2rem]"
      >
        {/* Header modal */}
        <div className={`relative flex items-center gap-4 bg-gradient-to-br p-5 text-slate-800 ${c.gradient}`}>
          <span className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-white/70 text-4xl shadow-soft">
            {c.emoji}
          </span>
          <div className="min-w-0">
            <h2 id="character-title" className="text-2xl font-black">
              {c.name}
            </h2>
            <p className="truncate text-sm font-bold opacity-75">
              {c.work} · {c.author} · Lớp {c.grade} · Bài {stage?.number ?? c.lesson}
              {stage?.name ? `: ${stage.name}` : ""}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Đóng"
            className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full bg-white/70 transition duration-300 ease-bounce hover:rotate-90 hover:bg-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 px-5 pt-4">
          {(
            [
              { id: "story", label: "Chuyện chưa kể", icon: BookHeart },
              { id: "chat", label: "Hỏi đáp nhập vai", icon: MessageCircle },
            ] as const
          ).map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex flex-1 items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-extrabold transition duration-300 ease-bounce hover:-translate-y-0.5 ${
                tab === id ? "bg-violet-300 text-violet-950 shadow-soft" : "bg-surface text-ink/70"
              }`}
            >
              <Icon className="h-4 w-4" /> {label}
            </button>
          ))}
        </div>

        {/* Giữ cả 2 tab trong DOM để không mất nội dung khi chuyển tab */}
        <div className={`min-h-0 flex-1 flex-col ${tab === "story" ? "flex" : "hidden"}`}>
          <StoryPanel character={c} onSuccess={onSuccess} />
        </div>
        <div className={`min-h-0 flex-1 flex-col ${tab === "chat" ? "flex" : "hidden"}`}>
          <ChatPanel character={c} onSuccess={onSuccess} />
        </div>
      </div>
    </div>
  );
}

function StoryPanel({ character: c, onSuccess }: { character: CharacterSummary; onSuccess: () => void }) {
  const [story, setStory] = useState<string | null>(null);
  const [demo, setDemo] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await callAI({ actionType: "character_story", payload: { characterId: c.id } });
      setStory(data.story);
      setDemo(Boolean(data.demo));
      onSuccess();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 space-y-4 overflow-y-auto p-5">
      {!story && !loading && (
        <div className="flex flex-col items-center gap-4 py-6 text-center">
          <Mascot message={`Cậu có biết ${c.name} còn nhiều chuyện chưa ai kể không? 🤫`} />
          <BouncyButton
            type="button"
            onClick={generate}
            className="bg-violet-400 hover:bg-violet-500"
            icon={<BookHeart className="h-5 w-5" />}
          >
            Kể chuyện chưa kể
          </BouncyButton>
        </div>
      )}

      {error && <ErrorBox message={error} />}
      {loading && (
        <MascotLoading
          messages={[
            `Tớ đang ghé thăm ${c.name}... 🚪`,
            "Nghe nói có chuyện hay lắm nha! 👂",
            "Đang chép lại từng lời một ✍️",
          ]}
        />
      )}

      {story && !loading && (
        <>
          <Card className="animate-pop-in">
            {demo && (
              <div className="mb-2">
                <DemoBadge />
              </div>
            )}
            <Markdown>{story}</Markdown>
          </Card>
          <div className="flex justify-center">
            <button
              onClick={generate}
              className="inline-flex items-center gap-2 rounded-full bg-surface px-4 py-2 text-sm font-extrabold shadow-soft transition duration-300 ease-bounce hover:-translate-y-0.5"
            >
              <RefreshCw className="h-4 w-4" /> Kể chuyện khác
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function ChatPanel({ character: c, onSuccess }: { character: CharacterSummary; onSuccess: () => void }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, loading]);

  const send = async (text: string) => {
    const question = text.trim();
    if (!question || loading) return;
    const next: ChatMessage[] = [...messages, { role: "user", text: question }];
    setMessages(next);
    setInput("");
    setLoading(true);
    setError(null);
    try {
      const data = await callAI({ actionType: "character_chat", payload: { characterId: c.id, messages: next } });
      setMessages((prev) => [...prev, { role: "character", text: data.reply }]);
      onSuccess();
    } catch (err) {
      setError(errorMessage(err));
      setMessages(messages); // hoàn tác câu hỏi để em gửi lại
      setInput(question);
    } finally {
      setLoading(false);
    }
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    send(input);
  };

  return (
    <>
      <div className="min-h-[260px] flex-1 space-y-3 overflow-y-auto p-5">
        {messages.length === 0 && (
          <div className="space-y-4 py-2">
            <Mascot
              emoji={c.emoji}
              size="sm"
              message={
                c.name.includes("&")
                  ? `Chào cậu! Chúng tớ là ${c.name}. Cậu muốn hỏi chúng tớ điều gì nào?`
                  : `Chào cháu! Ta là ${c.name}. Cháu muốn hỏi ta điều gì nào?`
              }
            />
            <div className="flex flex-wrap gap-2">
              {c.sampleQuestions.map((q) => (
                <button
                  key={q}
                  onClick={() => send(q)}
                  className="rounded-full border-2 border-violet-200 bg-surface px-3 py-1.5 text-sm font-bold transition duration-300 ease-bounce hover:-translate-y-0.5 hover:bg-violet-100 dark:border-violet-800 dark:hover:bg-violet-950"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) =>
          m.role === "user" ? (
            <div key={i} className="flex animate-pop-in justify-end">
              <p className="max-w-[80%] rounded-2xl rounded-br-sm bg-sky-pastel px-4 py-2.5 font-semibold">{m.text}</p>
            </div>
          ) : (
            <div key={i} className="flex animate-pop-in items-end gap-2">
              <span className="text-2xl" aria-hidden>
                {c.emoji}
              </span>
              <div className="max-w-[80%] rounded-2xl rounded-bl-sm bg-surface px-4 py-0.5 shadow-soft [&_p]:my-2">
                <Markdown>{m.text}</Markdown>
              </div>
            </div>
          ),
        )}

        {loading && (
          <div className="flex items-end gap-2" role="status">
            <span className="animate-bounce text-2xl" aria-hidden>
              {c.emoji}
            </span>
            <div className="rounded-2xl rounded-bl-sm bg-surface px-4 py-3 text-sm font-bold text-ink/60 shadow-soft">
              {c.name} đang suy nghĩ
              <span className="ml-1 inline-flex gap-0.5" aria-hidden>
                {[0, 1, 2].map((d) => (
                  <span
                    key={d}
                    className="h-1.5 w-1.5 animate-pulse rounded-full bg-violet-400"
                    style={{ animationDelay: `${d * 200}ms` }}
                  />
                ))}
              </span>
            </div>
          </div>
        )}
        {error && <ErrorBox message={error} />}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={submit} className="flex gap-2 border-t border-ink/5 bg-surface/60 p-4">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          maxLength={MAX_CHAT_CHARS}
          placeholder={`Hỏi ${c.name} điều gì đó...`}
          className="min-w-0 flex-1 rounded-full border-2 border-violet-200/60 bg-surface px-5 py-3 font-semibold outline-none transition placeholder:font-normal placeholder:text-ink/40 focus:border-violet-300"
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          aria-label="Gửi"
          className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-violet-400 text-white shadow-soft transition duration-300 ease-bounce hover:-translate-y-0.5 hover:scale-110 hover:bg-violet-500 active:scale-90 disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:scale-100"
        >
          <Send className="h-5 w-5" />
        </button>
      </form>
    </>
  );
}

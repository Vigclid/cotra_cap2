"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { BookHeart, MessageCircle, RefreshCw, Send, X } from "lucide-react";
import { CHARACTERS, type Character } from "@/lib/characters";
import { callAI, errorMessage } from "@/lib/api-client";
import { getStage } from "@/lib/roadmap";
import { MAX_CHAT_CHARS, type ChatMessage } from "@/lib/types";
import { Mascot, MascotLoading } from "./Mascot";
import { BouncyButton, Card, DemoBadge, ErrorBox, Markdown } from "./ui";

const LESSONS = [...new Set(CHARACTERS.map((c) => c.lesson))].sort((a, b) => a - b);

export function CharacterExplorer({ onSuccess }: { onSuccess: () => void }) {
  const [lesson, setLesson] = useState<number | null>(null);
  const [selected, setSelected] = useState<Character | null>(null);
  const list = lesson === null ? CHARACTERS : CHARACTERS.filter((c) => c.lesson === lesson);

  return (
    <div className="space-y-6">
      <Card className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-extrabold">🎭 Trò chuyện & Khám phá Nhân vật</h2>
          <p className="text-sm font-semibold text-ink/60">
            Chọn một nhân vật để nghe “chuyện chưa kể” hoặc phỏng vấn trực tiếp nhé!
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {[null, ...LESSONS].map((l) => (
            <button
              key={l ?? "all"}
              onClick={() => setLesson(l)}
              title={l === null ? undefined : getStage(l)?.name}
              className={`rounded-full px-3 py-1.5 text-sm font-bold transition duration-300 ease-bounce hover:-translate-y-0.5 ${
                lesson === l ? "bg-violet-300 text-violet-950" : "bg-cream text-ink/70"
              }`}
            >
              {l === null ? "Tất cả" : `Bài ${l}`}
            </button>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
        {list.map((c, i) => (
          <button
            key={c.id}
            onClick={() => setSelected(c)}
            style={{ animationDelay: `${i * 50}ms` }}
            className="group animate-pop-in overflow-hidden rounded-2xl bg-surface text-left shadow-soft transition duration-300 ease-bounce hover:-translate-y-2 hover:rotate-1 hover:shadow-pop focus-visible:outline-4 focus-visible:outline-violet-300"
          >
            {/* Ảnh minh họa placeholder */}
            <div className={`relative grid aspect-[4/3] place-items-center bg-gradient-to-br ${c.gradient}`}>
              <span className="text-6xl drop-shadow-md transition duration-300 ease-bounce group-hover:scale-125">
                {c.emoji}
              </span>
              <span className="absolute left-2 top-2 rounded-full bg-white/80 px-2 py-0.5 text-[11px] font-extrabold text-slate-700">
                Bài {c.lesson}
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
        ))}
      </div>

      {selected && (
        <CharacterModal key={selected.id} character={selected} onClose={() => setSelected(null)} onSuccess={onSuccess} />
      )}
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
  character: Character;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [tab, setTab] = useState<ModalTab>("story");

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
              {c.work} · {c.author} · Bài {c.lesson}: {getStage(c.lesson)?.name}
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

function StoryPanel({ character: c, onSuccess }: { character: Character; onSuccess: () => void }) {
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

function ChatPanel({ character: c, onSuccess }: { character: Character; onSuccess: () => void }) {
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

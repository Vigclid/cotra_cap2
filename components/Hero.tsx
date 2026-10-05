"use client";

import { useEffect, useState } from "react";
import { Dices } from "lucide-react";

const QUOTES = [
  "Viết văn không khó, vì đã có AI lo – nhưng ý tưởng hay phải do chính em! ✍️",
  "Mỗi trang văn là một chuyến phiêu lưu nhỏ. 🗺️",
  "Đọc nhiều, nghĩ sâu, viết hay. 📚",
  "Không có bài văn dở, chỉ có bài văn chưa được sửa. 🔧",
  "Văn hay chẳng luận đặt dài – miễn là có cảm xúc thật! 💖",
  "Một từ láy đúng chỗ đáng giá hơn mười câu sáo rỗng. 🌟",
  "Hôm nay viết một đoạn, mai sẽ thành một bài. 🌱",
  "Học văn là học làm người – từ Lão Hạc đến Dế Mèn. 🦗",
];

export function Hero({ streakText }: { streakText: string }) {
  // Render câu đầu tiên ở server, sau đó mới random để tránh lệch hydration.
  const [quoteIndex, setQuoteIndex] = useState(0);
  useEffect(() => setQuoteIndex(Math.floor(Math.random() * QUOTES.length)), []);

  const nextQuote = () =>
    setQuoteIndex((i) => (i + 1 + Math.floor(Math.random() * (QUOTES.length - 1))) % QUOTES.length);

  return (
    <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-pink-pastel via-lemon-pastel to-sky-pastel p-6 shadow-soft sm:p-10">
      <div className="pointer-events-none absolute -right-6 -top-6 text-[8rem] opacity-20 sm:text-[10rem]" aria-hidden>
        ✏️
      </div>
      <div className="relative flex flex-col items-start gap-6 md:flex-row md:items-center">
        <div className="animate-float text-7xl drop-shadow-md sm:text-8xl" aria-hidden>
          🦉
        </div>
        <div className="flex-1">
          <p className="mb-1 text-sm font-extrabold uppercase tracking-widest text-pink-500 dark:text-pink-300">
            Xin chào bạn nhỏ!
          </p>
          <h1 className="text-3xl font-black leading-tight sm:text-4xl">
            Hôm nay mình cùng <span className="text-sky-500 dark:text-sky-300">sạc đầy</span> cảm hứng viết văn nhé!
          </h1>
          <p className="mt-2 font-semibold text-ink/70">{streakText}</p>

          <figure className="mt-5 flex items-start gap-3 rounded-2xl bg-surface/70 p-4 backdrop-blur">
            <blockquote key={quoteIndex} className="flex-1 animate-pop-in font-bold italic">
              “{QUOTES[quoteIndex]}”
            </blockquote>
            <button
              onClick={nextQuote}
              aria-label="Đổi câu châm ngôn khác"
              className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-surface shadow-soft transition duration-300 ease-bounce hover:rotate-180 hover:scale-110"
            >
              <Dices className="h-4 w-4 text-pink-500" />
            </button>
          </figure>
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="mt-16 border-t border-ink/5 bg-surface/50">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-2 px-4 py-8 text-center text-sm font-semibold text-ink/60 sm:px-6">
        <p className="text-2xl" aria-hidden>
          🦉 📚 🚀
        </p>
        <p>
          Được làm bằng <span className="text-pink-400">♥</span> và rất nhiều trà sữa 🧋 cho các bạn nhỏ yêu văn.
        </p>
        <p className="text-xs text-ink/40">
          AI chỉ là người bạn gợi ý – bài văn hay nhất luôn là bài em tự viết bằng cảm xúc thật. © {new Date().getFullYear()} Trạm Sạc Ngữ Văn
        </p>
      </div>
    </footer>
  );
}

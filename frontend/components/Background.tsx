export function Background() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden>
      <div className="absolute -left-24 -top-24 h-80 w-80 rounded-full bg-pink-pastel blur-3xl" />
      <div className="absolute -right-24 top-60 h-96 w-96 rounded-full bg-sky-pastel blur-3xl" />
      <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-mint-pastel/70 blur-3xl" />
    </div>
  );
}

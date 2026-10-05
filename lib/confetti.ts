const COLORS = ["#FCE7F3", "#E0F2FE", "#D1FAE5", "#FDE68A", "#F9A8D4", "#7DD3FC"];

/** Pháo hoa lớn – dùng khi lên cấp. */
export async function fireConfetti() {
  const confetti = (await import("canvas-confetti")).default;
  confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 }, colors: COLORS });
  setTimeout(() => confetti({ particleCount: 60, angle: 60, spread: 60, origin: { x: 0 }, colors: COLORS }), 250);
  setTimeout(() => confetti({ particleCount: 60, angle: 120, spread: 60, origin: { x: 1 }, colors: COLORS }), 400);
}

/** Pháo hoa nhỏ – dùng khi trả lời đúng trong mini-game. */
export async function popConfetti() {
  const confetti = (await import("canvas-confetti")).default;
  confetti({ particleCount: 70, spread: 70, startVelocity: 35, origin: { y: 0.7 }, colors: COLORS });
}

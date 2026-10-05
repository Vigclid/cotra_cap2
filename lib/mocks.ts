/** Dữ liệu giả lập khi chưa có API key (demo mode). */

import type { Character } from "./characters";
import type { RewriteResult } from "./types";

const DEMO_NOTE =
  "> ⚠️ *Chế độ DEMO – thêm `GEMINI_API_KEY` vào `.env.local` để AI trả lời thật.*";

export function mockOutline(topic: string) {
  return `${DEMO_NOTE}

### 🎯 Phân tích đề
- **Đề bài:** ${topic}
- **Kiểu bài:** Văn miêu tả (tả cảnh sinh hoạt)
- **Đối tượng chính:** Quang cảnh và hoạt động của con người
- **Phạm vi:** Một thời điểm cụ thể, cảm nhận của chính em

### 📝 Dàn ý chi tiết
#### I. Mở bài
- Giới thiệu khung cảnh, thời điểm và ấn tượng chung.
- *Mở bài gián tiếp:* bắt đầu bằng một âm thanh quen thuộc (tiếng trống, tiếng chim...).

#### II. Thân bài
- **Ý 1: Tả bao quát**
  - Không gian, màu sắc chủ đạo, bầu không khí.
- **Ý 2: Tả chi tiết theo trình tự không gian**
  - Cảnh vật: cây cối, nắng, gió, sân, hành lang...
  - Con người: các nhóm bạn, trò chơi, nét mặt, tiếng cười.
- **Ý 3: Sự thay đổi theo thời gian**
  - Lúc bắt đầu → cao điểm → lúc kết thúc.

#### III. Kết bài
- Cảm nghĩ của em về khung cảnh.
- Mong ước hoặc lời hứa gắn với nơi đó.

### 💡 Bí kíp ghi điểm
- Dùng **từ láy** gợi âm thanh: *rộn ràng, xôn xao, lao xao*.
- Dùng **nhân hóa**: *hàng cây vẫy tay, nắng nhảy nhót*.
- Kết hợp tả cảnh với tả người cho sinh động.
- Tránh liệt kê khô khan – xen cảm xúc của em vào từng đoạn.

### 🌱 Lời nhắn của cô
- Nhắm mắt nhớ lại khung cảnh thật rồi viết bằng cảm xúc của mình nhé. Cô tin em! 💪`;
}

const STOPWORDS = new Set(
  "và là của có những các một được thì mà cho với em rất cũng đã đang sẽ này đó khi như không ra vào lên trong trên ở".split(" "),
);

/** Tự phát hiện từ lặp đơn giản để kết quả demo trông "thật" hơn. */
export function mockRewrite(paragraph: string): RewriteResult {
  const counts = new Map<string, number>();
  for (const w of paragraph.toLowerCase().match(/[\p{L}]+/gu) ?? []) {
    if (w.length > 1 && !STOPWORDS.has(w)) counts.set(w, (counts.get(w) ?? 0) + 1);
  }
  const repeated = [...counts.entries()].filter(([, n]) => n >= 3).sort((a, b) => b[1] - a[1]).slice(0, 3);

  return {
    issues: repeated.length
      ? repeated.map(([word, n]) => ({
          type: "Lặp từ",
          quote: word,
          explanation: `Từ "${word}" xuất hiện ${n} lần khiến đoạn văn hơi nhàm chán.`,
          suggestion: "Thử thay bằng từ đồng nghĩa hoặc dùng đại từ thay thế ở vài chỗ nhé.",
        }))
      : [
          {
            type: "Lủng củng",
            quote: paragraph.split(/[.!?]/)[0].slice(0, 80),
            explanation: "(Demo) Câu mở đầu có thể ngắn gọn và rõ ý hơn.",
            suggestion: "Tách câu dài thành 2 câu ngắn, mỗi câu nói một ý.",
          },
        ],
    versions: [
      {
        title: "Mượt mà, tự nhiên",
        text: `(Demo) ${paragraph}`,
        highlight: "Khi có API key, cô sẽ sửa lỗi lặp từ và nối câu cho liền mạch.",
      },
      {
        title: "Giàu hình ảnh, cảm xúc",
        text: `(Demo) Như một bức tranh rực rỡ sắc màu, ${paragraph.charAt(0).toLowerCase()}${paragraph.slice(1)}`,
        highlight: "Khi có API key, cô sẽ thêm từ láy và biện pháp tu từ phù hợp.",
      },
      {
        title: "Ngắn gọn, súc tích",
        text: `(Demo) ${paragraph.split(/(?<=[.!?])\s+/).slice(0, 2).join(" ")}`,
        highlight: "Khi có API key, cô sẽ cô đọng ý mà vẫn giữ đủ nội dung.",
      },
    ],
    encouragement: "Em đã có ý tưởng rõ ràng và biết quan sát rồi đó! Cố lên nhé 🌸",
  };
}

export function mockStory(c: Character) {
  return `### ${c.emoji} Một buổi chiều chưa ai kể của ${c.name}

${DEMO_NOTE}

Chiều hôm ấy, nắng vàng như mật ong rót xuống khắp nơi. ${c.name} ngồi lặng lẽ, khẽ mỉm cười khi nhớ lại những ngày đã qua trong "${c.work}".

– Giá mà có ai đó lắng nghe chuyện của mình nhỉ? – ${c.name} thì thầm với cơn gió.

Cơn gió dường như hiểu chuyện, nhẹ nhàng lật từng trang sách cũ, như muốn nói: *"Có đấy, các bạn học sinh lớp ${c.grade.replace("Lớp ", "")} vẫn đang đọc về bạn mỗi ngày!"*

💭 **Điều em có thể học được:** ${c.tagline.toLowerCase()} – mỗi nhân vật đều có một trái tim đáng trân trọng.`;
}

export function mockChat(c: Character, question: string) {
  return `*mỉm cười* Ta là ${c.name} đây. Cháu hỏi "${question.slice(0, 60)}" à? Hay lắm! Nhưng hiện ta đang ở chế độ demo nên chưa trả lời kĩ được. Cháu nhờ thầy cô thêm GEMINI_API_KEY vào .env.local rồi ta kể cho nghe nhé!`;
}

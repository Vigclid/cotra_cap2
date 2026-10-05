/** Dữ liệu tĩnh cho Góc Giải Trí – chạy hoàn toàn ở client, không gọi API. */

/* ---------------- 👮‍♂️ Cảnh sát Chính tả ---------------- */

export type SpellingRound = {
  /** Câu văn, trong đó `wrong` xuất hiện đúng 1 lần. */
  sentence: string;
  /** Cụm từ viết sai (có thể gồm nhiều tiếng). */
  wrong: string;
  /** Các phương án sửa – phần tử đầu tiên là đáp án đúng. */
  options: string[];
  /** Mẹo ghi nhớ hiện ra sau khi trả lời. */
  tip: string;
};

export const SPELLING_ROUNDS: SpellingRound[] = [
  {
    sentence: "Em xin gửi lời cảm ơn trân thành đến thầy cô giáo.",
    wrong: "trân thành",
    options: ["chân thành", "chân thàn", "trân thàn"],
    tip: "“Chân thành” nghĩa là thật lòng, viết với “ch”. “Trân” chỉ đi với “trân trọng”, “trân quý”.",
  },
  {
    sentence: "Buổi sớm, sương mù dăng kín cả cánh đồng làng.",
    wrong: "dăng",
    options: ["giăng", "răng", "dăn"],
    tip: "“Giăng” (giăng mắc, giăng kín) viết với “gi”.",
  },
  {
    sentence: "Mẹ luôn dặn em phải biết dữ gìn sức khỏe.",
    wrong: "dữ gìn",
    options: ["giữ gìn", "giữ dìn", "rữ gìn"],
    tip: "“Giữ gìn” – cả hai tiếng đều bắt đầu bằng “gi”.",
  },
  {
    sentence: "Bạn Lan rất sáng xuốt khi giải quyết mọi việc.",
    wrong: "sáng xuốt",
    options: ["sáng suốt", "xáng suốt", "sáng xuất"],
    tip: "“Sáng suốt” (thông minh, nhìn rõ sự việc) viết với “s”.",
  },
  {
    sentence: "Cảnh vật nơi đây thật yên tỉnh và thơ mộng.",
    wrong: "yên tỉnh",
    options: ["yên tĩnh", "yên tình", "iên tĩnh"],
    tip: "“Tĩnh” (im lặng) mang dấu ngã. “Tỉnh” dấu hỏi là tỉnh táo, tỉnh thành.",
  },
  {
    sentence: "Cả lớp được đi tham quan khu di tích lịch xử.",
    wrong: "lịch xử",
    options: ["lịch sử", "lịch sữ", "lịc sử"],
    tip: "“Lịch sử” viết với “s”. “Xử” là xử lí, cư xử.",
  },
];

/* ---------------- ⌨️ Bàn phím Siêu tốc ---------------- */

export type TypingPassage = {
  id: string;
  title: string;
  source: string;
  text: string;
};

export const TYPING_PASSAGES: TypingPassage[] = [
  {
    id: "de-men",
    title: "Chàng dế thanh niên",
    source: "Dế Mèn phiêu lưu ký – Tô Hoài",
    text: "Bởi tôi ăn uống điều độ và làm việc có chừng mực nên tôi chóng lớn lắm. Chẳng bao lâu, tôi đã trở thành một chàng dế thanh niên cường tráng.",
  },
  {
    id: "cay-tre",
    title: "Cây tre Việt Nam",
    source: "Cây tre Việt Nam – Thép Mới",
    text: "Cây tre Việt Nam! Cây tre xanh, nhũn nhặn, ngay thẳng, thủy chung, can đảm.",
  },
  {
    id: "luom",
    title: "Chú bé liên lạc",
    source: "Lượm – Tố Hữu",
    text: "Chú bé loắt choắt, cái xắc xinh xinh, cái chân thoăn thoắt, cái đầu nghênh nghênh.",
  },
];

/* ---------------- 🧠 Trắc nghiệm Tác giả – Tác phẩm ---------------- */

export type QuizQuestion = {
  question: string;
  options: string[];
  /** Vị trí đáp án đúng trong `options`. */
  answer: number;
  explain: string;
};

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    question: "Truyện ngắn “Lão Hạc” là sáng tác của nhà văn nào?",
    options: ["Kim Lân", "Nam Cao", "Tô Hoài", "Ngô Tất Tố"],
    answer: 1,
    explain: "Nam Cao viết “Lão Hạc” năm 1943, kể về người nông dân nghèo giàu lòng tự trọng.",
  },
  {
    question: "Nhân vật ông Hai yêu làng tha thiết xuất hiện trong truyện ngắn nào của Kim Lân?",
    options: ["Làng", "Vợ nhặt", "Chiếc lược ngà", "Lặng lẽ Sa Pa"],
    answer: 0,
    explain: "Truyện ngắn “Làng” (1948) của Kim Lân khắc họa tình yêu làng gắn với tình yêu nước của ông Hai.",
  },
  {
    question: "“Dế Mèn phiêu lưu ký” là tác phẩm của ai?",
    options: ["Nguyễn Huy Tưởng", "Võ Quảng", "Tô Hoài", "Nguyễn Nhật Ánh"],
    answer: 2,
    explain: "Tô Hoài viết “Dế Mèn phiêu lưu ký” năm 1941. Bài “Bài học đường đời đầu tiên” trích từ tác phẩm này.",
  },
  {
    question: "Tác giả của “Truyện Kiều” là ai?",
    options: ["Nguyễn Trãi", "Hồ Xuân Hương", "Nguyễn Đình Chiểu", "Nguyễn Du"],
    answer: 3,
    explain: "“Truyện Kiều” (Đoạn trường tân thanh) là kiệt tác truyện thơ Nôm của đại thi hào Nguyễn Du.",
  },
  {
    question: "Anh thanh niên làm công tác khí tượng một mình trên đỉnh Yên Sơn là nhân vật trong tác phẩm nào?",
    options: ["Lặng lẽ Sa Pa", "Bến quê", "Những ngôi sao xa xôi", "Làng"],
    answer: 0,
    explain: "“Lặng lẽ Sa Pa” (1970) của Nguyễn Thành Long ca ngợi những con người lặng lẽ cống hiến.",
  },
  {
    question: "“Chuyện người con gái Nam Xương” được trích từ tập truyện nào?",
    options: ["Lĩnh Nam chích quái", "Truyền kỳ mạn lục", "Hoàng Lê nhất thống chí", "Vũ trung tùy bút"],
    answer: 1,
    explain: "Truyện của Nguyễn Dữ, nằm trong tập “Truyền kỳ mạn lục” viết bằng chữ Hán ở thế kỷ XVI.",
  },
];

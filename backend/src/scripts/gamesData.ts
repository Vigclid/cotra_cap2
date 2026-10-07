/** Đề mẫu cho 3 mini-game. Chỉ nạp khi collection còn trống, để không xoá đề giáo viên đã sửa. */

export const spellingSeed = [
  {
    sentence: "Em xin gửi lời cảm ơn trân thành đến thầy cô giáo.",
    wrongWord: "trân thành",
    correctWord: "chân thành",
    distractors: ["chân thàn", "trân thàn"],
    tip: "“Chân thành” nghĩa là thật lòng, viết với “ch”. “Trân” chỉ đi với “trân trọng”, “trân quý”.",
  },
  {
    sentence: "Buổi sớm, sương mù dăng kín cả cánh đồng làng.",
    wrongWord: "dăng",
    correctWord: "giăng",
    distractors: ["răng", "dăn"],
    tip: "“Giăng” (giăng mắc, giăng kín) viết với “gi”.",
  },
  {
    sentence: "Mẹ luôn dặn em phải biết dữ gìn sức khỏe.",
    wrongWord: "dữ gìn",
    correctWord: "giữ gìn",
    distractors: ["giữ dìn", "rữ gìn"],
    tip: "“Giữ gìn” – cả hai tiếng đều bắt đầu bằng “gi”.",
  },
  {
    sentence: "Bạn Lan rất sáng xuốt khi giải quyết mọi việc.",
    wrongWord: "sáng xuốt",
    correctWord: "sáng suốt",
    distractors: ["xáng suốt", "sáng xuất"],
    tip: "“Sáng suốt” (thông minh, nhìn rõ sự việc) viết với “s”.",
  },
  {
    sentence: "Cảnh vật nơi đây thật yên tỉnh và thơ mộng.",
    wrongWord: "yên tỉnh",
    correctWord: "yên tĩnh",
    distractors: ["yên tình", "iên tĩnh"],
    tip: "“Tĩnh” (im lặng) mang dấu ngã. “Tỉnh” dấu hỏi là tỉnh táo, tỉnh thành.",
  },
  {
    sentence: "Cả lớp được đi tham quan khu di tích lịch xử.",
    wrongWord: "lịch xử",
    correctWord: "lịch sử",
    distractors: ["lịch sữ", "lịc sử"],
    tip: "“Lịch sử” viết với “s”. “Xử” là xử lí, cư xử.",
  },
];

export const typingSeed = [
  {
    title: "Chàng dế thanh niên",
    author: "Dế Mèn phiêu lưu ký – Tô Hoài",
    content:
      "Bởi tôi ăn uống điều độ và làm việc có chừng mực nên tôi chóng lớn lắm. Chẳng bao lâu, tôi đã trở thành một chàng dế thanh niên cường tráng.",
  },
  {
    title: "Cây tre Việt Nam",
    author: "Cây tre Việt Nam – Thép Mới",
    content: "Cây tre Việt Nam! Cây tre xanh, nhũn nhặn, ngay thẳng, thủy chung, can đảm.",
  },
  {
    title: "Chú bé liên lạc",
    author: "Lượm – Tố Hữu",
    content: "Chú bé loắt choắt, cái xắc xinh xinh, cái chân thoăn thoắt, cái đầu nghênh nghênh.",
  },
];

export const quizSeed = [
  {
    question: "Truyện ngắn “Lão Hạc” là sáng tác của nhà văn nào?",
    options: ["Kim Lân", "Nam Cao", "Tô Hoài", "Ngô Tất Tố"],
    correctIndex: 1,
    explain: "Nam Cao viết “Lão Hạc” năm 1943, kể về người nông dân nghèo giàu lòng tự trọng.",
  },
  {
    question: "Nhân vật ông Hai yêu làng tha thiết xuất hiện trong truyện ngắn nào của Kim Lân?",
    options: ["Làng", "Vợ nhặt", "Chiếc lược ngà", "Lặng lẽ Sa Pa"],
    correctIndex: 0,
    explain: "Truyện ngắn “Làng” (1948) của Kim Lân khắc họa tình yêu làng gắn với tình yêu nước của ông Hai.",
  },
  {
    question: "“Dế Mèn phiêu lưu ký” là tác phẩm của ai?",
    options: ["Nguyễn Huy Tưởng", "Võ Quảng", "Tô Hoài", "Nguyễn Nhật Ánh"],
    correctIndex: 2,
    explain: "Tô Hoài viết “Dế Mèn phiêu lưu ký” năm 1941. Bài “Bài học đường đời đầu tiên” trích từ tác phẩm này.",
  },
  {
    question: "Tác giả của “Truyện Kiều” là ai?",
    options: ["Nguyễn Trãi", "Hồ Xuân Hương", "Nguyễn Đình Chiểu", "Nguyễn Du"],
    correctIndex: 3,
    explain: "“Truyện Kiều” (Đoạn trường tân thanh) là kiệt tác truyện thơ Nôm của đại thi hào Nguyễn Du.",
  },
  {
    question: "Anh thanh niên làm công tác khí tượng một mình trên đỉnh Yên Sơn là nhân vật trong tác phẩm nào?",
    options: ["Lặng lẽ Sa Pa", "Bến quê", "Những ngôi sao xa xôi", "Làng"],
    correctIndex: 0,
    explain: "“Lặng lẽ Sa Pa” (1970) của Nguyễn Thành Long ca ngợi những con người lặng lẽ cống hiến.",
  },
  {
    question: "“Chuyện người con gái Nam Xương” được trích từ tập truyện nào?",
    options: ["Lĩnh Nam chích quái", "Truyền kỳ mạn lục", "Hoàng Lê nhất thống chí", "Vũ trung tùy bút"],
    correctIndex: 1,
    explain: "Truyện của Nguyễn Dữ, nằm trong tập “Truyền kỳ mạn lục” viết bằng chữ Hán ở thế kỷ XVI.",
  },
];

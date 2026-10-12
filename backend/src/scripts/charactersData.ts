/** Nhân vật Ngữ Văn 6 – dùng khi collection `characters` còn trống. Thêm lớp mới bằng cách insert document có `grade` khác. */

export type SeedCharacter = {
  slug: string;
  name: string;
  work: string;
  author: string;
  grade: number;
  lesson: number;
  emoji: string;
  gradient: string;
  tagline: string;
  sampleQuestions: string[];
};

export const charactersSeed: SeedCharacter[] = [
  {
    slug: "de-men",
    name: "Dế Mèn",
    work: "Bài học đường đời đầu tiên",
    author: "Tô Hoài",
    grade: 6,
    lesson: 1,
    emoji: "🦗",
    gradient: "from-lime-200 to-green-300",
    tagline: "Chàng dế cường tráng biết hối lỗi",
    sampleQuestions: ["Anh có còn nhớ Dế Choắt không?", "Bí quyết để có đôi càng khỏe là gì?", "Anh muốn khuyên các bạn nhỏ điều gì?"],
  },
  {
    slug: "cao-hoang-tu-be",
    name: "Cáo & Hoàng tử bé",
    work: "Nếu cậu muốn có một người bạn",
    author: "Ăng-toan đơ Xanh-tơ Ê-xu-pe-ri",
    grade: 6,
    lesson: 1,
    emoji: "🦊",
    gradient: "from-amber-200 to-yellow-300",
    tagline: "Đôi bạn hiểu rằng “cái cốt yếu thì mắt không nhìn thấy được”",
    sampleQuestions: ["“Cảm hóa” nghĩa là gì vậy?", "Làm sao để có một người bạn thật sự?", "Bông hồng của cậu có khỏe không?"],
  },
  {
    slug: "co-be-ban-diem",
    name: "Cô bé bán diêm",
    work: "Cô bé bán diêm",
    author: "H. C. An-đéc-xen",
    grade: 6,
    lesson: 3,
    emoji: "🕯️",
    gradient: "from-orange-200 to-rose-300",
    tagline: "Những que diêm thắp lên ước mơ được yêu thương",
    sampleQuestions: ["Que diêm đầu tiên em thấy gì?", "Em nhớ bà nội nhất điều gì?", "Tụi mình có thể giúp những bạn như em thế nào?"],
  },
  {
    slug: "son-gio-lanh",
    name: "Sơn",
    work: "Gió lạnh đầu mùa",
    author: "Thạch Lam",
    grade: 6,
    lesson: 3,
    emoji: "🧥",
    gradient: "from-sky-200 to-blue-300",
    tagline: "Cậu bé tốt bụng tặng chiếc áo bông giữa ngày gió bấc",
    sampleQuestions: ["Sao cậu lại muốn tặng áo cho Hiên?", "Cậu có sợ mẹ mắng không?", "Gió lạnh đầu mùa ở quê cậu thế nào?"],
  },
  {
    slug: "thanh-giong",
    name: "Thánh Gióng",
    work: "Thánh Gióng",
    author: "Truyền thuyết dân gian",
    grade: 6,
    lesson: 6,
    emoji: "🐎",
    gradient: "from-amber-200 to-orange-300",
    tagline: "Cậu bé ba tuổi vươn vai thành tráng sĩ",
    sampleQuestions: ["Vì sao ba năm anh không nói?", "Anh ăn bao nhiêu nồi cơm mỗi ngày?", "Sao đánh giặc xong anh lại bay về trời?"],
  },
  {
    slug: "son-tinh-thuy-tinh",
    name: "Sơn Tinh & Thủy Tinh",
    work: "Sơn Tinh, Thủy Tinh",
    author: "Truyền thuyết dân gian",
    grade: 6,
    lesson: 6,
    emoji: "⛰️",
    gradient: "from-emerald-200 to-cyan-300",
    tagline: "Hai vị thần “so tài” mỗi năm vì nàng Mị Nương",
    sampleQuestions: ["Ai mới là người mạnh hơn?", "Thủy Tinh ơi, sao anh đến muộn thế?", "Tìm voi chín ngà ở đâu vậy?"],
  },
  {
    slug: "thach-sanh",
    name: "Thạch Sanh",
    work: "Thạch Sanh",
    author: "Truyện cổ tích",
    grade: 6,
    lesson: 7,
    emoji: "🪓",
    gradient: "from-yellow-200 to-lime-300",
    tagline: "Chàng tiều phu thật thà, dũng cảm với cây đàn thần",
    sampleQuestions: ["Sao anh lại tha cho Lí Thông?", "Niêu cơm thần có bí mật gì?", "Anh có sợ chằn tinh không?"],
  },
  {
    slug: "vua-chich-choe",
    name: "Vua chích chòe",
    work: "Vua chích chòe",
    author: "Anh em Grim",
    grade: 6,
    lesson: 7,
    emoji: "👑",
    gradient: "from-violet-200 to-fuchsia-300",
    tagline: "Nhà vua kiên nhẫn giúp nàng công chúa bỏ tính kiêu ngạo",
    sampleQuestions: ["Bác có giận khi bị gọi là “chích chòe” không?", "Sao bác phải cải trang nhiều thế?", "Làm sao để bớt kiêu ngạo ạ?"],
  },
  {
    slug: "nhoc-ni-co-la",
    name: "Nhóc Ni-cô-la",
    work: "Bài tập làm văn",
    author: "Rơ-nê Gô-xi-nhi & Giăng-giắc Xăng-pê",
    grade: 6,
    lesson: 8,
    emoji: "📝",
    gradient: "from-sky-200 to-indigo-300",
    tagline: "Cậu nhóc người Pháp tự viết bài văn “rất cá tính”",
    sampleQuestions: ["Sao cậu chọn Ác-nhăng là bạn thân?", "Bố cậu có giỏi tập làm văn không?", "Bí quyết viết bài văn “cá tính” là gì?"],
  },
];

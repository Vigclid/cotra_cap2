/**
 * Kho từ vựng cho "Đua Tốc Độ Gõ": ưu tiên từ láy, từ ghép nhiều dấu thanh để luyện gõ Telex.
 * Đề thi không cần thành câu có nghĩa – chỉ là chuỗi từ ngẫu nhiên cách nhau bởi dấu cách.
 */
export const RACE_VOCABULARY = [
  // Từ láy
  "lấp lánh", "xôn xao", "bâng khuâng", "lác đác", "lững thững", "thăm thẳm", "rì rào", "róc rách",
  "lom khom", "chênh vênh", "thoăn thoắt", "nghênh nghênh", "loắt choắt", "lênh đênh", "mênh mông", "bập bềnh",
  "lả lướt", "líu lo", "véo von", "thướt tha", "rộn ràng", "ríu rít", "lấm tấm", "lăn tăn",
  "khấp khểnh", "gập ghềnh", "lẻ loi", "đìu hiu", "xào xạc", "vi vu", "lung linh", "long lanh",
  "lóng lánh", "phấp phới", "dập dờn", "chập chờn", "nhấp nhô", "tíu tít", "lách tách", "thình thịch",
  "hớn hở", "rạng rỡ", "khúc khích", "ngập ngừng", "bỡ ngỡ", "nao nức", "nôn nao", "thấp thỏm",
  "lúng túng", "hối hả", "tất bật", "lặng lẽ", "dịu dàng", "hiền hậu", "ngoan ngoãn", "chăm chỉ",
  "siêng năng", "cần mẫn", "nhanh nhẹn", "khéo léo", "tỉ mỉ", "thật thà", "mạnh mẽ", "dũng cảm",
  // Từ ghép
  "trân trọng", "quê hương", "đất nước", "tổ quốc", "truyền thuyết", "cổ tích", "đồng thoại", "ca dao",
  "tục ngữ", "lục bát", "hoán dụ", "ẩn dụ", "nhân hoá", "so sánh", "điệp ngữ", "tự sự",
  "miêu tả", "biểu cảm", "nghị luận", "thuyết minh", "nhân vật", "cốt truyện", "chi tiết", "ngôi kể",
  "tình bạn", "gia đình", "thầy cô", "sách vở", "mái trường", "học trò", "ước mơ", "kỉ niệm",
  "bình minh", "hoàng hôn", "sương sớm", "cánh đồng", "dòng sông", "luỹ tre", "mái đình", "giếng nước",
  "phượng vĩ", "hoa sữa", "nắng vàng", "mưa phùn", "gió heo may", "trăng rằm", "biển cả", "núi non",
];

/**
 * Bốc ngẫu nhiên `count` từ (mỗi mục trong kho có thể gồm nhiều tiếng, mỗi tiếng tính là một từ khi gõ).
 * Trả về chuỗi các tiếng cách nhau bởi một dấu cách, VD "lấp lánh quê hương ...".
 * Dùng Fisher–Yates trên bản sao để không lặp lại mục nào trong cùng một đề.
 */
export function generateWords(count: number) {
  const pool = [...RACE_VOCABULARY];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  const words: string[] = [];
  for (let i = 0; words.length < count; i = (i + 1) % pool.length) {
    words.push(...pool[i].split(" "));
  }
  return words.slice(0, count).join(" ");
}

/**
 * Chuẩn hóa tiếng Việt để so sánh công bằng:
 * - NFC: gộp dấu tổ hợp (bộ gõ trên macOS/iOS có thể sinh dạng NFD).
 * - Thống nhất vị trí dấu thanh kiểu mới: "òa"→"oà", "óe"→"oé", "ủy"→"uỷ"
 *   (học sinh gõ "thủy" hay "thuỷ" đều được tính đúng).
 */
const TONES = "\u0323\u0300\u0301\u0303\u0309"; // nặng, huyền, sắc, ngã, hỏi
const OA_OE = new RegExp(`([oO])([${TONES}])([aAeE])`, "g");
const UY = new RegExp(`([uU])([${TONES}])([yY])`, "g");

export function canon(s: string) {
  return s.replace(/\s/g, " ").normalize("NFD").replace(OA_OE, "$1$3$2").replace(UY, "$1$3$2").normalize("NFC");
}

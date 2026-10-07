/** Kiểu một lượt chơi – dữ liệu lấy từ API, không còn mảng đề cứng. */

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

export type TypingPassage = {
  id: string;
  title: string;
  source: string;
  text: string;
};

export type QuizQuestion = {
  question: string;
  options: string[];
  /** Vị trí đáp án đúng trong `options`. */
  answer: number;
  explain: string;
};

export type Store = Record<string, string>;
export type SaveFn = (key: string, value: string) => void;

export type DeskTab = "read" | "practice";

export const questionKey = (lessonId: number, textIndex: number, questionIndex: number) =>
  `${lessonId}:${textIndex}:${questionIndex}`;

/** "Bài học đường đời đầu tiên (Tô Hoài)" → { title: "Bài học đường đời đầu tiên", author: "Tô Hoài" } */
export function splitTextName(name: string) {
  const match = name.match(/^(.*?)\s*\(([^()]+)\)\s*$/);
  return match ? { title: match[1], author: match[2] } : { title: name, author: null };
}

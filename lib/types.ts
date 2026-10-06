export type ActionType = "outline" | "rewrite" | "character_story" | "character_chat" | "lesson_hint";

export type RewriteIssue = {
  type: string;
  quote: string;
  explanation: string;
  suggestion: string;
};

export type RewriteVersion = {
  title: string;
  text: string;
  highlight: string;
};

export type RewriteResult = {
  issues: RewriteIssue[];
  versions: RewriteVersion[];
  encouragement: string;
};

export type ChatMessage = { role: "user" | "character"; text: string };

/** Payload gửi lên /api/ai theo từng actionType. */
export type AIRequest =
  | { actionType: "outline"; payload: { topic: string } }
  | { actionType: "rewrite"; payload: { paragraph: string } }
  | { actionType: "character_story"; payload: { characterId: string } }
  | { actionType: "character_chat"; payload: { characterId: string; messages: ChatMessage[] } }
  | {
      actionType: "lesson_hint";
      payload: { lessonId: number; textIndex: number; questionIndex: number; draft: string };
    };

/** Dữ liệu trả về từ /api/ai theo từng actionType. */
export type AIResponseMap = {
  outline: { outline: string };
  rewrite: { result: RewriteResult };
  character_story: { story: string };
  character_chat: { reply: string };
  lesson_hint: { hint: string };
};

export type HistoryItem =
  | { id: string; createdAt: number; kind: "outline"; input: string; result: string }
  | { id: string; createdAt: number; kind: "rewrite"; input: string; result: RewriteResult };

export const MAX_TOPIC_CHARS = 300;
export const MAX_PARAGRAPH_WORDS = 300;
export const MAX_CHAT_CHARS = 300;
export const MAX_CHAT_TURNS = 12;
export const MAX_DRAFT_CHARS = 1200;

export type ChatRole = 'user' | 'assistant';

export interface ChatMessage {
  role: ChatRole;
  content: string;
  timestamp: Date;
}

export interface AnalyzeSymptomResponse {
  reply: string;
  specialite: string | null;
  disclaimer: string;
}

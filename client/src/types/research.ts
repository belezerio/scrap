export type AIModel = 'gemini-2.5-flash' | 'gemini-2.5-pro' | 'gemini-2.0-flash' | 'gemini-2.0-flash-lite';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  isStreaming?: boolean;
  deepResearchUsed?: boolean;
  thinkingModeUsed?: boolean;
  sources?: { title: string; url: string }[];
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
  isPinned?: boolean;
  model: AIModel;
  deepResearch: boolean;
  thinkingMode: boolean;
}

export interface SavedResearchItem {
  id: string;
  title: string;
  content: string;
  savedAt: string;
  chatId: string;
  tags: string[];
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'success' | 'error';
  message: string;
}

export interface ActivityMetrics {
  isRunning: boolean;
  statusMessage: string;
  progress: number;
  currentActor: string;
  executionTime: number;
  datasetSize: string;
  apiStatus: 'Idle' | 'Active' | 'Success' | 'Error';
  tokens: {
    prompt: number;
    completion: number;
    total: number;
  };
  logs: ActivityLog[];
}

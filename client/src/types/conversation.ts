export type MessageRole = 'user' | 'assistant' | 'system';

export type MessageStatus = 'streaming' | 'completed' | 'error';

export interface MessageAttachment {
  id: string;
  name: string;
  type: string;
  size?: number;
  url?: string;
  content?: string;
}

export interface MessageMetadata {
  actorId?: string;
  deepResearchUsed?: boolean;
  thinkingModeUsed?: boolean;
  tokens?: {
    prompt: number;
    completion: number;
  };
}

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: string;
  attachments?: MessageAttachment[];
  status: MessageStatus;
  metadata?: MessageMetadata;
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: Message[];
  isPinned: boolean;
  isFavorite: boolean;
  lastOpened: string;
  model: string;
  researchMode: boolean;
}

export interface AppSettings {
  selectedModel: string;
  researchMode: boolean;
  thinkingMode: boolean;
  theme: 'light' | 'dark' | 'system';
  sidebarCollapsed: boolean;
  promptHistory: string[];
  recentUploadsMetadata: {
    id: string;
    name: string;
    size: number;
    date: string;
  }[];
  preferredAIOptions: Record<string, unknown>;
}

export interface StorageExportFormat {
  version: string;
  exportedAt: string;
  conversations: Conversation[];
  settings: AppSettings;
}

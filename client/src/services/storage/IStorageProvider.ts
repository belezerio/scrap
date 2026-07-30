import { Conversation, AppSettings } from '../../types/conversation';

export interface IStorageProvider {
  getConversations(): Promise<Conversation[]>;
  getConversation(id: string): Promise<Conversation | null>;
  saveConversation(conversation: Conversation): Promise<void>;
  saveConversations(conversations: Conversation[]): Promise<void>;
  deleteConversation(id: string): Promise<void>;
  clearAllConversations(): Promise<void>;
  
  getSettings(): Promise<AppSettings>;
  saveSettings(settings: Partial<AppSettings>): Promise<void>;
  
  exportData(conversationId?: string): Promise<string>;
  importData(jsonData: string): Promise<boolean>;
}

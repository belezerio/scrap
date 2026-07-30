import { IStorageProvider } from './IStorageProvider';
import { LocalStorageProvider } from './LocalStorageProvider';
import { Conversation, AppSettings } from '../../types/conversation';

class StorageService {
  private provider: IStorageProvider;

  constructor(provider: IStorageProvider) {
    this.provider = provider;
  }

  public setProvider(newProvider: IStorageProvider) {
    this.provider = newProvider;
  }

  public async getConversations(): Promise<Conversation[]> {
    return this.provider.getConversations();
  }

  public async getConversation(id: string): Promise<Conversation | null> {
    return this.provider.getConversation(id);
  }

  public async saveConversation(conversation: Conversation): Promise<void> {
    return this.provider.saveConversation(conversation);
  }

  public async saveConversations(conversations: Conversation[]): Promise<void> {
    return this.provider.saveConversations(conversations);
  }

  public async deleteConversation(id: string): Promise<void> {
    return this.provider.deleteConversation(id);
  }

  public async clearAllConversations(): Promise<void> {
    return this.provider.clearAllConversations();
  }

  public async getSettings(): Promise<AppSettings> {
    return this.provider.getSettings();
  }

  public async saveSettings(settings: Partial<AppSettings>): Promise<void> {
    return this.provider.saveSettings(settings);
  }

  public async exportData(conversationId?: string): Promise<string> {
    return this.provider.exportData(conversationId);
  }

  public async importData(jsonData: string): Promise<boolean> {
    return this.provider.importData(jsonData);
  }
}

export const storageService = new StorageService(new LocalStorageProvider());

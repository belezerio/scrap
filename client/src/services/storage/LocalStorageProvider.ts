import { IStorageProvider } from './IStorageProvider';
import { Conversation, AppSettings, StorageExportFormat } from '../../types/conversation';

const CONVERSATIONS_KEY = 'ai_app_conversations_v2';
const SETTINGS_KEY = 'ai_app_settings_v2';

const DEFAULT_SETTINGS: AppSettings = {
  selectedModel: 'gemini-2.5-flash',
  researchMode: true,
  thinkingMode: true,
  theme: 'system',
  sidebarCollapsed: false,
  promptHistory: [],
  recentUploadsMetadata: [],
  preferredAIOptions: {},
};

export class LocalStorageProvider implements IStorageProvider {
  private debounceTimer: ReturnType<typeof setTimeout> | null = null;
  private pendingSaveConversations: Conversation[] | null = null;

  async getConversations(): Promise<Conversation[]> {
    try {
      const raw = localStorage.getItem(CONVERSATIONS_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed;
    } catch (err) {
      console.error('LocalStorageProvider: Corrupted storage detected. Recovering gracefully...', err);
      return [];
    }
  }

  async getConversation(id: string): Promise<Conversation | null> {
    const conversations = await this.getConversations();
    return conversations.find((c) => c.id === id) || null;
  }

  async saveConversation(conversation: Conversation): Promise<void> {
    const conversations = await this.getConversations();
    const index = conversations.findIndex((c) => c.id === conversation.id);
    if (index >= 0) {
      conversations[index] = conversation;
    } else {
      conversations.unshift(conversation);
    }
    await this.saveConversations(conversations);
  }

  async saveConversations(conversations: Conversation[]): Promise<void> {
    this.pendingSaveConversations = conversations;
    
    // Debounce writes during fast streaming to avoid synchronous UI lag
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    this.debounceTimer = setTimeout(() => {
      this.flushPendingSave();
    }, 150);
  }

  public flushPendingSave(): void {
    if (this.pendingSaveConversations) {
      try {
        localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(this.pendingSaveConversations));
      } catch (err) {
        console.error('LocalStorageProvider: Save failed:', err);
      }
      this.pendingSaveConversations = null;
    }
  }

  async deleteConversation(id: string): Promise<void> {
    const conversations = await this.getConversations();
    const filtered = conversations.filter((c) => c.id !== id);
    await this.saveConversations(filtered);
  }

  async clearAllConversations(): Promise<void> {
    try {
      localStorage.removeItem(CONVERSATIONS_KEY);
    } catch (err) {
      console.error('LocalStorageProvider: Failed to clear conversations:', err);
    }
  }

  async getSettings(): Promise<AppSettings> {
    try {
      const raw = localStorage.getItem(SETTINGS_KEY);
      if (!raw) return DEFAULT_SETTINGS;
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_SETTINGS, ...parsed };
    } catch (err) {
      console.error('LocalStorageProvider: Failed to parse settings:', err);
      return DEFAULT_SETTINGS;
    }
  }

  async saveSettings(settings: Partial<AppSettings>): Promise<void> {
    const current = await this.getSettings();
    const updated = { ...current, ...settings };
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
    } catch (err) {
      console.error('LocalStorageProvider: Failed to save settings:', err);
    }
  }

  async exportData(conversationId?: string): Promise<string> {
    const conversations = await this.getConversations();
    const settings = await this.getSettings();

    let exportList = conversations;
    if (conversationId) {
      exportList = conversations.filter((c) => c.id === conversationId);
    }

    const payload: StorageExportFormat = {
      version: '2.0',
      exportedAt: new Date().toISOString(),
      conversations: exportList,
      settings,
    };

    return JSON.stringify(payload, null, 2);
  }

  async importData(jsonData: string): Promise<boolean> {
    try {
      const parsed = JSON.parse(jsonData);
      if (!parsed || typeof parsed !== 'object') return false;

      let importedConversations: Conversation[] = [];
      if (Array.isArray(parsed.conversations)) {
        importedConversations = parsed.conversations;
      } else if (Array.isArray(parsed)) {
        importedConversations = parsed;
      } else if (parsed.id && Array.isArray(parsed.messages)) {
        importedConversations = [parsed as Conversation];
      }

      if (importedConversations.length === 0) return false;

      const existing = await this.getConversations();
      const existingIds = new Set(existing.map((c) => c.id));

      const merged = [...existing];
      for (const item of importedConversations) {
        if (!item.id || !Array.isArray(item.messages)) continue;
        
        // Prevent duplicate IDs
        let targetId = item.id;
        if (existingIds.has(targetId)) {
          targetId = `imported_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
        }
        existingIds.add(targetId);

        merged.push({
          ...item,
          id: targetId,
          updatedAt: new Date().toISOString(),
        });
      }

      await this.saveConversations(merged);
      this.flushPendingSave();

      if (parsed.settings && typeof parsed.settings === 'object') {
        await this.saveSettings(parsed.settings);
      }

      return true;
    } catch (err) {
      console.error('LocalStorageProvider: Import validation error:', err);
      return false;
    }
  }
}

import { storageService } from './storageService';
import { AppSettings } from '../../types/conversation';

export class SettingsStorageService {
  public static async loadSettings(): Promise<AppSettings> {
    return storageService.getSettings();
  }

  public static async updateSettings(settings: Partial<AppSettings>): Promise<void> {
    return storageService.saveSettings(settings);
  }

  public static async addPromptToHistory(prompt: string): Promise<void> {
    const settings = await this.loadSettings();
    const history = settings.promptHistory || [];
    const filtered = history.filter((p) => p !== prompt);
    const updated = [prompt, ...filtered].slice(0, 50); // Keep 50 recent prompts
    await this.updateSettings({ promptHistory: updated });
  }
}

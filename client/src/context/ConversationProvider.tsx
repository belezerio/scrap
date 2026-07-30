import React, { createContext, useState, useEffect, useCallback, useMemo } from 'react';
import { Conversation, Message, AppSettings } from '../types/conversation';
import { storageService } from '../services/storage/storageService';
import { ConversationStorageService } from '../services/storage/conversationStorage';
import { SettingsStorageService } from '../services/storage/settingsStorage';

interface ConversationContextType {
  conversations: Conversation[];
  activeConversationId: string | null;
  activeConversation: Conversation | null;
  settings: AppSettings;
  searchQuery: string;
  isLoading: boolean;
  setSearchQuery: (q: string) => void;
  createConversation: (initialPrompt?: string) => Promise<Conversation>;
  selectConversation: (id: string) => Promise<void>;
  deleteConversation: (id: string) => Promise<void>;
  renameConversation: (id: string, newTitle: string) => Promise<void>;
  duplicateConversation: (id: string) => Promise<void>;
  togglePinConversation: (id: string) => Promise<void>;
  toggleFavoriteConversation: (id: string) => Promise<void>;
  clearAllConversations: () => Promise<void>;
  addMessage: (conversationId: string, message: Message) => Promise<void>;
  updateMessageContent: (conversationId: string, messageId: string, content: string, isStreaming?: boolean) => Promise<void>;
  updateSettings: (newSettings: Partial<AppSettings>) => Promise<void>;
  exportData: (conversationId?: string) => Promise<string>;
  importData: (jsonData: string) => Promise<boolean>;
}

export const ConversationContext = createContext<ConversationContextType | undefined>(undefined);

export const ConversationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [settings, setSettings] = useState<AppSettings>({
    selectedModel: 'gemini-2.5-flash',
    researchMode: true,
    thinkingMode: true,
    theme: 'system',
    sidebarCollapsed: false,
    promptHistory: [],
    recentUploadsMetadata: [],
    preferredAIOptions: {},
  });
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initial Load & Refresh Restoration
  useEffect(() => {
    const initStorage = async () => {
      setIsLoading(true);
      try {
        const loadedSettings = await SettingsStorageService.loadSettings();
        setSettings(loadedSettings);

        let list = await storageService.getConversations();

        // 1. First Visit: Automatically create a new conversation if empty
        if (list.length === 0) {
          const initialConv = ConversationStorageService.createConversation(
            undefined,
            loadedSettings.selectedModel,
            loadedSettings.researchMode
          );
          await storageService.saveConversation(initialConv);
          list = [initialConv];
        }

        // Sort conversations (pinned first, then last opened)
        const sorted = ConversationStorageService.sortConversations(list);
        setConversations(sorted);

        // 2. On Refresh: Restore the last opened conversation
        const lastOpenedConv = sorted.reduce((prev, curr) => {
          const prevTime = new Date(prev.lastOpened || prev.updatedAt).getTime();
          const currTime = new Date(curr.lastOpened || curr.updatedAt).getTime();
          return currTime > prevTime ? curr : prev;
        }, sorted[0]);

        if (lastOpenedConv) {
          setActiveConversationId(lastOpenedConv.id);
        }
      } catch (err) {
        console.error('ConversationProvider: Initialization error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    initStorage();
  }, []);

  // Selected Active Conversation
  const activeConversation = useMemo(() => {
    return conversations.find((c) => c.id === activeConversationId) || null;
  }, [conversations, activeConversationId]);

  // Actions
  const createConversation = useCallback(
    async (initialPrompt?: string): Promise<Conversation> => {
      const newConv = ConversationStorageService.createConversation(
        initialPrompt,
        settings.selectedModel,
        settings.researchMode
      );

      setConversations((prev) => [newConv, ...prev]);
      setActiveConversationId(newConv.id);

      await storageService.saveConversation(newConv);
      return newConv;
    },
    [settings]
  );

  const selectConversation = useCallback(
    async (id: string) => {
      const now = new Date().toISOString();
      setActiveConversationId(id);

      setConversations((prev) => {
        const updated = prev.map((c) => (c.id === id ? { ...c, lastOpened: now } : c));
        const sorted = ConversationStorageService.sortConversations(updated);
        storageService.saveConversations(sorted);
        return sorted;
      });
    },
    []
  );

  const deleteConversation = useCallback(
    async (id: string) => {
      setConversations((prev) => {
        const filtered = prev.filter((c) => c.id !== id);
        if (activeConversationId === id) {
          const next = filtered.length > 0 ? filtered[0].id : null;
          setActiveConversationId(next);
        }
        storageService.deleteConversation(id);
        return filtered;
      });
    },
    [activeConversationId]
  );

  const renameConversation = useCallback(
    async (id: string, newTitle: string) => {
      const now = new Date().toISOString();
      setConversations((prev) => {
        const updated = prev.map((c) =>
          c.id === id ? { ...c, title: newTitle, updatedAt: now } : c
        );
        storageService.saveConversations(updated);
        return updated;
      });
    },
    []
  );

  const duplicateConversation = useCallback(
    async (id: string) => {
      const target = conversations.find((c) => c.id === id);
      if (!target) return;

      const dup = ConversationStorageService.duplicateConversation(target);
      setConversations((prev) => [dup, ...prev]);
      setActiveConversationId(dup.id);
      await storageService.saveConversation(dup);
    },
    [conversations]
  );

  const togglePinConversation = useCallback(
    async (id: string) => {
      setConversations((prev) => {
        const updated = prev.map((c) => (c.id === id ? { ...c, isPinned: !c.isPinned } : c));
        const sorted = ConversationStorageService.sortConversations(updated);
        storageService.saveConversations(sorted);
        return sorted;
      });
    },
    []
  );

  const toggleFavoriteConversation = useCallback(
    async (id: string) => {
      setConversations((prev) => {
        const updated = prev.map((c) => (c.id === id ? { ...c, isFavorite: !c.isFavorite } : c));
        storageService.saveConversations(updated);
        return updated;
      });
    },
    []
  );

  const clearAllConversations = useCallback(async () => {
    setConversations([]);
    setActiveConversationId(null);
    await storageService.clearAllConversations();
  }, []);

  const addMessage = useCallback(
    async (conversationId: string, message: Message) => {
      const now = new Date().toISOString();
      setConversations((prev) => {
        const updated = prev.map((c) => {
          if (c.id === conversationId) {
            const isFirstUserMsg = c.messages.length === 0 && message.role === 'user';
            const autoTitle = isFirstUserMsg
              ? ConversationStorageService.generateAutoTitle(message.content)
              : c.title;

            const updatedConv: Conversation = {
              ...c,
              title: autoTitle,
              updatedAt: now,
              lastOpened: now,
              messages: [...c.messages, message],
            };
            return updatedConv;
          }
          return c;
        });

        storageService.saveConversations(updated);
        return updated;
      });

      if (message.role === 'user') {
        SettingsStorageService.addPromptToHistory(message.content);
      }
    },
    []
  );

  const updateMessageContent = useCallback(
    async (conversationId: string, messageId: string, content: string, isStreaming = true) => {
      const now = new Date().toISOString();
      setConversations((prev) => {
        const updated = prev.map((c) => {
          if (c.id === conversationId) {
            const updatedMessages = c.messages.map((m) =>
              m.id === messageId
                ? {
                    ...m,
                    content,
                    status: (isStreaming ? 'streaming' : 'completed') as Message['status'],
                  }
                : m
            );
            return {
              ...c,
              updatedAt: now,
              messages: updatedMessages,
            };
          }
          return c;
        });

        // Auto-save while streaming AI responses (debounced by LocalStorageProvider)
        storageService.saveConversations(updated);
        return updated;
      });
    },
    []
  );

  const updateSettings = useCallback(async (newSettings: Partial<AppSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      SettingsStorageService.updateSettings(updated);
      return updated;
    });
  }, []);

  const exportData = useCallback(async (conversationId?: string) => {
    return storageService.exportData(conversationId);
  }, []);

  const importData = useCallback(async (jsonData: string) => {
    const success = await storageService.importData(jsonData);
    if (success) {
      const reloaded = await storageService.getConversations();
      const sorted = ConversationStorageService.sortConversations(reloaded);
      setConversations(sorted);
      if (sorted.length > 0) {
        setActiveConversationId(sorted[0].id);
      }
    }
    return success;
  }, []);

  // Search filtered conversations
  const filteredConversations = useMemo(() => {
    return ConversationStorageService.searchConversations(conversations, searchQuery);
  }, [conversations, searchQuery]);

  return (
    <ConversationContext.Provider
      value={{
        conversations: filteredConversations,
        activeConversationId,
        activeConversation,
        settings,
        searchQuery,
        isLoading,
        setSearchQuery,
        createConversation,
        selectConversation,
        deleteConversation,
        renameConversation,
        duplicateConversation,
        togglePinConversation,
        toggleFavoriteConversation,
        clearAllConversations,
        addMessage,
        updateMessageContent,
        updateSettings,
        exportData,
        importData,
      }}
    >
      {children}
    </ConversationContext.Provider>
  );
};

import React, { createContext, useState, useCallback, useEffect } from 'react';
import { ChatSession, AIModel, SavedResearchItem } from '../types/research';
import { useActivity } from '../hooks/useActivity';
import { useToast } from '../hooks/useToast';
import { useConversations } from '../hooks/useConversations';
import { Message } from '../types/conversation';

interface ChatContextType {
  chats: ChatSession[];
  activeChatId: string | null;
  activeChat: ChatSession | null;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedModel: AIModel;
  setSelectedModel: (model: AIModel) => void;
  deepResearch: boolean;
  setDeepResearch: (val: boolean | ((prev: boolean) => boolean)) => void;
  thinkingMode: boolean;
  setThinkingMode: (val: boolean | ((prev: boolean) => boolean)) => void;
  savedResearch: SavedResearchItem[];
  createNewChat: () => void;
  selectChat: (id: string) => void;
  deleteChat: (id: string) => void;
  renameChat: (id: string, newTitle: string) => void;
  togglePinChat: (id: string) => void;
  saveResearchItem: (title: string, content: string, tags?: string[]) => void;
  sendMessage: (content: string) => Promise<void>;
  stopResponse: () => void;
  regenerateResponse: (messageId: string) => Promise<void>;
  exportChatData: (conversationId?: string) => Promise<string>;
  importChatData: (jsonData: string) => Promise<boolean>;
}

export const ChatContext = createContext<ChatContextType | undefined>(undefined);

const SAVED_RESEARCH_KEY = 'ai_saved_research_v1';

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { startActivity, updateProgress, addLog, addTokens, stopActivity } = useActivity();
  const { success, error } = useToast();

  const {
    conversations,
    activeConversationId,
    activeConversation,
    searchQuery,
    setSearchQuery,
    createConversation,
    selectConversation,
    deleteConversation,
    renameConversation,
    togglePinConversation,
    addMessage,
    updateMessageContent,
    exportData,
    importData,
  } = useConversations();

  const [savedResearch, setSavedResearch] = useState<SavedResearchItem[]>(() => {
    const saved = localStorage.getItem(SAVED_RESEARCH_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  const [selectedModel, setSelectedModel] = useState<AIModel>('gemini-2.5-flash');
  const [deepResearch, setDeepResearch] = useState<boolean>(true);
  const [thinkingMode, setThinkingMode] = useState<boolean>(true);
  const [abortController, setAbortController] = useState<AbortController | null>(null);

  useEffect(() => {
    localStorage.setItem(SAVED_RESEARCH_KEY, JSON.stringify(savedResearch));
  }, [savedResearch]);

  // Convert storage conversations to UI ChatSession shape
  const chats: ChatSession[] = conversations.map((conv) => ({
    id: conv.id,
    title: conv.title,
    messages: conv.messages.map((m) => ({
      id: m.id,
      role: m.role === 'user' ? 'user' : 'assistant',
      content: m.content,
      timestamp: m.timestamp,
      isStreaming: m.status === 'streaming',
      deepResearchUsed: m.metadata?.deepResearchUsed,
      thinkingModeUsed: m.metadata?.thinkingModeUsed,
    })),
    createdAt: conv.createdAt,
    updatedAt: conv.updatedAt,
    isPinned: conv.isPinned,
    model: (conv.model as AIModel) || 'gemini-2.5-flash',
    deepResearch: conv.researchMode,
    thinkingMode: true,
  }));

  const activeChat = activeConversation
    ? chats.find((c) => c.id === activeConversation.id) || null
    : null;

  const createNewChat = useCallback(() => {
    createConversation();
  }, [createConversation]);

  const selectChat = useCallback(
    (id: string) => {
      selectConversation(id);
    },
    [selectConversation]
  );

  const deleteChat = useCallback(
    (id: string) => {
      deleteConversation(id);
      success('Conversation deleted');
    },
    [deleteConversation, success]
  );

  const renameChat = useCallback(
    (id: string, newTitle: string) => {
      renameConversation(id, newTitle);
    },
    [renameConversation]
  );

  const togglePinChat = useCallback(
    (id: string) => {
      togglePinConversation(id);
    },
    [togglePinConversation]
  );

  const saveResearchItem = useCallback(
    (title: string, content: string, tags: string[] = ['AI Report']) => {
      const item: SavedResearchItem = {
        id: `saved_${Date.now()}`,
        title,
        content,
        savedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        chatId: activeConversationId || '',
        tags,
      };
      setSavedResearch((prev) => [item, ...prev]);
      success('Added to Saved Research');
    },
    [activeConversationId, success]
  );

  const stopResponse = useCallback(() => {
    if (abortController) {
      abortController.abort();
      setAbortController(null);
    }
    stopActivity(false);
  }, [abortController, stopActivity]);

  const sendMessage = useCallback(
    async (content: string) => {
      let targetConvId = activeConversationId;

      if (!targetConvId) {
        const newConv = await createConversation(content);
        targetConvId = newConv.id;
      }

      const userMsg: Message = {
        id: `msg_u_${Date.now()}`,
        role: 'user',
        content,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'completed',
      };

      const aiMsgId = `msg_a_${Date.now()}`;
      const assistantMsg: Message = {
        id: aiMsgId,
        role: 'assistant',
        content: '',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'streaming',
        metadata: {
          deepResearchUsed: deepResearch,
          thinkingModeUsed: thinkingMode,
        },
      };

      await addMessage(targetConvId, userMsg);
      await addMessage(targetConvId, assistantMsg);

      startActivity('apify/actor-auto-selector');
      addLog(`Analyzing prompt for Apify Actor auto-selection...`, 'info');

      const controller = new AbortController();
      setAbortController(controller);

      try {
        const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';
        const response = await fetch(`${API_BASE}/research/auto-stream`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: content, model: selectedModel }),
          signal: controller.signal,
        });

        if (!response.ok || !response.body) {
          throw new Error('Failed to start research stream from backend server.');
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let accumulatedText = '';
        let sseBuffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          sseBuffer += decoder.decode(value, { stream: true });
          const parts = sseBuffer.split('\n\n');
          sseBuffer = parts.pop() || ''; // Keep incomplete trailing fragment

          for (const part of parts) {
            const lines = part.split('\n').map((l) => l.trim()).filter(Boolean);
            let eventType = '';
            let dataStr = '';

            for (const line of lines) {
              if (line.startsWith('event:')) {
                eventType = line.replace('event:', '').trim();
              } else if (line.startsWith('data:')) {
                dataStr = line.replace('data:', '').trim();
              }
            }

            if (!dataStr) continue;
            if (dataStr === '[DONE]') break;

            try {
              const parsed = JSON.parse(dataStr);

              if (eventType === 'progress') {
                const phase = parsed.phase;
                if (phase === 'Selecting Actor') {
                  updateProgress(15, `Selecting Actor: [${parsed.actor}]`);
                  addLog(parsed.message || `Selected actor ${parsed.actor}`, 'info');
                } else if (phase === 'Running Actor') {
                  updateProgress(30, `Running Actor: [${parsed.actor}]...`);
                  addLog(parsed.message || 'Executing actor task...', 'info');
                } else if (phase === 'Waiting for Results') {
                  updateProgress(50, `Waiting for Results from Apify...`);
                  addLog(parsed.message || 'Polling dataset completion...', 'info');
                } else if (phase === 'Processing Dataset') {
                  updateProgress(75, `Processing Dataset (${parsed.datasetSize || 'ready'})`);
                  addLog(parsed.message || 'Cleaned dataset items', 'success');
                } else if (phase === 'Thinking with Gemini') {
                  updateProgress(88, `Thinking with Gemini...`);
                  addLog(parsed.message || 'Gemini processing reasoning context', 'info');
                } else if (phase === 'Streaming Response') {
                  updateProgress(95, `Streaming Response...`);
                }
              } else if (parsed.error) {
                accumulatedText += `\n\n⚠️ **Pipeline Error**: ${parsed.error}`;
                await updateMessageContent(targetConvId, aiMsgId, accumulatedText, false);
              } else if (parsed.text) {
                accumulatedText += parsed.text;
                await updateMessageContent(targetConvId, aiMsgId, accumulatedText, true);
              }
            } catch (e) {
              // Ignore chunk parse error
            }
          }
        }

        // Finalize completed streaming response
        await updateMessageContent(targetConvId, aiMsgId, accumulatedText, false);
        addTokens(Math.round(content.length / 4), Math.round(accumulatedText.length / 4));
        stopActivity(true);
      } catch (err: any) {
        if (err.name === 'AbortError') {
          addLog('Task stopped by user', 'warn');
          stopActivity(false);
          return;
        }

        console.error('Research Stream Error:', err);
        const errMsg = err?.message || 'Failed to stream response from backend server.';
        error(errMsg, 'Research Pipeline Error');
        await updateMessageContent(targetConvId, aiMsgId, `⚠️ **Error**: ${errMsg}`, false);
        stopActivity(false);
      } finally {
        setAbortController(null);
      }
    },
    [
      activeConversationId,
      selectedModel,
      deepResearch,
      thinkingMode,
      createConversation,
      addMessage,
      updateMessageContent,
      startActivity,
      updateProgress,
      addLog,
      addTokens,
      stopActivity,
      error,
    ]
  );

  const regenerateResponse = useCallback(
    async (messageId: string) => {
      if (!activeConversation) return;
      const index = activeConversation.messages.findIndex((m) => m.id === messageId);
      if (index <= 0) return;

      const previousUserMsg = activeConversation.messages[index - 1];
      if (previousUserMsg.role === 'user') {
        await sendMessage(previousUserMsg.content);
      }
    },
    [activeConversation, sendMessage]
  );

  return (
    <ChatContext.Provider
      value={{
        chats,
        activeChatId: activeConversationId,
        activeChat,
        searchQuery,
        setSearchQuery,
        selectedModel,
        setSelectedModel,
        deepResearch,
        setDeepResearch,
        thinkingMode,
        setThinkingMode,
        savedResearch,
        createNewChat,
        selectChat,
        deleteChat,
        renameChat,
        togglePinChat,
        saveResearchItem,
        sendMessage,
        stopResponse,
        regenerateResponse,
        exportChatData: exportData,
        importChatData: importData,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

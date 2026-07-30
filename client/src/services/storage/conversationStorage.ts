import { Conversation } from '../../types/conversation';

export class ConversationStorageService {
  /**
   * Auto-generate title using first user prompt.
   * Max 40 characters, truncated elegantly.
   */
  public static generateAutoTitle(firstUserPrompt: string): string {
    const trimmed = firstUserPrompt.trim();
    if (!trimmed) return 'New Conversation';
    if (trimmed.length <= 40) return trimmed;
    return `${trimmed.substring(0, 37)}...`;
  }

  /**
   * Create a new conversation model instance
   */
  public static createConversation(
    initialPrompt?: string,
    model = 'gemini-2.5-flash',
    researchMode = true
  ): Conversation {
    const id = `conv_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    const now = new Date().toISOString();
    const title = initialPrompt ? this.generateAutoTitle(initialPrompt) : 'New Conversation';

    return {
      id,
      title,
      createdAt: now,
      updatedAt: now,
      messages: [],
      isPinned: false,
      isFavorite: false,
      lastOpened: now,
      model,
      researchMode,
    };
  }

  /**
   * Instant search across conversation titles, user messages, and AI responses
   */
  public static searchConversations(conversations: Conversation[], query: string): Conversation[] {
    const q = query.trim().toLowerCase();
    if (!q) return conversations;

    return conversations.filter((conv) => {
      if (conv.title.toLowerCase().includes(q)) return true;
      return conv.messages.some((msg) => msg.content.toLowerCase().includes(q));
    });
  }

  /**
   * Sort conversations: Pinned first, then by lastOpened / updatedAt
   */
  public static sortConversations(conversations: Conversation[]): Conversation[] {
    return [...conversations].sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      const timeA = new Date(a.lastOpened || a.updatedAt).getTime();
      const timeB = new Date(b.lastOpened || b.updatedAt).getTime();
      return timeB - timeA;
    });
  }

  /**
   * Duplicate conversation helper
   */
  public static duplicateConversation(conversation: Conversation): Conversation {
    const now = new Date().toISOString();
    const newId = `conv_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    return {
      ...conversation,
      id: newId,
      title: `${conversation.title} (Copy)`,
      createdAt: now,
      updatedAt: now,
      lastOpened: now,
      messages: conversation.messages.map((msg) => ({
        ...msg,
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      })),
    };
  }
}

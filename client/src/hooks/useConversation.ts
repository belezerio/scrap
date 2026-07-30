import { useContext, useMemo } from 'react';
import { ConversationContext } from '../context/ConversationProvider';
import { Conversation, Message } from '../types/conversation';

export const useConversation = (conversationId?: string) => {
  const context = useContext(ConversationContext);
  if (!context) {
    throw new Error('useConversation must be used within a ConversationProvider');
  }

  const {
    conversations,
    activeConversationId,
    addMessage,
    updateMessageContent,
    renameConversation,
    deleteConversation,
    duplicateConversation,
    togglePinConversation,
    toggleFavoriteConversation,
  } = context;

  const targetId = conversationId || activeConversationId;

  const conversation = useMemo<Conversation | null>(() => {
    if (!targetId) return null;
    return conversations.find((c) => c.id === targetId) || null;
  }, [conversations, targetId]);

  const sendMessage = async (message: Message) => {
    if (!targetId) return;
    await addMessage(targetId, message);
  };

  const updateStreamingMessage = async (messageId: string, content: string, isStreaming = true) => {
    if (!targetId) return;
    await updateMessageContent(targetId, messageId, content, isStreaming);
  };

  return {
    conversation,
    sendMessage,
    updateStreamingMessage,
    rename: (title: string) => targetId && renameConversation(targetId, title),
    remove: () => targetId && deleteConversation(targetId),
    duplicate: () => targetId && duplicateConversation(targetId),
    togglePin: () => targetId && togglePinConversation(targetId),
    toggleFavorite: () => targetId && toggleFavoriteConversation(targetId),
  };
};

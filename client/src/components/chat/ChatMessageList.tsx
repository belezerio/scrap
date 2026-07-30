import React, { useRef, useEffect } from 'react';
import { ChatMessage } from '../../types/research';
import { ChatMessageItem } from './ChatMessageItem';
import { ChatWelcomeHero } from './ChatWelcomeHero';

export interface ChatMessageListProps {
  messages: ChatMessage[];
  onSelectPrompt: (prompt: string) => void;
}

export const ChatMessageList: React.FC<ChatMessageListProps> = ({ messages, onSelectPrompt }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (messages.length === 0) {
    return <ChatWelcomeHero onSelectPrompt={onSelectPrompt} />;
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-4 max-w-4xl mx-auto w-full">
      {messages.map((msg) => (
        <ChatMessageItem key={msg.id} message={msg} />
      ))}
      <div ref={bottomRef} />
    </div>
  );
};

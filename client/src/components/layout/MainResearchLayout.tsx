import React, { useState } from 'react';
import { HeaderNavbar } from './HeaderNavbar';
import { LeftSidebar } from './LeftSidebar';
import { RightActivityPanel } from './RightActivityPanel';
import { ChatMessageList } from '../chat/ChatMessageList';
import { ChatInputBox } from '../chat/ChatInputBox';
import { useChat } from '../../hooks/useChat';

export const MainResearchLayout: React.FC = () => {
  const [leftOpen, setLeftOpen] = useState<boolean>(true);
  const [rightOpen, setRightOpen] = useState<boolean>(true);

  const { activeChat, sendMessage } = useChat();

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background text-foreground">
      {/* 1. Left Animated Sidebar */}
      <LeftSidebar isOpen={leftOpen} onToggle={() => setLeftOpen((prev) => !prev)} />

      {/* 2. Center Main Chat Area */}
      <div className="flex flex-1 flex-col h-full min-w-0 overflow-hidden relative">
        <HeaderNavbar
          leftOpen={leftOpen}
          rightOpen={rightOpen}
          onToggleLeft={() => setLeftOpen((prev) => !prev)}
          onToggleRight={() => setRightOpen((prev) => !prev)}
        />

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto flex flex-col">
          <ChatMessageList
            messages={activeChat?.messages || []}
            onSelectPrompt={(prompt) => sendMessage(prompt)}
          />
        </div>

        {/* Input Bar */}
        <ChatInputBox onSend={(text) => sendMessage(text)} />
      </div>

      {/* 3. Right Activity Monitor Panel */}
      <RightActivityPanel isOpen={rightOpen} onToggle={() => setRightOpen((prev) => !prev)} />
    </div>
  );
};

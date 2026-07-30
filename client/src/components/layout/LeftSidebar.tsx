import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  MessageSquare,
  Search,
  Pin,
  Trash2,
  Edit2,
  Bookmark,
  Sparkles,
  Settings,
  ChevronLeft,
} from 'lucide-react';
import { useChat } from '../../hooks/useChat';
import { useModal } from '../../hooks/useModal';
import { SavedResearchModal } from '../modals/SavedResearchModal';
import { TemplatesModal } from '../modals/TemplatesModal';
import { SettingsModal } from '../modals/SettingsModal';
import { cn } from '../../lib/utils';
import { Button } from '../ui/Button';

export interface LeftSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export const LeftSidebar: React.FC<LeftSidebarProps> = ({ isOpen, onToggle }) => {
  const {
    chats,
    activeChatId,
    selectChat,
    createNewChat,
    deleteChat,
    renameChat,
    togglePinChat,
    searchQuery,
    setSearchQuery,
  } = useChat();

  const { openModal } = useModal();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState<string>('');

  const handleStartRename = (id: string, currentTitle: string) => {
    setEditingId(id);
    setEditTitle(currentTitle);
  };

  const handleConfirmRename = (id: string) => {
    if (editTitle.trim()) {
      renameChat(id, editTitle.trim());
    }
    setEditingId(null);
  };

  const filteredChats = chats.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pinnedChats = filteredChats.filter((c) => c.isPinned);
  const recentChats = filteredChats.filter((c) => !c.isPinned);

  return (
    <AnimatePresence mode="wait">
      <motion.aside
        initial={false}
        animate={{ width: isOpen ? 280 : 0, opacity: isOpen ? 1 : 0 }}
        transition={{ duration: 0.25, ease: 'easeInOut' }}
        className={cn(
          'relative h-full border-r border-border/80 bg-card/90 flex flex-col justify-between overflow-hidden shadow-sm backdrop-blur-md z-30 shrink-0',
          !isOpen && 'pointer-events-none'
        )}
      >
        <div className="p-4 space-y-4 flex-1 flex flex-col overflow-hidden">
          {/* Header & New Chat */}
          <div className="flex items-center justify-between gap-2">
            <Button
              variant="primary"
              onClick={createNewChat}
              className="flex-1 justify-start gap-2 text-xs font-semibold"
              leftIcon={<Plus className="w-4 h-4" />}
            >
              New Research Chat
            </Button>

            <button
              onClick={onToggle}
              className="rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer"
              title="Collapse Sidebar"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              className="w-full rounded-xl border border-input bg-background/60 pl-8 pr-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-colors"
            />
          </div>

          {/* Chat History Lists */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-1">
            {/* Pinned Chats */}
            {pinnedChats.length > 0 && (
              <div className="space-y-1">
                <div className="px-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                  <Pin className="w-3 h-3 text-amber-500" />
                  <span>Pinned Chats</span>
                </div>
                {pinnedChats.map((chat) => (
                  <ChatItemRow
                    key={chat.id}
                    chat={chat}
                    isActive={chat.id === activeChatId}
                    isEditing={editingId === chat.id}
                    editTitle={editTitle}
                    setEditTitle={setEditTitle}
                    onSelect={() => selectChat(chat.id)}
                    onStartRename={() => handleStartRename(chat.id, chat.title)}
                    onConfirmRename={() => handleConfirmRename(chat.id)}
                    onDelete={() => deleteChat(chat.id)}
                    onTogglePin={() => togglePinChat(chat.id)}
                  />
                ))}
              </div>
            )}

            {/* Recent Chats */}
            <div className="space-y-1">
              <div className="px-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                Recent Chats
              </div>
              {recentChats.length === 0 ? (
                <div className="px-2 py-4 text-center text-xs text-muted-foreground italic">
                  No research chats found
                </div>
              ) : (
                recentChats.map((chat) => (
                  <ChatItemRow
                    key={chat.id}
                    chat={chat}
                    isActive={chat.id === activeChatId}
                    isEditing={editingId === chat.id}
                    editTitle={editTitle}
                    setEditTitle={setEditTitle}
                    onSelect={() => selectChat(chat.id)}
                    onStartRename={() => handleStartRename(chat.id, chat.title)}
                    onConfirmRename={() => handleConfirmRename(chat.id)}
                    onDelete={() => deleteChat(chat.id)}
                    onTogglePin={() => togglePinChat(chat.id)}
                  />
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer Navigation Buttons */}
        <div className="p-3 border-t border-border/60 bg-muted/30 space-y-1 text-xs font-medium">
          <button
            onClick={() =>
              openModal({
                title: 'Saved Research Library',
                content: <SavedResearchModal />,
                size: 'lg',
              })
            }
            className="w-full flex items-center gap-2.5 rounded-lg px-3 py-2 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer"
          >
            <Bookmark className="w-4 h-4 text-emerald-500" />
            <span>Saved Research</span>
          </button>

          <button
            onClick={() =>
              openModal({
                title: 'Research Prompt Templates',
                content: <TemplatesModal />,
                size: 'lg',
              })
            }
            className="w-full flex items-center gap-2.5 rounded-lg px-3 py-2 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-purple-500" />
            <span>Templates</span>
          </button>

          <button
            onClick={() =>
              openModal({
                title: 'Application & Model Settings',
                content: <SettingsModal />,
                size: 'md',
              })
            }
            className="w-full flex items-center gap-2.5 rounded-lg px-3 py-2 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer"
          >
            <Settings className="w-4 h-4 text-indigo-500" />
            <span>Settings</span>
          </button>
        </div>
      </motion.aside>
    </AnimatePresence>
  );
};

// Inline helper component for single chat item row
interface ChatItemRowProps {
  chat: any;
  isActive: boolean;
  isEditing: boolean;
  editTitle: string;
  setEditTitle: (val: string) => void;
  onSelect: () => void;
  onStartRename: () => void;
  onConfirmRename: () => void;
  onDelete: () => void;
  onTogglePin: () => void;
}

const ChatItemRow: React.FC<ChatItemRowProps> = ({
  chat,
  isActive,
  isEditing,
  editTitle,
  setEditTitle,
  onSelect,
  onStartRename,
  onConfirmRename,
  onDelete,
  onTogglePin,
}) => {
  return (
    <div
      onClick={onSelect}
      className={cn(
        'group relative flex items-center justify-between rounded-xl px-3 py-2 text-xs font-medium transition-all cursor-pointer select-none',
        isActive
          ? 'bg-primary/10 text-primary font-semibold border border-primary/20'
          : 'text-muted-foreground hover:bg-accent hover:text-foreground'
      )}
    >
      <div className="flex items-center gap-2 truncate flex-1 pr-2">
        <MessageSquare className="w-3.5 h-3.5 shrink-0" />
        {isEditing ? (
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onConfirmRename()}
            className="w-full rounded border border-input bg-background px-1 py-0.5 text-xs text-foreground focus:outline-none"
            autoFocus
          />
        ) : (
          <span className="truncate">{chat.title}</span>
        )}
      </div>

      <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
        {isEditing ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onConfirmRename();
            }}
            className="p-1 text-emerald-500 hover:bg-accent rounded"
          >
            ✓
          </button>
        ) : (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onTogglePin();
              }}
              className="p-1 hover:text-foreground text-muted-foreground"
              title={chat.isPinned ? 'Unpin' : 'Pin'}
            >
              <Pin className={cn('w-3 h-3', chat.isPinned && 'fill-current text-amber-500')} />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onStartRename();
              }}
              className="p-1 hover:text-foreground text-muted-foreground"
              title="Rename"
            >
              <Edit2 className="w-3 h-3" />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="p-1 hover:text-destructive text-muted-foreground"
              title="Delete"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </>
        )}
      </div>
    </div>
  );
};

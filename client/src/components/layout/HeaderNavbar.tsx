import React from 'react';
import { PanelLeft, PanelRight, Sparkles } from 'lucide-react';
import { useChat } from '../../hooks/useChat';
import { ThemeToggle } from '../common/ThemeToggle';

export interface HeaderNavbarProps {
  leftOpen: boolean;
  rightOpen: boolean;
  onToggleLeft: () => void;
  onToggleRight: () => void;
}

export const HeaderNavbar: React.FC<HeaderNavbarProps> = ({
  leftOpen,
  rightOpen,
  onToggleLeft,
  onToggleRight,
}) => {
  const { activeChat } = useChat();

  return (
    <header className="sticky top-0 z-20 flex h-14 w-full items-center justify-between border-b border-border/70 bg-card/80 px-4 backdrop-blur-md">
      {/* Left Section: Sidebar Toggle & Branding */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleLeft}
          className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer"
          title={leftOpen ? 'Hide Sidebar' : 'Show Sidebar'}
        >
          <PanelLeft className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 font-bold text-sm text-foreground">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <span className="hidden sm:inline">AI Research Engine</span>
        </div>
      </div>

      {/* Center Section: Active Chat Title */}
      <div className="hidden md:flex items-center gap-2 max-w-md truncate text-xs font-semibold text-muted-foreground">
        <span className="truncate">{activeChat ? activeChat.title : 'New Research Workspace'}</span>
      </div>

      {/* Right Section: Theme Toggle & Activity Monitor Toggle */}
      <div className="flex items-center gap-2">
        <ThemeToggle />

        <button
          onClick={onToggleRight}
          className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer"
          title={rightOpen ? 'Hide Activity Monitor' : 'Show Activity Monitor'}
        >
          <PanelRight className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};

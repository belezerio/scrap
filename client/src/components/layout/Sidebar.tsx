import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Bot, Database, Settings, ShieldCheck, X } from 'lucide-react';
import { cn } from '../../lib/utils';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { label: 'AI Generator', path: '/ai-studio', icon: <Bot className="w-4 h-4" /> },
    { label: 'Data Extractor', path: '/extractor', icon: <Database className="w-4 h-4" /> },
    { label: 'Settings', path: '/settings', icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-40 h-full w-64 border-r border-border bg-card p-4 transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 flex flex-col justify-between',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="space-y-6">
          {/* Mobile Close Header */}
          <div className="flex items-center justify-between lg:hidden pb-2 border-b border-border">
            <span className="font-semibold text-sm">Navigation</span>
            <button
              onClick={onClose}
              className="rounded-lg p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                  )
                }
              >
                {item.icon}
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Footer Badge / Info */}
        <div className="rounded-xl border border-border bg-muted/40 p-3 space-y-1 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5 font-semibold text-foreground">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Secure Architecture</span>
          </div>
          <p className="text-[11px] leading-relaxed">
            Strict TypeScript & JWT Session Token Protected
          </p>
        </div>
      </aside>
    </>
  );
};

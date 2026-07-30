import React from 'react';
import { Bookmark, Calendar, Copy, Check } from 'lucide-react';
import { useChat } from '../../hooks/useChat';
import { MarkdownRenderer } from '../chat/MarkdownRenderer';
import { useState } from 'react';
import { Badge } from '../ui/Badge';

export const SavedResearchModal: React.FC = () => {
  const { savedResearch } = useChat();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (id: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (savedResearch.length === 0) {
    return (
      <div className="py-12 text-center space-y-3">
        <Bookmark className="w-10 h-10 mx-auto text-muted-foreground opacity-50" />
        <h3 className="text-sm font-semibold text-foreground">No Saved Research Items</h3>
        <p className="text-xs text-muted-foreground max-w-sm mx-auto">
          Click the "Save" button on any AI research response to store key insights here for quick reference.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
      {savedResearch.map((item) => (
        <div key={item.id} className="rounded-xl border border-border bg-card p-4 space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-foreground truncate pr-2">{item.title}</h4>
            <button
              onClick={() => handleCopy(item.id, item.content)}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground p-1"
            >
              {copiedId === item.id ? (
                <Check className="w-3.5 h-3.5 text-emerald-500" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          </div>

          <div className="max-h-48 overflow-y-auto text-xs bg-muted/40 p-3 rounded-lg border border-border">
            <MarkdownRenderer content={item.content} />
          </div>

          <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border/40">
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>{item.savedAt}</span>
            </div>
            <div className="flex items-center gap-1">
              {item.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-[10px] py-0 px-1.5">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Bot, User, Copy, Check, RotateCcw, Bookmark, Globe, Brain, Download, Loader2 } from 'lucide-react';
import { ChatMessage } from '../../types/research';
import { MarkdownRenderer } from './MarkdownRenderer';
import { useChat } from '../../hooks/useChat';
import { useToast } from '../../hooks/useToast';
import { cn } from '../../lib/utils';
import { Badge } from '../ui/Badge';
import { exportToPDF } from '../../utils/pdfExport';

export interface ChatMessageItemProps {
  message: ChatMessage;
}

export const ChatMessageItem: React.FC<ChatMessageItemProps> = ({ message }) => {
  const [copied, setCopied] = useState(false);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const { regenerateResponse, saveResearchItem } = useChat();
  const { success, error } = useToast();

  const isUser = message.role === 'user';

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    const titleSnippet = message.content.slice(0, 40) + '...';
    saveResearchItem(titleSnippet, message.content);
    success('Saved to research library');
  };

  const handleDownloadPDF = async () => {
    if (!message.content) return;
    try {
      setIsExportingPDF(true);
      const filename = `Lead_Report_${new Date().toISOString().slice(0, 10)}.pdf`;
      await exportToPDF(message.content, filename);
      success('PDF report downloaded successfully');
    } catch (err: any) {
      console.error('PDF Export Error:', err);
      error('Failed to generate PDF download');
    } finally {
      setIsExportingPDF(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={cn(
        'group flex gap-3 sm:gap-4 p-4 sm:p-6 rounded-2xl transition-all my-2',
        isUser
          ? 'bg-muted/40 border border-border/40 ml-auto max-w-3xl'
          : 'bg-card border border-border/80 shadow-xs w-full'
      )}
    >
      {/* Role Avatar */}
      <div
        className={cn(
          'flex h-9 w-9 items-center justify-center rounded-xl font-semibold text-xs shrink-0 shadow-sm',
          isUser
            ? 'bg-secondary text-secondary-foreground border border-border'
            : 'bg-primary text-primary-foreground'
        )}
      >
        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
      </div>

      {/* Content & Metadata */}
      <div className="flex-1 space-y-2 overflow-hidden">
        {/* Header Metadata */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-foreground">
              {isUser ? 'You' : 'AI Research Assistant'}
            </span>
            <span className="text-[10px] text-muted-foreground">{message.timestamp}</span>

            {!isUser && message.deepResearchUsed && (
              <Badge variant="info" className="text-[10px] py-0 px-1.5 gap-1">
                <Globe className="w-2.5 h-2.5" /> Deep Research
              </Badge>
            )}

            {!isUser && message.thinkingModeUsed && (
              <Badge variant="primary" className="text-[10px] py-0 px-1.5 gap-1">
                <Brain className="w-2.5 h-2.5" /> Chain of Thought
              </Badge>
            )}
          </div>
        </div>

        {/* Message Content */}
        {isUser ? (
          <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">{message.content}</p>
        ) : (
          <div>
            <MarkdownRenderer content={message.content} />
            {message.isStreaming && (
              <div className="inline-flex items-center gap-1 mt-2 text-xs font-semibold text-primary animate-pulse">
                <span className="w-2 h-2 rounded-full bg-primary" />
                <span>Thinking & Streaming Output...</span>
              </div>
            )}
          </div>
        )}

        {/* Action Toolbar for AI Messages */}
        {!isUser && !message.isStreaming && message.content && (
          <div className="flex items-center gap-2 pt-2 opacity-80 group-hover:opacity-100 transition-opacity border-t border-border/30 flex-wrap">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer"
              title="Copy response markdown"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>

            <button
              onClick={handleDownloadPDF}
              disabled={isExportingPDF}
              className="flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold bg-primary/10 text-primary hover:bg-primary/20 transition-colors cursor-pointer disabled:opacity-50"
              title="Download as PDF document"
            >
              {isExportingPDF ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5" />
              )}
              <span>{isExportingPDF ? 'Exporting PDF...' : 'Download PDF'}</span>
            </button>

            <button
              onClick={() => regenerateResponse(message.id)}
              className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer"
              title="Regenerate AI output"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Regenerate</span>
            </button>

            <button
              onClick={handleSave}
              className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer"
              title="Save to Research Library"
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>Save</span>
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

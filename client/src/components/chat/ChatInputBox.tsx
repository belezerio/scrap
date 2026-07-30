import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Square, Mic, MicOff, Paperclip, Globe, Brain, ChevronDown, Sparkles, FileText, X } from 'lucide-react';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';
import { useChat } from '../../hooks/useChat';
import { useActivity } from '../../hooks/useActivity';
import { AIModel } from '../../types/research';
import { cn } from '../../lib/utils';

export interface ChatInputBoxProps {
  onSend: (text: string) => void;
  isLoading?: boolean;
}

export const ChatInputBox: React.FC<ChatInputBoxProps> = ({ onSend, isLoading }) => {
  const [text, setText] = useState<string>('');
  const [attachedFile, setAttachedFile] = useState<{ name: string; content: string } | null>(null);
  const [showModelMenu, setShowModelMenu] = useState<boolean>(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { selectedModel, setSelectedModel, deepResearch, setDeepResearch, thinkingMode, setThinkingMode, stopResponse } =
    useChat();
  const { isRunning } = useActivity();

  // Voice Speech Recognition Hook
  const { isListening, hasSupport, toggleListening } = useSpeechRecognition((transcript) => {
    setText((prev) => (prev ? `${prev} ${transcript}` : transcript));
  });

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  }, [text]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    const trimmed = text.trim();
    if ((!trimmed && !attachedFile) || isRunning) return;

    let fullPrompt = trimmed;
    if (attachedFile) {
      fullPrompt = `[Attached Document: ${attachedFile.name}]\n\n${attachedFile.content}\n\n[User Instruction]\n${trimmed}`;
    }

    onSend(fullPrompt);
    setText('');
    setAttachedFile(null);

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setAttachedFile({ name: file.name, content });
    };
    reader.readAsText(file);
  };

  const models: { id: AIModel; label: string; desc: string }[] = [
    { id: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash', desc: 'Fastest & smartest for everyday research' },
    { id: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro', desc: 'Deep reasoning with massive context window' },
    { id: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash', desc: 'Reliable & fast general-purpose model' },
    { id: 'gemini-2.0-flash-lite', label: 'Gemini 2.0 Flash Lite', desc: 'Lightweight & cost-efficient' },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto px-4 pb-4">
      <div className="relative rounded-2xl border border-border/80 bg-card/90 shadow-xl backdrop-blur-md transition-all focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/20">
        {/* Attached File Preview */}
        {attachedFile && (
          <div className="flex items-center justify-between px-4 pt-3 text-xs">
            <div className="inline-flex items-center gap-2 rounded-lg bg-primary/10 border border-primary/20 px-3 py-1 text-primary font-medium">
              <FileText className="w-3.5 h-3.5" />
              <span>{attachedFile.name}</span>
            </div>
            <button
              onClick={() => setAttachedFile(null)}
              className="text-muted-foreground hover:text-foreground p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Text Input Area */}
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask anything or let AI scrape the web..."
          rows={1}
          className="w-full resize-none border-0 bg-transparent px-4 pt-4 pb-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-0 min-h-[52px]"
        />

        {/* Bottom Controls Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/40 px-3 py-2 text-xs">
          {/* Left Toggles & Model Selector */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Model Selector Menu */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowModelMenu((prev) => !prev)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-muted/50 px-2.5 py-1 font-medium text-foreground hover:bg-accent transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                <span className="truncate max-w-[120px] sm:max-w-none">
                  {models.find((m) => m.id === selectedModel)?.label}
                </span>
                <ChevronDown className="w-3 h-3 text-muted-foreground" />
              </button>

              {showModelMenu && (
                <div className="absolute bottom-full left-0 mb-2 w-64 rounded-xl border border-border bg-card p-1 shadow-2xl z-50 space-y-1">
                  {models.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => {
                        setSelectedModel(m.id);
                        setShowModelMenu(false);
                      }}
                      className={cn(
                        'w-full text-left rounded-lg p-2 transition-colors cursor-pointer',
                        selectedModel === m.id ? 'bg-primary/10 text-primary font-semibold' : 'hover:bg-accent'
                      )}
                    >
                      <div className="text-xs font-semibold">{m.label}</div>
                      <div className="text-[10px] text-muted-foreground">{m.desc}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Deep Research Toggle */}
            <button
              type="button"
              onClick={() => setDeepResearch((prev) => !prev)}
              className={cn(
                'inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 font-medium transition-all cursor-pointer',
                deepResearch
                  ? 'border-blue-500/40 bg-blue-500/10 text-blue-600 dark:text-blue-400'
                  : 'border-border bg-muted/40 text-muted-foreground hover:text-foreground'
              )}
              title="Toggle Web Scraping & Deep Web Search"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Deep Research</span>
            </button>

            {/* Thinking Mode Toggle */}
            <button
              type="button"
              onClick={() => setThinkingMode((prev) => !prev)}
              className={cn(
                'inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 font-medium transition-all cursor-pointer',
                thinkingMode
                  ? 'border-purple-500/40 bg-purple-500/10 text-purple-600 dark:text-purple-400'
                  : 'border-border bg-muted/40 text-muted-foreground hover:text-foreground'
              )}
              title="Toggle Chain-of-Thought Reasoning"
            >
              <Brain className="w-3.5 h-3.5" />
              <span>Thinking Mode</span>
            </button>
          </div>

          {/* Right Action Icons & Send Button */}
          <div className="flex items-center gap-2">
            {/* File Upload Button */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
              accept=".txt,.md,.json,.csv"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer"
              title="Upload text or markdown document"
            >
              <Paperclip className="w-4 h-4" />
            </button>

            {/* Voice Speech Button */}
            {hasSupport && (
              <button
                type="button"
                onClick={toggleListening}
                className={cn(
                  'rounded-lg p-2 transition-all cursor-pointer',
                  isListening
                    ? 'bg-destructive text-destructive-foreground animate-pulse'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                )}
                title={isListening ? 'Listening... Click to stop' : 'Voice Speech Input'}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
            )}

            {/* Send / Stop Button */}
            {isRunning ? (
              <motion.button
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={stopResponse}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90 transition-colors cursor-pointer"
                title="Stop Response"
              >
                <Square className="w-4 h-4 fill-current" />
              </motion.button>
            ) : (
              <motion.button
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={handleSubmit}
                disabled={(!text.trim() && !attachedFile) || isLoading}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 disabled:opacity-50 disabled:pointer-events-none transition-colors cursor-pointer"
                title="Send Research Query"
              >
                <Send className="w-4 h-4" />
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

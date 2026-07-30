import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Compass } from 'lucide-react';
import { PromptSuggestions } from './PromptSuggestions';

interface ChatWelcomeHeroProps {
  onSelectPrompt: (prompt: string) => void;
}

export const ChatWelcomeHero: React.FC<ChatWelcomeHeroProps> = ({ onSelectPrompt }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 py-8 text-center space-y-8 max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="space-y-4"
      >
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary shadow-xs">
          <Sparkles className="w-4 h-4 animate-pulse" />
          <span>Next-Gen Full-Stack AI Research Engine</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground leading-tight">
          What would you like to <span className="bg-gradient-to-r from-primary via-indigo-500 to-purple-600 bg-clip-text text-transparent">research today?</span>
        </h1>

        <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto leading-relaxed">
          Ask complex questions, synthesize web datasets with Apify actors, and generate structured reports powered by Gemini 2.5.
        </p>
      </motion.div>

      <div className="w-full flex flex-col items-center space-y-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          <Compass className="w-3.5 h-3.5" />
          <span>Prompt Templates & Suggestions</span>
        </div>
        <PromptSuggestions onSelectPrompt={onSelectPrompt} />
      </div>
    </div>
  );
};

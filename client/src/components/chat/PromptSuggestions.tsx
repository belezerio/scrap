import React from 'react';
import { motion } from 'framer-motion';
import { Search, Code2, Globe, Cpu } from 'lucide-react';

interface PromptSuggestionsProps {
  onSelectPrompt: (prompt: string) => void;
}

export const PromptSuggestions: React.FC<PromptSuggestionsProps> = ({ onSelectPrompt }) => {
  const suggestions = [
    {
      title: 'Market & Competitor Analysis',
      subtitle: 'Analyze key industry trends and technical differentiators.',
      prompt: 'Perform a comprehensive market analysis of modern AI coding assistants comparing performance, pricing, and architectural tradeoffs.',
      icon: <Search className="w-5 h-5 text-indigo-500" />,
    },
    {
      title: 'Full-Stack Tech Evaluation',
      subtitle: 'Evaluate backend performance & database latency.',
      prompt: 'Compare Supabase vs PostgreSQL + Prisma vs DynamoDB for a high-concurrency microservice application.',
      icon: <Code2 className="w-5 h-5 text-emerald-500" />,
    },
    {
      title: 'Deep Web Content Research',
      subtitle: 'Scrape and synthesize multiple technical documents.',
      prompt: 'Research recent breakthroughs in Large Language Model reasoning architectures and context window optimizations.',
      icon: <Globe className="w-5 h-5 text-blue-500" />,
    },
    {
      title: 'System Design & Scalability',
      subtitle: 'Draft architecture blueprints & component schemas.',
      prompt: 'Design a fault-tolerant, streaming AI agent pipeline supporting WebSockets, background queue workers, and rate limiting.',
      icon: <Cpu className="w-5 h-5 text-purple-500" />,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-3xl">
      {suggestions.map((item, index) => (
        <motion.button
          key={item.title}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.08 }}
          onClick={() => onSelectPrompt(item.prompt)}
          className="group flex flex-col items-start p-4 rounded-2xl border border-border/80 bg-card/80 hover:bg-card hover:border-primary/40 hover:shadow-md transition-all text-left cursor-pointer backdrop-blur-xs"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-muted/60 group-hover:scale-110 transition-transform">
              {item.icon}
            </div>
            <span className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">
              {item.title}
            </span>
          </div>
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            {item.subtitle}
          </p>
        </motion.button>
      ))}
    </div>
  );
};

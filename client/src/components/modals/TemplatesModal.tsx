import React from 'react';
import { ArrowRight } from 'lucide-react';
import { useChat } from '../../hooks/useChat';
import { useModal } from '../../hooks/useModal';

export const TemplatesModal: React.FC = () => {
  const { sendMessage, createNewChat } = useChat();
  const { closeModal } = useModal();

  const templates = [
    {
      title: 'Competitive Feature Analysis Matrix',
      category: 'Product Strategy',
      prompt: 'Perform a comprehensive competitive matrix comparing top 3 AI products in developer tooling. Include feature parity, pricing models, latency benchmarks, and architectural design patterns in tabular markdown format.',
    },
    {
      title: 'Full-Stack Architecture Security Audit',
      category: 'System Engineering',
      prompt: 'Conduct a thorough security evaluation for a Node.js Express & React application. Detail JWT storage security, CORS policies, SQL/NoSQL injection mitigations, and Zod input validation best practices.',
    },
    {
      title: 'API Performance & Latency Benchmark',
      category: 'Backend & Cloud',
      prompt: 'Analyze high-throughput REST vs GraphQL vs WebSockets streaming architectures. Provide concrete pros/cons, payload size overheads, and code examples for each approach.',
    },
    {
      title: 'Academic Literature Review Summary',
      category: 'Deep Research',
      prompt: 'Synthesize the state-of-the-art developments in AI agent orchestration frameworks. Highlight autonomous planning, reflection loops, memory persistence, and tool invocation strategies.',
    },
  ];

  const handleApplyTemplate = (prompt: string) => {
    closeModal();
    createNewChat();
    setTimeout(() => {
      sendMessage(prompt);
    }, 100);
  };

  return (
    <div className="space-y-3">
      {templates.map((tpl) => (
        <div
          key={tpl.title}
          onClick={() => handleApplyTemplate(tpl.prompt)}
          className="group rounded-xl border border-border bg-card p-4 space-y-2 hover:border-primary/40 hover:shadow-md transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-primary uppercase tracking-wider bg-primary/10 px-2 py-0.5 rounded-full">
              {tpl.category}
            </span>
            <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
          </div>
          <h4 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
            {tpl.title}
          </h4>
          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{tpl.prompt}</p>
        </div>
      ))}
    </div>
  );
};

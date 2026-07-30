import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Check, Copy } from 'lucide-react';
import { cn } from '../../lib/utils';

interface CodeBlockProps {
  language?: string;
  code: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ language, code }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative my-4 rounded-xl border border-border bg-slate-950 text-slate-100 dark:bg-slate-900 shadow-md overflow-hidden font-mono text-xs">
      <div className="flex items-center justify-between px-4 py-2 bg-slate-900/80 border-b border-slate-800 text-slate-400">
        <span className="text-[11px] font-sans font-semibold uppercase">{language || 'code'}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 rounded-md px-2 py-1 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>
      <pre className="p-4 overflow-x-auto leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  );
};

export const MarkdownRenderer: React.FC<{ content: string; className?: string }> = ({ content, className }) => {
  return (
    <div className={cn('prose dark:prose-invert max-w-none text-sm leading-relaxed space-y-3', className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ className: codeClassName, children }) {
            const match = /language-(\w+)/.exec(codeClassName || '');
            const codeString = String(children).replace(/\n$/, '');

            if (match || (codeString.includes('\n') && !codeClassName)) {
              return <CodeBlock language={match ? match[1] : 'text'} code={codeString} />;
            }
            return (
              <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-primary font-medium">
                {children}
              </code>
            );
          },
          table({ children }) {
            return (
              <div className="my-4 overflow-x-auto rounded-xl border border-border shadow-xs">
                <table className="w-full text-left text-xs border-collapse">{children}</table>
              </div>
            );
          },
          thead({ children }) {
            return <thead className="bg-muted/80 text-foreground font-semibold border-b border-border">{children}</thead>;
          },
          th({ children }) {
            return <th className="px-4 py-2.5 font-semibold">{children}</th>;
          },
          td({ children }) {
            return <td className="px-4 py-2 border-t border-border/50 text-muted-foreground">{children}</td>;
          },
          blockquote({ children }) {
            return (
              <blockquote className="border-l-4 border-primary/60 pl-4 py-1 my-3 text-muted-foreground italic bg-primary/5 rounded-r-lg">
                {children}
              </blockquote>
            );
          },
          ul({ children }) {
            return <ul className="list-disc list-inside space-y-1 my-2 pl-2">{children}</ul>;
          },
          ol({ children }) {
            return <ol className="list-decimal list-inside space-y-1 my-2 pl-2">{children}</ol>;
          },
          h1({ children }) {
            return <h1 className="text-xl font-extrabold tracking-tight text-foreground mt-4 mb-2">{children}</h1>;
          },
          h2({ children }) {
            return <h2 className="text-lg font-bold tracking-tight text-foreground mt-3 mb-2">{children}</h2>;
          },
          h3({ children }) {
            return <h3 className="text-base font-semibold text-foreground mt-3 mb-1">{children}</h3>;
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react';
import { useChat } from '../../hooks/useChat';
import { AIModel } from '../../types/research';
import { Button } from '../ui/Button';
import { apiClient } from '../../lib/api-client';

export const SettingsModal: React.FC = () => {
  const { selectedModel, setSelectedModel, deepResearch, setDeepResearch, thinkingMode, setThinkingMode } = useChat();
  const [backendHealth, setBackendHealth] = useState<'checking' | 'online' | 'offline'>('checking');
  const [latency, setLatency] = useState<number | null>(null);

  const checkHealth = async () => {
    setBackendHealth('checking');
    const start = performance.now();
    try {
      await apiClient.get('/health');
      const end = performance.now();
      setLatency(Math.round(end - start));
      setBackendHealth('online');
    } catch (err) {
      setBackendHealth('offline');
      setLatency(null);
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  return (
    <div className="space-y-6 text-sm">
      {/* Backend API Status */}
      <div className="rounded-xl border border-border bg-muted/40 p-4 space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-foreground">Backend Express API Status</span>
          <Button variant="outline" size="sm" onClick={checkHealth} leftIcon={<RefreshCw className="w-3 h-3" />}>
            Check Status
          </Button>
        </div>
        <div className="flex items-center gap-2 text-xs">
          {backendHealth === 'checking' && <span className="text-muted-foreground animate-pulse">Checking connectivity...</span>}
          {backendHealth === 'online' && (
            <span className="flex items-center gap-1.5 font-medium text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-4 h-4" /> Connected to http://localhost:5000/api/v1 ({latency}ms)
            </span>
          )}
          {backendHealth === 'offline' && (
            <span className="flex items-center gap-1.5 font-medium text-destructive">
              <AlertTriangle className="w-4 h-4" /> Disconnected. Ensure Express server is running.
            </span>
          )}
        </div>
      </div>

      {/* Model Selection */}
      <div className="space-y-2">
        <label className="block text-xs font-bold uppercase tracking-wider text-foreground/80">Default AI Model</label>
        <select
          value={selectedModel}
          onChange={(e) => setSelectedModel(e.target.value as AIModel)}
          className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="gemini-2.5-flash">Gemini 2.5 Flash (Fastest & Smartest)</option>
          <option value="gemini-2.5-pro">Gemini 2.5 Pro (Deep Reasoning)</option>
          <option value="gemini-2.0-flash">Gemini 2.0 Flash (Reliable & Fast)</option>
          <option value="gemini-2.0-flash-lite">Gemini 2.0 Flash Lite (Lightweight)</option>
        </select>
      </div>

      {/* Feature Toggles */}
      <div className="space-y-3 pt-2 border-t border-border">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-semibold text-foreground text-xs">Deep Research Mode</div>
            <div className="text-[11px] text-muted-foreground">Scrape live web sources via Apify actors</div>
          </div>
          <input
            type="checkbox"
            checked={deepResearch}
            onChange={(e) => setDeepResearch(e.target.checked)}
            className="h-4 w-4 rounded border-input text-primary focus:ring-ring cursor-pointer"
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <div className="font-semibold text-foreground text-xs">Thinking Mode</div>
            <div className="text-[11px] text-muted-foreground">Inject structured chain-of-thought reasoning prompts</div>
          </div>
          <input
            type="checkbox"
            checked={thinkingMode}
            onChange={(e) => setThinkingMode(e.target.checked)}
            className="h-4 w-4 rounded border-input text-primary focus:ring-ring cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
};

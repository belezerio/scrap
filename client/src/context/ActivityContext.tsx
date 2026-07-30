import React, { createContext, useState, useCallback, useEffect } from 'react';
import { ActivityMetrics, ActivityLog } from '../types/research';

interface ActivityContextType extends ActivityMetrics {
  startActivity: (actorName?: string) => void;
  updateProgress: (progress: number, statusMsg?: string) => void;
  addLog: (message: string, level?: ActivityLog['level']) => void;
  addTokens: (promptTokens: number, completionTokens: number) => void;
  stopActivity: (success?: boolean) => void;
  resetActivity: () => void;
}

export const ActivityContext = createContext<ActivityContextType | undefined>(undefined);

export const ActivityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [metrics, setMetrics] = useState<ActivityMetrics>({
    isRunning: false,
    statusMessage: 'Ready for research tasks',
    progress: 0,
    currentActor: 'apify/website-content-crawler',
    executionTime: 0,
    datasetSize: '0 KB',
    apiStatus: 'Idle',
    tokens: { prompt: 0, completion: 0, total: 0 },
    logs: [
      {
        id: '1',
        timestamp: new Date().toLocaleTimeString(),
        level: 'info',
        message: 'AI Research Assistant initialized & connected to Gemini API backend.',
      },
    ],
  });

  // Timer effect for execution duration
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (metrics.isRunning) {
      interval = setInterval(() => {
        setMetrics((prev) => ({ ...prev, executionTime: prev.executionTime + 1 }));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [metrics.isRunning]);

  const addLog = useCallback((message: string, level: ActivityLog['level'] = 'info') => {
    const newLog: ActivityLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      level,
      message,
    };
    setMetrics((prev) => ({
      ...prev,
      logs: [newLog, ...prev.logs.slice(0, 49)], // Keep top 50 logs
    }));
  }, []);

  const startActivity = useCallback((actorName = 'apify/website-content-crawler') => {
    setMetrics((prev) => ({
      ...prev,
      isRunning: true,
      statusMessage: 'Initiating AI research pipeline...',
      progress: 10,
      currentActor: actorName,
      executionTime: 0,
      datasetSize: '12 KB',
      apiStatus: 'Active',
    }));
    addLog(`Task launched with actor [${actorName}]`, 'info');
  }, [addLog]);

  const updateProgress = useCallback((progress: number, statusMsg?: string) => {
    setMetrics((prev) => ({
      ...prev,
      progress,
      statusMessage: statusMsg || prev.statusMessage,
      datasetSize: `${(progress * 42.5).toFixed(1)} KB`,
    }));
    if (statusMsg) {
      addLog(statusMsg, 'info');
    }
  }, [addLog]);

  const addTokens = useCallback((promptTokens: number, completionTokens: number) => {
    setMetrics((prev) => {
      const p = prev.tokens.prompt + promptTokens;
      const c = prev.tokens.completion + completionTokens;
      return {
        ...prev,
        tokens: {
          prompt: p,
          completion: c,
          total: p + c,
        },
      };
    });
  }, []);

  const stopActivity = useCallback((success = true) => {
    setMetrics((prev) => ({
      ...prev,
      isRunning: false,
      progress: 100,
      statusMessage: success ? 'Task completed successfully' : 'Task aborted',
      apiStatus: success ? 'Success' : 'Error',
    }));
    addLog(success ? 'Research process finished cleanly.' : 'Research task stopped.', success ? 'success' : 'warn');
  }, [addLog]);

  const resetActivity = useCallback(() => {
    setMetrics({
      isRunning: false,
      statusMessage: 'Ready for research tasks',
      progress: 0,
      currentActor: 'apify/website-content-crawler',
      executionTime: 0,
      datasetSize: '0 KB',
      apiStatus: 'Idle',
      tokens: { prompt: 0, completion: 0, total: 0 },
      logs: [
        {
          id: `log_init_${Date.now()}`,
          timestamp: new Date().toLocaleTimeString(),
          level: 'info',
          message: 'Activity log reset.',
        },
      ],
    });
  }, []);

  return (
    <ActivityContext.Provider
      value={{
        ...metrics,
        startActivity,
        updateProgress,
        addLog,
        addTokens,
        stopActivity,
        resetActivity,
      }}
    >
      {children}
    </ActivityContext.Provider>
  );
};

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Clock, Database, Terminal, Cpu, Zap, ChevronRight } from 'lucide-react';
import { useActivity } from '../../hooks/useActivity';
import { cn } from '../../lib/utils';
import { Badge } from '../ui/Badge';

export interface RightActivityPanelProps {
  isOpen: boolean;
  onToggle: () => void;
}

export const RightActivityPanel: React.FC<RightActivityPanelProps> = ({ isOpen, onToggle }) => {
  const {
    statusMessage,
    progress,
    currentActor,
    executionTime,
    datasetSize,
    apiStatus,
    tokens,
    logs,
  } = useActivity();

  return (
    <AnimatePresence mode="wait">
      <motion.aside
        initial={false}
        animate={{ width: isOpen ? 320 : 0, opacity: isOpen ? 1 : 0 }}
        transition={{ duration: 0.25, ease: 'easeInOut' }}
        className={cn(
          'relative h-full border-l border-border/80 bg-card/90 flex flex-col justify-between overflow-hidden shadow-sm backdrop-blur-md z-30 shrink-0',
          !isOpen && 'pointer-events-none'
        )}
      >
        <div className="p-4 space-y-4 flex-1 flex flex-col overflow-hidden">
          {/* Top Title Bar */}
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-foreground">
              <Activity className="w-4 h-4 text-primary animate-pulse" />
              <span>Live Research Monitor</span>
            </div>
            <button
              onClick={onToggle}
              className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer"
              title="Collapse Monitor"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Running Task Status Card */}
          <div className="rounded-xl border border-border bg-muted/40 p-3.5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-foreground">Active Task</span>
              <Badge
                variant={
                  apiStatus === 'Active'
                    ? 'info'
                    : apiStatus === 'Success'
                    ? 'success'
                    : apiStatus === 'Error'
                    ? 'danger'
                    : 'secondary'
                }
                className="text-[10px]"
              >
                {apiStatus}
              </Badge>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed font-medium">
              {statusMessage}
            </p>

            {/* Progress Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-semibold text-muted-foreground">
                <span>Progress</span>
                <span>{progress}%</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary via-indigo-500 to-emerald-400 transition-all duration-300 rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="rounded-xl border border-border bg-background/50 p-2.5 space-y-1">
              <div className="flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground">
                <Cpu className="w-3.5 h-3.5 text-blue-500" />
                <span>Actor Engine</span>
              </div>
              <p className="font-mono text-[11px] font-bold text-foreground truncate" title={currentActor}>
                {currentActor.split('/')[1] || currentActor}
              </p>
            </div>

            <div className="rounded-xl border border-border bg-background/50 p-2.5 space-y-1">
              <div className="flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground">
                <Clock className="w-3.5 h-3.5 text-amber-500" />
                <span>Execution Time</span>
              </div>
              <p className="font-mono text-[11px] font-bold text-foreground">{executionTime}s</p>
            </div>

            <div className="rounded-xl border border-border bg-background/50 p-2.5 space-y-1">
              <div className="flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground">
                <Database className="w-3.5 h-3.5 text-emerald-500" />
                <span>Dataset Size</span>
              </div>
              <p className="font-mono text-[11px] font-bold text-foreground">{datasetSize}</p>
            </div>

            <div className="rounded-xl border border-border bg-background/50 p-2.5 space-y-1">
              <div className="flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground">
                <Zap className="w-3.5 h-3.5 text-purple-500" />
                <span>Total Tokens</span>
              </div>
              <p className="font-mono text-[11px] font-bold text-foreground">{tokens.total.toLocaleString()}</p>
            </div>
          </div>

          {/* Real-Time Log Terminal */}
          <div className="flex-1 flex flex-col rounded-xl border border-border bg-slate-950 text-slate-100 p-3 font-mono text-[11px] overflow-hidden space-y-2">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2 text-slate-400">
              <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider">
                <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                <span>Stream Logs</span>
              </div>
              <span className="text-[10px] text-slate-500">{logs.length} entries</span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 leading-relaxed">
              {logs.map((log) => (
                <div key={log.id} className="flex gap-2">
                  <span className="text-slate-500 shrink-0">[{log.timestamp}]</span>
                  <span
                    className={cn(
                      log.level === 'error' && 'text-red-400 font-semibold',
                      log.level === 'warn' && 'text-amber-400',
                      log.level === 'success' && 'text-emerald-400 font-semibold',
                      log.level === 'info' && 'text-slate-300'
                    )}
                  >
                    {log.message}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.aside>
    </AnimatePresence>
  );
};

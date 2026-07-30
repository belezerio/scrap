import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import { ToastMessage } from '../../types';
import { cn } from '../../lib/utils';

export interface ToastProps {
  toast: ToastMessage;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />,
    info: <Info className="w-5 h-5 text-blue-500 flex-shrink-0" />,
  };

  const borders = {
    success: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-950 dark:text-emerald-100',
    error: 'border-destructive/30 bg-destructive/10 text-destructive-950 dark:text-destructive-100',
    warning: 'border-amber-500/30 bg-amber-500/10 text-amber-950 dark:text-amber-100',
    info: 'border-blue-500/30 bg-blue-500/10 text-blue-950 dark:text-blue-100',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      className={cn(
        'pointer-events-auto flex items-start gap-3 rounded-xl border p-4 shadow-lg backdrop-blur-md transition-all',
        borders[toast.type]
      )}
    >
      {icons[toast.type]}
      <div className="flex-1 space-y-1">
        {toast.title && <h4 className="text-xs font-bold uppercase tracking-wider">{toast.title}</h4>}
        <p className="text-sm leading-relaxed">{toast.message}</p>
      </div>
      <button
        onClick={onClose}
        className="rounded-lg p-1 opacity-70 hover:opacity-100 transition-opacity"
        aria-label="Dismiss toast"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
};

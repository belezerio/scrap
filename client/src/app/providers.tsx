import React from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '../lib/query-client';
import { ThemeProvider } from '../context/ThemeContext';
import { ToastProvider } from '../context/ToastContext';
import { ModalProvider } from '../context/ModalContext';
import { ActivityProvider } from '../context/ActivityContext';
import { ConversationProvider } from '../context/ConversationProvider';
import { ChatProvider } from '../context/ChatContext';
import { ErrorBoundary } from '../components/common/ErrorBoundary';

interface ProvidersProps {
  children: React.ReactNode;
}

export const AppProviders: React.FC<ProvidersProps> = ({ children }) => {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <ToastProvider>
            <ModalProvider>
              <ActivityProvider>
                <ConversationProvider>
                  <ChatProvider>{children}</ChatProvider>
                </ConversationProvider>
              </ActivityProvider>
            </ModalProvider>
          </ToastProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

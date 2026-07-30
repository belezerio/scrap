import { useMutation } from '@tanstack/react-query';
import { apiClient } from '../../lib/api-client';
import { useToast } from '../../hooks/useToast';
import { ApiResponse } from '../../types';

export interface GenerateTextPayload {
  prompt: string;
  model?: string;
  temperature?: number;
  systemInstruction?: string;
}

export interface ChatMessage {
  role: 'user' | 'model' | 'system';
  content: string;
}

export interface ChatCompletionPayload {
  messages: ChatMessage[];
  model?: string;
}

export const useGenerateTextMutation = () => {
  const { error } = useToast();

  return useMutation({
    mutationFn: async (payload: GenerateTextPayload) => {
      const response = await apiClient.post<ApiResponse<{ text: string }>>('/ai/generate-text', payload);
      return response.data.data;
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'Failed to generate text response';
      error(msg, 'AI Service Error');
    },
  });
};

export const useChatCompletionMutation = () => {
  const { error } = useToast();

  return useMutation({
    mutationFn: async (payload: ChatCompletionPayload) => {
      const response = await apiClient.post<ApiResponse<{ message: string }>>('/ai/chat', payload);
      return response.data.data;
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'Failed to execute AI chat completion';
      error(msg, 'AI Service Error');
    },
  });
};

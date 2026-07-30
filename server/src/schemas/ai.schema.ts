import { z } from 'zod';

export const generateTextSchema = z.object({
  body: z.object({
    prompt: z.string().min(1, 'Prompt is required'),
    model: z.string().optional().default('gemini-2.5-flash'),
    temperature: z.number().min(0).max(2).optional(),
    systemInstruction: z.string().optional(),
  }),
});

export const chatCompletionSchema = z.object({
  body: z.object({
    messages: z.array(
      z.object({
        role: z.enum(['user', 'model', 'system']),
        content: z.string().min(1),
      })
    ).min(1, 'At least one message is required'),
    model: z.string().optional().default('gemini-2.5-flash'),
  }),
});

export type GenerateTextInput = z.infer<typeof generateTextSchema>['body'];
export type ChatCompletionInput = z.infer<typeof chatCompletionSchema>['body'];

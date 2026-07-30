import { Response } from 'express';
import { getGeminiClient } from '../config/gemini';
import { GenerateTextInput } from '../schemas/ai.schema';
import { AppError } from '../utils/AppError';

export class GeminiService {
  /**
   * Normalize model name — maps any legacy/unknown names to working model IDs.
   * The frontend sends the exact model name (e.g. 'gemini-2.5-flash'), so
   * most of the time no mapping is needed; this is a safety net.
   */
  private static normalizeModelName(modelName?: string): string {
    if (!modelName) return 'gemini-2.5-flash';
    // Legacy names that no longer exist
    if (modelName.startsWith('gemini-1.5')) return 'gemini-2.5-flash';
    if (modelName === 'web-hybrid-v1') return 'gemini-2.5-flash';
    return modelName;
  }

  static async generateText(input: GenerateTextInput): Promise<{ text: string }> {
    try {
      const ai = getGeminiClient();
      const modelName = this.normalizeModelName(input.model);
      const model = ai.getGenerativeModel({
        model: modelName,
        systemInstruction: input.systemInstruction,
      });

      const response = await model.generateContent(input.prompt);
      const text = response.response.text();
      return { text };
    } catch (error: any) {
      console.error('Gemini Service Error:', error);
      throw AppError.internal(error?.message || 'Failed to generate response from Gemini API');
    }
  }

  static async streamText(input: GenerateTextInput, res: Response): Promise<void> {
    try {
      const ai = getGeminiClient();
      const modelName = this.normalizeModelName(input.model);
      const model = ai.getGenerativeModel({
        model: modelName,
        systemInstruction: input.systemInstruction,
      });

      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      const resultStream = await model.generateContentStream(input.prompt);

      for await (const chunk of resultStream.stream) {
        const chunkText = chunk.text();
        res.write(`data: ${JSON.stringify({ text: chunkText })}\n\n`);
      }

      res.write(`data: [DONE]\n\n`);
      res.end();
    } catch (error: any) {
      console.error('Gemini Stream Error:', error);
      if (!res.headersSent) {
        res.status(500).json({ success: false, message: error?.message || 'Gemini Streaming Error' });
      } else {
        res.write(`data: ${JSON.stringify({ error: error?.message })}\n\n`);
        res.end();
      }
    }
  }
}

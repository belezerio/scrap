import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from './env';

export const getGeminiClient = () => {
  if (!config.GEMINI_API_KEY) {
    console.warn('⚠️ GEMINI_API_KEY is missing in environment variables.');
  }
  return new GoogleGenerativeAI(config.GEMINI_API_KEY || 'dummy_key');
};

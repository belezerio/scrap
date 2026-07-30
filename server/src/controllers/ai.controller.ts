import { Request, Response } from 'express';
import { GeminiService } from '../services/gemini.service';
import { successResponse } from '../utils/response';

export class AIController {
  static generateText = async (req: Request, res: Response): Promise<void> => {
    const result = await GeminiService.generateText(req.body);
    successResponse(res, result, 'Text generated successfully', 200);
  };

  static streamText = async (req: Request, res: Response): Promise<void> => {
    await GeminiService.streamText(req.body, res);
  };
}

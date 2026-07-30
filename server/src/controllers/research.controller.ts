import { Request, Response } from 'express';
import { ResearchService } from '../services/research.service';

export class ResearchController {
  static streamAutomatedResearch = async (req: Request, res: Response): Promise<void> => {
    const { prompt, model, forceDeepResearch } = req.body;
    await ResearchService.streamAutomatedResearch(
      { prompt, model, forceDeepResearch },
      res
    );
  };
}

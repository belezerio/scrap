import { Response } from 'express';
import { OrchestrationAgent } from './orchestrator.service';

export interface AutomatedResearchInput {
  prompt: string;
  model?: string;
  forceDeepResearch?: boolean;
}

export class ResearchService {
  static async streamAutomatedResearch(input: AutomatedResearchInput, res: Response): Promise<void> {
    await OrchestrationAgent.orchestrateAndStream(input.prompt, input.model, res);
  }
}

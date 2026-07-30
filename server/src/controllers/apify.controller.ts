import { Request, Response } from 'express';
import { ApifyService } from '../services/apify.service';
import { successResponse } from '../utils/response';

export class ApifyController {
  static runActor = async (req: Request, res: Response): Promise<void> => {
    const result = await ApifyService.runActor(req.body);
    successResponse(res, result, 'Apify actor execution started', 202);
  };

  static getDatasetItems = async (req: Request, res: Response): Promise<void> => {
    const datasetId = Array.isArray(req.params.datasetId) ? req.params.datasetId[0] : req.params.datasetId;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 100;
    const offset = req.query.offset ? parseInt(req.query.offset as string, 10) : 0;

    const result = await ApifyService.getDatasetItems(datasetId, limit, offset);
    successResponse(res, result, 'Dataset items retrieved successfully', 200);
  };
}

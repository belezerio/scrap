import { Router } from 'express';
import { ResearchController } from '../controllers/research.controller';
import { asyncHandler } from '../middlewares/async.middleware';

const router = Router();

router.post('/auto-stream', asyncHandler(ResearchController.streamAutomatedResearch));

export default router;

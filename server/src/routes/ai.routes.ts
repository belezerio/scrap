import { Router } from 'express';
import { AIController } from '../controllers/ai.controller';
import { validateRequest } from '../middlewares/validate.middleware';
import { generateTextSchema } from '../schemas/ai.schema';
import { asyncHandler } from '../middlewares/async.middleware';

const router = Router();

router.post('/generate-text', validateRequest(generateTextSchema), asyncHandler(AIController.generateText));
router.post('/stream', validateRequest(generateTextSchema), asyncHandler(AIController.streamText));

export default router;

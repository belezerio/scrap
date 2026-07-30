import { Router } from 'express';
import { ApifyController } from '../controllers/apify.controller';
import { validateRequest } from '../middlewares/validate.middleware';
import { runActorSchema, getDatasetItemsSchema } from '../schemas/apify.schema';
import { authenticateJWT } from '../middlewares/auth.middleware';
import { asyncHandler } from '../middlewares/async.middleware';

const router = Router();

router.use(authenticateJWT);

router.post('/run', validateRequest(runActorSchema), asyncHandler(ApifyController.runActor));
router.get('/dataset/:datasetId', validateRequest(getDatasetItemsSchema), asyncHandler(ApifyController.getDatasetItems));

export default router;

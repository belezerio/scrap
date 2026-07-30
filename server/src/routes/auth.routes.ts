import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { validateRequest } from '../middlewares/validate.middleware';
import { registerSchema, loginSchema } from '../schemas/auth.schema';
import { authenticateJWT } from '../middlewares/auth.middleware';
import { asyncHandler } from '../middlewares/async.middleware';

const router = Router();

router.post('/register', validateRequest(registerSchema), asyncHandler(AuthController.register));
router.post('/login', validateRequest(loginSchema), asyncHandler(AuthController.login));
router.get('/me', authenticateJWT, asyncHandler(AuthController.getProfile));

export default router;

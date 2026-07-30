import { Router } from 'express';
import authRoutes from './auth.routes';
import aiRoutes from './ai.routes';
import apifyRoutes from './apify.routes';
import researchRoutes from './research.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/ai', aiRoutes);
router.use('/apify', apifyRoutes);
router.use('/research', researchRoutes);

router.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

export default router;

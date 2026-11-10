import { Router } from 'express';
import { prisma } from '../utils/prisma';

export const healthRouter = Router();

healthRouter.get('/', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      success: true,
      message: 'Academia NG API is healthy',
      timestamp: new Date().toISOString(),
      database: 'connected',
    });
  } catch {
    res.status(503).json({
      success: false,
      message: 'Service unavailable',
      database: 'disconnected',
    });
  }
});

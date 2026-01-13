import { Router } from 'express';
import { getDailyQuote } from './consejos.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';

const router = Router();

// Endpoint: GET /api/consejos/daily
// Authenticated users only
router.get('/daily', authMiddleware, getDailyQuote);

export default router;

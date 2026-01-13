import { Router } from 'express';
import { getDailyMissions, getCompletedMissions, completeMission } from './misiones.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';

const router = Router();

// Endpoint: GET /api/misiones/daily
// Authenticated users only
router.get('/daily', authMiddleware, getDailyMissions);

// Endpoint: GET /api/misiones/completed
router.get('/completed', authMiddleware, getCompletedMissions);

// Endpoint: POST /api/misiones/:id/complete
router.post('/:id/complete', authMiddleware, completeMission);

export default router;

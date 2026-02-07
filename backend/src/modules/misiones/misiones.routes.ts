import { Router } from 'express';
import { z } from 'zod';
import { getDailyMissions, getCompletedMissions, completeMission } from './misiones.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { validateParams, uuidSchema } from '../../utils/validators';

const router = Router();

const missionIdSchema = z.object({ id: uuidSchema });

// Endpoint: GET /api/misiones/daily
// Authenticated users only
router.get('/daily', authMiddleware, getDailyMissions);

// Endpoint: GET /api/misiones/completed
router.get('/completed', authMiddleware, getCompletedMissions);

// Endpoint: POST /api/misiones/:id/complete
router.post('/:id/complete', authMiddleware, validateParams(missionIdSchema), completeMission);

export default router;

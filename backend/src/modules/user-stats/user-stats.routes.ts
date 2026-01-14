import { Router } from 'express';
import { UserStatsController } from './user-stats.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';

const router = Router();
const controller = new UserStatsController();

router.get('/me', authMiddleware, controller.getStats);
router.get('/global', authMiddleware, controller.getGlobalStats);
router.get('/leaderboard', authMiddleware, controller.getLeaderboard);
router.get('/:userId', authMiddleware, controller.getStatsById);

export default router;

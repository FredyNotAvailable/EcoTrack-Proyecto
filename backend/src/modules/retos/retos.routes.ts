import { Router } from 'express';
import { RetosController } from './retos.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';

const router = Router();
const controller = new RetosController();

// Public/Open
router.get('/', controller.getAll);

// Protected
router.get('/me', authMiddleware, controller.getMyChallenges);
router.post('/:id/join', authMiddleware, controller.join);
router.post('/:retoId/tasks/:taskId/complete', authMiddleware, controller.completeTask);

export const retosRouter = router;

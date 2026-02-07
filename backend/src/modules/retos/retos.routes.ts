import { Router } from 'express';
import { z } from 'zod';
import { RetosController } from './retos.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { validateParams, uuidSchema } from '../../utils/validators';

const router = Router();
const controller = new RetosController();

const retoIdSchema = z.object({ id: uuidSchema });
const taskCompleteSchema = z.object({ 
    retoId: uuidSchema, 
    taskId: uuidSchema 
});

// Public/Open
router.get('/', controller.getAll);

// Protected
router.get('/me', authMiddleware, controller.getMyChallenges);
router.post('/:id/join', authMiddleware, validateParams(retoIdSchema), controller.join);
router.post('/:retoId/tasks/:taskId/complete', authMiddleware, validateParams(taskCompleteSchema), controller.completeTask);

export const retosRouter = router;

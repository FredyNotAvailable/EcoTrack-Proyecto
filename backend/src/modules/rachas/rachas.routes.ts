
import { Router } from 'express';
import { RachasController } from './rachas.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';

const router = Router();
const controller = new RachasController();

router.get('/me', authMiddleware, controller.getRacha);
router.get('/:userId', authMiddleware, controller.getUserRacha);

export default router;

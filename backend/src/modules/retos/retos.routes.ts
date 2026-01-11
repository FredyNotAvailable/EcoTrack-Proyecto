import { Router } from 'express';
import { RetosController } from './retos.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';

const router = Router();
const controller = new RetosController();

// Rutas públicas
router.get('/', controller.getAll);

// Rutas protegidas
router.post('/join', authMiddleware, controller.joinChallenge);

export default router;

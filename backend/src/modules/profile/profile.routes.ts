import { Router } from 'express';
import { ProfileController } from './profile.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';

const router = Router();
const controller = new ProfileController();

// Todas las rutas de perfil requieren autenticación
// Rutas protegidas
router.get('/me', authMiddleware, controller.getMe);
router.post('/me', authMiddleware, controller.createMe);
router.put('/me', authMiddleware, controller.updateMe);
router.get('/username/:username', authMiddleware, controller.getProfileByUsername);
router.get('/:id', authMiddleware, controller.getProfileById);

export default router;

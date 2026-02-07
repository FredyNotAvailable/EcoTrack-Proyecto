import { Router } from 'express';
import { ProfileController } from './profile.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { validateBody, createProfileSchema, updateProfileSchema } from '../../utils/validators';

const router = Router();
const controller = new ProfileController();

// Todas las rutas de perfil requieren autenticación
// Rutas protegidas
router.get('/me', authMiddleware, controller.getMe);
router.post('/me', authMiddleware, validateBody(createProfileSchema), controller.createMe);
router.put('/me', authMiddleware, validateBody(updateProfileSchema), controller.updateMe);
router.get('/search', authMiddleware, controller.search);
router.get('/username/:username', authMiddleware, controller.getProfileByUsername);
router.get('/:id', authMiddleware, controller.getProfileById);

export default router;

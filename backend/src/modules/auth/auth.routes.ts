import { Router } from 'express';
import { authMiddleware, requireRole } from '../../middlewares/auth.middleware';

const router = Router();

/**
 * GET /auth/me
 * Devuelve la información del usuario autenticado extraída del JWT
 */
router.get('/me', authMiddleware, (req, res) => {
    res.json(req.user);
});

/**
 * GET /auth/admin/ping
 * Ruta protegida solo para administradores
 */
router.get('/admin/ping', authMiddleware, requireRole(['admin']), (req, res) => {
    res.json({
        message: 'Pong! Acceso concedido a administrador',
        admin_id: req.user?.id
    });
});

export default router;

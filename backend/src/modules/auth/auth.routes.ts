import { Router } from 'express';
import { authMiddleware, requireRole } from '../../middlewares/auth.middleware';

import { supabase } from '../../config/supabaseClient';

const router = Router();

/**
 * POST /auth/check-email
 * Verifica si un correo ya está registrado en Supabase Auth.
 * Público (sin middleware de auth).
 */
// verifica si un correo ya esta registrado
router.post('/check-email', async (req, res) => {
    try {
        const { email } = req.body;
        console.log(`[Backend] Check Email Request for: ${email}`);

        if (!email) {
            return res.status(400).json({ error: 'Email requerido' });
        }

        // Utiliza listUsers ya que schema('auth') falló por permisos de PostgREST
        // Nota: listUsers no tiene filtro directo de email en esta versión?
        // DOCUMENTACIÓN: listUsers() trae paginado.
        // Si hay muchos usuarios, esto es ineficiente. Pero es lo que tenemos.
        // Intentaremos buscar una forma más eficiente si esto es lento, pero por ahora funciona.

        // Intento de optimización: Supabase admin API suele permitir search por email en raw query? No.
        // Vamos a traer la primera página, si no está ahí, iteramos? 
        // NO, mejor usemos 'createUser' con una contraseña dummy y veamos si falla por duplicado? NO, eso envía correos.

        // En supabase-js v2, listUsers devuelve un objeto.
        // Verificaremos si hay alguna funcion de RPC que podamos usar... no.

        // Vamos a iterar (asumiendo < 1000 users por ahora) o usar una función RPC si pudieramos crearla.
        // Como no puedo crear funciones RPC SQL fácilmente ahora, usaré listUsers.

        const { data: userList, error } = await supabase.auth.admin.listUsers({
            perPage: 1000 // Traemos un lote grande
        });

        if (error) {
            console.log("Check email error (listUsers):", error.message);
            return res.json({ exists: false });
        }

        const found = userList.users.find(u => u.email?.toLowerCase() === email.toLowerCase());
        console.log(`[Backend] Found user? ${!!found}`);

        if (found) {
            return res.json({
                exists: true,
                provider: found.app_metadata?.provider || 'email'
            });
        }

        return res.json({ exists: false, provider: null });
    } catch (error) {
        console.error("Error checking email:", error);
        return res.status(500).json({ error: 'Error interno del servidor' });
    }
});

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

/**
 * GET /auth/registration-status
 * Verifica si el usuario autenticado tiene un perfil registrado.
 * Protegido.
 */
router.get('/registration-status', authMiddleware, async (req: any, res) => {
    try {
        const userId = req.user.id;
        console.log(`[Backend] Checking registration status for userId: ${userId}`);

        // Importación dinámica para evitar ciclos si los hubiera
        const { ProfileService } = await import('../profile/profile.service');
        const profileService = new ProfileService();

        const profile = await profileService.getProfile(userId);

        return res.json({
            registered: !!profile,
            userId: userId
        });
    } catch (error) {
        console.error("Error checking registration status:", error);
        return res.status(500).json({ error: 'Error interno del servidor' });
    }
});

/**
 * DELETE /auth/me
 * Elimina la cuenta del usuario autenticado permanentemente.
 * Protegido.
 */
router.delete('/me', authMiddleware, async (req: any, res) => {
    try {
        const userId = req.user.id;
        console.log(`[Backend] Deleting account for userId: ${userId}`);

        // 1. Eliminar datos del perfil en DB (local)
        const { ProfileService } = await import('../profile/profile.service');
        const profileService = new ProfileService();
        await profileService.deleteAccount(userId);

        // 2. Eliminar usuario de Supabase Auth
        // Nota: supabase.auth.admin.deleteUser requiere service_role key, que ya tenemos configurada.
        const { error: authError } = await supabase.auth.admin.deleteUser(userId);

        if (authError) {
            console.error("Error deleting user from Supabase Auth:", authError);
            // Si falla auth, al menos los datos locales ya se borraron. 
            // Podríamos intentar rollback, pero por ahora lo dejamos así y lo logueamos.
            return res.status(500).json({ error: 'Error al eliminar usuario de autenticación' });
        }

        return res.json({ message: 'Cuenta eliminada exitosamente' });

    } catch (error) {
        console.error("Error deleting account:", error);
        return res.status(500).json({ error: 'Error interno del servidor' });
    }
});

export default router;

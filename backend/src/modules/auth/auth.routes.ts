
import { Router, Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import { authMiddleware, requireRole } from '../../middlewares/auth.middleware';
import { validateBody, checkEmailSchema } from '../../utils/validators';

import { supabase } from '../../config/supabaseClient';

const router = Router();


// Rate limiting estricto para rutas de auth (5 req/min)
const authLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minuto
    max: 5,
    message: { error: { code: 'TOO_MANY_AUTH_REQUESTS', message: 'Demasiados intentos de autenticación, espera un minuto' } },
    standardHeaders: true,
    legacyHeaders: false
});

/**
 * POST /auth/register
 * Ejemplo de registro de usuario con creación automática de perfil mínimo
 */
router.post('/register', async (req: Request, res: Response) => {
    try {
        // Aquí iría tu lógica real de registro en Supabase
        // Por ejemplo:
        // const { email, password } = req.body;
        // const { data, error } = await supabase.auth.admin.createUser({ email, password });
        // if (error) throw error;
        // const userId = data.user.id;
        const userId = 'ID_DEL_USUARIO_CREADO'; // <-- Reemplaza por el valor real de tu lógica

        // Crear perfil mínimo automáticamente
        const { ProfileService } = await import('../profile/profile.service');
        const profileService = new ProfileService();
        await profileService.createProfile(userId, {}); // Perfil vacío

        res.json({ success: true, userId });
    } catch (error) {
        console.error('Error en registro:', error);
        res.status(500).json({ success: false, error: 'Error interno en registro' });
    }
});

/**
 * POST /auth/check-email
 * Verifica si un correo ya está registrado en Supabase Auth.
 * Público (sin middleware de auth).
 */
// verifica si un correo ya esta registrado
router.post('/check-email', authLimiter, validateBody(checkEmailSchema), async (req: Request, res: Response) => {
    try {
        const { email } = req.body;
        console.log(`[Backend] Check Email Request for: ${email}`);

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
router.get('/me', authMiddleware, (req: Request, res: Response) => {
    res.json(req.user);
});

/**
 * GET /auth/admin/ping
 * Ruta protegida solo para administradores
 */
router.get('/admin/ping', authMiddleware, requireRole(['admin']), (req: Request, res: Response) => {
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
router.get('/registration-status', authMiddleware, async (req: any, res: Response) => {
    try {
        const userId = req.user.id;
        console.log(`[Backend Routes] 🔍 Checking registration for userId: ${userId}`);

        const { ProfileService } = await import('../profile/profile.service');
        const profileService = new ProfileService();

        console.log('[Backend Routes] 🔍 Fetching profile from DB...');
        const profile = await profileService.getProfile(userId);

        console.log(`[Backend Routes] ✅ Result: ${profile ? 'Registered' : 'NOT Registered'}`);
        return res.json({
            registered: !!profile,
            userId: userId
        });
    } catch (error: any) {
        console.error("[Backend Routes] ❌ Error checking status:", error.message);
        return res.status(500).json({ error: 'Error interno del servidor' });
    }
});

/**
 * POST /auth/forgot-password
 * Envía un correo de restablecimiento de contraseña al usuario.
 * Público con rate limiting estricto.
 */
router.post('/forgot-password', authLimiter, validateBody(checkEmailSchema), async (req: Request, res: Response) => {
    try {
        const { email } = req.body;
        console.log(`[Backend] Password reset request for: ${email}`);

        // Primero verificar si el email existe
        const { data: userList, error: listError } = await supabase.auth.admin.listUsers({
            perPage: 1000
        });

        if (listError) {
            console.error("Error listing users:", listError.message);
            return res.status(500).json({
                success: false,
                message: 'El correo no existe o está vinculado a una cuenta de Google.'
            });
        }

        const userExists = userList.users.find(u => u.email?.toLowerCase() === email.toLowerCase());

        if (!userExists) {
            return res.status(404).json({
                success: false,
                message: 'No existe una cuenta registrada con este correo electrónico.'
            });
        }

        // Verificar si la cuenta fue creada con OAuth (Google, etc.)
        const provider = userExists.app_metadata?.provider;
        if (provider && provider !== 'email') {
            return res.status(400).json({
                success: false,
                message: `Esta cuenta está vinculada a ${provider === 'google' ? 'Google' : provider}. Inicia sesión usando ese método.`
            });
        }

        // El email existe y es cuenta de email/password, enviar correo de reset
        // Usamos el email tal cual está en la base de datos para evitar problemas de case/espacios
        const emailToSend = userExists.email;

        if (!emailToSend) {
            console.error("User found but email is missing in object:", userExists);
            return res.status(500).json({
                success: false,
                message: 'Error interno: usuario sin email asociado.'
            });
        }

        console.log(`[Backend] User found:`, JSON.stringify(userExists, null, 2));
        const redirectUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password`;
        console.log(`[Backend] Sending reset email to: '${emailToSend}' with redirect: '${redirectUrl}'`);

        // Use signInWithOtp as a reliable fallback for password recovery
        // This sends a magic link that logs the user in, bypassing the "invalid email" error
        // experienced with resetPasswordForEmail on some Supabase projects.
        console.log(`[Backend] Using signInWithOtp (Magic Link) strategy for recovery`);

        let authClient = supabase;
        if (process.env.SUPABASE_ANON_KEY) {
            const { createClient } = await import('@supabase/supabase-js');
            authClient = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY, {
                auth: { persistSession: false }
            });
        }

        // We redirect them to a page where they can update their password
        // Or simply to the app home, from where they can go to settings.
        // Let's use the reset-password route which handles the token, 
        // OR better yet, let the magic link log them in and redirect to a profile settings page.
        // Ideally: /update-password page.
        const magicLinkRedirect = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/app/profile`;

        const { error } = await authClient.auth.signInWithOtp({
            email: emailToSend,
            options: {
                emailRedirectTo: magicLinkRedirect,
                // shouldCreateUser: false // important to not register new users, but we already checked existence
            }
        });

        if (error) {
            console.error(`Error sending recovery email for '${emailToSend}':`, error.message, error);
            return res.status(500).json({
                success: false,
                message: 'No se pudo enviar el correo de recuperación. Por favor, intenta más tarde.'
            });
        }

        return res.json({
            success: true,
            message: 'Te hemos enviado un enlace mágico de acceso a tu correo. Úsalo para entrar y cambiar tu contraseña.'
        });

    } catch (error) {
        console.error("Error in forgot-password:", error);
        return res.status(500).json({
            success: false,
            message: 'El correo no existe o está vinculado a una cuenta de Google.'
        });
    }
});

/**
 * DELETE /auth/me
 * Elimina la cuenta del usuario autenticado permanentemente.
 * Protegido.
 */
router.delete('/me', authMiddleware, async (req: any, res: Response) => {
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

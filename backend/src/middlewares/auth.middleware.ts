import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabaseClient';

/**
 * Middleware para validar el token de Supabase Auth
 */
export const authMiddleware = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const authHeader = req.headers.authorization;
    console.log(`[Backend Auth] 🛡️ Incoming request to: ${req.path}`);

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.log('[Backend Auth] ❌ No Bearer token provided');
        return res.status(401).json({
            error: {
                code: 'UNAUTHORIZED',
                message: 'No se proporcionó un token de autenticación (Bearer token esperado)'
            }
        });
    }

    const token = authHeader.split(' ')[1];
    console.log('[Backend Auth] 🔑 Token received (length):', token.length);

    try {
        console.log('[Backend Auth] 🛰️ Validating token with Supabase...');
        const { data: { user }, error } = await supabase.auth.getUser(token);

        if (error || !user) {
            console.log('[Backend Auth] ❌ Token invalid or expired:', error?.message);
            return res.status(401).json({
                error: {
                    code: 'UNAUTHORIZED',
                    message: 'Token inválido o expirado'
                }
            });
        }

        console.log('[Backend Auth] ✅ Token valid for user:', user.email);
        // Adjuntar en req.user un objeto tipado
        req.user = {
            id: user.id,
            email: user.email,
            role: (user.app_metadata?.role as string) || 'user'
        };

        next();
    } catch (error: any) {
        console.error('[Backend Auth] 💥 Fatal error validating identity:', error.message);
    }
};

/**
 * Middleware para autorizar según roles
 */
export const requireRole = (allowedRoles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.user) {
            return res.status(401).json({
                error: {
                    code: 'UNAUTHORIZED',
                    message: 'Autenticación requerida'
                }
            });
        }

        if (!allowedRoles.includes(req.user.role || '')) {
            return res.status(403).json({
                error: {
                    code: 'FORBIDDEN',
                    message: 'No tienes permisos suficientes para acceder a este recurso'
                }
            });
        }

        next();
    };
};

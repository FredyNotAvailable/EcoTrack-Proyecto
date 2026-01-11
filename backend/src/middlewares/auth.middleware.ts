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

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            error: {
                code: 'UNAUTHORIZED',
                message: 'No se proporcionó un token de autenticación (Bearer token esperado)'
            }
        });
    }

    const token = authHeader.split(' ')[1];

    try {
        const { data: { user }, error } = await supabase.auth.getUser(token);

        if (error || !user) {
            return res.status(401).json({
                error: {
                    code: 'UNAUTHORIZED',
                    message: 'Token inválido o expirado'
                }
            });
        }

        // Adjuntar en req.user un objeto tipado
        req.user = {
            id: user.id,
            email: user.email,
            role: (user.app_metadata?.role as string) || 'user'
        };

        next();
    } catch (error) {
        return res.status(401).json({
            error: {
                code: 'UNAUTHORIZED',
                message: 'Ocurrió un error al validar la identidad'
            }
        });
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

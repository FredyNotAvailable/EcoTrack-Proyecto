import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabaseClient';

export const authMiddleware = async (
    req: any,
    res: Response,
    next: NextFunction
) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            success: false,
            message: 'No se proporcionó un token de autenticación',
        });
    }

    const token = authHeader.split(' ')[1];

    try {
        const { data: { user }, error } = await supabase.auth.getUser(token);

        if (error || !user) {
            return res.status(401).json({
                success: false,
                message: 'Token inválido o expirado',
            });
        }

        // Inyectar el usuario en la request
        req.user = user;
        next();
    } catch (error) {
        next(error);
    }
};

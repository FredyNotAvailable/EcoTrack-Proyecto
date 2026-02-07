import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

/**
 * Middleware para agregar ETags a respuestas JSON
 * Permite a clientes usar If-None-Match para evitar transferir datos sin cambios
 */
export const etagMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const originalJson = res.json.bind(res);

    res.json = function (body: any) {
        // Solo aplicar ETags a GET requests
        if (req.method !== 'GET') {
            return originalJson(body);
        }

        // Generar ETag basado en el contenido
        const content = JSON.stringify(body);
        const hash = crypto.createHash('md5').update(content).digest('hex');
        const etag = `"${hash}"`;

        // Verificar If-None-Match del cliente
        const clientEtag = req.headers['if-none-match'];
        
        if (clientEtag === etag) {
            // Datos no han cambiado, retornar 304
            res.status(304).end();
            return res;
        }

        // Establecer ETag en respuesta
        res.setHeader('ETag', etag);
        res.setHeader('Cache-Control', 'private, max-age=0, must-revalidate');
        
        return originalJson(body);
    };

    next();
};

/**
 * Middleware específico para rutas con datos estáticos (consejos, niveles)
 * Usa cache más agresivo
 */
export const staticCacheMiddleware = (maxAge: number = 3600) => {
    return (req: Request, res: Response, next: NextFunction) => {
        res.setHeader('Cache-Control', `public, max-age=${maxAge}`);
        next();
    };
};

import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Error interno del servidor';
    const errorCode = err.code || 'INTERNAL_ERROR';

    console.error(`[Error] ${req.method} ${req.path} >>`, {
        statusCode,
        message,
        code: errorCode,
        userId: (req as any).user?.id,
        timestamp: new Date().toISOString()
    });

    res.status(statusCode).json({
        success: false,
        message,
        code: errorCode,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    });
};

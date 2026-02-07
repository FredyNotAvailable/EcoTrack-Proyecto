import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';
import { ApiError } from './ApiError';

// ==========================================
// VALIDADORES COMUNES
// ==========================================

// UUID v4 validator
export const uuidSchema = z.string().uuid('ID inválido');

// Paginación
export const paginationSchema = z.object({
    limit: z.coerce.number().min(1).max(100).optional().default(10),
    cursor: z.string().optional(),
    offset: z.coerce.number().min(0).optional()
});

// ==========================================
// VALIDADORES DE PROFILE
// ==========================================

export const createProfileSchema = z.object({
    username: z.string()
        .min(3, 'El username debe tener al menos 3 caracteres')
        .max(30, 'El username no puede exceder 30 caracteres')
        .regex(/^[a-zA-Z0-9_]+$/, 'El username solo puede contener letras, números y guiones bajos'),
    nombre_completo: z.string()
        .min(2, 'El nombre debe tener al menos 2 caracteres')
        .max(100, 'El nombre no puede exceder 100 caracteres')
        .optional(),
    bio: z.string().max(300, 'La bio no puede exceder 300 caracteres').optional(),
    avatar_url: z.string().url('URL de avatar inválida').optional()
});

export const updateProfileSchema = createProfileSchema.partial();

// ==========================================
// VALIDADORES DE RETOS
// ==========================================

export const joinChallengeSchema = z.object({
    params: z.object({
        id: uuidSchema
    })
});

export const completeTaskSchema = z.object({
    params: z.object({
        retoId: uuidSchema,
        taskId: uuidSchema
    })
});

// ==========================================
// VALIDADORES DE MISIONES
// ==========================================

export const completeMissionSchema = z.object({
    params: z.object({
        id: uuidSchema
    })
});

// ==========================================
// VALIDADORES DE AUTH
// ==========================================

export const checkEmailSchema = z.object({
    email: z.string().email('Email inválido')
});

// ==========================================
// MIDDLEWARE DE VALIDACIÓN
// ==========================================

type ValidationTarget = 'body' | 'query' | 'params';

interface ValidateOptions {
    body?: z.ZodSchema;
    query?: z.ZodSchema;
    params?: z.ZodSchema;
}

/**
 * Middleware factory para validar requests con Zod
 * @example
 * router.post('/profile', validate({ body: createProfileSchema }), controller.create)
 */
export const validate = (schemas: ValidateOptions) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const errors: string[] = [];

            if (schemas.body) {
                const result = schemas.body.safeParse(req.body);
                if (!result.success) {
                    errors.push(...result.error.issues.map((e: z.ZodIssue) => `${e.path.join('.')}: ${e.message}`));
                } else {
                    req.body = result.data;
                }
            }

            if (schemas.query) {
                const result = schemas.query.safeParse(req.query);
                if (!result.success) {
                    errors.push(...result.error.issues.map((e: z.ZodIssue) => `${e.path.join('.')}: ${e.message}`));
                } else {
                    // Preserve original query type but update values
                    Object.assign(req.query, result.data);
                }
            }

            if (schemas.params) {
                const result = schemas.params.safeParse(req.params);
                if (!result.success) {
                    errors.push(...result.error.issues.map((e: z.ZodIssue) => `${e.path.join('.')}: ${e.message}`));
                } else {
                    Object.assign(req.params, result.data);
                }
            }

            if (errors.length > 0) {
                throw new ApiError(400, errors.join('; '), 'VALIDATION_ERROR');
            }

            next();
        } catch (error) {
            next(error);
        }
    };
};

/**
 * Validador simple para body
 */
export const validateBody = <T extends z.ZodSchema>(schema: T) => {
    return validate({ body: schema });
};

/**
 * Validador simple para params
 */
export const validateParams = <T extends z.ZodSchema>(schema: T) => {
    return validate({ params: schema });
};

/**
 * Validador simple para query
 */
export const validateQuery = <T extends z.ZodSchema>(schema: T) => {
    return validate({ query: schema });
};

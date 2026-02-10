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
    bio: z.string().max(300, 'La bio no puede exceder 300 caracteres').optional(),
    avatar_url: z.string().url('URL de avatar inválida').optional(),
    status: z.enum(['active', 'suspended']).optional().default('active')
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
    email: z.string().trim().toLowerCase().email('Email inválido')
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

// ==========================================
// VALIDADORES DE ADMIN (Gestión de Usuarios)
// ==========================================

export const adminUserSchema = z.object({
    email: z.string().email('Email inválido'),
    password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres').optional(),
    username: z.string().min(3).max(30),
    role: z.enum(['user', 'admin']).default('user'),
    status: z.enum(['active', 'suspended']).default('active'),
    full_name: z.string().optional()
});

export const updateAdminUserSchema = adminUserSchema.partial();

export const changeStatusSchema = z.object({
    status: z.enum(['active', 'suspended'])
});

// ==========================================
// VALIDADORES DE ADMIN (Gestión de Misiones)
// ==========================================

export const missionSchema = z.object({
    titulo: z.string().min(3).max(100),
    descripcion: z.string().min(10).max(500),
    eco_tip: z.string().max(500).optional(),
    impacto: z.string().max(500).optional(),
    kg_co2_ahorrado: z.number().min(0).optional(),
    puntos: z.number().min(1).max(5000),
    dificultad: z.enum(['fácil', 'intermedio', 'difícil']).optional(),
    categoria: z.enum(['energia', 'agua', 'transporte', 'residuos']),
    activa: z.boolean().default(true)
});

export const updateMissionSchema = missionSchema.partial();

// ==========================================
// VALIDADORES DE ADMIN (Gestión de Retos)
// ==========================================

export const challengeSchema = z.object({
    titulo: z.string().min(3).max(100),
    descripcion: z.string().min(10).max(1000),
    categoria: z.enum(['energia', 'agua', 'transporte', 'residuos']),
    recompensa_puntos: z.number().min(1),
    recompensa_kg_co2: z.number().min(0),
    fecha_inicio: z.string(), // Consider ISO date validation
    fecha_fin: z.string(),
    activo: z.boolean().default(true)
});

export const updateChallengeSchema = challengeSchema.partial();

export const taskSchema = z.object({
    reto_id: uuidSchema,
    titulo: z.string().min(3).max(100),
    descripcion: z.string().min(5).max(500),
    recompensa_puntos: z.number().min(1),
    recompensa_kg_co2: z.number().min(0),
    dia_orden: z.number().min(1).max(5)
});

export const updateTaskSchema = taskSchema.partial();

// ==========================================
// VALIDADORES DE ADMIN (Gestión de Niveles)
// ==========================================

export const levelSchema = z.object({
    nivel: z.number().int().min(1).max(100),
    puntos_minimos: z.number().int().min(0)
});

export const updateLevelSchema = levelSchema.partial();

/**
 * Validador simple para query
 */
export const validateQuery = <T extends z.ZodSchema>(schema: T) => {
    return validate({ query: schema });
};

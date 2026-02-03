import { z } from 'zod';

export const createPostSchema = z.object({
    descripcion: z.string().max(500).optional().default(''),
    is_public: z.boolean().optional().default(true),
    ubicacion: z.string().max(80).optional(),
    hashtags: z.array(z.string().max(30)).max(10).optional(),
    media: z.array(z.object({
        url: z.string().url(),
        type: z.enum(['image', 'video'])
    })).min(1, 'Debes subir al menos una foto o video para publicar.'),
});

export const createCommentSchema = z.object({
    content: z.string().min(1).max(300),
});

export const updateCommentSchema = z.object({
    content: z.string().min(1).max(300),
});

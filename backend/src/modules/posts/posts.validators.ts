import { z } from 'zod';

export const createPostSchema = z.object({
    descripcion: z.string().max(500).optional().default(''),
    is_public: z.boolean().optional().default(true),
    ubicacion: z.string().max(80).optional(),
    hashtags: z.array(z.string().max(30)).max(10).optional(),
    media_url: z.string().url().optional(),
    media_type: z.enum(['image', 'video']).optional(),
    media_mime: z.string()
        .refine((val) => {
            const allowed = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm'];
            return allowed.includes(val);
        }, "Invalid mime type. Allowed: image/jpeg, image/png, image/webp, video/mp4, video/webm")
        .optional(),
});

export const createCommentSchema = z.object({
    content: z.string().min(1).max(300),
});

export const updateCommentSchema = z.object({
    content: z.string().min(1).max(300),
});

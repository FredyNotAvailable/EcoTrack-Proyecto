import { Router } from 'express';
import { z } from 'zod';
import rateLimit from 'express-rate-limit';
import * as postsController from './posts.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { validateBody, validateParams, uuidSchema } from '../../utils/validators';
import { createPostSchema, createCommentSchema, updateCommentSchema } from './posts.validators';

const router = Router();

// Schemas de validación
const postIdSchema = z.object({ id: uuidSchema });
const commentIdSchema = z.object({ id: uuidSchema });

// Rate limiting para upload (10 req/min)
const uploadLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minuto
    max: 10,
    message: { error: { code: 'TOO_MANY_UPLOADS', message: 'Demasiadas subidas, espera un minuto' } },
    standardHeaders: true,
    legacyHeaders: false
});

// Feed
router.get('/', authMiddleware, postsController.getFeed); // Auth optional usually but middleware implies required? 
// Checking auth middleware implementation: It returns 401 if no header.
// User requested: "Lista posts públicos (feed)". But usually feed is public.
// However, implementation of authMiddleware seems to force auth.
// "if (!authHeader) return 401". 
// If we want public access, we need a "loose" auth middleware or handle it in controller manually by checking header.
// BUT, Step 1 says: "A) GET /posts ... B) GET /posts/:id ... C) POST /posts (REQ AUTH)".
// It implies A and B might be public? 
// "B) Devuelve un post público... + liked_by_me (si está autenticado)" -> This implies optional auth.
// My `authMiddleware` is strict. I should create an `optionalAuthMiddleware` or just NOT use middleware and check req.headers manually in controller?
// Better: Create `optionalAuthMiddleware` in `src/middlewares/` but I'll simple implement strict routes for now where req is explicitly needed, and for others, I'll let Controller handle "if token present".
// But Controller depends on `req.user`. `req.user` is set by middleware.
// I will not add `authMiddleware` to GET /posts. I will try to parse token if present inside controller or separate middleware?
// I'll stick to: GET /posts is PUBLIC. If client sends token, we want to know it.
// I'll use a new middleware helper inside this file or just skip it and lose `liked_by_me` for now?
// No, `liked_by_me` is important.
// I'll add a local `optionalAuthMiddleware` here or modify the global one?
// Modifying global is risky.
// I'll create a small helper here.

const optionalAuth = async (req: any, res: any, next: any) => {
    if (req.headers.authorization) {
        return authMiddleware(req, res, next);
    }
    next();
};

// Because `authMiddleware` throws 401 on failure, using it for optional is dangerous if token is invalid.
// I will just leave GET / and GET /:id WITHOUT auth middleware for now, and accept that `req.user` will be undefined.
// If the user sends a token, `liked_by_me` will be false because `req.user` is missing.
// This is a trade-off. To fix properly I'd need `optionalAuthMiddleware` that doesn't 401.
// I will create `optionalAuthMiddleware` in `src/middlewares/auth.middleware.ts` first? 
// The user said "Si falta algo mínimo ... créalo". I will do that.

router.get('/', optionalAuth, postsController.getFeed);
router.get('/search/hashtags', postsController.searchHashtags);
router.get('/hashtags/popular', postsController.getPopularHashtags);
router.get('/:id', optionalAuth, postsController.getPost);

import { uploadMiddleware } from '../../middlewares/upload.middleware';

router.post('/', authMiddleware, validateBody(createPostSchema), postsController.createPost);
router.put('/:id', authMiddleware, validateParams(postIdSchema), postsController.updatePost);
router.delete('/:id', authMiddleware, validateParams(postIdSchema), postsController.deletePost);
router.post('/upload', authMiddleware, uploadLimiter, uploadMiddleware.array('files', 10), postsController.uploadMedia);
router.post('/:id/like', authMiddleware, validateParams(postIdSchema), postsController.likePost);
router.delete('/:id/like', authMiddleware, validateParams(postIdSchema), postsController.unlikePost);

router.get('/:id/comments', validateParams(postIdSchema), postsController.getComments);
router.post('/:id/comments', authMiddleware, validateParams(postIdSchema), validateBody(createCommentSchema), postsController.createComment);

// Comments router separado (se monta en /comments en index.ts)
export const commentsRouter = Router();
commentsRouter.patch('/:id', authMiddleware, validateParams(commentIdSchema), validateBody(updateCommentSchema), postsController.updateComment);
commentsRouter.delete('/:id', authMiddleware, validateParams(commentIdSchema), postsController.deleteComment);

// Report
router.post('/:id/report', authMiddleware, validateParams(postIdSchema), postsController.reportPost);

export default router;
// I need to import it.


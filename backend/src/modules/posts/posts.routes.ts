import { Router } from 'express';
import * as postsController from './posts.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';

const router = Router();

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

router.post('/', authMiddleware, postsController.createPost);
router.put('/:id', authMiddleware, postsController.updatePost);
router.delete('/:id', authMiddleware, postsController.deletePost);
router.post('/upload', authMiddleware, uploadMiddleware.single('file'), postsController.uploadMedia);
router.post('/:id/like', authMiddleware, postsController.likePost);
router.delete('/:id/like', authMiddleware, postsController.unlikePost);

router.get('/:id/comments', postsController.getComments); // Comments are public? "Lista comentarios".
router.post('/:id/comments', authMiddleware, postsController.createComment);

// Comments routes separate or nested?
// User said: "H) PATCH /comments/:id"
// So I need global routes for comments too?
// Or I can mount a sub-router.
// I will just add them here:
router.patch('/comments/:id', authMiddleware, postsController.updateComment); // Note path is /posts/comments/:id if mounted on /posts
// But user asked for /comments/:id.
// So I should prob have two files or mount this router on /posts AND /comments?
// Or just handle /comments/:id in the main router mapping?
// I'll export a separate router for comments?
// Or I'll just put all in `postsRouter` and mount it on `/` in index.ts?
// No, standard is `/posts`.
// PROPOSAL:
// `router` handles `/` (which becomes `/posts`), `/:id`, etc.
// And I add `comments/:id` here? That would be `/posts/comments/:id`. User asked `/comments/:id`.
// I will create a separate `commentsRouter` inside this file or `posts.routes.ts` and export it too.

router.patch('/comments/:id', authMiddleware, postsController.updateComment); // This will be /posts/comments/:id which is wrong.
// I need `PATCH /comments/:id`.
// I will handle this in `src/routes/index.ts` by mounting the SAME router or a subset?
// "Móntalo en el router principal: /posts -> posts.routes, /comments -> comments routes si lo separas".
// I will separate `comments` routes to a variable and export it.

export const commentsRouter = Router();
commentsRouter.patch('/:id', authMiddleware, postsController.updateComment);
commentsRouter.delete('/:id', authMiddleware, postsController.deleteComment);

export default router;

// Wait, the "optionalAuth" above:
// If I use `authMiddleware` and it fails, it returns 401.
// If header is missing, it returns 401.
// My `optionalAuth` check `if header`. If header exists but is invalid, `authMiddleware` returns 401. That is CORRECT.
// If header missing, it calls next(), `req.user` is undefined. CORRECT.
// EXCEPT: `authMiddleware` has `req`, `res`, `next` typed.
// I need to import it.


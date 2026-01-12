import { Router } from 'express';

import authRouter from '../modules/auth/auth.routes';
import profileRouter from '../modules/profile/profile.routes';
import { postsRouter, commentsRouter } from '../modules/posts';

const router = Router();

router.use('/auth', authRouter);
router.use('/profile', profileRouter);
router.use('/posts', postsRouter);
router.use('/comments', commentsRouter);

export default router;

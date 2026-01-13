import { Router } from 'express';

import authRouter from '../modules/auth/auth.routes';
import profileRouter from '../modules/profile/profile.routes';
import { postsRouter, commentsRouter } from '../modules/posts';
import { consejosRouter } from '../modules/consejos';
import { misionesRouter } from '../modules/misiones';

const router = Router();

router.use('/auth', authRouter);
router.use('/profile', profileRouter);
router.use('/posts', postsRouter);
router.use('/comments', commentsRouter);
router.use('/consejos', consejosRouter);
router.use('/misiones', misionesRouter);

export default router;

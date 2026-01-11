import { Router } from 'express';

import authRouter from '../modules/auth/auth.routes';
import profileRouter from '../modules/profile/profile.routes';

const router = Router();

router.use('/auth', authRouter);
router.use('/profile', profileRouter);

export default router;

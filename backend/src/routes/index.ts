import { Router } from 'express';

import retosRouter from '../modules/retos/retos.routes';

const router = Router();

router.use('/retos', retosRouter);

export default router;

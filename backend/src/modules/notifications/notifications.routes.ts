import { Router } from 'express';
import { NotificationsController } from './notifications.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';

const router = Router();
const controller = new NotificationsController();

router.use(authMiddleware);

router.get('/', controller.getUserNotifications);
router.patch('/mark-all-read', controller.markAllAsRead);
router.patch('/:id/read', controller.markAsRead);

export default router;

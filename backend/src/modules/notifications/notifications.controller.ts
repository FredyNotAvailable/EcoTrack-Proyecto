import { Request, Response } from 'express';
import { NotificationsService } from './notifications.service';

export class NotificationsController {
    private service = NotificationsService.getInstance();

    getUserNotifications = async (req: Request, res: Response) => {
        try {
            const userId = (req as any).user.id;
            const limitVal = req.query.limit;
            const limit = (limitVal && typeof limitVal === 'string') ? parseInt(limitVal) : 20;
            const notifications = await this.service.getUserNotifications(userId, limit);
            res.json(notifications);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    };

    markAsRead = async (req: Request, res: Response) => {
        try {
            const userId = (req as any).user.id;
            const notificationId = req.params.id as string;
            await this.service.markRead(notificationId, userId);
            res.json({ success: true });
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    };

    markAllAsRead = async (req: Request, res: Response) => {
        try {
            const userId = (req as any).user.id;
            await this.service.markAllRead(userId);
            res.json({ success: true });
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    };
}

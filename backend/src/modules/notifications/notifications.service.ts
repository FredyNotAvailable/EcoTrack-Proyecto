import { NotificationsRepository } from './notifications.repository';
import { CreateNotificationDTO, Notification } from './notifications.types';

export class NotificationsService {
    private static instance: NotificationsService;
    private repository: NotificationsRepository;

    private constructor() {
        this.repository = NotificationsRepository.getInstance();
    }

    static getInstance(): NotificationsService {
        if (!NotificationsService.instance) {
            NotificationsService.instance = new NotificationsService();
        }
        return NotificationsService.instance;
    }

    /**
     * Genereic method to send a notification
     */
    async notify(data: CreateNotificationDTO): Promise<Notification> {
        return this.repository.create(data);
    }

    /**
     * Helpers for specific types of notifications
     */

    async notifyModeration(userId: string, title: string, message: string, postId?: string) {
        return this.notify({
            user_id: userId,
            type: 'moderation',
            title,
            message,
            reference_id: postId,
            reference_type: 'post'
        });
    }

    async notifyAchievement(userId: string, title: string, message: string, referenceId?: string, referenceType?: 'challenge' | 'badge' | 'mision' | 'post') {
        return this.notify({
            user_id: userId,
            type: 'achievement',
            title,
            message,
            reference_id: referenceId,
            reference_type: referenceType
        });
    }

    async notifySocial(userId: string, actorId: string, title: string, message: string, referenceId: string, referenceType: 'post' | 'comment') {
        return this.notify({
            user_id: userId,
            actor_id: actorId,
            type: 'social',
            title,
            message,
            reference_id: referenceId,
            reference_type: referenceType
        });
    }

    async notifySystem(userId: string, title: string, message: string) {
        return this.notify({
            user_id: userId,
            type: 'system',
            title,
            message
        });
    }

    async deleteSocialNotification(userId: string, actorId: string, referenceId: string) {
        return this.repository.deleteSocialNotification(userId, actorId, referenceId);
    }

    /**
     * Fetching notifications for a user
     */
    async getUserNotifications(userId: string, limit?: number) {
        return this.repository.findByUserId(userId, limit);
    }

    async markRead(notificationId: string, userId: string) {
        return this.repository.markAsRead(notificationId, userId);
    }

    async markAllRead(userId: string) {
        return this.repository.markAllAsRead(userId);
    }
}

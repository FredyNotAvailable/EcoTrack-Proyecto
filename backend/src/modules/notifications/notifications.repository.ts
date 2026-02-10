import { supabase } from '../../config/supabaseClient';
import { CreateNotificationDTO, Notification } from './notifications.types';

export class NotificationsRepository {
    private static instance: NotificationsRepository;

    private constructor() { }

    static getInstance(): NotificationsRepository {
        if (!NotificationsRepository.instance) {
            NotificationsRepository.instance = new NotificationsRepository();
        }
        return NotificationsRepository.instance;
    }

    async create(data: CreateNotificationDTO): Promise<Notification> {
        const { data: notification, error } = await supabase
            .from('notifications')
            .insert(data)
            .select()
            .single();

        if (error) throw error;
        return notification;
    }

    async findByUserId(userId: string, limit: number = 20): Promise<Notification[]> {
        const { data, error } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) throw error;
        return data || [];
    }

    async markAsRead(notificationId: string, userId: string): Promise<void> {
        const { error } = await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('id', notificationId)
            .eq('user_id', userId);

        if (error) throw error;
    }

    async markAllAsRead(userId: string): Promise<void> {
        const { error } = await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('user_id', userId)
            .eq('is_read', false);

        if (error) throw error;
    }

    async delete(notificationId: string, userId: string): Promise<void> {
        const { error } = await supabase
            .from('notifications')
            .delete()
            .eq('id', notificationId)
            .eq('user_id', userId);

        if (error) throw error;
    }

    async deleteSocialNotification(userId: string, actorId: string, referenceId: string): Promise<void> {
        const { error } = await supabase
            .from('notifications')
            .delete()
            .match({
                user_id: userId,
                actor_id: actorId,
                reference_id: referenceId,
                type: 'social'
            });

        if (error) throw error;
    }
}

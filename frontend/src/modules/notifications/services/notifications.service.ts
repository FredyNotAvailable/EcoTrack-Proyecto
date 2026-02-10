import { supabase } from '../../../config/supabase';

export interface Notification {
    id: string;
    user_id: string;
    actor_id?: string;
    type: 'moderation' | 'social' | 'achievement' | 'system';
    title: string;
    message: string;
    reference_id?: string;
    reference_type?: string;
    is_read: boolean;
    created_at: string;
}

export const NotificationsAPIService = {
    async getNotifications(limit: number = 20): Promise<Notification[]> {
        const { data, error } = await supabase
            .from('notifications')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) throw error;
        return data || [];
    },

    async markAsRead(id: string): Promise<void> {
        const { error } = await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('id', id);

        if (error) throw error;
    },

    async markAllAsRead(): Promise<void> {
        const { error } = await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('is_read', false);

        if (error) throw error;
    }
};

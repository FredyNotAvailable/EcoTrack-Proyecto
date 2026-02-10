export type NotificationType = 'moderation' | 'social' | 'achievement' | 'system';
export type ReferenceType = 'post' | 'comment' | 'challenge' | 'badge' | 'mision';

export interface Notification {
    id: string;
    user_id: string;
    actor_id?: string;
    type: NotificationType;
    title: string;
    message: string;
    reference_id?: string;
    reference_type?: ReferenceType;
    is_read: boolean;
    created_at: string;
}

export interface CreateNotificationDTO {
    user_id: string;
    actor_id?: string;
    type: NotificationType;
    title: string;
    message: string;
    reference_id?: string;
    reference_type?: ReferenceType;
}

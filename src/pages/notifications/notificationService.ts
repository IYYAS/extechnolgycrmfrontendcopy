import { api } from '../../api/api';

export interface Notification {
    id: number;
    user: number;
    activity: number | null;
    comment: number | null;
    project: number | null;
    message: string;
    is_read: boolean;
    created_at: string;
    notification_type?: 'server_alert' | 'domain_alert' | string | null;
    project_name?: string;
    expiry_date?: string;
}

export interface NotificationResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: Notification[];
}

export interface UnreadCountResponse {
    unread_count: number;
}

export const getNotifications = async (page: number = 1): Promise<NotificationResponse> => {
    const response = await api.get<NotificationResponse>(`/notifications/?page=${page}`);
    return response.data;
};

export const getUnreadCount = async (): Promise<number> => {
    const response = await api.get<UnreadCountResponse>('/notifications/unread-count/');
    return response.data.unread_count;
};

export const markAsRead = async (id: number): Promise<void> => {
    await api.patch(`/notifications/${id}/`, { is_read: true });
};

export const markAllAsRead = async (): Promise<void> => {
    await api.put('/notifications/mark-all-read/');
};

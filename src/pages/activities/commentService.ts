import { api } from '../../api/api';

export interface ActivityExceedComment {
    id: number;
    activity: number | null;
    project_service: number | null;
    commented_by: number | null;
    commenter_name?: string;
    comment: string;
    created_at: string;
}

export interface Notification {
    id?: number;
    user: number;
    message: string;
    activity?: number | null;
    comment?: number | null;
    is_read?: boolean;
    created_at?: string;
}

export const getComments = async (activityId: number): Promise<ActivityExceedComment[]> => {
    const response = await api.get(`/activity-exceed-comments/?activity=${activityId}`);
    return response.data.results || [];
};

export const createComment = async (data: Partial<ActivityExceedComment>): Promise<ActivityExceedComment> => {
    const response = await api.post('/activity-exceed-comments/', data);
    return response.data;
};

export const deleteComment = async (id: number): Promise<void> => {
    await api.delete(`/activity-exceed-comments/${id}/`);
};

export const createNotification = async (data: Notification): Promise<Notification> => {
    const response = await api.post('/notifications/', data);
    return response.data;
};

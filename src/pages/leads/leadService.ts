import { api } from '../../api/api';
import type { Lead, FollowUp, LeadDashboardStats } from './lead';

export const leadService = {
    getDashboardStats: async (): Promise<LeadDashboardStats> => {
        const response = await api.get('/leads/dashboard/');
        return response.data;
    },

    getLeads: async (params?: any) => {
        const response = await api.get('/leads/', { params });
        return response.data;
    },

    getLead: async (id: number): Promise<Lead> => {
        const response = await api.get(`/leads/${id}/`);
        return response.data;
    },

    createLead: async (data: Partial<Lead>): Promise<Lead> => {
        const response = await api.post('/leads/', data);
        return response.data;
    },

    updateLead: async (id: number, data: Partial<Lead>): Promise<Lead> => {
        const response = await api.patch(`/leads/${id}/`, data);
        return response.data;
    },

    deleteLead: async (id: number): Promise<void> => {
        await api.delete(`/leads/${id}/`);
    },

    getFollowUps: async (leadId?: number): Promise<FollowUp[]> => {
        const response = await api.get('/followups/', { params: { lead: leadId } });
        return response.data;
    },

    getUpcomingFollowUps: async (): Promise<(FollowUp & { lead_company?: string })[]> => {
        const response = await api.get('/followups/', { params: { upcoming: true } });
        return response.data;
    },

    createFollowUp: async (data: Partial<FollowUp>): Promise<FollowUp> => {
        const response = await api.post('/followups/', data);
        return response.data;
    },

    updateFollowUp: async (id: number, data: Partial<FollowUp>): Promise<FollowUp> => {
        const response = await api.patch(`/followups/${id}/`, data);
        return response.data;
    },

    deleteFollowUp: async (id: number): Promise<void> => {
        await api.delete(`/followups/${id}/`);
    },
};

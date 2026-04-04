import { api } from '../../api/api';
import type { User } from '../user/userService';

export interface TeamMember {
    id: number;
    username: string;
    email: string;
    name: string;
    role?: string;
    designation?: string;
}

export interface Team {
    id: number;
    name: string;
    team_lead: number | null;
    team_lead_name: string;
    members: number[];
    members_details: User[];
    created_at: string;
    updated_at: string;
    assigned_projects?: any[];
}

export const getTeams = async (page: number = 1, search: string = '') => {
    const response = await api.get(`/teams/?page=${page}&search=${search}`);
    return response.data;
};

export const getTeam = async (id: number) => {
    const response = await api.get(`/teams/${id}/`);
    return response.data;
};

export const createTeam = async (data: Partial<Team>) => {
    const response = await api.post('/teams/', data);
    return response.data;
};

export const updateTeam = async (id: number, data: Partial<Team>) => {
    const response = await api.put(`/teams/${id}/`, data);
    return response.data;
};

export const deleteTeam = async (id: number) => {
    const response = await api.delete(`/teams/${id}/`);
    return response.data;
};

export const getTeamAssignedProjects = async (id: number) => {
    const response = await api.get(`/teams/${id}/assigned-projects/`);
    return response.data;
};

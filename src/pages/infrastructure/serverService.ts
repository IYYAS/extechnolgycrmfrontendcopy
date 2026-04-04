import { api } from '../../api/api';

export interface Provider {
    id: number;
    company_name: string;
    contact_person: string;
    email: string;
    phone: string;
    created_at: string;
}

export interface ProjectServer {
    id: number;
    provider: Provider[];
    server_type: string;
    name: string;
    accrued_by: string;
    purchased_from: string;
    purchase_date: string;
    expiration_date: string;
    status: string;
    cost: string;
    payment_status: string;
    project: number | null;
    client_address: number | null;
}

export interface ProjectServerListResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: ProjectServer[];
}

export const getProjectServers = async (page: number = 1, search: string = ''): Promise<ProjectServerListResponse> => {
    const url = search
        ? `/project-servers/?page=${page}&search=${encodeURIComponent(search)}`
        : `/project-servers/?page=${page}`;
    const response = await api.get<ProjectServerListResponse>(url);
    return response.data;
};

export const getProjectServer = async (id: number): Promise<ProjectServer> => {
    const response = await api.get<ProjectServer>(`/project-servers/${id}/`);
    return response.data;
};

export const createProjectServer = async (data: Partial<ProjectServer>): Promise<ProjectServer> => {
    // If provider is passed as an array of IDs, but the API expects nested or just IDs?
    // Based on typical DRF patterns in this project, we might need to handle it.
    // For now, let's assume it handles JSON.
    const response = await api.post<ProjectServer>('/project-servers/', data);
    return response.data;
};

export const updateProjectServer = async (id: number, data: Partial<ProjectServer>): Promise<ProjectServer> => {
    const response = await api.put<ProjectServer>(`/project-servers/${id}/`, data);
    return response.data;
};

export const deleteProjectServer = async (id: number): Promise<void> => {
    await api.delete(`/project-servers/${id}/`);
};

import { api } from '../../api/api';

export interface Provider {
    id: number;
    company_name: string;
    contact_person: string;
    email: string;
    phone: string;
    created_at: string;
}

export interface ProjectDomain {
    id: number;
    provider: Provider[];
    name: string | null;
    accrued_by: string;
    purchased_from: string;
    purchase_date: string;
    expiration_date: string;
    status: string;
    cost: string;
    payment_status: string;
    project: number | null;
    client_address?: number | null;
}

export interface ProjectDomainListResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: ProjectDomain[];
}

export const getProjectDomains = async (page: number = 1, search: string = ''): Promise<ProjectDomainListResponse> => {
    const url = search
        ? `/project-domains/?page=${page}&search=${encodeURIComponent(search)}`
        : `/project-domains/?page=${page}`;
    const response = await api.get<ProjectDomainListResponse>(url);
    return response.data;
};

export const getProjectDomain = async (id: number): Promise<ProjectDomain> => {
    const response = await api.get<ProjectDomain>(`/project-domains/${id}/`);
    return response.data;
};

export const createProjectDomain = async (data: Partial<ProjectDomain>): Promise<ProjectDomain> => {
    const response = await api.post<ProjectDomain>('/project-domains/', data);
    return response.data;
};

export const updateProjectDomain = async (id: number, data: Partial<ProjectDomain>): Promise<ProjectDomain> => {
    const response = await api.put<ProjectDomain>(`/project-domains/${id}/`, data);
    return response.data;
};

export const deleteProjectDomain = async (id: number): Promise<void> => {
    await api.delete(`/project-domains/${id}/`);
};

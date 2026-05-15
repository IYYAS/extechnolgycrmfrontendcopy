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
    project_name?: string;
    accrued_by: string;
    purchased_from: string;
    purchase_date: string;
    expiration_date: string;
    status: string;
    cost: string;
    payment_status: string;
    project: number | null;
    client_address?: number | null;
    invoice_status?: string;
}

export interface ProjectDomainListResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: ProjectDomain[];
    statistics?: {
        total: number;
        active: number;
        pending: number;
        expired: number;
    };
}

export const getProjectDomains = async (
    page: number = 1, 
    search: string = '', 
    filters: {
        status?: string;
        payment_status?: string;
        invoice_status?: string;
        min_cost?: string;
        max_cost?: string;
        start_date?: string;
        end_date?: string;
    } = {}
): Promise<ProjectDomainListResponse> => {
    let url = `/project-domains/?page=${page}`;
    
    if (search) {
        url += `&search=${encodeURIComponent(search)}`;
    }
    
    if (filters.status) url += `&status=${encodeURIComponent(filters.status)}`;
    if (filters.payment_status) url += `&payment_status=${encodeURIComponent(filters.payment_status)}`;
    if (filters.invoice_status) url += `&invoice_status=${encodeURIComponent(filters.invoice_status)}`;
    if (filters.min_cost) url += `&min_cost=${encodeURIComponent(filters.min_cost)}`;
    if (filters.max_cost) url += `&max_cost=${encodeURIComponent(filters.max_cost)}`;
    if (filters.start_date) url += `&start_date=${encodeURIComponent(filters.start_date)}`;
    if (filters.end_date) url += `&end_date=${encodeURIComponent(filters.end_date)}`;

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

import { api } from '../../api/api';

export interface Exbot {
    id: number;
    project: number;
    project_name?: string;
    whatsapp_number: string;
    plan_category: string;
    plan_active_date: string;
    plan_deactive_date: string;
    plan_rate: string;
    payment_status: 'PAID' | 'UNPAID';
    status: string;
    invoice_status?: string;
    description: string;
}

export interface ExbotListResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: Exbot[];
    statistics?: {
        total: number;
        active: number;
        pending: number;
        expired: number;
    };
}

export const getExbots = async (
    page: number = 1, 
    search: string = '',
    filters: {
        status?: string;
        payment_status?: string;
        invoice_status?: string;
        min_rate?: string;
        max_rate?: string;
        start_date?: string;
        end_date?: string;
    } = {}
): Promise<ExbotListResponse> => {
    let url = `/project-exbots/?page=${page}`;
    
    if (search) {
        url += `&search=${encodeURIComponent(search)}`;
    }
    
    if (filters.status) url += `&status=${encodeURIComponent(filters.status)}`;
    if (filters.payment_status) url += `&payment_status=${encodeURIComponent(filters.payment_status)}`;
    if (filters.invoice_status) url += `&invoice_status=${encodeURIComponent(filters.invoice_status)}`;
    if (filters.min_rate) url += `&min_rate=${encodeURIComponent(filters.min_rate)}`;
    if (filters.max_rate) url += `&max_rate=${encodeURIComponent(filters.max_rate)}`;
    if (filters.start_date) url += `&start_date=${encodeURIComponent(filters.start_date)}`;
    if (filters.end_date) url += `&end_date=${encodeURIComponent(filters.end_date)}`;

    const response = await api.get<ExbotListResponse>(url);
    return response.data;
};

export const getExbot = async (id: number): Promise<Exbot> => {
    const response = await api.get<Exbot>(`/project-exbots/${id}/`);
    return response.data;
};

export const createExbot = async (data: any): Promise<Exbot> => {
    const response = await api.post<Exbot>('/project-exbots/', data);
    return response.data;
};

export const updateExbot = async (id: number, data: any): Promise<Exbot> => {
    const response = await api.put<Exbot>(`/project-exbots/${id}/`, data);
    return response.data;
};

export const deleteExbot = async (id: number): Promise<void> => {
    await api.delete(`/project-exbots/${id}/`);
};

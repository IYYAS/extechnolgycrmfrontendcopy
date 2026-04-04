import { api } from '../../api/api';

export interface OtherExpense {
    id: number;
    title: string;
    amount: string;
    date: string;
    notes: string | null;
    created_at: string;
}

export interface OtherExpenseListResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: OtherExpense[];
}

export const getOtherExpenses = async (page: number = 1, search: string = ''): Promise<OtherExpenseListResponse> => {
    const url = search
        ? `/other-expenses/?page=${page}&search=${encodeURIComponent(search)}`
        : `/other-expenses/?page=${page}`;
    const response = await api.get<OtherExpenseListResponse>(url);
    return response.data;
};

export const getOtherExpense = async (id: number): Promise<OtherExpense> => {
    const response = await api.get<OtherExpense>(`/other-expenses/${id}/`);
    return response.data;
};

export const createOtherExpense = async (data: any): Promise<OtherExpense> => {
    const response = await api.post<OtherExpense>('/other-expenses/', data);
    return response.data;
};

export const updateOtherExpense = async (id: number, data: any): Promise<OtherExpense> => {
    const response = await api.put<OtherExpense>(`/other-expenses/${id}/`, data);
    return response.data;
};

export const deleteOtherExpense = async (id: number): Promise<void> => {
    await api.delete(`/other-expenses/${id}/`);
};

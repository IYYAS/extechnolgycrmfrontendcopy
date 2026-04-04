import { api } from '../../api/api';

export interface OtherIncome {
    id: number;
    title: string;
    amount: string;
    date: string;
    notes: string | null;
    created_at: string;
}

export interface OtherIncomeListResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: OtherIncome[];
}

export const getOtherIncomes = async (page: number = 1, search: string = ''): Promise<OtherIncomeListResponse> => {
    const url = search
        ? `/other-incomes/?page=${page}&search=${encodeURIComponent(search)}`
        : `/other-incomes/?page=${page}`;
    const response = await api.get<OtherIncomeListResponse>(url);
    return response.data;
};

export const getOtherIncome = async (id: number): Promise<OtherIncome> => {
    const response = await api.get<OtherIncome>(`/other-incomes/${id}/`);
    return response.data;
};

export const createOtherIncome = async (data: any): Promise<OtherIncome> => {
    const response = await api.post<OtherIncome>('/other-incomes/', data);
    return response.data;
};

export const updateOtherIncome = async (id: number, data: any): Promise<OtherIncome> => {
    const response = await api.put<OtherIncome>(`/other-incomes/${id}/`, data);
    return response.data;
};

export const deleteOtherIncome = async (id: number): Promise<void> => {
    await api.delete(`/other-incomes/${id}/`);
};

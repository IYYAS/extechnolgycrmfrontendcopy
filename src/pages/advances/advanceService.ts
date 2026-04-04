import { api } from '../../api/api';

export interface AdvancePayment {
    id: number;
    amount: string;
    advance_balance: string;
    remaining_amount: string;
    note: string | null;
    is_manual: boolean;
    created_at: string;
    client: number;
    payment?: number;
}

export interface AdvanceListResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: AdvancePayment[];
}

export const getAdvances = async (clientId: number): Promise<AdvanceListResponse> => {
    const response = await api.get<AdvanceListResponse>(
        `/project-business-addresses/${clientId}/advances/`
    );
    return response.data;
};

export const getAdvance = async (clientId: number, advanceId: number): Promise<AdvancePayment> => {
    const response = await api.get<AdvancePayment>(
        `/project-business-addresses/${clientId}/advances/${advanceId}/`
    );
    return response.data;
};

export const createAdvance = async (clientId: number, data: Partial<AdvancePayment>): Promise<AdvancePayment> => {
    const response = await api.post<AdvancePayment>(
        `/project-business-addresses/${clientId}/advances/`,
        data
    );
    return response.data;
};

export const updateAdvance = async (clientId: number, advanceId: number, data: Partial<AdvancePayment>): Promise<AdvancePayment> => {
    const response = await api.put<AdvancePayment>(
        `/project-business-addresses/${clientId}/advances/${advanceId}/`,
        data
    );
    return response.data;
};

export const deleteAdvance = async (clientId: number, advanceId: number): Promise<void> => {
    await api.delete(`/project-business-addresses/${clientId}/advances/${advanceId}/`);
};

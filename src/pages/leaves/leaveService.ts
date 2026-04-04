import { api } from '../../api/api';

export interface EmployeeLeave {
    id: number;
    start_date: string;
    end_date: string;
    status: string | null;
    description: string | null;
    created_at: string;
    updated_at: string;
    employee: number;
    approved_by: number | null;
    // UI helpers
    employee_name?: string;
}

export interface LeaveListResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: EmployeeLeave[];
}

export const getLeaves = async (page: number = 1, search: string = ''): Promise<LeaveListResponse> => {
    const url = search
        ? `/employee-leaves/?page=${page}&search=${encodeURIComponent(search)}`
        : `/employee-leaves/?page=${page}`;
    const response = await api.get<LeaveListResponse>(url);
    return response.data;
};

export const getLeave = async (id: number): Promise<EmployeeLeave> => {
    const response = await api.get<EmployeeLeave>(`/employee-leaves/${id}/`);
    return response.data;
};

export const createLeave = async (data: any): Promise<EmployeeLeave> => {
    const response = await api.post<EmployeeLeave>('/employee-leaves/', data);
    return response.data;
};

export const updateLeave = async (id: number, data: any): Promise<EmployeeLeave> => {
    const response = await api.put<EmployeeLeave>(`/employee-leaves/${id}/`, data);
    return response.data;
};

export const deleteLeave = async (id: number): Promise<void> => {
    await api.delete(`/employee-leaves/${id}/`);
};

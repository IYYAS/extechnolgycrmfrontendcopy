import { api } from '../../api/api';

export interface UserSalary {
    id: number;
    user: number;
    username: string;
    base_salary: string;
    working_days: number;
    joining_date: string | null;
    created_at: string;
    updated_at: string;
}

export interface UserSalaryListResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: UserSalary[];
}

export const getUserSalaries = async (
    page: number = 1,
    search: string = '',
    filters: { user?: string } = {}
): Promise<UserSalaryListResponse> => {
    const response = await api.get<UserSalaryListResponse>('/user-salaries/', {
        params: { page, search, user: filters.user }
    });
    return response.data;
};

export const getUserSalary = async (id: number): Promise<UserSalary> => {
    const response = await api.get<UserSalary>(`/user-salaries/${id}/`);
    return response.data;
};

export const createUserSalary = async (data: any): Promise<UserSalary> => {
    const response = await api.post<UserSalary>('/user-salaries/', data);
    return response.data;
};

export const updateUserSalary = async (id: number, data: any): Promise<UserSalary> => {
    const response = await api.put<UserSalary>(`/user-salaries/${id}/`, data);
    return response.data;
};

export const deleteUserSalary = async (id: number): Promise<void> => {
    await api.delete(`/user-salaries/${id}/`);
};

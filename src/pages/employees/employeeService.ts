import { api } from '../../api/api';

export interface Employee {
    id: number;
    photo: string | null;
    employee_id: string;
    joining_date: string;
    department: string | null;
    basic_salary: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    user: number;
}

export interface EmployeeListResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: Employee[];
}

export const getEmployees = async (page: number = 1, search: string = ''): Promise<EmployeeListResponse> => {
    const url = search
        ? `/employees/?page=${page}&search=${encodeURIComponent(search)}`
        : `/employees/?page=${page}`;
    const response = await api.get<EmployeeListResponse>(url);
    return response.data;
};

export const getEmployee = async (id: number): Promise<Employee> => {
    const response = await api.get<Employee>(`/employees/${id}/`);
    return response.data;
};

export const createEmployee = async (data: any): Promise<Employee> => {
    const isFormData = data instanceof FormData;
    const response = await api.post<Employee>('/employees/', data, {
        headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {}
    });
    return response.data;
};

export const updateEmployee = async (id: number, data: any): Promise<Employee> => {
    const isFormData = data instanceof FormData;
    const response = await api.put<Employee>(`/employees/${id}/`, data, {
        headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {}
    });
    return response.data;
};

export const deleteEmployee = async (id: number): Promise<void> => {
    await api.delete(`/employees/${id}/`);
};

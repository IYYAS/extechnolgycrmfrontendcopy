import { api } from '../../api/api';

export interface Salary {
    id: number;
    employee: number;
    employee_name: string;
    start_date: string;
    end_date: string;
    basic: string;
    working_days: number;
    present_days: string;
    overtime_pay: string;
    late_deduction: string;
    bonus: string;
    advance: string;
    deductions: string;
    total_salary: string;
    status: string;
    created_at: string;
}

export interface SalaryListResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: Salary[];
}

export const getSalaries = async (
    page: number = 1,
    search: string = '',
    filters: { start_date?: string; end_date?: string; employee?: string } = {}
): Promise<SalaryListResponse> => {
    const response = await api.get<SalaryListResponse>('/salaries/', {
        params: {
            page,
            search,
            start_date: filters.start_date,
            end_date: filters.end_date,
            employee: filters.employee,
        }
    });
    return response.data;
};

export const getSalary = async (id: number): Promise<Salary> => {
    const response = await api.get<Salary>(`/salaries/${id}/`);
    return response.data;
};

export const createSalary = async (data: any): Promise<Salary> => {
    const response = await api.post<Salary>('/salaries/', data);
    return response.data;
};

export const updateSalary = async (id: number, data: any): Promise<Salary> => {
    const response = await api.put<Salary>(`/salaries/${id}/`, data);
    return response.data;
};

export const deleteSalary = async (id: number): Promise<void> => {
    await api.delete(`/salaries/${id}/`);
};

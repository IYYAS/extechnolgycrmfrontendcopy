import { api } from '../../api/api';

export interface EmployeeDailyActivity {
    id: number;
    employee_name: string;
    team_name?: string | null;
    project_name?: string | null;
    project_service_name?: string | null;
    description: string;
    hours_spent: string; // "5.50"
    date: string; // "2026-03-10"
    pending_work_percentage: number;
    target_work_percentage: number;
    is_timeline_exceeded: boolean;
    delay_reason: string | null;
    comment_count?: number;
    created_at: string;
    employee: number;
    team: number | null;
    project: number | null;
    project_service: number | null;
}

export interface ActivityListResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: EmployeeDailyActivity[];
}

export const getActivities = async (
    page: number = 1, 
    search: string = '', 
    startDate?: string, 
    endDate?: string,
    exportType?: string,
    employeeId?: number
): Promise<any> => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    if (search) params.append('search', search);
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    if (exportType) params.append('export', exportType);
    if (employeeId) params.append('employee_id', employeeId.toString());

    const url = `/employee-daily-activities/?${params.toString()}`;
    
    // If it's a blob export, fetch it with auth headers
    if (exportType === 'pdf' || exportType === 'docx') {
        const response = await api.get(url, { responseType: 'blob' });
        const contentType = exportType === 'pdf' 
            ? 'application/pdf' 
            : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        const extension = exportType === 'pdf' ? 'pdf' : 'docx';
        
        const blob = new Blob([response.data], { type: contentType });
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.setAttribute('download', `Activity_Report_${new Date().toISOString().split('T')[0]}.${extension}`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(downloadUrl);
        return;
    }

    const response = await api.get<ActivityListResponse>(url);
    return response.data;
};

export const getActivity = async (id: number): Promise<EmployeeDailyActivity> => {
    const response = await api.get<EmployeeDailyActivity>(`/employee-daily-activities/${id}/`);
    return response.data;
};

export const createActivity = async (data: any): Promise<EmployeeDailyActivity> => {
    const response = await api.post<EmployeeDailyActivity>('/employee-daily-activities/', data);
    return response.data;
};

export const updateActivity = async (id: number, data: any): Promise<EmployeeDailyActivity> => {
    const response = await api.put<EmployeeDailyActivity>(`/employee-daily-activities/${id}/`, data);
    return response.data;
};

export const deleteActivity = async (id: number): Promise<void> => {
    await api.delete(`/employee-daily-activities/${id}/`);
};

export const getEmployeeActivities = async (
    employeeId: number,
    page: number = 1,
    startDate?: string,
    endDate?: string,
    exportType?: string
): Promise<any> => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    if (exportType) params.append('export', exportType);

    const url = `/employees/${employeeId}/activities/?${params.toString()}`;

    if (exportType === 'pdf' || exportType === 'docx') {
        const response = await api.get(url, { responseType: 'blob' });
        const contentType = exportType === 'pdf' 
            ? 'application/pdf' 
            : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        const extension = exportType === 'pdf' ? 'pdf' : 'docx';

        const blob = new Blob([response.data], { type: contentType });
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.setAttribute('download', `Employee_${employeeId}_Activity_Report_${new Date().toISOString().split('T')[0]}.${extension}`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(downloadUrl);
        return;
    }

    const response = await api.get<ActivityListResponse>(url);
    return response.data;
};

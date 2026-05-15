import { api } from '../../api/api';


export interface Role {
  id: number;
  name: string;
  permissions?: any[];
}

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string | null;
  designation: string | null;
  roles: Role[];
  role?: Role;
  profile_pic: string | null;
  date_joined: string;
}
export interface UserListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: User[];
}



export const getUsers = async (
  page: number = 1, 
  search: string = '', 
  designation: string = '', 
  role: string = '', 
  status: string = '',
  startDate: string = '',
  endDate: string = ''
): Promise<UserListResponse> => {
  let url = `/users/?page=${page}`;
  if (search) url += `&search=${encodeURIComponent(search)}`;
  if (designation) url += `&designation=${encodeURIComponent(designation)}`;
  if (role) url += `&role=${encodeURIComponent(role)}`;
  if (status) url += `&status=${encodeURIComponent(status)}`;
  if (startDate) url += `&start_date=${startDate}`;
  if (endDate) url += `&end_date=${endDate}`;
  
  const response = await api.get<UserListResponse>(url);
  return response.data;
};

export const getRoles = async (): Promise<Role[]> => {
    const response = await api.get<any>('/roles/');
    // Handle paginated response { results: Role[] } or direct array Role[]
    if (response.data && response.data.results) {
        return response.data.results;
    }
    return Array.isArray(response.data) ? response.data : [];
};

export const createRole = async (name: string): Promise<Role> => {
  const response = await api.post<Role>('/roles/', { name });
  return response.data;
};

export const getUser = async (userId: number): Promise<User> => {
  const response = await api.get<User>(`/users/${userId}/`);
  return response.data;
};


const sanitizePayload = (obj: any): any => {
  if (Array.isArray(obj)) {
    return obj.map(sanitizePayload);
  }
  if (obj !== null && typeof obj === 'object') {
    const cleaned: any = {};
    for (const [key, value] of Object.entries(obj)) {
      cleaned[key] = sanitizePayload(value);
    }
    return cleaned;
  }
  // Convert empty strings to null for optional backend fields
  return obj === '' ? null : obj;
};

export const createUser = async (userData: any): Promise<User> => {
  const isFormData = userData instanceof FormData;
  const payload = isFormData ? userData : sanitizePayload(userData);
  const response = await api.post<User>('/users/', payload, {
    headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : undefined
  });
  return response.data;
};

export const updateUser = async (userId: number, userData: any): Promise<User> => {
  const isFormData = userData instanceof FormData;
  const payload = isFormData ? userData : sanitizePayload(userData);
  const response = await api.put<User>(`/users/${userId}/`, payload, {
    headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : undefined
  });
  return response.data;
};

export const deleteUser = async (userId: number): Promise<void> => {
  await api.delete(`/users/${userId}/`);
};

export const changePassword = async (data: any): Promise<any> => {
  const response = await api.put('/change-password/', sanitizePayload(data));
  return response.data;
};

export interface UserWorkDetails {
    total_projects: number;
    total_services: number;
    active_services: number;
    completed_services: number;
    pending_activities: number;
    active_work_list: Array<{
        type: string;
        name: string;
        role: string;
        days_worked: number;
        status: string;
        deadline: string | null;
    }>;
    recent_activities: Array<{
        id: number;
        date: string | null;
        employee_name: string;
        team_name: string | null;
        project_name: string | null;
        project_service_name: string | null;
        description: string;
        hours_spent: string | number;
        target_work_percentage: number;
        pending_work_percentage: number;
        is_timeline_exceeded: boolean;
        delay_reason: string;
    }>;
}

export interface PerformanceItem {
    name: string;
    status: string;
    start_date: string;
    end_date: string;
    deadline: string;
    actual_end_date: string;
    current_date: string;
    overused: boolean;
    over_days: number;
    remain_days: number;
}

export interface TeamPerformance {
    team_id: number;
    team_name: string;
    member_count: number;
    member_names: string[];
    team_projects_count: number;
    projects: PerformanceItem[];
    team_service_count: number;
    services: PerformanceItem[];
}

export interface TeamPerformanceResponse {
    count: number;
    total_pages: number;
    current_page: number;
    page_size: number;
    next: string | null;
    previous: string | null;
    total_teams: number;
    total_pending: number;
    total_completed: number;
    total_inprogress: number;
    teams: TeamPerformance[];
}

export const getTeamPerformance = async (teamId?: number, page: number = 1, pageSize: number = 10): Promise<TeamPerformanceResponse> => {
  let url = `/team-performance/?page=${page}&page_size=${pageSize}`;
  if (teamId) url += `&team_id=${teamId}`;
  const response = await api.get<TeamPerformanceResponse>(url);
  return response.data;
};

export interface EmployeePerformance {
  employee_id: number;
  employee_name: string;
  pending_total: number;
  completed_total: number;
  progressing_total: number;
  total_committed_project_count: number;
  total_committed_project_team: Array<{
    project_name: string;
    status: string;
    start_date: string;
    allocated_days: number;
    current_date: string;
    end_date: string;
    note: string;
    target_score: number;
    is_over_allocated: boolean;
  }>;
  total_committed_service_count: number;
  total_committed_service_team: Array<{
    service_name: string;
    status: string;
    start_date: string;
    allocated_days: number;
    current_date: string;
    end_date: string;
    note: string;
    target_score: number;
    is_over_allocated: boolean;
  }>;
}

export const getEmployeePerformance = async (employeeId?: number): Promise<EmployeePerformance> => {
  const url = employeeId ? `/employee-performance/?employee_id=${employeeId}` : '/employee-performance/';
  const response = await api.get<EmployeePerformance>(url);
  return response.data;
};

export const getUserWorkDetails = async (userId: number): Promise<UserWorkDetails> => {
    const response = await api.get<UserWorkDetails>(`/employees/${userId}/work-details/`);
    return response.data;
};

export const getMe = async (): Promise<User> => {
    const response = await api.get<User>('/users/me/');
    return response.data;
};

export const adminChangePassword = async (userId: number, data: any): Promise<any> => {
    const response = await api.put(`/admin-change-password/${userId}/`, sanitizePayload(data));
    return response.data;
};

export const getDesignations = async (): Promise<string[]> => {
    const response = await api.get<string[]>('/users/designations/');
    return response.data;
};

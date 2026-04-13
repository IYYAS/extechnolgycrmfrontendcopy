import { api } from '../../api/api';
import type { User } from '../user/userService';

export interface ProjectNature {
    id: number;
    name: string;
    created_at: string;
    updated_at: string;
}

export interface ProjectBaseInformation {
    id?: number;
    project_approach_date: string;
    name: string;
    description: string;
    creator_name: string;
    creator_designation: string;
}

export interface ProjectExecution {
    id?: number;
    work_assigned_date: string;
    assigned_delivery_date: string;
    start_date: string;
    confirmed_end_date: string;
    end_date: string | null;
}

export interface ProjectFinance {
    id?: number;
    project_cost: string;
    manpower_cost: string;
    total_invoiced: string;
    total_paid: string;
    total_balance_due: string;
}

export interface Provider {
    id: number;
    company_name: string;
    contact_person: string;
    email: string;
    phone: string;
    created_at: string;
}

export interface ProjectDomain {
    id?: number;
    provider?: Provider[];
    name: string;
    accrued_by: string;
    purchased_from: string;
    purchase_date: string;
    expiration_date: string;
    status: string;
    cost: string;
    payment_status: string;
}

export interface ProjectServer {
    id?: number;
    provider?: Provider[];
    server_type: string;
    name: string;
    accrued_by: string;
    purchased_from: string;
    purchase_date: string;
    expiration_date: string;
    status: string;
    cost: string;
    payment_status: string;
}

export interface ProjectClient {
    id?: number;
    company_name: string;
    contact_person: string;
    email: string;
    phone: string;
    created_at?: string;
    updated_at?: string;
}

export interface ProjectBusinessAddress {
    id?: number;
    gst_number?: string;
    pan_number?: string;
    email?: string;
    phone?: string;
    legal_name?: string;
    logo?: string | null;
    attention_name: string;
    unit_or_floor: string;
    building_name: string;
    plot_number: string;
    street_name: string;
    landmark: string;
    locality: string;
    city: string;
    district: string;
    state: string;
    pin_code: string;
    country: string;
    created_at?: string;
    updated_at?: string;
}

export interface BusinessAddressListResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: ProjectBusinessAddress[];
}

export interface TeamDetail {
    id: number;
    name: string;
    created_at: string;
    updated_at: string;
    team_lead: number | null;
    team_lead_name?: string;
    members: number[];
    member_names?: string[];
    members_details?: User[];
}

// Project Team (team-based, under project_teams)
export interface ProjectTeamMemberEntry {
    id?: number;
    role: string;
    cost: string;
    allocated_days: number;
    actual_days_spent: number;
    start_date: string;
    end_date: string;
    status: string;
    notes: string;
    employee: number;
    employee_name?: string;
}

export interface ProjectTeam {
    id?: number;
    team: number;
    team_detail?: TeamDetail;
    members: ProjectTeamMemberEntry[];
    allocated_time: number;
    actual_time_spent: number;
    created_at?: string;
    updated_at?: string;
}

// Standalone project team member (project_team_members)
export interface ProjectTeamMember {
    id?: number;
    role: string;
    cost: string;
    allocated_days: number;
    actual_days_spent: number;
    start_date: string;
    end_date: string;
    status: string;
    notes: string;
    employee: number;
    employee_name?: string;
}

// Service member with employee detail
export interface EmployeeDetail {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    phone_number: string | null;
    designation: string | null;
    roles: { id: number; name: string }[];
}

export interface ServiceMember {
    id?: number;
    employee: number;
    employee_detail?: EmployeeDetail;
    role: string;
    allocated_days: number;
    actual_days: number;
    cost: string;
    employee_name?: string;
}

export interface ServiceTeam {
    id?: number;
    team: number;
    team_detail?: TeamDetail;
    allocated_days: number;
    actual_days: number;
}

export interface ProjectService {
    id?: number;
    name: string;
    description: string;
    start_date: string;
    deadline: string;
    status: string;
    payment_status: string;
    project_base_informations: ProjectBaseInformation[];
    project_excutions: ProjectExecution[];
    project_finances: ProjectFinance[];
    project_teams?: ProjectTeam[];
    teams?: ServiceTeam[];
    members?: ServiceMember[];
}

export interface ProjectDocument {
    id?: number;
    project?: number;
    name: string;
    document: string; // Base64 for upload, URL for display
    description: string;
    uploaded_at?: string;
}

export interface Project {
    id: number;
    name?: string;
    description: string;
    status: string;
    created_at: string;
    updated_at: string;
    project_nature: number;
    project_nature_detail?: ProjectNature;
    project_base_informations: ProjectBaseInformation[];
    project_excutions: ProjectExecution[];
    project_finances: ProjectFinance[];
    project_domains: ProjectDomain[];
    project_servers: ProjectServer[];
    project_clients: ProjectClient[];
    project_business_addresses: ProjectBusinessAddress[];
    project_documents?: ProjectDocument[];
    project_teams: ProjectTeam[];
    project_team_members: ProjectTeamMember[];
    services: ProjectService[];
}

export interface ProjectListResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: Project[];
}

export const getProjects = async (page: number = 1, search: string = ''): Promise<ProjectListResponse> => {
    const url = search
        ? `/projects/?page=${page}&search=${encodeURIComponent(search)}`
        : `/projects/?page=${page}`;
    const response = await api.get<ProjectListResponse>(url);
    return response.data;
};

export const getProject = async (projectId: number): Promise<Project> => {
    const response = await api.get<Project>(`/projects/${projectId}/`);
    return response.data;
};

// Strip read-only server-generated fields from payload while keeping all IDs
const STRIP_KEYS = new Set([
    'created_at', 'updated_at', 'team_detail', 'project_nature_detail', 'employee_detail', 'projects'
]);

const sanitizePayload = (obj: any): any => {
    if (obj instanceof File || obj instanceof Blob) {
        return obj;
    }
    if (Array.isArray(obj)) {
        return obj.map(sanitizePayload);
    }
    if (obj !== null && typeof obj === 'object') {
        const cleaned: any = {};
        for (const [key, value] of Object.entries(obj)) {
            if (STRIP_KEYS.has(key)) continue;

            // If it's a logo or document field and it's a string (URL), 
            // we skip it because it's an existing file on the server.
            // Sending it back as a string causes "not a file" errors in DRF.
            if ((key === 'logo' || key === 'document') && typeof value === 'string' && value.startsWith('http')) {
                continue;
            }

            cleaned[key] = sanitizePayload(value);
        }
        return cleaned;
    }
    return obj === '' ? null : obj;
};

const containsFiles = (obj: any): boolean => {
    if (obj instanceof File || obj instanceof Blob) return true;
    if (Array.isArray(obj)) return obj.some(containsFiles);
    if (obj !== null && typeof obj === 'object') {
        return Object.values(obj).some(containsFiles);
    }
    return false;
};

const appendToFormData = (formData: FormData, key: string, value: any) => {
    if (value instanceof File || value instanceof Blob) {
        formData.append(key, value);
    } else if (Array.isArray(value)) {
        if (value.length === 0) return;
        value.forEach((v, i) => {
            if (typeof v === 'object' && v !== null && !(v instanceof File) && !(v instanceof Blob)) {
                // For objects in arrays: field[index]subkey
                Object.entries(v).forEach(([subKey, subVal]) => {
                    appendToFormData(formData, `${key}[${i}]${subKey}`, subVal);
                });
            } else {
                // For simple values in arrays: field[index]
                appendToFormData(formData, `${key}[${i}]`, v);
            }
        });
    } else if (value !== null && typeof value === 'object') {
        Object.entries(value).forEach(([k, v]) => {
            // For top-level nested objects: field.subkey
            const newKey = key ? `${key}.${k}` : k;
            appendToFormData(formData, newKey, v);
        });
    } else if (value !== null && value !== undefined && value !== '') {
        formData.append(key, String(value));
    }
};

const toFormData = (obj: any): FormData => {
    const formData = new FormData();
    Object.entries(obj).forEach(([key, value]) => {
        if (value === null || value === undefined) return;
        appendToFormData(formData, key, value);
    });
    return formData;
};

export const createProject = async (projectData: any): Promise<Project> => {
    const payload = sanitizePayload(projectData);
    if (containsFiles(payload)) {
        const formData = toFormData(payload);
        const response = await api.post<Project>('/projects/', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    }
    const response = await api.post<Project>('/projects/', payload);
    return response.data;
};

export const updateProject = async (projectId: number, projectData: any): Promise<Project> => {
    const payload = sanitizePayload(projectData);
    if (containsFiles(payload)) {
        const formData = toFormData(payload);
        const response = await api.put<Project>(`/projects/${projectId}/`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    }
    const response = await api.put<Project>(`/projects/${projectId}/`, payload);
    return response.data;
};

export const deleteProject = async (projectId: number): Promise<void> => {
    await api.delete(`/projects/${projectId}/`);
};

export const getTeams = async (): Promise<TeamDetail[]> => {
    const response = await api.get<any>('/teams/');
    if (response.data && response.data.results) {
        return response.data.results;
    }
    return response.data;
};

export const getProjectNatures = async (): Promise<ProjectNature[]> => {
    const response = await api.get<any>('/project-natures/');
    if (response.data && response.data.results) {
        return response.data.results;
    }
    return response.data;
};

export const getAllBusinessAddresses = async (page: number = 1, search: string = ''): Promise<BusinessAddressListResponse> => {
    const url = search
        ? `/project-business-addresses/?page=${page}&search=${encodeURIComponent(search)}`
        : `/project-business-addresses/?page=${page}`;
    const response = await api.get<BusinessAddressListResponse>(url);
    return response.data;
};

export const createProjectNature = async (name: string): Promise<ProjectNature> => {
    const response = await api.post<ProjectNature>('/project-natures/', { name });
    return response.data;
};

export const deleteProjectNature = async (id: number): Promise<void> => {
    await api.delete(`/project-natures/${id}/`);
};

export interface ProjectSummary {
    id: number;
    name: string | null;
    total_invoiced: string | number;
    total_paid: string | number;
    total_balance_due: string | number;
    business_address_id: number | null;
}

export interface ProjectSummaryResponse {
    count: number;
    results: ProjectSummary[];
}

export const getProjectSummaries = async (businessAddressId?: number): Promise<ProjectSummary[]> => {
    let url = '/projects/summary/';
    if (businessAddressId) {
        url += `?business_address_id=${businessAddressId}`;
    }
    const response = await api.get<ProjectSummaryResponse>(url);
    return response.data.results;
};

export interface BusinessAddressSummary {
    id: number;
    legal_name: string | null;
    total_invoiced: string | number;
    total_paid: string | number;
    total_balance_due: string | number;
    invoice_count: number;
}

export interface BusinessAddressSummaryResponse {
    count: number;
    results: BusinessAddressSummary[];
}

export const getAddressSummaries = async (search: string = ''): Promise<BusinessAddressSummary[]> => {
    const url = search
        ? `/project-business-addresses/summary/?search=${encodeURIComponent(search)}`
        : '/project-business-addresses/summary/';
    const response = await api.get<BusinessAddressSummaryResponse>(url);
    return response.data.results;
};

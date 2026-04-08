import { api } from '../../api/api';

export interface OverviewProjects {
    total: number;
    pending: number;
    progressing: number;
    completed: number;
}

export interface OverviewServices {
    total: number;
    completed: number;
    in_progress: number;
    overdue: number;
}

export interface OverviewPayment {
    unpaid_projects: number;
    paid_projects: number;
    total_remaining_amount?: number;
}

export interface OverviewWork {
    unfinished_teams: number;
    total_teams?: number;
    overdue_teams?: number;
}

export interface AnalyticalOverview {
    projects: OverviewProjects;
    payment: OverviewPayment;
    work: OverviewWork;
}

export interface AnalyticalServiceTeam {
    id: number;
    name: string;
    members_count: number;
    allocated_days: number;
    actual_days: number;
}

export interface AnalyticalService {
    id?: number;
    name?: string;
    service_team_name?: string;
    status: string;
    service_team_status?: string;
    deadline?: string | null;
    is_overdue?: boolean;
    paid_status?: string;
    teams?: AnalyticalServiceTeam[];
    
    // New granular dates
    service_team_start_date?: string | null;
    service_team_end_date?: string | null;
    service_team_deadline?: string | null;
    service_team_actual_date?: string | null;
    service_cost?: number;
}

export interface ProjectInfo {
    id: number;
    name: string;
    status: string;
    created_at: string;
}

export interface ProjectProgress {
    completion_percentage: number;
    total_services: number;
    completed_services: number;
    pending_services: number;
    overdue_services: number;
}

export interface ProjectTeams {
    project_teams_count: number;
    service_teams_count: number;
    total_teams: number;
    total_members: number;
    allocated_days: number;
    actual_days: number;
}

export interface ProjectFinance {
    project_cost: number;
    total_invoiced: number;
    total_paid: number;
    balance_due: number;
}

export interface AnalyticalProject {
    project_id?: number;
    project_name: string;
    project_team_name: string;
    project_team_status?: string;
    project_status?: string;
    status: string;
    paid_status: string;
    serviceteam_count: number;
    server_count?: number;
    paid_server_count?: number;
    unpaid_server_count?: number;
    domain_count?: number;
    paid_domain_count?: number;
    unpaid_domain_count?: number;
    server_expiring_soon_count?: number;
    domain_expiring_soon_count?: number;
    server_name?: string;
    domain_name?: string;
    services: AnalyticalService[];
    start_date?: string;
    
    // New granular payments
    project_payment?: string;
    domain_payment?: string;
    server_payment?: string;
    service_payment?: string;
    
    // New team dates & counts
    project_teams_count?: number;
    service_teams_count?: number;
    project_team_start_date?: string | null;
    project_team_end_date?: string | null;
    project_team_deadline?: string | null;
    project_team_actual_date?: string | null;
    
    total_paid?: number;
    balance_due?: number;
    total_project_cost?: number;
    project_cost?: number;
    domain_cost?: number;
    server_cost?: number;
    server_deadline?: string;
    domain_deadline?: string;
    category_status?: {
        project: string;
        project_total_cost?: number;
        project_paid_cost?: number;
        project_unpaid_cost?: number;

        domain: string;
        domain_total_cost?: number;
        domain_paid_cost?: number;
        domain_unpaid_cost?: number;
        domain_deadline?: string;
        domain_items?: Array<{
            name: string;
            cost: number;
            payment_status: string;
            deadline: string;
        }>;

        server: string;
        server_total_cost?: number;
        server_paid_cost?: number;
        server_unpaid_cost?: number;
        server_deadline?: string;
        server_items?: Array<{
            name: string;
            cost: number;
            payment_status: string;
            deadline: string;
        }>;

        service: string;
        service_total_cost?: number;
        service_paid_cost?: number;
        service_unpaid_cost?: number;
    };
    
    completed_teams_count?: number;
    total_teams_count?: number;
    
    // Legacy support (optional)
    project?: ProjectInfo;
    progress?: ProjectProgress;
    teams?: ProjectTeams;
    finance?: ProjectFinance;
}

export interface ServerOverview {
    total_servers: number;
    active_servers: number;
    expired_servers: number;
    paid_servers: number;
    unpaid_servers: number;
    total_cost: number;
}

export interface ServerByType {
    server_type: string;
    count: number;
}

export interface ServerByAccruedBy {
    accrued_by: string;
    count: number;
}

export interface ExpiringSoonServer {
    id: number;
    name: string;
    server_type: string;
    expiration_date: string;
    project: string | null;
    days_until_expiry?: number;
}

export interface DomainOverview {
    total_domains: number;
    active_domains: number;
    expired_domains: number;
    paid_domains: number;
    unpaid_domains: number;
    total_cost: number;
}

export interface DomainByAccruedBy {
    accrued_by: string;
    count: number;
}

export interface ExpiringSoonDomain {
    id: number;
    domain: string;
    expiration_date: string;
    purchase_date?: string;
    project: string | null;
    purchased_from?: string;
    days_until_expiry?: number | null;
}

export interface DomainListDomain {
    id: number;
    name: string;
    domain: string;
    expiration_date: string;
    purchase_date?: string;
    project: string | null;
    payment_status: string;
    status: string;
    effective_status?: string;
    cost: number;
    accrued_by?: string;
    purchased_from?: string;
    days_until_expiry?: number | null;
}

export interface DomainAnalyticsResponse {
    overview: DomainOverview;
    by_accrued_by: DomainByAccruedBy[];
    expiring_soon: ExpiringSoonDomain[];
    domains_list?: DomainListDomain[];
}

export interface ServerListServer {
    id: number;
    name: string;
    server_type: string;
    expiration_date: string;
    purchase_date?: string;
    project: string | null;
    payment_status: string;
    status: string;
    effective_status?: string;
    cost: number;
    accrued_by?: string;
    purchased_from?: string;
    days_until_expiry?: number;
}

export interface ServerAnalyticsResponse {
    overview: ServerOverview;
    by_server_type: ServerByType[];
    by_accrued_by: ServerByAccruedBy[];
    expiring_soon: ExpiringSoonServer[];
    servers_list?: ServerListServer[];
}

export interface AnalyticalProjectsResponse {
    overview?: AnalyticalOverview;
    total_project_count: number;
    count?: number; // For backward compatibility if needed internally
    next: string | null;
    previous: string | null;
    results: AnalyticalProject[];
}

export interface AnalyticalFilter {
    search?: string;
    start_date?: string;
    end_date?: string;
    month?: string;
    year?: string;
    filter_type?: string;
    page?: number;
    page_size?: number;
    status?: string;
    payment_status?: string;
    team_status?: string;
    date_field?: string;
}

const buildQueryString = (filter: AnalyticalFilter): string => {
    const params = new URLSearchParams();
    if (filter.search) params.append('search', filter.search);
    if (filter.start_date) params.append('start_date', filter.start_date);
    if (filter.end_date) params.append('end_date', filter.end_date);
    if (filter.month) params.append('month', filter.month);
    if (filter.year) params.append('year', filter.year);
    if (filter.filter_type && filter.filter_type !== 'custom') {
        params.append('filter_type', filter.filter_type);
    }
    if (filter.page) params.append('page', filter.page.toString());
    if (filter.page_size) params.append('page_size', filter.page_size.toString());
    if (filter.status) params.append('status', filter.status);
    if (filter.payment_status) params.append('payment_status', filter.payment_status);
    if (filter.team_status) params.append('team_status', filter.team_status);
    if (filter.date_field) params.append('date_field', filter.date_field);
    
    const qs = params.toString();
    return qs ? `?${qs}` : '';
};

export const getAnalyticalProjects = async (filter: AnalyticalFilter): Promise<AnalyticalProjectsResponse> => {
    const response = await api.get<AnalyticalProjectsResponse>(`/analytical/projects/${buildQueryString(filter)}`);
    return response.data;
};

export const getServerAnalytics = async (): Promise<ServerAnalyticsResponse> => {
    const response = await api.get<ServerAnalyticsResponse>('/analytical/servers/');
    return response.data;
};

export const getDomainAnalytics = async (): Promise<DomainAnalyticsResponse> => {
    const response = await api.get<DomainAnalyticsResponse>('/analytical/domains/');
    return response.data;
};

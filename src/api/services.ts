import client from './client';
import type {
    User, Project, DashboardStats, EmployeeDailyActivity, FilteredProjectsResponse,
    KPISummary, ProjectStatusCount, ProjectHealth, EmployeeUtilization, CostSummary,
    ExecutiveSummary, ProjectPortfolioStatus, ProjectDeliveryHealth, ProjectNatureBreakdown,
    FinancialPerformance, CostAnatomy, WorkforceBandwidth, ProductivityTrend,
    GeoRevenue, RevenueByCreator, DashboardFilterParams, ProjectsOverview, AssetAnalyticsResponse,
    CreateInvoiceRequest, Invoice, RecordPaymentRequest, CreateAdvancedPaymentRequest,
    Payment, AdvancedPayment, FinancialSummary, ProjectFinancialSummary, ProjectInvoiceSummary,
    Client, RecentPayment, PaginatedResponse, ProjectTimelineStatus, Domain, Server, Employee
} from '../types';
import { PROJECT_STATUS_CHOICES } from '../types';

export { PROJECT_STATUS_CHOICES };

// CEO Dashboard Services

export const getProjectsFinancialSummary = async (page: number = 1, name?: string) => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    if (name) params.append('name', name);
    const response = await client.get<PaginatedResponse<ProjectFinancialSummary>>(`/projects-financial-summary/?${params.toString()}`);
    return response.data;
};

export const getExecutiveSummary = async (period: 'ALL' | 'WEEK' | 'MONTH' | 'YEAR' = 'ALL') => {
    const response = await client.get<ExecutiveSummary>('/dashboard/executive-summary/', {
        params: period !== 'ALL' ? { period } : {}
    });
    return response.data;
};

export const getProjectPortfolioStatus = async (params?: DashboardFilterParams) => {
    const response = await client.get<ProjectPortfolioStatus[]>('/dashboard/project-portfolio-status/', { params });
    return response.data;
};

export const getProjectDeliveryHealth = async (period: 'ALL' | 'WEEK' | 'MONTH' | 'YEAR' = 'ALL') => {
    const response = await client.get<ProjectDeliveryHealth[]>('/dashboard/project-delivery-health/', {
        params: period !== 'ALL' ? { period } : {}
    });
    return response.data;
};

export const getProjectNatureBreakdown = async (period: 'ALL' | 'WEEK' | 'MONTH' | 'YEAR' = 'ALL') => {
    const response = await client.get<ProjectNatureBreakdown[]>('/dashboard/project-nature-breakdown/', {
        params: period !== 'ALL' ? { period } : {}
    });
    return response.data;
};

export const getFinancialPerformance = async (params?: DashboardFilterParams) => {
    const response = await client.get<FinancialPerformance[]>('/dashboard/financial-performance/', { params });
    return response.data;
};

export const getCostAnatomy = async (period: 'ALL' | '1M' | '6M' | '1Y' = 'ALL') => {
    const response = await client.get<CostAnatomy[]>('/dashboard/cost-anatomy/', {
        params: period !== 'ALL' ? { period } : {}
    });
    return response.data;
};

export const getWorkforceBandwidth = async () => {
    const response = await client.get<WorkforceBandwidth[]>('/dashboard/workforce-bandwidth/');
    return response.data;
};

export const getProductivityTrends = async () => {
    const response = await client.get<ProductivityTrend[]>('/dashboard/productivity-trends/');
    return response.data;
};

export const getGeoRevenueMap = async (period: 'ALL' | 'WEEK' | 'MONTH' | 'YEAR' = 'ALL') => {
    const response = await client.get<GeoRevenue[]>('/dashboard/geo-revenue-map/', {
        params: period !== 'ALL' ? { period } : {}
    });
    return response.data;
};

export const getRevenueByCreator = async (period: 'ALL' | 'WEEK' | 'MONTH' | 'YEAR' = 'ALL') => {
    const response = await client.get<RevenueByCreator[]>('/dashboard/revenue-by-creator/', {
        params: period !== 'ALL' ? { period } : {}
    });
    return response.data;
};

export const getProjectsOverview = async (period: 'ALL' | '1M' | '6M' | '1Y' = 'ALL') => {
    const response = await client.get<ProjectsOverview>('/dashboard/projects-overview/', {
        params: period !== 'ALL' ? { period } : {}
    });
    return response.data;
};

export const getServerAnalytics = async (
    filter: 'all' | 'today' | 'this_month' | 'this_year' | 'custom' = 'all',
    startDate?: string,
    endDate?: string
) => {
    const params: any = { filter };
    if (filter === 'custom' && startDate && endDate) {
        params.start_date = startDate;
        params.end_date = endDate;
    }
    const response = await client.get<AssetAnalyticsResponse>('/dashboard/server-analytics/', { params });
    return response.data;
};

export const getDomainAnalytics = async (
    filter: 'all' | 'today' | 'this_month' | 'this_year' | 'custom' = 'all',
    startDate?: string,
    endDate?: string
) => {
    const params: any = { filter };
    if (filter === 'custom' && startDate && endDate) {
        params.start_date = startDate;
        params.end_date = endDate;
    }
    const response = await client.get<AssetAnalyticsResponse>('/dashboard/domain-analytics/', { params });
    return response.data;
};

export const login = async (credentials: { username: string; password: string }) => {
    console.log('add login service called with:', credentials);
    try {
        console.log('add making POST request to /login/');
        const response = await client.post('/login/', credentials);
        console.log('add login POST response received:', response);
        console.log('add response data:', response.data);
        return response.data;
    } catch (error: any) {
        console.error('add login service error:', error);
        console.error('add error message:', error.message);
        console.error('add error response:', error.response);
        throw error;
    }
};

export const getDashboardStats = async () => {
    const response = await client.get<DashboardStats>('/dashboard/');
    return response.data;
};

export const getKPISummary = async () => {
    const response = await client.get<KPISummary>('/dashboard/kpi-summary/');
    return response.data;
};

export const getProjectStatusChart = async (period: 'ALL' | 'WEEK' | 'MONTH' | 'YEAR' = 'ALL') => {
    const response = await client.get<ProjectStatusCount[]>('/dashboard/project-status/', {
        params: period !== 'ALL' ? { period } : {}
    });
    return response.data;
};

export const getProjectHealth = async () => {
    const response = await client.get<ProjectHealth>('/dashboard/project-health/');
    return response.data;
};

export const getEmployeeUtilization = async () => {
    const response = await client.get<EmployeeUtilization[]>('/dashboard/employee-utilization/');
    return response.data;
};

export const getCostSummary = async () => {
    const response = await client.get<CostSummary>('/dashboard/cost-summary/');
    return response.data;
};

export const getFilteredProjects = async (
    filter: 'today' | 'this_week' | 'this_month' | 'this_year' | 'custom',
    dateField: 'start_date' | 'end_date' | 'created_at' | 'confirmed_end_date' = 'start_date',
    startDate?: string,
    endDate?: string
) => {
    const params = new URLSearchParams();
    params.append('filter', filter);
    params.append('date_field', dateField);

    if (filter === 'custom' && startDate && endDate) {
        params.append('start_date', startDate);
        params.append('end_date', endDate);
    }

    const response = await client.get<FilteredProjectsResponse>(`/projects/filter/?${params.toString()}`);
    return response.data;
};

export const debugFilteredProjects = async (
    filter: 'today' | 'this_week' | 'this_month' | 'this_year' | 'custom',
    dateField: 'start_date' | 'end_date' | 'created_at' | 'confirmed_end_date' = 'start_date',
    startDate?: string,
    endDate?: string
) => {
    const params = new URLSearchParams();
    params.append('filter', filter);
    params.append('date_field', dateField);

    if (filter === 'custom' && startDate && endDate) {
        params.append('start_date', startDate);
        params.append('end_date', endDate);
    }

    console.log('Debugging Filtered Projects API Call:', params.toString());

    try {
        const response = await client.get<FilteredProjectsResponse>(`/projects/filter/?${params.toString()}`);
        console.log('Filtered Projects Response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error Fetching Filtered Projects:', error);
        throw error;
    }
};

export const getEmployees = async (page: number = 1, filters: { search?: string, name?: string, role?: string, phone?: string, email?: string } = {}) => {
    const params = new URLSearchParams();
    params.append('page', page.toString());

    if (filters.search) params.append('search', filters.search);
    if (filters.name) params.append('name', filters.name);
    if (filters.role) params.append('role', filters.role);
    if (filters.phone) params.append('phone', filters.phone);
    if (filters.email) params.append('email', filters.email);

    const response = await client.get<PaginatedResponse<Employee>>(`/employees/?${params.toString()}`);
    return response.data;
};

export const getEmployee = async (id: number) => {
    const response = await client.get<Employee>(`/employees/${id}/`);
    return response.data;
};

export const getClients = async (page: number = 1, filters: { search?: string, name?: string, email?: string, phone?: string, company_name?: string } = {}) => {
    const params = new URLSearchParams();
    params.append('page', page.toString());

    if (filters.search) params.append('search', filters.search);
    if (filters.name) params.append('name', filters.name);
    if (filters.email) params.append('email', filters.email);
    if (filters.phone) params.append('phone', filters.phone);
    if (filters.company_name) params.append('company_name', filters.company_name);

    const response = await client.get<PaginatedResponse<Client>>(`/clients/?${params.toString()}`);
    return response.data;
};

export const getClient = async (id: number) => {
    const response = await client.get<Client>(`/clients/${id}/`);
    return response.data;
};

export const createClient = async (clientData: Partial<Client>) => {
    const response = await client.post('/clients/', clientData);
    return response.data;
};

export const updateClient = async (id: number, clientData: Partial<Client>) => {
    const response = await client.put(`/clients/${id}/`, clientData);
    return response.data;
};

export const deleteClient = async (id: number) => {
    await client.delete(`/clients/${id}/`);
};

export const getUsers = async (page: number = 1) => {
    const response = await client.get<PaginatedResponse<User>>(`/users/?page=${page}`);
    return response.data;
};

export const getUser = async (id: number) => {
    const response = await client.get<User>(`/users/${id}/`);
    return response.data;
};

export const createUser = async (userData: Partial<User> & { password?: string }) => {
    const response = await client.post('/users/', userData);
    return response.data;
};

export const updateUser = async (id: number, userData: Partial<User>) => {
    const response = await client.put(`/users/${id}/`, userData);
    return response.data;
};

export const deleteUser = async (id: number) => {
    await client.delete(`/users/${id}/`);
};

export const getProjects = async (page: number = 1, filters: { search?: string, name?: string, client?: string, domain?: string, server?: string } = {}) => {
    const params = new URLSearchParams();
    params.append('page', page.toString());

    if (filters.search) params.append('search', filters.search);
    if (filters.name) params.append('name', filters.name);
    if (filters.client) params.append('client', filters.client);
    if (filters.domain) params.append('domain', filters.domain);
    if (filters.server) params.append('server', filters.server);

    const response = await client.get<PaginatedResponse<Project>>(`/projects/?${params.toString()}`);
    return response.data;
};

export const getProject = async (id: number) => {
    const response = await client.get<Project>(`/projects/${id}/`);
    return response.data;
};

export const createProject = async (projectData: Partial<Project> & { employee_assignments?: any[] }) => {
    console.log('API Request: Creating Project with data:', projectData);
    const response = await client.post('/projects/', projectData);
    console.log('API Response: Create Project:', response.data);
    return response.data;
};

export const updateProject = async (id: number, projectData: Partial<Project> & { employee_assignments?: any[] }) => {
    console.log(`API Request: Updating Project ${id} with data:`, projectData);
    const response = await client.put(`/projects/${id}/`, projectData);
    console.log(`API Response: Update Project ${id}:`, response.data);
    return response.data;
};

export const deleteProject = async (id: number) => {
    await client.delete(`/projects/${id}/`);
};

export const getDailyActivities = async () => {
    const response = await client.get<EmployeeDailyActivity[]>('/employee-daily-activities/');
    return response.data;
};

export const createDailyActivity = async (data: Partial<EmployeeDailyActivity>) => {
    const response = await client.post('/employee-daily-activities/', data);
    return response.data;
};

export const updateDailyActivity = async (id: number, data: Partial<EmployeeDailyActivity>) => {
    const response = await client.put(`/employee-daily-activities/${id}/`, data);
    return response.data;
};

export const deleteDailyActivity = async (id: number) => {
    await client.delete(`/employee-daily-activities/${id}/`);
};

export const getEmployeeActivities = async (employeeId: number) => {
    const response = await client.get<EmployeeDailyActivity[]>(`/employees/${employeeId}/activities/`);
    return response.data;
};

// Employee Assignment Management
export const addProjectAssignment = async (projectId: number, assignmentData: any) => {
    console.log(`API Request: Adding assignment to Project ${projectId}:`, assignmentData);
    const response = await client.post(`/projects/${projectId}/assignments/`, assignmentData);
    console.log(`API Response: Assignment added:`, response.data);
    return response.data;
};

export const updateProjectAssignment = async (projectId: number, assignmentId: number, assignmentData: any) => {
    console.log(`API Request: Updating assignment ${assignmentId} in Project ${projectId}:`, assignmentData);
    const response = await client.put(`/projects/${projectId}/assignments/${assignmentId}/`, assignmentData);
    console.log(`API Response: Assignment updated:`, response.data);
    return response.data;
};

export const deleteProjectAssignment = async (projectId: number, assignmentId: number) => {
    console.log(`API Request: Deleting assignment ${assignmentId} from Project ${projectId}`);
    await client.delete(`/projects/${projectId}/assignments/${assignmentId}/`);
    console.log(`API Response: Assignment deleted`);
};

export const createInvoice = async (projectId: number, data: CreateInvoiceRequest) => {
    const response = await client.post<Invoice>(`/projects/${projectId}/billing/`, data);
    return response.data;
};

export const createInvoiceDirect = async (data: any) => {
    const response = await client.post<Invoice>(`/invoices/`, data);
    return response.data;
};

export const getInvoices = async (projectId?: number) => {
    const url = projectId ? `/invoices/?project_id=${projectId}` : `/invoices/`;
    const response = await client.get<Invoice[]>(url);
    return response.data;
};

export const getInvoice = async (invoiceId: number) => {
    const response = await client.get<Invoice>(`/invoices/${invoiceId}/`);
    return response.data;
};

export const getProjectInvoices = async (projectId: number) => {
    const response = await client.get<ProjectInvoiceSummary[]>(`/projects/${projectId}/invoices/`);
    return response.data;
};

export const getLatestProjectInvoice = async (projectId: number) => {
    const response = await client.get<Invoice>(`/projects/${projectId}/billing/`);
    return response.data;
};

export const updateInvoice = async (invoiceId: number, data: CreateInvoiceRequest) => {
    const response = await client.put<Invoice>(`/invoices/${invoiceId}/`, data);
    return response.data;
};

export const deleteInvoice = async (invoiceId: number) => {
    await client.delete(`/invoices/${invoiceId}/`);
};

export const downloadInvoicePdf = async (invoiceId: number) => {
    const response = await client.get(`/invoices/${invoiceId}/pdf/`, {
        responseType: 'blob',
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Invoice_${invoiceId}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
};

export const recordPayment = async (invoiceId: number, data: RecordPaymentRequest) => {
    const response = await client.post<Payment>(`/invoices/${invoiceId}/payments/`, data);
    return response.data;
};

export const getInvoicePayments = async (invoiceId: number) => {
    const response = await client.get<Payment[]>(`/invoices/${invoiceId}/payments/`);
    return response.data;
};

export const createAdvancedPayment = async (data: CreateAdvancedPaymentRequest) => {
    const response = await client.post<AdvancedPayment>(`/advanced-payments/`, data);
    return response.data;
};

export const getClientFinancialSummary = async (clientId: number) => {
    const response = await client.get<FinancialSummary>(`/clients/${clientId}/financial-summary/`);
    return response.data;
}; export const updatePayment = async (paymentId: number, data: Partial<RecordPaymentRequest>) => {
    const response = await client.put<Payment>(`/payments/${paymentId}/`, data);
    return response.data;
};

export const deletePayment = async (paymentId: number) => {
    await client.delete(`/payments/${paymentId}/`);
};

export const getRecentPayments = async (page: number = 1) => {
    const response = await client.get<PaginatedResponse<RecentPayment>>(`/payments/recent/?page=${page}`);
    return response.data;
};

export const getProjectTimelineStatus = async () => {
    const response = await client.get<ProjectTimelineStatus[]>('/projects/timeline-status/');
    return response.data;
};

export const getDomains = async (page: number = 1, filters: { search?: string, name?: string, project?: string, accrued_by?: string } = {}) => {
    const params = new URLSearchParams();
    params.append('page', page.toString());

    if (filters.search) params.append('search', filters.search);
    if (filters.name) params.append('name', filters.name);
    if (filters.project) params.append('project', filters.project);
    if (filters.accrued_by) params.append('accrued_by', filters.accrued_by);

    const response = await client.get<PaginatedResponse<Domain>>(`/assets/domains/?${params.toString()}`);
    return response.data;
};

export const getServers = async (page: number = 1, filters: { search?: string, name?: string, project?: string, server_type?: string, accrued_by?: string } = {}) => {
    const params = new URLSearchParams();
    params.append('page', page.toString());

    if (filters.search) params.append('search', filters.search);
    if (filters.name) params.append('name', filters.name);
    if (filters.project) params.append('project', filters.project);
    if (filters.server_type) params.append('server_type', filters.server_type);
    if (filters.accrued_by) params.append('accrued_by', filters.accrued_by);

    const response = await client.get<PaginatedResponse<Server>>(`/assets/servers/?${params.toString()}`);
    return response.data;
};

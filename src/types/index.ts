export interface Client {
  id: number;
  name: string;
  email: string;
  phone: string;
  company_name: string;
  address: string | null;
  country?: string;
  about?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Employee {
  id: number;
  username: string;
  email: string;
  name: string;
  phone_number: string | null;
  is_superuser: boolean;
  is_staff: boolean;
  is_phone_verified: boolean;
  is_email_verified: boolean;
  created_at: string;
  updated_at: string;
  date_joined: string;
  designation: string | null;
  job_role: string | null;
  role: string;
  project_count: number;
  projects_assigned: string[];
}

export interface User {
  id: number;
  username: string;
  email: string;
  phone_number: string;
  designation: string;
  role: string;
  is_active: boolean;
  is_phone_verified: boolean;
  is_email_verified: boolean;
  date_joined: string;
}

export interface EmployeeAssignment {
  id?: number;
  employee: number;
  role: string;
  cost: string;
  allocated_days: number;
  actual_days_spent: number;
  start_date: string;
  end_date?: string | null;
  status: string;
}

export interface Project {
  id: number;
  unique_id: string;
  name: string;
  client_name: string;
  client_country: string | null;
  client_phone: string | null;
  client_email: string | null;
  client_logo: string | null;
  client_about: string | null;
  client_approach_date: string | null;
  client?: number;
  client_details?: {
    id: number;
    name: string;
    email: string;
    phone: string;
    company_name: string;
    address: string | null;
    country?: string;
    about?: string;
  };
  project_approach_date: string | null;
  project_nature: string;
  status: 'Proposed' | 'Planning' | 'Approved' | 'In Progress' | 'On Hold' | 'Postponed' | 'Blocked' | 'Testing' | 'Completed' | 'Live' | 'Maintenance' | 'Cancelled';
  description: string;

  // Dates
  work_assigned_date: string | null;
  assigned_delivery_date: string | null;
  start_date: string | null;
  confirmed_end_date: string | null;
  end_date: string | null;

  // Financials
  budget: string;
  total_spend_days: number;
  allocated_project_days: number;
  over_spend_days: number;
  saved_days: number;
  over_spend: string;
  manpower_cost: string;
  total_people_assigned: number;
  actual_cost: string;
  server_cost: string;
  domain_cost: string;
  profit_amount: number;
  is_profitable: boolean;
  profit_status: string;

  // Employee Assignments - from API response
  assignments?: EmployeeAssignment[];
  assigned_employees?: number[];

  // Legacy Employee Assignments field
  employee_assignments?: EmployeeAssignment[];

  // Legacy Employee fields (Flattened from API for now)
  employee: string | null;
  employee_name: string | null;
  employee_role: string | null;
  employee_cost: string | null;
  employee_over_spend: string | null;
  employee_allocated_days: number | null;
  employee_actual_days_spent: number | null;
  employee_start_date: string | null;
  employee_end_date: string | null;
  employee_status: string | null;

  // Creator
  creator_name: string;
  creator_designation: string;

  // Domain & Hosting
  domain_name: string | null;
  domain_accrued_by: string;
  domain_purchased_from: string | null;
  domain_purchase_date: string | null;
  domain_expiration_date: string | null;
  domain_status: string; // New field

  server_type: string | null;
  server_name: string | null;
  server_ip: string | null;
  server_accrued_by: string;
  server_purchase_date: string | null;
  server_expiration_date: string | null;
  server_status: string; // New field

  // Billing Summary
  billing_status?: 'UNPAID' | 'PARTIAL' | 'PAID' | 'OVERDUE';
  balance_due?: string | number;
  total_balance_due?: string | number;
  total_invoiced?: string | number;
  total_project_cost?: string | number;
  total_paid?: string | number;

  // Nested objects from API
  domain?: {
    name: string | null;
    accrued_by: string;
    purchased_from: string | null;
    purchase_date: string | null;
    expiration_date: string | null;
    status: string;
    cost: string;
  };
  server?: {
    server_type: string | null;
    name: string | null;
    accrued_by: string;
    purchase_date: string | null;
    expiration_date: string | null;
    status: string;
    cost: string;
  };
  finance?: {
    project_cost: string;
    manpower_cost: string;
    total_invoiced: string;
    total_paid: string;
    total_balance_due: string;
  };
}

export interface DashboardProject {
  id: number;
  name: string;
  status: string;
  profit_amount: number;
  profit_status: 'Profit' | 'Loss';
  is_profitable: boolean;
}

export interface DashboardStats {
  total_projects: number;
  pending_projects: number;
  projects: DashboardProject[];
}

export interface KPISummary {
  total_employees: number;
  total_projects: number;
  active_projects: number;
  delayed_projects: number;
  total_actual_cost: string;
}

export interface ProjectStatusCount {
  status: string;
  count: number;
}

export interface ProjectHealth {
  on_time: number;
  delayed: number;
}

export interface EmployeeUtilization {
  employee_name: string;
  allocated_days: number;
  actual_days: number;
}

export interface CostSummary {
  total_manpower_cost: string;
  total_actual_cost: string;
  total_saved_amount: string;
  total_overspend: string;
}

export interface FilterInfo {
  type: 'today' | 'this_week' | 'this_month' | 'this_year' | 'custom';
  date_field?: 'start_date' | 'end_date' | 'created_at' | 'confirmed_end_date';
}

export interface DashboardFilterParams {
  filter?: 'today' | 'this_week' | 'this_month' | 'this_year' | 'custom';
  date_field?: 'start_date' | 'end_date' | 'confirmed_end_date' | 'created_at';
  start_date?: string;
  end_date?: string;
}

export interface FilteredProjectsResponse {
  count: number;
  filter: FilterInfo;
  results: Project[];
}

export interface EmployeeDailyActivity {
  id: number;
  employee: number;
  employee_name: string;
  project: number | null;
  project_name: string | null;
  project_start_date: string | null;
  role: string | null;
  description: string;
  date: string;
  created_at: string;
  updated_at: string;
}
// Project Status Choices
export const PROJECT_STATUS_CHOICES = [
  { value: 'Proposed', label: 'Proposed' },
  { value: 'Planning', label: 'Planning' },
  { value: 'Approved', label: 'Approved' },
  { value: 'In Progress', label: 'In Progress' },
  { value: 'On Hold', label: 'On Hold' },
  { value: 'Postponed', label: 'Postponed' },
  { value: 'Blocked', label: 'Blocked' },
  { value: 'Testing', label: 'Testing' },
  { value: 'Completed', label: 'Completed' },
  { value: 'Live', label: 'Live' },
  { value: 'Maintenance', label: 'Maintenance' },
  { value: 'Cancelled', label: 'Cancelled' },
] as const;
// CEO Dashboard Types
export interface ExecutiveSummary {
  total_projects: number;
  active_projects: number;
  completed_projects: number;
  on_hold_projects: number;
  total_employees: number;
  active_employees: number;
  total_budget: string;
  total_actual_cost: string;
  total_profit_loss: string;
  delayed_projects: number;
}

export interface ProjectPortfolioStatus {
  status: string;
  count: number;
}

export interface ProjectDeliveryHealth {
  status: string;
  count: number;
  percentage: number;
}

export interface ProjectNatureBreakdown {
  nature: string;
  count: number;
}

export interface FinancialPerformance {
  project_name: string;
  budget: string;
  actual_cost: string;
  profit_loss: string;
  margin_percentage: number;
}

export interface CostAnatomy {
  category: string;
  amount: string;
  percentage: number;
}

export interface WorkforceBandwidth {
  status: string;
  count: number;
}

export interface ProductivityTrend {
  date: string;
  activity_count: number;
}

export interface GeoRevenue {
  country: string;
  revenue: string;
  project_count: number;
}

export interface RevenueByCreator {
  creator: string;
  total_revenue: string;
}

export interface MonthlyTrend {
  month: string;
  revenue: number;
  number_of_projects: number;
  active_projects: number;
}

export interface ProjectsOverview {
  number_of_projects: number;
  active_projects: number;
  revenue: string;
  working_hours: number;
  monthly_trends: MonthlyTrend[];
}

export interface AssetAnalyticsResponse {
  accrual_distribution: {
    server_accrued_by?: string;
    domain_accrued_by?: string;
    server_details__accrued_by?: string;
    domain_details__accrued_by?: string;
    count: number;
  }[];
  total_expiring_assets: number;
  expiration_status: {
    health_status: string;
    count: number;
  }[];
}

export type ServiceType =
  | (string & {})

  | 'Domain'
  | 'Server';

export interface InvoiceItem {
  id?: number;
  service_type: ServiceType;
  description: string;
  rate: string | number;
  quantity: number;
  total_price: string | number;
  purchase_date?: string | null;
  expiration_date?: string | null;
}

export type InvoiceStatus = 'UNPAID' | 'PARTIAL' | 'PAID' | 'OVERDUE';

export interface Payment {
  id: number;
  amount: string | number;
  payment_date: string;
  payment_method: string;
  transaction_id: string;
  notes: string;
}

export interface AdvancedPayment {
  id: number;
  client: number;
  project?: number;
  amount: string | number;
  received_at: string;
  notes?: string;
  is_utilized: boolean;
}

export interface FinancialSummary {
  id: number;
  name: string;
  total_invoiced: string | number;
  total_paid: string | number;
  total_balance_due: string | number;
  advanced_credits: string | number;
}

export interface Invoice {
  id: number;
  project: number;
  invoice_number: string;
  items: InvoiceItem[];
  client_details?: {
    name: string;
    email: string;
  };
  tax_rate: string | number;
  tax_amount: string | number;
  discount_amount: string | number;
  subtotal: string | number;
  total_amount?: string | number; // Added from JSON
  grand_total: string | number;
  status: InvoiceStatus;
  payments: Payment[];
  amount_paid: string | number;
  balance_due: string | number;
  due_date: string | null;
  custom_date: string | null;
  invoice_date: string | null;
  created_at: string;
  updated_at?: string; // Added from JSON
}

export interface CreateInvoiceRequest {
  items: InvoiceItem[];
  tax_rate: number;
  discount_amount: number;
  invoice_date?: string | null;
  due_date?: string | null;
  custom_date?: string | null;
  apply_credits?: boolean;
}

export interface RecordPaymentRequest {
  amount: number;
  payment_method: string;
  transaction_id?: string;
  notes?: string;
}

export interface CreateAdvancedPaymentRequest {
  client: number;
  amount: number;
  notes?: string;
}

export interface ProjectInvoiceSummary {
  id: number;
  invoice_number: string;
  project_name: string;
  total_amount: number;
  total_paid: string | number;
  balance_due: string;
  status: 'PAID' | 'UNPAID' | 'PARTIAL' | 'OVERDUE';
  invoice_date: string;
  due_date: string | null;
}

export interface ProjectFinancialSummary {
  id: number;
  name: string;
  total_balance: string;
  total_payment: string;
  total_invoice: string;
}

export interface RecentPayment extends Payment {
  invoice: number;
  invoice_number: string;
  project_name: string;
  payment_method: string;
  transaction_id: string;
  notes: string;
}

export interface ProjectTimelineStatus {
  id: number;
  name: string;
  confirmed_end_date: string;
  days_remaining: number;
  status_color: string;
  status_label: string;
}

export interface Domain {
  id: number;
  project: number;
  project_name: string;
  name: string;
  accrued_by: string;
  purchased_from: string;
  purchase_date: string;
  expiration_date: string;
  status: string;
  cost: string;
  days_until_expiration: number;
  status_color: string;
  status_label: string;
}

export interface Server {
  id: number;
  project: number;
  project_name: string;
  server_type: string;
  name: string;
  accrued_by: string;
  purchase_date: string;
  expiration_date: string;
  status: string;
  cost: string;
  days_until_expiration: number;
  status_color: string;
  status_label: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

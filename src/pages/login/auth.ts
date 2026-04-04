import { api } from "../../api/api";

export interface Role {
  id: number;
  name: string;
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
}



export interface LoginResponse {
  refresh: string;
  access: string;
  is_logged_in: boolean;
  roles: string[]; // Keep as string[] for login response convenience if backend handles it differently there, or update to Role[] if needed. The request says login res roles are strings.
  is_superuser: boolean;
  user: User;
}

export const ROLES_PERMISSIONS: Record<string, string[]> = {
  'DEVELOPER': ['/projects', '/activities', '/attendance', '/leaves', '/profile', '/employee-performance'],
  'TEAMHEAD': ['/projects', '/teams', '/activities', '/attendance', '/leaves', '/profile', '/employee-performance', '/team-performance'],
  'BILLING': [
      '/dashboard', '/users', '/employees', '/projects', '/teams', '/infrastructure/servers', 
      '/infrastructure/domains', '/invoices/company-summary', '/other-incomes', 
      '/other-expenses', '/attendance', '/leaves', '/salaries', '/user-salaries', '/profile', '/company-profile', '/employee-performance', '/team-performance'
  ],
  'ADMIN': [
      '/dashboard', '/reports', '/users', '/employees', '/projects', '/teams', '/infrastructure/servers', 
      '/infrastructure/domains', '/attendance', '/leaves', '/salaries', '/user-salaries', '/profile', '/company-profile', '/employee-performance', '/team-performance'
  ],
  'SUPERADMIN': ['*'] // All access
};

export const login = async (username: string, password: string): Promise<LoginResponse> => {
  const response = await api.post<LoginResponse>('/token/', { username, password });
  return response.data;
};
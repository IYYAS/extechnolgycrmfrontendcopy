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
  role: string | null;
  permissions: string[];
  is_superuser: boolean;
  user: User;
}

export const login = async (username: string, password: string): Promise<LoginResponse> => {
  const response = await api.post<LoginResponse>('/token/', { username, password });
  
  // Store permissions for easy access
  localStorage.setItem('permissions', JSON.stringify(response.data.permissions));
  localStorage.setItem('user_role', response.data.role || '');
  
  return response.data;
};
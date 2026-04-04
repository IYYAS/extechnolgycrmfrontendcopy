import { api } from '../../api/api';

export interface CompanyProfile {
    id: number;
    company_name: string;
    company_type: string;
    email: string;
    phone: string;
    address: string;
    logo: string | null;
    updated_at: string;
}

export interface CompanyProfileListResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: CompanyProfile[];
}

export const getCompanyProfiles = async (): Promise<CompanyProfile[]> => {
    const response = await api.get<CompanyProfileListResponse>('/company-profiles/');
    return response.data.results;
};

export const getCompanyProfile = async (id: number): Promise<CompanyProfile> => {
    const response = await api.get<CompanyProfile>(`/company-profiles/${id}/`);
    return response.data;
};

export const createCompanyProfile = async (data: FormData): Promise<CompanyProfile> => {
    const response = await api.post<CompanyProfile>('/company-profiles/', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
};

export const updateCompanyProfile = async (id: number, data: FormData): Promise<CompanyProfile> => {
    const response = await api.put<CompanyProfile>(`/company-profiles/${id}/`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
};

export const deleteCompanyProfile = async (id: number): Promise<void> => {
    await api.delete(`/company-profiles/${id}/`);
};

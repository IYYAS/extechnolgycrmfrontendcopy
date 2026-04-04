import { api } from '../../api/api';

export interface Attendance {
    id: number;
    date: string;
    check_in: string | null;
    check_out: string | null;
    status: string;
    employee: number;
}

export interface AttendanceListResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: Attendance[];
}

export const getAttendances = async (page: number = 1, search: string = ''): Promise<AttendanceListResponse> => {
    const url = search
        ? `/attendance/?page=${page}&search=${encodeURIComponent(search)}`
        : `/attendance/?page=${page}`;
    const response = await api.get<AttendanceListResponse>(url);
    return response.data;
};

export const getAttendance = async (id: number): Promise<Attendance> => {
    const response = await api.get<Attendance>(`/attendance/${id}/`);
    return response.data;
};

export const createAttendance = async (data: any): Promise<Attendance> => {
    const response = await api.post<Attendance>('/attendance/', data);
    return response.data;
};

export const updateAttendance = async (id: number, data: any): Promise<Attendance> => {
    const response = await api.put<Attendance>(`/attendance/${id}/`, data);
    return response.data;
};

export const deleteAttendance = async (id: number): Promise<void> => {
    await api.delete(`/attendance/${id}/`);
};

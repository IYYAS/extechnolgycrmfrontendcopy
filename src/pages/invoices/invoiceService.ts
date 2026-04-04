import { api } from '../../api/api';

export interface InvoiceItem {
    id?: number;
    service_type: string;
    description: string;
    rate: string | number;
    quantity: number;
    total_price?: string;
    purchase_date?: string | null;
    expairy_date?: string | null;
    invoice?: number;
    project_server?: number | null;
    project_domain?: number | null;
    project_service?: number | null;
}

export interface Payment {
    id?: number;
    amount: string | number;
    payment_method: string;
    transaction_id: string;
    notes?: string;
    payment_date?: string;
    invoice?: number;
    advance_payment?: number | null;
}

export interface ClientCompany {
    id: number;
    gst_number: string;
    pan_number: string;
    email: string;
    phone: string;
    legal_name: string;
    logo: string | null;
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
    advance_balance: string;
    project?: number;
}

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

export interface Invoice {
    id: number;
    items: InvoiceItem[];
    payments: Payment[];
    invoice_number: string | null;
    invoice_date: string;
    tax_rate: string | number;
    discount_amount: string | number;
    subtotal: string;
    tax_amount: string;
    total_amount: string;
    total_paid: string;
    balance_due: string;
    status: string;
    due_date: string;
    created_at?: string;
    business_address?: number;
    client_company?: ClientCompany;
    company_profile?: CompanyProfile;
    business_address_id?: number;
}

export interface InvoiceListResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: Invoice[];
}

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
    return obj === '' ? null : obj;
};

export const getInvoices = async (clientId: number, page: number = 1, search: string = ''): Promise<InvoiceListResponse> => {
    const params = new URLSearchParams({
        page: page.toString(),
    });

    if (search) params.append('search', search);

    const response = await api.get<InvoiceListResponse>(`/project-business-addresses/${clientId}/invoices/?${params.toString()}`);
    return response.data;
};

export const getInvoice = async (clientId: number, id: number): Promise<Invoice> => {
    const response = await api.get<Invoice>(`/project-business-addresses/${clientId}/invoices/${id}/`);
    return response.data;
};

export const createInvoice = async (clientId: number, data: any): Promise<Invoice> => {
    const response = await api.post<Invoice>(`/project-business-addresses/${clientId}/invoices/`, sanitizePayload(data));
    return response.data;
};

export const updateInvoice = async (clientId: number, id: number, data: any): Promise<Invoice> => {
    const response = await api.put<Invoice>(`/project-business-addresses/${clientId}/invoices/${id}/`, sanitizePayload(data));
    return response.data;
};

export const deleteInvoice = async (clientId: number, id: number): Promise<void> => {
    await api.delete(`/project-business-addresses/${clientId}/invoices/${id}/`);
};

export const getInvoicePdf = async (clientId: number, id: number): Promise<Blob> => {
    const response = await api.get(`/project-business-addresses/${clientId}/invoices/${id}/pdf/`, {
        responseType: 'blob'
    });
    return response.data;
};

// ─── Payment Management ───
export const getInvoicePayments = async (clientId: number, invoiceId: number): Promise<{ results: Payment[], count: number }> => {
    const response = await api.get(`/project-business-addresses/${clientId}/invoices/${invoiceId}/payments/`);
    return response.data;
};

export const createInvoicePayment = async (clientId: number, invoiceId: number, data: any): Promise<Payment> => {
    const response = await api.post<Payment>(`/project-business-addresses/${clientId}/invoices/${invoiceId}/payments/`, sanitizePayload(data));
    return response.data;
};

export const updateInvoicePayment = async (clientId: number, invoiceId: number, paymentId: number, data: any): Promise<Payment> => {
    const response = await api.put<Payment>(`/project-business-addresses/${clientId}/invoices/${invoiceId}/payments/${paymentId}/`, sanitizePayload(data));
    return response.data;
};

export const deleteInvoicePayment = async (clientId: number, invoiceId: number, paymentId: number): Promise<void> => {
    await api.delete(`/project-business-addresses/${clientId}/invoices/${invoiceId}/payments/${paymentId}/`);
};

export const applyInvoiceAdvance = async (clientId: number, invoiceId: number, amount: string | number): Promise<any> => {
    const response = await api.post(`/project-business-addresses/${clientId}/invoices/${invoiceId}/apply-advance/`, { amount });
    return response.data;
};

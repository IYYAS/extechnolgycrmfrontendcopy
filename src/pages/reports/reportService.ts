import { api } from '../../api/api';

export interface BalanceSheetData {
    assets: {
        cash_on_hand: number;
        accounts_receivable: number;
        total_assets: number;
    };
    liabilities: {
        accounts_payable: number;
        client_advances: number;
        total_liabilities: number;
    };
    equity: {
        retained_earnings: number;
        total_equity: number;
    };
}

export interface CashFlowData {
    cash_in: {
        invoice_payments: number;
        other_income: number;
        client_advances: number;
        total_cash_in: number;
    };
    cash_out: {
        salaries_paid: number;
        other_expenses: number;
        domains_servers_paid: number;
        total_cash_out: number;
    };
    net_cash_flow: number;
}

export interface IncomeStatementData {
    revenue: {
        invoices: number;
        other_income: number;
        total_revenue: number;
    };
    expenses: {
        salaries: number;
        other_expenses: number;
        domains_and_servers: number;
        total_expenses: number;
    };
    net_income: number;
}

export interface ReportFilter {
    filter_type?: string; 
    start_date?: string;
    end_date?: string;
    month?: string;
    year?: string;
}

const buildQueryString = (filter: ReportFilter, isPdf: boolean = false): string => {
    const params = new URLSearchParams();
    if (filter.filter_type && filter.filter_type !== 'custom') {
        params.append('filter_type', filter.filter_type);
    }
    if (filter.start_date) params.append('start_date', filter.start_date);
    if (filter.end_date) params.append('end_date', filter.end_date);
    if (filter.month) params.append('month', filter.month);
    if (filter.year) params.append('year', filter.year);
    if (isPdf) params.append('export', 'pdf');
    
    const qs = params.toString();
    return qs ? `?${qs}` : '';
};

export const getBalanceSheet = async (filter: ReportFilter): Promise<BalanceSheetData> => {
    const response = await api.get<BalanceSheetData>(`/reports/balance-sheet/${buildQueryString(filter)}`);
    return response.data;
};

export const getCashFlow = async (filter: ReportFilter): Promise<CashFlowData> => {
    const response = await api.get<CashFlowData>(`/reports/cash-flow/${buildQueryString(filter)}`);
    return response.data;
};

export const getIncomeStatement = async (filter: ReportFilter): Promise<IncomeStatementData> => {
    const response = await api.get<IncomeStatementData>(`/reports/income-statement/${buildQueryString(filter)}`);
    return response.data;
};

export const downloadBalanceSheetPdf = async (filter: ReportFilter): Promise<void> => {
    const response = await api.get(`/reports/balance-sheet/${buildQueryString(filter, true)}`, {
        responseType: 'blob'
    });
    
    const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `balance_sheet_${new Date().toISOString().split('T')[0]}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.parentNode?.removeChild(link);
    window.URL.revokeObjectURL(url);
};

export const downloadCashFlowPdf = async (filter: ReportFilter): Promise<void> => {
    const response = await api.get(`/reports/cash-flow/${buildQueryString(filter, true)}`, {
        responseType: 'blob'
    });
    
    const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `cash_flow_${new Date().toISOString().split('T')[0]}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.parentNode?.removeChild(link);
    window.URL.revokeObjectURL(url);
};

export const downloadIncomeStatementPdf = async (filter: ReportFilter): Promise<void> => {
    const response = await api.get(`/reports/income-statement/${buildQueryString(filter, true)}`, {
        responseType: 'blob'
    });
    
    const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `income_statement_${new Date().toISOString().split('T')[0]}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.parentNode?.removeChild(link);
    window.URL.revokeObjectURL(url);
};

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getInvoices, deleteInvoice, getInvoicePdf } from './invoiceService';
import { usePermission } from '../../hooks/usePermission';
import type { Invoice } from './invoiceService';
import {
    LayoutGrid,
    List,
    Search,
    Plus,
    FileText,
    Calendar,
    ChevronRight,
    Loader2,
    Eye,
    Edit2,
    Trash2,
    Receipt,
    CreditCard,
    ArrowUpRight,
    Download,
    ArrowLeft
} from 'lucide-react';

const InvoiceList: React.FC = () => {
    const { hasPermission } = usePermission();
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
    const { clientId: clientIdParam } = useParams<{ clientId: string }>();
    const clientId = clientIdParam ? parseInt(clientIdParam) : undefined;
    const navigate = useNavigate();

    const ITEMS_PER_PAGE = 10;
    const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

    const fetchInvoices = async (page: number = 1, search: string = '') => {
        setLoading(true);
        setError(null);
        try {
            if (!clientId) throw new Error('Client ID is required');
            const data = await getInvoices(clientId, page, search);
            setInvoices(data.results);
            setTotalCount(data.count);
        } catch (error: any) {
            console.error('Failed to fetch invoices:', error);
            setError(error.response?.data?.detail || 'Failed to load invoices. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadPdf = async (id: number, invoiceNum: string | null) => {
        try {
            if (!clientId) return;
            const blob = await getInvoicePdf(clientId, id);
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Invoice-${invoiceNum || id}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.parentNode?.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (err: any) {
            console.error('Failed to download PDF:', err);
            alert('Failed to download invoice PDF.');
        }
    };

    const handleDelete = async (invoiceId: number, invoiceNum: string | null) => {
        const displayNum = invoiceNum || `ID: ${invoiceId}`;
        if (!window.confirm(`Are you sure you want to delete invoice "${displayNum}"? This action cannot be undone.`)) {
            return;
        }

        try {
            if (!clientId) return;
            await deleteInvoice(clientId, invoiceId);
            fetchInvoices(currentPage, searchTerm);
        } catch (error: any) {
            console.error('Failed to delete invoice:', error);
            alert(error.response?.data?.detail || 'Failed to delete invoice. Please try again.');
        }
    };

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (currentPage !== 1) {
                setCurrentPage(1);
            } else {
                fetchInvoices(1, searchTerm);
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);

    useEffect(() => {
        if (currentPage !== 1) {
            setCurrentPage(1);
        } else {
            fetchInvoices(1, searchTerm);
        }
    }, [clientId]);

    useEffect(() => {
        fetchInvoices(currentPage, searchTerm);
    }, [currentPage]);

    const getStatusStyles = (status: string) => {
        switch (status?.toUpperCase()) {
            case 'PAID':
                return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
            case 'PARTIAL':
                return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
            case 'UNPAID':
                return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
            default:
                return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const formatCurrency = (amount: string | number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
        }).format(Number(amount));
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Invoices</h1>
                    <p className="text-muted mt-1">Manage billing and payment history.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center bg-card border border-border rounded-xl p-1 shadow-sm">
                        <button
                            onClick={() => setViewMode('table')}
                            className={`p-2 rounded-lg transition-all ${viewMode === 'table' ? 'bg-primary text-white shadow-sm' : 'text-muted hover:text-foreground'}`}
                        >
                            <List size={18} />
                        </button>
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-primary text-white shadow-sm' : 'text-muted hover:text-foreground'}`}
                        >
                            <LayoutGrid size={18} />
                        </button>
                    </div>
                    <button
                        onClick={() => navigate('/invoices/company-summary')}
                        className="flex items-center space-x-2 px-5 py-2.5 bg-card border border-border text-foreground hover:border-primary/50 font-semibold rounded-xl transition-all shadow-sm group"
                    >
                        <ArrowLeft size={20} className="text-muted group-hover:text-primary transition-colors" />
                        <span>Back to Summaries</span>
                    </button>
                    {hasPermission('add_invoice') && (
                        <button
                            onClick={() => navigate(`/invoices/client/${clientId}/new`)}
                            className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl font-bold hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-primary/20"
                        >
                            <Plus size={18} />
                            <span>Create Invoice</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-4 bg-card border border-border rounded-2xl shadow-sm">
                    <p className="text-muted text-xs font-semibold uppercase tracking-wider">Total Invoices</p>
                    <div className="flex items-end justify-between mt-1">
                        <p className="text-2xl font-bold text-foreground">{totalCount}</p>
                        <Receipt className="text-primary/20" size={24} />
                    </div>
                </div>
                <div className="p-4 bg-card border border-border rounded-2xl shadow-sm">
                    <p className="text-muted text-xs font-semibold uppercase tracking-wider">Total Revenue</p>
                    <div className="flex items-end justify-between mt-1">
                        <p className="text-2xl font-bold text-emerald-500">
                            {formatCurrency(invoices.reduce((acc, inv) => acc + Number(inv.total_amount), 0))}
                        </p>
                        <CreditCard className="text-emerald-500/20" size={24} />
                    </div>
                </div>
                <div className="p-4 bg-card border border-border rounded-2xl shadow-sm">
                    <p className="text-muted text-xs font-semibold uppercase tracking-wider">Outstanding</p>
                    <div className="flex items-end justify-between mt-1">
                        <p className="text-2xl font-bold text-rose-500">
                            {formatCurrency(invoices.reduce((acc, inv) => acc + Number(inv.balance_due), 0))}
                        </p>
                        <ArrowUpRight className="text-rose-500/20" size={24} />
                    </div>
                </div>
            </div>

            {/* Filter & Search */}
            <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
                <div className="p-4 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="relative flex-1 w-full max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
                        <input
                            type="text"
                            placeholder="Search invoices..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-xl text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="px-6 py-24 text-center">
                        <div className="flex flex-col items-center space-y-4">
                            <Loader2 className="animate-spin text-primary" size={48} />
                            <p className="text-muted font-medium">Fetching invoices...</p>
                        </div>
                    </div>
                ) : error ? (
                    <div className="px-6 py-12 text-center">
                        <h3 className="text-lg font-bold text-foreground">Something went wrong</h3>
                        <p className="text-muted max-w-xs mx-auto mt-2">{error}</p>
                        <button
                            onClick={() => fetchInvoices(currentPage, searchTerm)}
                            className="mt-6 px-6 py-2 bg-primary text-white font-semibold rounded-xl transition-all shadow-lg shadow-primary/20"
                        >
                            Try Again
                        </button>
                    </div>
                ) : invoices.length > 0 ? (
                    viewMode === 'table' ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-muted/5 text-muted text-xs font-semibold uppercase tracking-wider">
                                        <th className="px-6 py-4">Invoice Info</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4">Amount</th>
                                        <th className="px-6 py-4">Due Date</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {invoices.map((invoice) => (
                                        <tr key={invoice.id} className="group hover:bg-muted/5 transition-colors">
                                            <td className="px-6 py-4 cursor-pointer" onClick={() => navigate(`/invoices/client/${clientId}/${invoice.id}`)}>
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary border border-primary/10">
                                                        <FileText size={20} />
                                                    </div>
                                                    <div>
                                                        <p className="text-foreground font-bold">{invoice.invoice_number || `INV-${invoice.id.toString().padStart(4, '0')}`}</p>
                                                        <p className="text-muted text-xs">{formatDate(invoice.invoice_date)}</p>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-6 py-4">
                                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${getStatusStyles(invoice.status)}`}>
                                                    {invoice.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-foreground font-bold">{formatCurrency(invoice.total_amount)}</p>
                                                <p className="text-rose-500 text-[10px] font-bold">Due: {formatCurrency(invoice.balance_due)}</p>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-muted">
                                                {formatDate(invoice.due_date)}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={() => navigate(`/invoices/client/${clientId}/${invoice.id}/payments`)} className="p-2 text-muted hover:text-primary rounded-lg transition-all" title="Manage Payments"><CreditCard size={18} /></button>
                                                    <button onClick={() => navigate(`/invoices/client/${clientId}/${invoice.id}`)} className="p-2 text-muted hover:text-primary rounded-lg transition-all" title="View"><Eye size={18} /></button>
                                                    <button onClick={() => handleDownloadPdf(invoice.id, invoice.invoice_number)} className="p-2 text-muted hover:text-emerald-500 rounded-lg transition-all" title="Download PDF"><Download size={18} /></button>
                                                    {hasPermission('change_invoice') && (
                                                        <button onClick={() => navigate(`/invoices/client/${clientId}/edit/${invoice.id}`)} className="p-2 text-muted hover:text-primary rounded-lg transition-all" title="Edit"><Edit2 size={18} /></button>
                                                    )}
                                                    {hasPermission('delete_invoice') && (
                                                        <button onClick={() => handleDelete(invoice.id, invoice.invoice_number)} className="p-2 text-muted hover:text-rose-500 rounded-lg transition-all" title="Delete"><Trash2 size={18} /></button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                            {invoices.map((invoice) => (
                                <div key={invoice.id} onClick={() => navigate(`/invoices/client/${clientId}/${invoice.id}`)} className="group bg-background border border-border rounded-2xl p-5 hover:border-primary/50 transition-all hover:shadow-xl hover:shadow-primary/5 cursor-pointer relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-4 flex items-center gap-2">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleDownloadPdf(invoice.id, invoice.invoice_number); }}
                                            className="p-1.5 text-muted hover:text-emerald-500 bg-background/50 backdrop-blur-md rounded-lg border border-border/50 transition-all"
                                            title="Download PDF"
                                        >
                                            <Download size={14} />
                                        </button>
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${getStatusStyles(invoice.status)}`}>
                                            {invoice.status}
                                        </span>
                                    </div>
                                    <div className="flex items-center space-x-3 mb-6">
                                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                                            <FileText size={24} />
                                        </div>
                                        <div>
                                            <h3 className="text-foreground font-bold text-lg group-hover:text-primary transition-colors">
                                                {invoice.invoice_number || `INV-${invoice.id.toString().padStart(4, '0')}`}
                                            </h3>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 mb-6 pt-4 border-t border-border/50">
                                        <div>
                                            <p className="text-[10px] uppercase font-bold text-muted tracking-wider">Total Amount</p>
                                            <p className="text-foreground text-sm font-bold">{formatCurrency(invoice.total_amount)}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] uppercase font-bold text-muted tracking-wider">Balance Due</p>
                                            <p className="text-rose-500 text-sm font-bold">{formatCurrency(invoice.balance_due)}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between pt-4 border-t border-border/50">
                                        <div className="flex items-center text-muted text-[10px] font-bold uppercase">
                                            <Calendar size={12} className="mr-1" />
                                            Due {formatDate(invoice.due_date)}
                                        </div>
                                        <ChevronRight size={16} className="text-primary group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )
                ) : (
                    <div className="px-6 py-24 text-center">
                        <FileText className="text-muted/40 mx-auto mb-4" size={48} />
                        <h3 className="text-lg font-bold text-foreground">No invoices found</h3>
                        <p className="text-muted max-w-xs mx-auto mt-2">Start by creating your first invoice!</p>
                        {hasPermission('add_invoice') && (
                            <button
                                onClick={() => navigate(`/invoices/client/${clientId}/new`)}
                                className="mt-6 px-6 py-2 bg-primary text-white font-semibold rounded-xl"
                            >
                                Create Invoice
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Pagination */}
            {!loading && totalCount > 0 && totalPages > 1 && (
                <div className="flex items-center justify-center space-x-2 py-4">
                    <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 rounded-lg border border-border disabled:opacity-30">Prev</button>
                    <span className="text-sm font-bold">Page {currentPage} of {totalPages}</span>
                    <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-2 rounded-lg border border-border disabled:opacity-30">Next</button>
                </div>
            )}
        </div>
    );
};

export default InvoiceList;

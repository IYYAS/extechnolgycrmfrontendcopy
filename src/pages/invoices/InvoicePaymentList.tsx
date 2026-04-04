import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    getInvoicePayments,
    deleteInvoicePayment,
    getInvoice,
    type Payment,
    type Invoice
} from './invoiceService';
import {
    ArrowLeft,
    Plus,
    Trash2,
    Edit2,
    Loader2,
    AlertCircle,
    CheckCircle2,
    Banknote,
    Clock
} from 'lucide-react';

const InvoicePaymentList: React.FC = () => {
    const { clientId: clientIdParam, invoiceId: invoiceIdParam } = useParams<{ clientId: string; invoiceId: string }>();
    const clientId = clientIdParam ? parseInt(clientIdParam) : undefined;
    const invoiceId = invoiceIdParam ? parseInt(invoiceIdParam) : undefined;
    const navigate = useNavigate();

    const [payments, setPayments] = useState<Payment[]>([]);
    const [invoice, setInvoice] = useState<Invoice | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Form state removed as it's now on a separate page

    const fetchData = useCallback(async () => {
        if (!clientId || !invoiceId) return;
        setLoading(true);
        try {
            const [paymentsData, invoiceData] = await Promise.all([
                getInvoicePayments(clientId, invoiceId),
                getInvoice(clientId, invoiceId)
            ]);
            setPayments(paymentsData.results);
            setInvoice(invoiceData);
        } catch (err: any) {
            setError('Failed to load payment data.');
        } finally {
            setLoading(false);
        }
    }, [clientId, invoiceId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleOpenForm = (payment?: Payment) => {
        if (payment) {
            navigate(`/invoices/client/${clientId}/${invoiceId}/payments/edit/${payment.id}`);
        } else {
            navigate(`/invoices/client/${clientId}/${invoiceId}/payments/new`);
        }
    };



    const handleDelete = async (paymentId: number) => {
        if (!clientId || !invoiceId || !window.confirm('Are you sure you want to delete this payment?')) return;

        try {
            await deleteInvoicePayment(clientId, invoiceId, paymentId);
            await fetchData();
        } catch (err: any) {
            alert('Failed to delete payment.');
        }
    };

    const formatCurrency = (amount: string | number) =>
        new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(Number(amount));

    const formatDate = (ds: string | null | undefined) => {
        if (!ds) return '—';
        return new Date(ds).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    if (loading && !payments.length) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <Loader2 className="animate-spin text-primary" size={48} />
                <p className="text-muted font-medium">Loading payments...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-500 max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="p-2.5 bg-card border border-border rounded-2xl hover:text-primary transition-all">
                        <ArrowLeft size={18} />
                    </button>
                    <div>
                        <h1 className="text-3xl font-black tracking-tight text-foreground">Manage Payments</h1>
                        <p className="text-muted font-medium mt-1">
                            Invoice {invoice?.invoice_number || `#${invoiceId}`}
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => handleOpenForm()}
                    className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl font-bold hover:scale-[1.02] transition-all shadow-lg shadow-primary/20"
                >
                    <Plus size={18} /> Add Payment
                </button>
            </div>

            {error && (
                <div className="p-5 bg-rose-500/10 border border-rose-500/20 rounded-3xl text-rose-500 text-sm font-bold flex items-center gap-3">
                    <AlertCircle size={18} />
                    {error}
                </div>
            )}

            {/* Summary Grid */}
            {invoice && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-card border border-border rounded-[2rem] p-6 shadow-sm flex items-center gap-5">
                        <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20 shrink-0">
                            <Banknote size={28} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-wider text-muted">Total Amount</p>
                            <p className="text-xl font-black text-foreground">{formatCurrency(invoice.total_amount)}</p>
                        </div>
                    </div>
                    <div className="bg-card border border-border rounded-[2rem] p-6 shadow-sm flex items-center gap-5">
                        <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center border border-emerald-500/20 shrink-0">
                            <CheckCircle2 size={28} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-wider text-muted">Total Paid</p>
                            <p className="text-xl font-black text-emerald-500">{formatCurrency(invoice.total_paid)}</p>
                        </div>
                    </div>
                    <div className="bg-card border border-border rounded-[2rem] p-6 shadow-sm flex items-center gap-5">
                        <div className="w-14 h-14 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center border border-rose-500/20 shrink-0">
                            <Clock size={28} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-wider text-muted">Balance Due</p>
                            <p className="text-xl font-black text-rose-500">{formatCurrency(invoice.balance_due)}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Payments List */}
            <div className="bg-card border border-border rounded-[2.5rem] overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-muted/5 border-b border-border">
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-wider text-muted">Date</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-wider text-muted">Method</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-wider text-muted">Transaction ID</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-wider text-muted">Amount</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-wider text-muted">Status</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-wider text-muted text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                            {payments.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-8 py-20 text-center">
                                        <Clock size={48} className="mx-auto text-muted/20 mb-4" />
                                        <h3 className="text-lg font-bold text-foreground">No Payments Found</h3>
                                        <p className="text-muted">No payments have been recorded for this invoice yet.</p>
                                    </td>
                                </tr>
                            ) : (
                                payments.map((p) => (
                                    <tr key={p.id} className="hover:bg-muted/5 transition-colors group">
                                        <td className="px-8 py-5">
                                            <p className="font-bold text-foreground">{formatDate(p.payment_date)}</p>
                                            <p className="text-[10px] text-muted font-bold mt-0.5 uppercase">ID: #{p.id}</p>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className={`px-3 py-1 border rounded-full text-[10px] font-black uppercase ${
                                                p.payment_method === 'Advance Applied' 
                                                ? 'bg-emerald-500/5 text-emerald-600 border-emerald-500/10' 
                                                : 'bg-primary/5 text-primary border-primary/10'
                                            }`}>
                                                {p.payment_method}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5">
                                            <p className="text-sm font-medium text-foreground">{p.transaction_id || '—'}</p>
                                        </td>
                                        <td className="px-8 py-5">
                                            <p className="text-base font-black text-foreground">{formatCurrency(p.amount)}</p>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-2 text-emerald-500 font-bold text-xs">
                                                <CheckCircle2 size={14} /> Completed
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => handleOpenForm(p)}
                                                    className="p-2 text-muted hover:text-primary transition-all"
                                                    title="Edit"
                                                >
                                                    <Edit2 size={18} />
                                                </button>
                                                <button
                                                    onClick={() => p.id && handleDelete(p.id)}
                                                    className="p-2 text-muted hover:text-rose-500 transition-all"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                        {payments.length > 0 && invoice && (
                            <tfoot>
                                <tr className="bg-muted/5 font-black border-t-2 border-border">
                                    <td colSpan={3} className="px-8 py-6 text-sm text-right uppercase tracking-wider text-muted">Total Paid</td>
                                    <td colSpan={3} className="px-8 py-6 text-xl text-emerald-500">{formatCurrency(invoice.total_paid)}</td>
                                </tr>
                            </tfoot>
                        )}
                    </table>
                </div>
            </div>


        </div>
    );
};

export default InvoicePaymentList;

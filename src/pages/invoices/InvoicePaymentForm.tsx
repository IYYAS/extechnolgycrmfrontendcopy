import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    createInvoicePayment,
    updateInvoicePayment,
    getInvoicePayments,
    getInvoice,
    applyInvoiceAdvance,
    type Payment,
    type Invoice
} from './invoiceService';
import {
    ArrowLeft,
    Loader2,
    AlertCircle,
    Save,
    Calendar,
    Banknote,
    Wallet,
    X
} from 'lucide-react';

import { getAdvances } from '../advances/advanceService';

const InvoicePaymentForm: React.FC = () => {
    const { clientId: clientIdParam, invoiceId: invoiceIdParam, paymentId: paymentIdParam } = useParams<{
        clientId: string;
        invoiceId: string;
        paymentId?: string;
    }>();

    const clientId = clientIdParam ? parseInt(clientIdParam) : undefined;
    const invoiceId = invoiceIdParam ? parseInt(invoiceIdParam) : undefined;
    const paymentId = paymentIdParam ? parseInt(paymentIdParam) : undefined;
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [invoice, setInvoice] = useState<Invoice | null>(null);
    const [availableAdvance, setAvailableAdvance] = useState<number>(0);
    const [formData, setFormData] = useState<Partial<Payment>>({
        amount: '',
        payment_method: 'Cash',
        transaction_id: '',
        notes: '',
        payment_date: new Date().toISOString().split('T')[0]
    });
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        if (!clientId || !invoiceId) return;
        setLoading(true);
        try {
            // Parallel fetch for invoice and advances
            const [invoiceData, advancesData] = await Promise.all([
                getInvoice(clientId, invoiceId),
                getAdvances(clientId)
            ]);
            
            setInvoice(invoiceData);
            
            // Sum available advance
            const totalRemaining = advancesData.results.reduce(
                (sum, adv) => sum + Number(adv.remaining_amount), 0
            );
            setAvailableAdvance(totalRemaining);

            if (paymentId) {
                const paymentsData = await getInvoicePayments(clientId, invoiceId);
                const existingPayment = paymentsData.results.find((p: Payment) => p.id === paymentId);
                if (existingPayment) {
                    setFormData({
                        amount: existingPayment.amount,
                        payment_method: existingPayment.payment_method,
                        transaction_id: existingPayment.transaction_id,
                        notes: existingPayment.notes,
                        payment_date: existingPayment.payment_date ? existingPayment.payment_date.split('T')[0] : new Date().toISOString().split('T')[0]
                    });
                } else {
                    setError('Payment not found.');
                }
            }
        } catch (err: any) {
            setError('Failed to load data.');
        } finally {
            setLoading(false);
        }
    }, [clientId, invoiceId, paymentId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!clientId || !invoiceId) return;

        setSubmitting(true);
        setError(null);

        try {
            if (paymentId) {
                await updateInvoicePayment(clientId, invoiceId, paymentId, formData);
            } else if (formData.payment_method === 'Advance Credit') {
                await applyInvoiceAdvance(clientId, invoiceId, formData.amount as string);
            } else {
                await createInvoicePayment(clientId, invoiceId, formData);
            }
            navigate(`/invoices/client/${clientId}/${invoiceId}/payments`);
        } catch (err: any) {
            const data = err.response?.data;
            setError(
                typeof data === 'string' ? data :
                    typeof data === 'object' ? JSON.stringify(data) :
                        'Failed to save payment.'
            );
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <Loader2 className="animate-spin text-primary" size={48} />
                <p className="text-muted font-medium">Loading...</p>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-500">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <button onClick={() => navigate(-1)} className="p-2.5 bg-card border border-border rounded-2xl hover:text-primary transition-all shadow-sm">
                    <ArrowLeft size={18} />
                </button>
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-foreground">
                        {paymentId ? 'Edit Payment' : 'Record Payment'}
                    </h1>
                    <p className="text-muted font-medium mt-1 uppercase text-[10px] tracking-widest font-black">
                        Invoice {invoice?.invoice_number || `#${invoiceId}`}
                    </p>
                </div>
            </div>

            {/* Form Card */}
            <div className="bg-card border border-border rounded-[2.5rem] shadow-sm overflow-hidden">
                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    {availableAdvance > 0 && (
                        <div className="p-6 bg-emerald-500/10 border-2 border-dashed border-emerald-500/30 rounded-[2rem] flex flex-col sm:flex-row items-center justify-between gap-4 animate-in zoom-in-95 duration-300">
                            <div className="flex items-center gap-4 text-center sm:text-left">
                                <div className="p-3 bg-emerald-500/20 rounded-2xl text-emerald-600">
                                    <Wallet size={24} />
                                </div>
                                <div>
                                    <h3 className="text-sm font-black text-emerald-700 uppercase tracking-wider">Available Advance Credit</h3>
                                    <p className="text-[10px] font-bold text-emerald-600/70 uppercase tracking-widest mt-0.5">
                                        This credit will be applied automatically to the balance
                                    </p>
                                </div>
                            </div>
                            <div className="text-2xl font-black text-emerald-600 bg-white/50 px-6 py-2 rounded-2xl border border-emerald-500/10">
                                ₹{new Intl.NumberFormat('en-IN').format(availableAdvance)}
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-500 text-xs font-bold flex items-center gap-3 animate-in fade-in duration-300">
                            <AlertCircle size={16} />
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-wider text-muted ml-1">Amount</label>
                            <div className="relative">
                                <Banknote className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
                                <input
                                    required
                                    type="number"
                                    name="amount"
                                    step="0.01"
                                    value={formData.amount}
                                    onChange={handleInputChange}
                                    placeholder="0.00"
                                    className="w-full pl-12 pr-6 py-4 bg-background border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-bold text-lg"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-wider text-muted ml-1">Payment Date</label>
                            <div className="relative">
                                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
                                <input
                                    required
                                    type="date"
                                    name="payment_date"
                                    value={formData.payment_date}
                                    onChange={handleInputChange}
                                    className="w-full pl-12 pr-6 py-4 bg-background border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-bold"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-wider text-muted ml-1">Payment Method</label>
                            <select
                                name="payment_method"
                                value={formData.payment_method}
                                onChange={handleInputChange}
                                className="w-full px-6 py-4 bg-background border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-bold"
                            >
                                <option value="Cash">Cash</option>
                                <option value="Bank Transfer">Bank Transfer</option>
                                <option value="UPI">UPI</option>
                                <option value="Credit Card">Credit Card</option>
                                <option value="Cheque">Cheque</option>
                                <option value="Advance Credit">Advance Credit</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        {formData.payment_method !== 'Advance Credit' && (
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-wider text-muted ml-1">Transaction ID</label>
                                <input
                                    type="text"
                                    name="transaction_id"
                                    value={formData.transaction_id}
                                    onChange={handleInputChange}
                                    placeholder="Reference number..."
                                    className="w-full px-6 py-4 bg-background border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-bold"
                                />
                            </div>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-wider text-muted ml-1">Notes</label>
                        <textarea
                            name="notes"
                            value={formData.notes}
                            onChange={handleInputChange}
                            rows={3}
                            placeholder="Additional details..."
                            className="w-full px-6 py-4 bg-background border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-bold resize-none"
                        />
                    </div>

                    <div className="flex items-center justify-end gap-4 pt-6 mt-6 border-t border-border">
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="px-8 py-4 bg-muted/20 text-muted border border-border rounded-2xl font-bold hover:text-foreground hover:bg-muted/30 transition-all flex items-center gap-2"
                        >
                            <X size={18} /> Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="px-10 py-4 bg-emerald-500 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:scale-[1.02] transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-60"
                        >
                            {submitting ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                            {submitting ? 'Saving...' : paymentId ? 'Update Payment' : 'Record Payment'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default InvoicePaymentForm;

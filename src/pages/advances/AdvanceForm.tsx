import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    getAdvance,
    createAdvance,
    updateAdvance,
    type AdvancePayment
} from './advanceService';
import {
    ArrowLeft,
    Loader2,
    AlertCircle,
    Save,
    Wallet,
    X,
    FileText,
    TrendingUp
} from 'lucide-react';

const AdvanceForm: React.FC = () => {
    const { clientId: clientIdParam, advanceId: advanceIdParam } = useParams<{
        clientId: string;
        advanceId?: string;
    }>();

    const clientId = clientIdParam ? parseInt(clientIdParam) : undefined;
    const advanceId = advanceIdParam ? parseInt(advanceIdParam) : undefined;
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState<Partial<AdvancePayment>>({
        amount: '',
        remaining_amount: '',
        note: '',
        is_manual: true
    });
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        if (!clientId || !advanceId) return;
        setLoading(true);
        try {
            const data = await getAdvance(clientId, advanceId);
            setFormData({
                amount: data.amount,
                remaining_amount: data.remaining_amount,
                note: data.note || '',
                is_manual: data.is_manual
            });
        } catch (err: any) {
            setError('Failed to load advance payment details.');
        } finally {
            setLoading(false);
        }
    }, [clientId, advanceId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!clientId) return;

        setSubmitting(true);
        setError(null);

        try {
            if (advanceId) {
                await updateAdvance(clientId, advanceId, { ...formData, client: clientId });
            } else {
                // For new advance, balance starts as total amount if not specified
                const payload = {
                    ...formData,
                    client: clientId,
                    remaining_amount: formData.remaining_amount || formData.amount
                };
                await createAdvance(clientId, payload);
            }
            navigate(`/advances/client/${clientId}`);
        } catch (err: any) {
            const data = err.response?.data;
            setError(
                typeof data === 'string' ? data :
                    typeof data === 'object' ? JSON.stringify(data) :
                        'Failed to save advance payment.'
            );
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <Loader2 className="animate-spin text-primary" size={48} />
                <p className="text-muted font-medium">Loading details...</p>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-500">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2.5 bg-card border border-border rounded-xl hover:text-primary transition-all shadow-sm"
                >
                    <ArrowLeft size={18} />
                </button>
                <div>
                    <h1 className="text-2xl font-black tracking-tight text-foreground">
                        {advanceId ? 'Edit Advance Payment' : 'Record Advance Payment'}
                    </h1>
                    <p className="text-muted font-medium mt-0.5 text-[10px] uppercase tracking-widest font-black">
                        Client Business Address #{clientId}
                    </p>
                </div>
            </div>

            {/* Form Card */}
            <div className="bg-card border border-border rounded-[2rem] shadow-sm overflow-hidden">
                <div className="px-8 py-6 border-b border-border bg-muted/5 flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-xl text-primary">
                        <Wallet size={20} />
                    </div>
                    <h2 className="text-sm font-black text-foreground uppercase tracking-wider">Payment Information</h2>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    {error && (
                        <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-500 text-xs font-bold flex items-center gap-3">
                            <AlertCircle size={16} />
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-wider text-muted ml-1">Total Amount</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted font-bold text-lg">₹</span>
                                <input
                                    required
                                    type="number"
                                    name="amount"
                                    step="0.01"
                                    value={formData.amount}
                                    onChange={handleInputChange}
                                    placeholder="0.00"
                                    className="w-full pl-10 pr-6 py-4 bg-background border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-black text-xl text-foreground"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-wider text-muted ml-1 flex items-center gap-1.5">
                                <TrendingUp size={10} /> Remaining Balance
                            </label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted font-bold text-lg">₹</span>
                                <input
                                    required
                                    type="number"
                                    name="remaining_amount"
                                    step="0.01"
                                    value={formData.remaining_amount}
                                    onChange={handleInputChange}
                                    placeholder="0.00"
                                    className="w-full pl-10 pr-6 py-4 bg-background border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-black text-xl text-emerald-500"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-wider text-muted ml-1 flex items-center gap-1.5">
                            <FileText size={10} /> Remarks / Internal Note
                        </label>
                        <textarea
                            name="note"
                            value={formData.note || ''}
                            onChange={handleInputChange}
                            rows={3}
                            placeholder="Add details about this advance..."
                            className="w-full px-6 py-4 bg-background border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-bold resize-none leading-relaxed"
                        />
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-6 border-t border-border">
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="px-6 py-3.5 bg-muted/10 text-muted border border-border rounded-2xl font-bold hover:text-foreground hover:bg-muted/20 transition-all flex items-center gap-2 text-sm"
                        >
                            <X size={16} /> Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="px-8 py-3.5 bg-primary text-white rounded-2xl font-black flex items-center justify-center gap-2 hover:scale-[1.02] transition-all shadow-lg shadow-primary/20 disabled:opacity-60 text-sm"
                        >
                            {submitting ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                            {submitting ? 'Processing...' : advanceId ? 'Update Advance' : 'Record Advance'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdvanceForm;

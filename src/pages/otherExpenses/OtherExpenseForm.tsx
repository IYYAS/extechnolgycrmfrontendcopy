import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getOtherExpense, createOtherExpense, updateOtherExpense } from './otherExpenseService';
import { ArrowLeft, Save, Loader2, AlertCircle, Tag, FileText } from 'lucide-react';

const OtherExpenseForm: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const isEdit = !!id;

    const [loading, setLoading] = useState(isEdit);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState<any>({
        date: new Date().toISOString().split('T')[0],
        title: '',
        amount: '',
        notes: ''
    });

    useEffect(() => {
        const loadData = async () => {
            if (isEdit && id) {
                try {
                    const rec = await getOtherExpense(parseInt(id));
                    setFormData({ ...rec });
                } catch (err: any) {
                    setError('Failed to load other expense data.');
                } finally {
                    setLoading(false);
                }
            } else {
                setLoading(false);
            }
        };
        loadData();
    }, [id, isEdit]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError(null);
        try {
            const payload = { ...formData };
            if (isEdit && id) {
                await updateOtherExpense(parseInt(id), payload);
            } else {
                await createOtherExpense(payload);
            }
            navigate('/other-expenses');
        } catch (err: any) {
            setError(err.response?.data?.detail || JSON.stringify(err.response?.data) || 'Failed to save record.');
        } finally {
            setSaving(false);
        }
    };

    const inputCls = "w-full px-5 py-3.5 bg-background border border-border rounded-2xl focus:ring-2 focus:ring-rose-500/20 transition-all font-medium text-sm disabled:opacity-50";
    const labelCls = "text-[11px] font-bold text-muted uppercase tracking-widest mb-1.5 block";

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
            <Loader2 className="animate-spin text-rose-500" size={48} />
            <p className="text-muted font-medium italic">Loading other expense data...</p>
        </div>
    );

    return (
        <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700 pb-20">
            {/* Header */}
            <div className="flex items-center gap-6">
                <button onClick={() => navigate('/other-expenses')} className="p-3 bg-muted/20 text-muted rounded-2xl hover:bg-rose-500/10 hover:text-rose-500 transition-all active:scale-95 border border-transparent hover:border-rose-500/20">
                    <ArrowLeft size={22} />
                </button>
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-foreground">{isEdit ? 'Edit Other Expense' : 'Add Other Expense'}</h1>
                    <p className="text-muted font-bold text-xs uppercase tracking-widest mt-0.5">Manage miscellaneous expenses</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                    <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-3 text-rose-500 text-sm font-bold">
                        <AlertCircle size={20} /> {error}
                    </div>
                )}

                {/* Details */}
                <div className="bg-card border border-border rounded-[2.5rem] p-8 space-y-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-rose-500/10 text-rose-500 rounded-xl"><Tag size={18} /></div>
                        <h3 className="text-lg font-black text-foreground tracking-tight">Expense Information</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className={labelCls}>Title</label>
                            <input type="text" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className={inputCls} placeholder="e.g. Office Supplies" required />
                        </div>
                        <div>
                            <label className={labelCls}>Date</label>
                            <input type="date" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} className={inputCls} required />
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className={labelCls}>Amount</label>
                            <div className="relative">
                                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-muted font-black">$</span>
                                <input type="number" step="0.01" value={formData.amount} onChange={e => setFormData({ ...formData, amount: e.target.value })} className={`${inputCls} pl-10`} placeholder="0.00" required />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Notes */}
                <div className="bg-card border border-border rounded-[2.5rem] p-8 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-primary/10 text-primary rounded-xl"><FileText size={18} /></div>
                        <h3 className="text-lg font-black text-foreground tracking-tight">Notes</h3>
                    </div>
                    <div>
                        <textarea value={formData.notes || ''} onChange={e => setFormData({ ...formData, notes: e.target.value })} className={`${inputCls} min-h-[120px] resize-none`} placeholder="Add any additional details here..."></textarea>
                    </div>
                </div>

                <div className="flex items-center justify-end gap-4 pt-4">
                    <button type="button" onClick={() => navigate('/other-expenses')} className="px-8 py-4 bg-muted/10 text-muted font-black rounded-2xl hover:bg-muted/20 transition-all active:scale-95">Cancel</button>
                    <button type="submit" disabled={saving} className="px-12 py-4 bg-rose-500 text-white font-black rounded-2xl shadow-xl shadow-rose-500/30 hover:shadow-rose-500/50 transition-all hover:scale-[1.02] active:scale-95 flex items-center gap-2">
                        {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} strokeWidth={2.5} />}
                        <span>{isEdit ? 'Update Record' : 'Save Record'}</span>
                    </button>
                </div>
            </form>
        </div>
    );
};

export default OtherExpenseForm;

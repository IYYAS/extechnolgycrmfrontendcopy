import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getSalary, createSalary, updateSalary } from './salaryService';
import { getUsers } from '../user/userService';
import {
    ArrowLeft, Save, Loader2, User, DollarSign, AlertCircle, CheckCircle2
} from 'lucide-react';

const SalaryForm: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const isEdit = !!id;

    const [loading, setLoading] = useState(isEdit);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [users, setUsers] = useState<any[]>([]);

    const [formData, setFormData] = useState<any>({
        start_date: new Date().toISOString().slice(0, 10),
        end_date: new Date().toISOString().slice(0, 10),
        basic: '0.00',
        overtime_pay: '0.00',
        late_deduction: '0.00',
        bonus: '0.00',
        advance: '0.00',
        deductions: '0.00',
        working_days: 26,
        present_days: '0.00',
        status: 'Unpaid',
        employee: ''
    });

    useEffect(() => {
        const loadData = async () => {
            try {
                const userData = await getUsers(1, '');
                setUsers(userData.results || []);
                if (isEdit && id) {
                    const salary = await getSalary(parseInt(id));
                    setFormData({ ...salary, employee: salary.employee.toString() });
                }
            } catch (err: any) {
                setError('Failed to load data.');
            } finally {
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
            const payload = { ...formData, employee: parseInt(formData.employee) };
            if (isEdit && id) await updateSalary(parseInt(id), payload);
            else await createSalary(payload);
            navigate('/salaries');
        } catch (err: any) {
            setError(err.response?.data?.detail || JSON.stringify(err.response?.data) || 'Failed to save salary.');
        } finally {
            setSaving(false);
        }
    };

    const inputCls = "w-full px-5 py-3.5 bg-background border border-border rounded-2xl focus:ring-2 focus:ring-primary/20 transition-all font-medium text-sm disabled:opacity-50";
    const labelCls = "text-[11px] font-bold text-muted uppercase tracking-widest mb-1.5 block";

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
            <Loader2 className="animate-spin text-primary" size={48} />
            <p className="text-muted font-medium italic">Loading salary data...</p>
        </div>
    );

    return (
        <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700 pb-20">
            {/* Header */}
            <div className="flex items-center gap-6">
                <button onClick={() => navigate('/salaries')} className="p-3 bg-muted/20 text-muted rounded-2xl hover:bg-primary/10 hover:text-primary transition-all active:scale-95 border border-transparent hover:border-primary/20">
                    <ArrowLeft size={22} />
                </button>
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-foreground">{isEdit ? 'Edit Salary Record' : 'New Salary Record'}</h1>
                    <p className="text-muted font-bold text-xs uppercase tracking-widest mt-0.5">Manage employee payroll</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                    <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-3 text-rose-500 text-sm font-bold animate-in zoom-in duration-300">
                        <AlertCircle size={20} /> {error}
                    </div>
                )}

                {/* Employee & Month */}
                <div className="bg-card border border-border rounded-[2.5rem] p-8 space-y-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-primary/10 text-primary rounded-xl"><User size={18} /></div>
                        <h3 className="text-lg font-black text-foreground tracking-tight">Employee & Month</h3>
                    </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className={labelCls}>Employee</label>
                                <select value={formData.employee} onChange={e => setFormData({ ...formData, employee: e.target.value })} className={inputCls} required>
                                    <option value="">Select Employee...</option>
                                    {users.map(u => (
                                        <option key={u.id} value={u.id}>{u.username}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={labelCls}>Start Date</label>
                                    <input type="date" value={formData.start_date} onChange={e => setFormData({ ...formData, start_date: e.target.value })} className={inputCls} required />
                                </div>
                                <div>
                                    <label className={labelCls}>End Date</label>
                                    <input type="date" value={formData.end_date} onChange={e => setFormData({ ...formData, end_date: e.target.value })} className={inputCls} required />
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-border/50">
                            <div>
                                <label className={labelCls}>Working Days</label>
                                <input type="number" value={formData.working_days} onChange={e => setFormData({ ...formData, working_days: parseInt(e.target.value) || 0 })} className={inputCls} required />
                            </div>
                            <div>
                                <label className={labelCls}>Present Days</label>
                                <input type="number" step="0.01" value={formData.present_days} onChange={e => setFormData({ ...formData, present_days: e.target.value })} className={inputCls} required />
                            </div>
                        </div>
                    </div>

                {/* Salary Details */}
                <div className="bg-card border border-border rounded-[2.5rem] p-8 space-y-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-xl"><DollarSign size={18} /></div>
                        <h3 className="text-lg font-black text-foreground tracking-tight">Salary Breakdown</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className={labelCls}>Basic Salary</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted font-bold text-sm">₹</span>
                                <input type="number" step="0.01" placeholder="0.00" value={formData.basic} onChange={e => setFormData({ ...formData, basic: e.target.value })} className={`${inputCls} pl-8`} required />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className={labelCls}>OT Pay</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500 font-bold text-sm">+</span>
                                    <input type="number" step="0.01" placeholder="0.00" value={formData.overtime_pay} onChange={e => setFormData({ ...formData, overtime_pay: e.target.value })} className={`${inputCls} pl-8`} />
                                </div>
                            </div>
                            <div>
                                <label className={labelCls}>Late Ded.</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-rose-500 font-bold text-sm">-</span>
                                    <input type="number" step="0.01" placeholder="0.00" value={formData.late_deduction} onChange={e => setFormData({ ...formData, late_deduction: e.target.value })} className={`${inputCls} pl-8`} />
                                </div>
                            </div>
                        </div>
                        <div>
                            <label className={labelCls}>Bonus</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500 font-bold text-sm">+</span>
                                <input type="number" step="0.01" placeholder="0.00" value={formData.bonus} onChange={e => setFormData({ ...formData, bonus: e.target.value })} className={`${inputCls} pl-8`} />
                            </div>
                        </div>
                        <div>
                            <label className={labelCls}>Advance</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-500 font-bold text-sm">₹</span>
                                <input type="number" step="0.01" placeholder="0.00" value={formData.advance} onChange={e => setFormData({ ...formData, advance: e.target.value })} className={`${inputCls} pl-8`} />
                            </div>
                        </div>
                        <div>
                            <label className={labelCls}>Deductions</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-rose-500 font-bold text-sm">-</span>
                                <input type="number" step="0.01" placeholder="0.00" value={formData.deductions} onChange={e => setFormData({ ...formData, deductions: e.target.value })} className={`${inputCls} pl-8`} />
                            </div>
                        </div>
                    </div>

                    {/* Net Salary Preview */}
                        <div className="mt-4 p-4 bg-primary/5 rounded-2xl border border-primary/10 flex items-center justify-between animate-in fade-in duration-300">
                            <span className="text-sm font-black text-muted uppercase tracking-widest">Estimated Net Pay</span>
                             <span className="text-2xl font-black text-primary">
                                ₹{(
                                    ((parseFloat(formData.basic || 0) / (formData.working_days || 1)) * (parseFloat(formData.present_days) || 0)) +
                                    parseFloat(formData.bonus || 0) +
                                    parseFloat(formData.overtime_pay || 0) -
                                    parseFloat(formData.late_deduction || 0) -
                                    parseFloat(formData.advance || 0) -
                                    parseFloat(formData.deductions || 0)
                                ).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </span>
                        </div>
                </div>

                {/* Status */}
                <div className="bg-card border border-border rounded-[2.5rem] p-8 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-amber-500/10 text-amber-500 rounded-xl"><CheckCircle2 size={18} /></div>
                        <h3 className="text-lg font-black text-foreground tracking-tight">Payment Status</h3>
                    </div>
                    <div className="flex gap-3">
                        {['Unpaid', 'Paid'].map(s => (
                            <button
                                key={s}
                                type="button"
                                onClick={() => setFormData({ ...formData, status: s })}
                                className={`flex-1 py-3 rounded-2xl font-black text-sm border-2 transition-all ${formData.status === s
                                    ? s === 'Paid'
                                        ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/25'
                                        : 'bg-rose-500 border-rose-500 text-white shadow-lg shadow-rose-500/25'
                                    : 'border-border bg-muted/5 text-muted hover:border-primary/30'
                                    }`}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex items-center justify-end gap-4 pt-4">
                    <button type="button" onClick={() => navigate('/salaries')} className="px-8 py-4 bg-muted/10 text-muted font-black rounded-2xl hover:bg-muted/20 transition-all active:scale-95">Cancel</button>
                    <button type="submit" disabled={saving} className="px-12 py-4 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/30 hover:shadow-primary/50 transition-all hover:scale-[1.02] active:scale-95 flex items-center gap-2">
                        {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} strokeWidth={2.5} />}
                        <span>{isEdit ? 'Update Salary' : 'Save Salary'}</span>
                    </button>
                </div>
            </form>
        </div>
    );
};

export default SalaryForm;

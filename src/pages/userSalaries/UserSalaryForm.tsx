import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getUserSalary, createUserSalary, updateUserSalary } from './userSalaryService';
import { getUsers } from '../user/userService';
import {
    ArrowLeft, Save, Loader2, User, DollarSign, AlertCircle, Calendar, Briefcase
} from 'lucide-react';

const UserSalaryForm: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const isEdit = !!id;

    const [loading, setLoading] = useState(isEdit);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [users, setUsers] = useState<any[]>([]);

    const [formData, setFormData] = useState<any>({
        user: '',
        base_salary: '0.00',
        working_days: 26,
        joining_date: '',
    });

    useEffect(() => {
        const loadData = async () => {
            try {
                const userData = await getUsers(1, '');
                setUsers(userData.results || []);
                if (isEdit && id) {
                    const item = await getUserSalary(parseInt(id));
                    setFormData({
                        user: item.user.toString(),
                        base_salary: item.base_salary,
                        working_days: item.working_days,
                        joining_date: item.joining_date || '',
                    });
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
            const payload = {
                ...formData,
                user: parseInt(formData.user),
                joining_date: formData.joining_date || null,
            };
            if (isEdit && id) await updateUserSalary(parseInt(id), payload);
            else await createUserSalary(payload);
            navigate('/user-salaries');
        } catch (err: any) {
            setError(err.response?.data?.detail || JSON.stringify(err.response?.data) || 'Failed to save.');
        } finally {
            setSaving(false);
        }
    };

    const inputCls = "w-full px-5 py-3.5 bg-background border border-border rounded-2xl focus:ring-2 focus:ring-primary/20 transition-all font-medium text-sm disabled:opacity-50";
    const labelCls = "text-[11px] font-bold text-muted uppercase tracking-widest mb-1.5 block";

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
            <Loader2 className="animate-spin text-primary" size={48} />
            <p className="text-muted font-medium italic">Loading data...</p>
        </div>
    );

    return (
        <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700 pb-20">
            {/* Header */}
            <div className="flex items-center gap-6">
                <button onClick={() => navigate('/user-salaries')} className="p-3 bg-muted/20 text-muted rounded-2xl hover:bg-primary/10 hover:text-primary transition-all active:scale-95 border border-transparent hover:border-primary/20">
                    <ArrowLeft size={22} />
                </button>
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-foreground">{isEdit ? 'Edit User Salary' : 'New User Salary'}</h1>
                    <p className="text-muted font-bold text-xs uppercase tracking-widest mt-0.5">Configure base salary settings</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                    <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-3 text-rose-500 text-sm font-bold animate-in zoom-in duration-300">
                        <AlertCircle size={20} /> {error}
                    </div>
                )}

                {/* Employee */}
                <div className="bg-card border border-border rounded-[2.5rem] p-8 space-y-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-primary/10 text-primary rounded-xl"><User size={18} /></div>
                        <h3 className="text-lg font-black text-foreground tracking-tight">Employee</h3>
                    </div>
                    <div>
                        <label className={labelCls}>Select Employee</label>
                        <select value={formData.user} onChange={e => setFormData({ ...formData, user: e.target.value })} className={inputCls} required>
                            <option value="">Select Employee...</option>
                            {users.map(u => (
                                <option key={u.id} value={u.id}>{u.username}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className={labelCls}>Joining Date</label>
                        <div className="relative">
                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={16} />
                            <input type="date" value={formData.joining_date} onChange={e => setFormData({ ...formData, joining_date: e.target.value })} className={`${inputCls} pl-12`} />
                        </div>
                    </div>
                </div>

                {/* Salary Details */}
                <div className="bg-card border border-border rounded-[2.5rem] p-8 space-y-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-xl"><DollarSign size={18} /></div>
                        <h3 className="text-lg font-black text-foreground tracking-tight">Salary Settings</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className={labelCls}>Base Salary</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted font-bold text-sm">₹</span>
                                <input type="number" step="0.01" placeholder="0.00" value={formData.base_salary} onChange={e => setFormData({ ...formData, base_salary: e.target.value })} className={`${inputCls} pl-8`} required />
                            </div>
                        </div>
                        <div>
                            <label className={labelCls}>Working Days / Cycle</label>
                            <div className="relative">
                                <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={16} />
                                <input type="number" value={formData.working_days} onChange={e => setFormData({ ...formData, working_days: parseInt(e.target.value) || 0 })} className={`${inputCls} pl-12`} required />
                            </div>
                        </div>
                    </div>

                    {/* Preview */}
                    <div className="mt-2 p-4 bg-primary/5 rounded-2xl border border-primary/10 flex items-center justify-between">
                        <span className="text-sm font-black text-muted uppercase tracking-widest">Daily Rate</span>
                        <span className="text-2xl font-black text-primary">
                            ₹{(parseFloat(formData.base_salary || '0') / (formData.working_days || 1)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </span>
                    </div>
                </div>

                <div className="flex items-center justify-end gap-4 pt-4">
                    <button type="button" onClick={() => navigate('/user-salaries')} className="px-8 py-4 bg-muted/10 text-muted font-black rounded-2xl hover:bg-muted/20 transition-all active:scale-95">Cancel</button>
                    <button type="submit" disabled={saving} className="px-12 py-4 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/30 hover:shadow-primary/50 transition-all hover:scale-[1.02] active:scale-95 flex items-center gap-2">
                        {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} strokeWidth={2.5} />}
                        <span>{isEdit ? 'Update' : 'Save'}</span>
                    </button>
                </div>
            </form>
        </div>
    );
};

export default UserSalaryForm;

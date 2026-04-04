import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getLeave, createLeave, updateLeave } from './leaveService';
import { getUsers } from '../user/userService';
import {
    ArrowLeft,
    Save,
    Loader2,
    Calendar,
    User,
    FileText,
    AlertCircle,
    CheckCircle2
} from 'lucide-react';

const LeaveForm: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const isEdit = !!id;

    const [loading, setLoading] = useState(isEdit);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [users, setUsers] = useState<any[]>([]);

    const [formData, setFormData] = useState<any>({
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date().toISOString().split('T')[0],
        employee: '',
        description: '',
        status: 'Pending',
        approved_by: ''
    });

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const userData = await getUsers(1, '');
                setUsers(userData.results || []);

                if (isEdit && id) {
                    const leave = await getLeave(parseInt(id));
                    setFormData({
                        ...leave,
                        employee: leave.employee.toString(),
                        status: leave.status || 'Pending',
                        approved_by: leave.approved_by?.toString() || ''
                    });
                }
            } catch (err: any) {
                setError('Failed to load initial data.');
            } finally {
                setLoading(false);
            }
        };
        loadInitialData();
    }, [id, isEdit]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError(null);
        try {
            const payload = {
                ...formData,
                employee: parseInt(formData.employee),
                approved_by: formData.approved_by ? parseInt(formData.approved_by) : null
            };

            if (isEdit && id) {
                await updateLeave(parseInt(id), payload);
            } else {
                await createLeave(payload);
            }
            navigate('/leaves');
        } catch (err: any) {
            setError(err.response?.data?.detail || JSON.stringify(err.response?.data) || 'Failed to save leave request.');
        } finally {
            setSaving(false);
        }
    };

    const inputCls = "w-full px-5 py-3.5 bg-background border border-border rounded-2xl focus:ring-2 focus:ring-primary/20 transition-all font-medium text-sm disabled:opacity-50";
    const labelCls = "text-[11px] font-bold text-muted uppercase tracking-widest mb-1.5 block";

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
            <Loader2 className="animate-spin text-primary" size={48} />
            <p className="text-muted font-medium italic">Loading request data...</p>
        </div>
    );

    return (
        <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700 pb-20">
            {/* Header */}
            <div className="flex items-center gap-6">
                <button onClick={() => navigate('/leaves')} className="p-3 bg-muted/20 text-muted rounded-2xl hover:bg-primary/10 hover:text-primary transition-all active:scale-95 border border-transparent hover:border-primary/20">
                    <ArrowLeft size={22} />
                </button>
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-foreground">{isEdit ? 'Edit Leave Request' : 'New Leave Request'}</h1>
                    <p className="text-muted font-bold text-xs uppercase tracking-widest mt-0.5">Request and track employee leave</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                    <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-3 text-rose-500 text-sm font-bold animate-in zoom-in duration-300">
                        <AlertCircle size={20} />
                        {error}
                    </div>
                )}

                <div className="bg-card border border-border rounded-[2.5rem] p-8 space-y-8 shadow-sm">
                    {/* Employee Selection */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-primary/10 text-primary rounded-xl"><User size={18} /></div>
                            <h3 className="text-lg font-black text-foreground tracking-tight">Employee Details</h3>
                        </div>
                        <div>
                            <label className={labelCls}>Employee</label>
                            <select value={formData.employee} onChange={e => setFormData({ ...formData, employee: e.target.value })} className={inputCls} required>
                                <option value="">Select Employee...</option>
                                {users.map(u => (
                                    <option key={u.id} value={u.id}>{u.username}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Dates */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-xl"><Calendar size={18} /></div>
                            <h3 className="text-lg font-black text-foreground tracking-tight">Leave Duration</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

                    {/* Status if editing */}
                    {isEdit && (
                        <div className="space-y-4 pt-4 border-t border-border/50">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-amber-500/10 text-amber-500 rounded-xl"><CheckCircle2 size={18} /></div>
                                <h3 className="text-lg font-black text-foreground tracking-tight">Approval Status</h3>
                            </div>
                            <div className="max-w-[200px]">
                                <label className={labelCls}>Current Status</label>
                                <select 
                                    value={formData.status || 'Pending'} 
                                    onChange={e => {
                                        const newStatus = e.target.value;
                                        const newFormData = { ...formData, status: newStatus };
                                        
                                        // Auto-populate approved_by if status becomes Approved and it's currently empty
                                        if (newStatus === 'Approved' && !formData.approved_by) {
                                            try {
                                                const storedUser = localStorage.getItem('user');
                                                if (storedUser) {
                                                    const currentUser = JSON.parse(storedUser);
                                                    newFormData.approved_by = currentUser.id.toString();
                                                }
                                            } catch (err) {
                                                console.error('Failed to auto-populate approver', err);
                                            }
                                        }
                                        
                                        setFormData(newFormData);
                                    }} 
                                    className={inputCls}
                                >
                                    <option value="Pending">Pending</option>
                                    <option value="Approved">Approved</option>
                                    <option value="Rejected">Rejected</option>
                                    <option value="Cancelled">Cancelled</option>
                                </select>
                            </div>
                            {formData.status !== 'Pending' && (
                                <div className="max-w-[200px] mt-4">
                                    <label className={labelCls}>{formData.status === 'Approved' ? 'Approved By' : 'Actioned By'}</label>
                                    <select value={formData.approved_by} onChange={e => setFormData({ ...formData, approved_by: e.target.value })} className={inputCls} required={formData.status === 'Approved'}>
                                        <option value="">Select User...</option>
                                        {users.map(u => (
                                            <option key={u.id} value={u.id}>{u.username}</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Description */}
                    <div className="space-y-4 pt-4 border-t border-border/50">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-indigo-500/10 text-indigo-500 rounded-xl"><FileText size={18} /></div>
                            <h3 className="text-lg font-black text-foreground tracking-tight">Reason for Leave</h3>
                        </div>
                        <textarea
                            placeholder="Provide a brief description of the reason for leave..."
                            value={formData.description || ''}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            className={`${inputCls} min-h-[120px] resize-none py-4 text-base`}
                        />
                    </div>
                </div>

                <div className="flex items-center justify-end gap-4 pt-4">
                    <button type="button" onClick={() => navigate('/leaves')} className="px-8 py-4 bg-muted/10 text-muted font-black rounded-2xl hover:bg-muted/20 transition-all active:scale-95">Cancel</button>
                    <button type="submit" disabled={saving} className="px-12 py-4 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/30 hover:shadow-primary/50 transition-all hover:scale-[1.02] active:scale-95 flex items-center gap-2">
                        {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} strokeWidth={2.5} />}
                        <span>{isEdit ? 'Update Request' : 'Submit Request'}</span>
                    </button>
                </div>
            </form>
        </div>
    );
};

export default LeaveForm;

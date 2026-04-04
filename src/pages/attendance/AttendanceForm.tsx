import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getAttendance, createAttendance, updateAttendance } from './attendanceService';
import { getUsers } from '../user/userService';
import { ArrowLeft, Save, Loader2, User, Calendar, Clock, AlertCircle } from 'lucide-react';

const STATUS_OPTIONS = ['Present', 'Absent', 'Half Day', 'Late'];

const AttendanceForm: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const isEdit = !!id;

    // Read logged-in user from localStorage
    const loggedInUser = (() => { try { return JSON.parse(localStorage.getItem('user') || '{}'); } catch { return {}; } })();
    const loggedInUserId = loggedInUser?.id?.toString() || '';

    const [loading, setLoading] = useState(isEdit);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [users, setUsers] = useState<any[]>([]);

    const [formData, setFormData] = useState<any>({
        date: new Date().toISOString().split('T')[0],
        check_in: '09:00',
        check_out: '17:30',
        status: 'Present',
        employee: loggedInUserId
    });

    useEffect(() => {
        const loadData = async () => {
            try {
                const userData = await getUsers(1, '');
                setUsers(userData.results || []);
                if (isEdit && id) {
                    const rec = await getAttendance(parseInt(id));
                    setFormData({ ...rec, employee: rec.employee.toString(), check_in: rec.check_in || '', check_out: rec.check_out || '' });
                }
            } catch (err: any) { setError('Failed to load data.'); }
            finally { setLoading(false); }
        };
        loadData();
    }, [id, isEdit]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true); setError(null);
        try {
            const payload = {
                ...formData,
                employee: parseInt(formData.employee),
                check_in: formData.check_in || null,
                check_out: formData.check_out || null
            };
            if (isEdit && id) await updateAttendance(parseInt(id), payload);
            else await createAttendance(payload);
            navigate('/attendance');
        } catch (err: any) {
            setError(err.response?.data?.detail || JSON.stringify(err.response?.data) || 'Failed to save.');
        } finally { setSaving(false); }
    };

    const inputCls = "w-full px-5 py-3.5 bg-background border border-border rounded-2xl focus:ring-2 focus:ring-primary/20 transition-all font-medium text-sm disabled:opacity-50";
    const labelCls = "text-[11px] font-bold text-muted uppercase tracking-widest mb-1.5 block";

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
            <Loader2 className="animate-spin text-primary" size={48} />
            <p className="text-muted font-medium italic">Loading attendance data...</p>
        </div>
    );

    return (
        <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700 pb-20">
            {/* Header */}
            <div className="flex items-center gap-6">
                <button onClick={() => navigate('/attendance')} className="p-3 bg-muted/20 text-muted rounded-2xl hover:bg-primary/10 hover:text-primary transition-all active:scale-95 border border-transparent hover:border-primary/20">
                    <ArrowLeft size={22} />
                </button>
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-foreground">{isEdit ? 'Edit Attendance' : 'Mark Attendance'}</h1>
                    <p className="text-muted font-bold text-xs uppercase tracking-widest mt-0.5">Track employee presence</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                    <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-3 text-rose-500 text-sm font-bold">
                        <AlertCircle size={20} /> {error}
                    </div>
                )}

                {/* Employee & Date */}
                <div className="bg-card border border-border rounded-[2.5rem] p-8 space-y-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-primary/10 text-primary rounded-xl"><User size={18} /></div>
                        <h3 className="text-lg font-black text-foreground tracking-tight">Employee & Date</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className={labelCls}>Employee</label>
                            <select value={formData.employee} onChange={e => setFormData({ ...formData, employee: e.target.value })} className={inputCls} required>
                                <option value="">Select Employee...</option>
                                {users.map(u => {
                                    const fullName = `${u.first_name || ''} ${u.last_name || ''}`.trim();
                                    return (
                                        <option key={u.id} value={u.id}>
                                            {fullName ? `${fullName} (${u.username})` : u.username}
                                        </option>
                                    );
                                })}
                            </select>
                        </div>
                        <div>
                            <label className={labelCls}>Date</label>
                            <input type="date" max={new Date().toISOString().split('T')[0]} value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} className={inputCls} required />
                        </div>
                    </div>
                </div>

                {/* Check-in / Check-out */}
                <div className="bg-card border border-border rounded-[2.5rem] p-8 space-y-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-xl"><Clock size={18} /></div>
                        <h3 className="text-lg font-black text-foreground tracking-tight">Timings</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className={labelCls}>Check In Time</label>
                            <input type="time" value={formData.check_in || ''} onChange={e => setFormData({ ...formData, check_in: e.target.value })} className={inputCls} />
                        </div>
                        <div>
                            <label className={labelCls}>Check Out Time</label>
                            <input type="time" value={formData.check_out || ''} onChange={e => setFormData({ ...formData, check_out: e.target.value })} className={inputCls} />
                        </div>
                    </div>
                </div>

                {/* Status */}
                <div className="bg-card border border-border rounded-[2.5rem] p-8 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-amber-500/10 text-amber-500 rounded-xl"><Calendar size={18} /></div>
                        <h3 className="text-lg font-black text-foreground tracking-tight">Attendance Status</h3>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {STATUS_OPTIONS.map(s => {
                            const colorMap: Record<string, string> = {
                                'Present': 'bg-emerald-500 border-emerald-500 shadow-emerald-500/25',
                                'Absent': 'bg-rose-500 border-rose-500 shadow-rose-500/25',
                                'Half Day': 'bg-amber-500 border-amber-500 shadow-amber-500/25',
                                'Late': 'bg-orange-500 border-orange-500 shadow-orange-500/25',
                            };
                            const isSelected = formData.status === s;
                            return (
                                <button
                                    key={s}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, status: s })}
                                    className={`py-3 rounded-2xl font-black text-sm border-2 transition-all ${isSelected
                                        ? `${colorMap[s]} text-white shadow-lg`
                                        : 'border-border bg-muted/5 text-muted hover:border-primary/30'
                                        }`}
                                >
                                    {s}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="flex items-center justify-end gap-4 pt-4">
                    <button type="button" onClick={() => navigate('/attendance')} className="px-8 py-4 bg-muted/10 text-muted font-black rounded-2xl hover:bg-muted/20 transition-all active:scale-95">Cancel</button>
                    <button type="submit" disabled={saving} className="px-12 py-4 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/30 hover:shadow-primary/50 transition-all hover:scale-[1.02] active:scale-95 flex items-center gap-2">
                        {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} strokeWidth={2.5} />}
                        <span>{isEdit ? 'Update Record' : 'Save Record'}</span>
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AttendanceForm;

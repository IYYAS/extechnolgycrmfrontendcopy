import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getEmployee, createEmployee, updateEmployee } from './employeeService';
import { getUsers } from '../user/userService';
import { ArrowLeft, Save, Loader2, AlertCircle, User, Briefcase, Calendar, Hash, DollarSign, Image as ImageIcon, UploadCloud } from 'lucide-react';

const EmployeeForm: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const isEdit = !!id;

    const [loading, setLoading] = useState(isEdit);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [users, setUsers] = useState<any[]>([]);

    const [formData, setFormData] = useState<any>({
        user: '',
        employee_id: '',
        joining_date: new Date().toISOString().split('T')[0],
        department: '',
        basic_salary: '',
        is_active: true,
        photo: null as File | null
    });

    useEffect(() => {
        const loadData = async () => {
            try {
                const fetchedUsers = await getUsers(1, '');
                setUsers(fetchedUsers.results || []);

                if (isEdit && id) {
                    const rec = await getEmployee(parseInt(id));
                    setFormData({
                        ...rec,
                        user: rec.user.toString()
                    });
                }
            } catch (err: any) {
                setError('Failed to load employee data or users.');
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
            let payload: any;
            
            // If we have a new photo file, we must use FormData
            if (formData.photo instanceof File) {
                payload = new FormData();
                payload.append('user', formData.user);
                payload.append('employee_id', formData.employee_id);
                payload.append('joining_date', formData.joining_date);
                if (formData.department) payload.append('department', formData.department);
                payload.append('basic_salary', formData.basic_salary);
                payload.append('is_active', formData.is_active);
                payload.append('photo', formData.photo);
            } else {
                // Otherwise use standard JSON payload
                payload = { 
                    ...formData,
                    user: parseInt(formData.user),
                };
                // Remove the photo key if it's not a new file so we don't send the URL back
                delete payload.photo;
            }

            if (isEdit && id) {
                await updateEmployee(parseInt(id), payload);
            } else {
                await createEmployee(payload);
            }
            navigate('/employees');
        } catch (err: any) {
            setError(err.response?.data?.detail || JSON.stringify(err.response?.data) || 'Failed to save record.');
        } finally {
            setSaving(false);
        }
    };

    const inputCls = "w-full px-5 py-3.5 bg-background border border-border rounded-2xl focus:ring-2 focus:ring-blue-500/20 transition-all font-medium text-sm disabled:opacity-50";
    const labelCls = "text-[11px] font-bold text-muted uppercase tracking-widest mb-1.5 block";

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
            <Loader2 className="animate-spin text-blue-500" size={48} />
            <p className="text-muted font-medium italic">Loading employee data...</p>
        </div>
    );

    return (
        <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700 pb-20">
            {/* Header */}
            <div className="flex items-center gap-6">
                <button onClick={() => navigate('/employees')} className="p-3 bg-muted/20 text-muted rounded-2xl hover:bg-blue-500/10 hover:text-blue-500 transition-all active:scale-95 border border-transparent hover:border-blue-500/20">
                    <ArrowLeft size={22} />
                </button>
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-foreground">{isEdit ? 'Edit Employee' : 'Add Employee'}</h1>
                    <p className="text-muted font-bold text-xs uppercase tracking-widest mt-0.5">Manage staff details and roles</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                    <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-3 text-rose-500 text-sm font-bold">
                        <AlertCircle size={20} /> {error}
                    </div>
                )}

                {/* Identity */}
                <div className="bg-card border border-border rounded-[2.5rem] p-8 space-y-6 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-500/10 text-blue-500 rounded-xl"><User size={18} /></div>
                            <h3 className="text-lg font-black text-foreground tracking-tight">Identity Details</h3>
                        </div>
                        <label className="flex items-center gap-3 cursor-pointer">
                            <span className="text-[11px] font-bold text-muted uppercase tracking-widest">Active Status</span>
                            <div 
                                onClick={() => setFormData({ ...formData, is_active: !formData.is_active })}
                                className={`w-14 h-8 rounded-full p-1 transition-colors ${formData.is_active ? 'bg-emerald-500' : 'bg-muted'} cursor-pointer`}
                            >
                                <div className={`w-6 h-6 bg-white rounded-full shadow-md transition-transform ${formData.is_active ? 'translate-x-6' : 'translate-x-0'}`}></div>
                            </div>
                        </label>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-6">
                        <div>
                            <label className={labelCls}>System User</label>
                            <select value={formData.user} onChange={e => setFormData({ ...formData, user: e.target.value })} className={inputCls} required>
                                <option value="">Select User Profile...</option>
                                {users.map(u => (
                                    <option key={u.id} value={u.id}>{u.username}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-border mt-4">
                        <label className={labelCls}>Profile Photo</label>
                        <div className="flex items-start gap-6 mt-3">
                            {/* Preview Area */}
                            <div className="shrink-0">
                                {formData.photo instanceof File ? (
                                    <img src={URL.createObjectURL(formData.photo)} alt="Preview" className="w-24 h-24 rounded-2xl object-cover border-2 border-primary/20 bg-muted/10 shadow-sm" />
                                ) : formData.photo && typeof formData.photo === 'string' ? (
                                    <img src={formData.photo} alt="Current" className="w-24 h-24 rounded-2xl object-cover border-2 border-border bg-muted/10 shadow-sm" />
                                ) : (
                                    <div className="w-24 h-24 rounded-2xl border-2 border-dashed border-border bg-muted/5 flex flex-col items-center justify-center text-muted gap-2">
                                        <ImageIcon size={24} strokeWidth={1.5} />
                                    </div>
                                )}
                            </div>

                            {/* Upload Control */}
                            <div className="flex-1">
                                <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-border rounded-2xl cursor-pointer hover:bg-muted/5 hover:border-primary/30 transition-all group">
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <UploadCloud className="w-8 h-8 mb-2 text-muted group-hover:text-primary transition-colors" />
                                        <p className="mb-0.5 text-sm text-muted-foreground font-medium"><span className="font-bold text-primary group-hover:underline">Click to upload</span> or drag and drop</p>
                                        <p className="text-xs text-muted font-bold uppercase tracking-wider">SVG, PNG, JPG or GIF</p>
                                    </div>
                                    <input 
                                        type="file" 
                                        className="hidden" 
                                        accept="image/*"
                                        onChange={(e) => {
                                            if (e.target.files && e.target.files[0]) {
                                                setFormData({ ...formData, photo: e.target.files[0] });
                                            }
                                        }}
                                    />
                                </label>
                                {formData.photo && (
                                    <button 
                                        type="button" 
                                        onClick={() => setFormData({ ...formData, photo: null })}
                                        className="mt-2 text-xs font-bold text-rose-500 hover:text-rose-600 transition-colors"
                                    >
                                        Remove Photo
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Professional Info */}
                <div className="bg-card border border-border rounded-[2.5rem] p-8 space-y-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-indigo-500/10 text-indigo-500 rounded-xl"><Briefcase size={18} /></div>
                        <h3 className="text-lg font-black text-foreground tracking-tight">Professional Information</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className={labelCls}>Employee ID / Code</label>
                            <div className="relative">
                                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-muted font-black"><Hash size={16} /></span>
                                <input type="text" value={formData.employee_id} onChange={e => setFormData({ ...formData, employee_id: e.target.value })} className={`${inputCls} pl-12`} placeholder="e.g. EMP-001" required />
                            </div>
                        </div>
                        <div>
                            <label className={labelCls}>Department</label>
                            <input type="text" value={formData.department || ''} onChange={e => setFormData({ ...formData, department: e.target.value })} className={inputCls} placeholder="e.g. Engineering" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className={labelCls}>Joining Date</label>
                            <div className="relative">
                                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-muted font-black"><Calendar size={16} /></span>
                                <input type="date" value={formData.joining_date} onChange={e => setFormData({ ...formData, joining_date: e.target.value })} className={`${inputCls} pl-12`} required />
                            </div>
                        </div>
                        <div>
                            <label className={labelCls}>Basic Salary</label>
                            <div className="relative">
                                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-muted font-black"><DollarSign size={16} /></span>
                                <input type="number" step="0.01" value={formData.basic_salary} onChange={e => setFormData({ ...formData, basic_salary: e.target.value })} className={`${inputCls} pl-12`} placeholder="0.00" required />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-end gap-4 pt-4">
                    <button type="button" onClick={() => navigate('/employees')} className="px-8 py-4 bg-muted/10 text-muted font-black rounded-2xl hover:bg-muted/20 transition-all active:scale-95">Cancel</button>
                    <button type="submit" disabled={saving} className="px-12 py-4 bg-blue-500 text-white font-black rounded-2xl shadow-xl shadow-blue-500/30 hover:shadow-blue-500/50 transition-all hover:scale-[1.02] active:scale-95 flex items-center gap-2">
                        {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} strokeWidth={2.5} />}
                        <span>{isEdit ? 'Update Employee' : 'Save Employee'}</span>
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EmployeeForm;

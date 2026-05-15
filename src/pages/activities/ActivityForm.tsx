import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { getActivity, createActivity, updateActivity } from './activityService';
import { getProject } from '../projects/projectService';
import SearchableUserSelect from '../../components/SearchableUserSelect';
import SearchableProjectSelect from '../../components/SearchableProjectSelect';
import SearchableTeamSelect from '../../components/SearchableTeamSelect';
import {
    ArrowLeft,
    Save,
    Loader2,
    Calendar,
    Clock,
    AlertCircle,
    MessageSquare,
    Percent,
} from 'lucide-react';

const ActivityForm: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const isEdit = !!id;

    // Read pre-filled fields from URL query params e.g. ?project=5&team=2&service=3&employee=10
    const prefilledProjectId = new URLSearchParams(location.search).get('project') || '';
    const prefilledTeamId = new URLSearchParams(location.search).get('team') || '';
    const prefilledServiceId = new URLSearchParams(location.search).get('service') || '';
    const prefilledEmployeeId = new URLSearchParams(location.search).get('employee') || '';

    // Read logged-in user from localStorage
    const loggedInUser = (() => { try { return JSON.parse(localStorage.getItem('user') || '{}'); } catch { return {}; } })();
    const loggedInUserId = loggedInUser?.id?.toString() || '';

    const [loading, setLoading] = useState(isEdit);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedProjectServices, setSelectedProjectServices] = useState<any[]>([]);

    const [formData, setFormData] = useState<any>({
        description: '',
        hours_spent: '',
        date: new Date().toISOString().split('T')[0],
        pending_work_percentage: 0,
        target_work_percentage: 0,
        is_timeline_exceeded: false,
        delay_reason: '',
        employee: prefilledEmployeeId || loggedInUserId,
        team: prefilledTeamId,
        project: prefilledProjectId,
        project_service: prefilledServiceId
    });

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                if (isEdit && id) {
                    const activity = await getActivity(parseInt(id));
                    setFormData({
                        ...activity,
                        employee: activity.employee.toString(),
                        team: activity.team?.toString() || '',
                        project: activity.project?.toString() || '',
                        project_service: activity.project_service?.toString() || '',
                        target_work_percentage: activity.target_work_percentage || 0
                    });

                    if (activity.project) {
                        const fullProject = await getProject(activity.project);
                        setSelectedProjectServices(fullProject.services || []);
                    }
                } else if (prefilledProjectId) {
                    const fullProject = await getProject(parseInt(prefilledProjectId));
                    setSelectedProjectServices(fullProject.services || []);
                }
            } catch (err: any) {
                setError('Failed to load initial data.');
            } finally {
                setLoading(false);
            }
        };
        loadInitialData();
    }, [id, isEdit, prefilledProjectId]);

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError(null);
        try {
            const payload = {
                ...formData,
                employee: parseInt(formData.employee),
                team: formData.team ? parseInt(formData.team) : null,
                project: formData.project ? parseInt(formData.project) : null,
                project_service: formData.project_service ? parseInt(formData.project_service) : null,
                pending_work_percentage: parseInt(formData.pending_work_percentage),
                target_work_percentage: parseInt(formData.target_work_percentage)
            };

            if (isEdit && id) {
                await updateActivity(parseInt(id), payload);
            } else {
                await createActivity(payload);
            }
            navigate('/activities');
        } catch (err: any) {
            setError(err.response?.data?.detail || JSON.stringify(err.response?.data) || 'Failed to save activity.');
        } finally {
            setSaving(false);
        }
    };

    const inputCls = "w-full px-5 py-3.5 bg-background border border-border rounded-2xl focus:ring-2 focus:ring-primary/20 transition-all font-medium text-sm disabled:opacity-50";
    const labelCls = "text-[11px] font-bold text-muted uppercase tracking-widest mb-1.5 block";

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
            <Loader2 className="animate-spin text-primary" size={48} />
            <p className="text-muted font-medium italic">Loading report data...</p>
        </div>
    );


    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700 pb-20">
            {/* Header */}
            <div className="flex items-center gap-6">
                <button onClick={() => navigate('/activities')} className="p-3 bg-muted/20 text-muted rounded-2xl hover:bg-primary/10 hover:text-primary transition-all active:scale-95 border border-transparent hover:border-primary/20">
                    <ArrowLeft size={22} />
                </button>
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-foreground">{isEdit ? 'Edit Activity Report' : 'New Activity Report'}</h1>
                    <p className="text-muted font-bold text-xs uppercase tracking-widest mt-0.5">Log your daily progress and hours</p>
                </div>
            </div>

            <form onSubmit={handleInvite} className="space-y-6">
                {error && (
                    <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-3 text-rose-500 text-sm font-bold animate-in zoom-in duration-300">
                        <AlertCircle size={20} />
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Basic Info */}
                    <div className="bg-card border border-border rounded-[2.5rem] p-8 space-y-6 shadow-sm">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-primary/10 text-primary rounded-xl"><Calendar size={18} /></div>
                            <h3 className="text-lg font-black text-foreground tracking-tight">Report Context</h3>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className={labelCls}>Date of Activity</label>
                                <input type="date" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} className={inputCls} required />
                            </div>
                            <div>
                                <label className={labelCls}>Employee</label>
                                <SearchableUserSelect
                                    value={formData.employee}
                                    onChange={(val) => setFormData({ ...formData, employee: val?.toString() || '' })}
                                />
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className={labelCls}>Project</label>
                                    <SearchableProjectSelect
                                        value={formData.project}
                                        onChange={async (val) => {
                                            setFormData({ ...formData, project: val?.toString() || '', project_service: '' });
                                            if (val) {
                                                const p = await getProject(val);
                                                setSelectedProjectServices(p.services || []);
                                            } else {
                                                setSelectedProjectServices([]);
                                            }
                                        }}
                                        placeholder="No Project"
                                    />
                                </div>
                                <div>
                                    <label className={labelCls}>Team</label>
                                    <SearchableTeamSelect
                                        value={formData.team}
                                        onChange={(val) => setFormData({ ...formData, team: val?.toString() || '' })}
                                        placeholder="No Team"
                                    />
                                </div>
                            </div>
                            {selectedProjectServices.length > 0 && (
                                <div>
                                    <label className={labelCls}>Related Service</label>
                                    <select value={formData.project_service} onChange={e => setFormData({ ...formData, project_service: e.target.value })} className={inputCls}>
                                        <option value="">Select Service...</option>
                                        {selectedProjectServices.map((s: any) => (
                                            <option key={s.id} value={s.id}>{s.name}</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Progress details */}
                    <div className="bg-card border border-border rounded-[2.5rem] p-8 space-y-6 shadow-sm">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-xl"><Clock size={18} /></div>
                            <h3 className="text-lg font-black text-foreground tracking-tight">Progress Tracking</h3>
                        </div>

                        <div className="space-y-4">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                <div>
                                    <label className={labelCls}>Hours Spent</label>
                                    <div className="relative">
                                        <input type="number" step="0.25" placeholder="e.g. 5.5" value={formData.hours_spent} onChange={e => setFormData({ ...formData, hours_spent: e.target.value })} className={inputCls} required />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-muted uppercase">Hrs</span>
                                    </div>
                                </div>
                                <div>
                                    <label className={labelCls}>Pending Work %</label>
                                    <div className="relative">
                                        <input type="number" min="0" max="100" value={formData.pending_work_percentage} onChange={e => setFormData({ ...formData, pending_work_percentage: e.target.value })} className={inputCls} required />
                                        <Percent className="absolute right-4 top-1/2 -translate-y-1/2 text-muted" size={14} />
                                    </div>
                                </div>
                                <div>
                                    <label className={labelCls}>Target Work %</label>
                                    <div className="relative flex items-center h-[46px] px-4 bg-indigo-50/50 border border-indigo-500/20 rounded-2xl text-indigo-500 text-sm font-bold">
                                        Auto-calculated on save
                                        <Percent className="absolute right-4 top-1/2 -translate-y-1/2 text-indigo-400 opacity-50" size={14} />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 p-4 bg-muted/20 rounded-2xl border border-border/50">
                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${formData.is_timeline_exceeded ? 'bg-rose-500 border-rose-500' : 'bg-background border-muted group-hover:border-rose-500/50'}`}>
                                        <input type="checkbox" className="hidden" checked={formData.is_timeline_exceeded} onChange={e => setFormData({ ...formData, is_timeline_exceeded: e.target.checked })} />
                                        {formData.is_timeline_exceeded && <AlertCircle size={14} className="text-white" strokeWidth={3} />}
                                    </div>
                                    <span className={`text-sm font-black uppercase tracking-tight ${formData.is_timeline_exceeded ? 'text-rose-500' : 'text-muted'}`}>Timeline Exceeded?</span>
                                </label>
                            </div>

                            {formData.is_timeline_exceeded && (
                                <div className="space-y-1 animate-in slide-in-from-top-2 duration-300">
                                    <label className={labelCls}>Delay Reason</label>
                                    <textarea
                                        placeholder="Explain the cause of delay..."
                                        value={formData.delay_reason}
                                        onChange={e => setFormData({ ...formData, delay_reason: e.target.value })}
                                        className={`${inputCls} min-h-[100px] resize-none py-4`}
                                        required
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Description - Full Width */}
                    <div className="md:col-span-2 bg-card border border-border rounded-[2.5rem] p-8 space-y-4 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-indigo-500/10 text-indigo-500 rounded-xl"><MessageSquare size={18} /></div>
                            <h3 className="text-lg font-black text-foreground tracking-tight">Work Description</h3>
                        </div>
                        <textarea
                            placeholder="What did you work on today? Give a detailed overview of your accomplishments..."
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            className={`${inputCls} min-h-[150px] resize-none py-4 text-base`}
                            required
                        />
                    </div>
                </div>

                <div className="flex items-center justify-end gap-4 pt-4">
                    <button type="button" onClick={() => navigate('/activities')} className="px-8 py-4 bg-muted/10 text-muted font-black rounded-2xl hover:bg-muted/20 transition-all active:scale-95">Cancel</button>
                    <button type="submit" disabled={saving} className="px-12 py-4 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/30 hover:shadow-primary/50 transition-all hover:scale-[1.02] active:scale-95 flex items-center gap-2">
                        {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} strokeWidth={2.5} />}
                        <span>{isEdit ? 'Update Report' : 'Save Report'}</span>
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ActivityForm;

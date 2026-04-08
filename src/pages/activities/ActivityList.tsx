import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getActivities, deleteActivity, getEmployeeActivities } from './activityService';
import type { EmployeeDailyActivity } from './activityService';
import { getProjects, getTeams } from '../projects/projectService';
import { getUsers } from '../user/userService';
import { usePermission } from '../../hooks/usePermission';
import {
    Search,
    Plus,
    Calendar,
    Clock,
    Loader2,
    Edit2,
    Trash2,
    AlertCircle,
    TrendingUp,
    ChevronLeft,
    ChevronRight,
    Users,
    FilePlus
} from 'lucide-react';

const ActivityList: React.FC = () => {
    const { hasPermission } = usePermission();
    const [activities, setActivities] = useState<EmployeeDailyActivity[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | null>(null);
    const navigate = useNavigate();
    const { employeeId } = useParams<{ employeeId: string }>();
    const isEmployeeView = !!employeeId;

    // Mapping states
    const [users, setUsers] = useState<any[]>([]);
    const [projects, setProjects] = useState<any[]>([]);
    const [teams, setTeams] = useState<any[]>([]);

    const ITEMS_PER_PAGE = 10;
    const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

    const fetchData = async (page: number = 1, search: string = '', sDate: string = '', eDate: string = '', empId: number | null = null) => {
        setLoading(true);
        setError(null);
        try {
            const fetchActivitiesPromise = isEmployeeView 
                ? getEmployeeActivities(parseInt(employeeId as string), page, sDate, eDate)
                : getActivities(page, search, sDate, eDate, undefined, empId || undefined);

            const [activityData, userData, projectData, teamData] = await Promise.all([
                fetchActivitiesPromise,
                getUsers(1, ''), // Simple fetch for mapping
                getProjects(1, ''),
                getTeams()
            ]);
            setActivities(activityData.results);
            setTotalCount(activityData.count);
            setUsers(userData.results || []);
            setProjects(projectData.results || []);
            setTeams(teamData || []);
        } catch (err: any) {
            console.error('Failed to fetch activities:', err);
            setError(err.response?.data?.detail || 'Failed to load activities.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchData(currentPage, searchTerm, startDate, endDate, selectedEmployeeId);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm, currentPage, startDate, endDate, selectedEmployeeId]);

    const handleExportPDF = async () => {
        try {
            if (isEmployeeView) {
                await getEmployeeActivities(parseInt(employeeId as string), currentPage, startDate, endDate, 'pdf');
            } else {
                await getActivities(currentPage, searchTerm, startDate, endDate, 'pdf', selectedEmployeeId || undefined);
            }
        } catch (err: any) {
            console.error('PDF Export failed:', err);
            setError('Failed to generate PDF report. Please try again.');
        }
    };

    const handleExportWord = async () => {
        try {
            if (isEmployeeView) {
                await getEmployeeActivities(parseInt(employeeId as string), currentPage, startDate, endDate, 'docx');
            } else {
                await getActivities(currentPage, searchTerm, startDate, endDate, 'docx', selectedEmployeeId || undefined);
            }
        } catch (err: any) {
            console.error('Word Export failed:', err);
            setError('Failed to generate Word report. Please try again.');
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Are you sure you want to delete this activity report?')) return;
        try {
            await deleteActivity(id);
            fetchData(currentPage, searchTerm);
        } catch (err: any) {
            alert(err.response?.data?.detail || 'Failed to delete activity.');
        }
    };

    const getUserName = (id: number) => {
        const u = users.find(u => u.id === id);
        return u ? `${u.first_name} ${u.last_name}` : `User #${id}`;
    };

    const getProjectName = (id: number | null) => {
        if (!id) return '—';
        const p = projects.find(p => p.id === id);
        return p ? p.name || `Project #${id}` : `Project #${id}`;
    };

    const getTeamName = (id: number | null) => {
        if (!id) return '—';
        const t = teams.find(t => t.id === id);
        return t ? t.name || `Team #${id}` : `Team #${id}`;
    };

    // Summary Calculations
    const totalHours = activities.reduce((acc, act) => acc + parseFloat(act.hours_spent), 0).toFixed(1);
    const avgCompletion = activities.length > 0
        ? (activities.reduce((acc, act) => acc + (100 - act.pending_work_percentage), 0) / activities.length).toFixed(0)
        : 0;
    const delayedCount = activities.filter(a => a.is_timeline_exceeded).length;

    if (loading && activities.length === 0) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
            <Loader2 className="animate-spin text-primary" size={48} />
            <p className="text-muted font-medium italic">Loading activities...</p>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
            {error && (
                <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-3 text-rose-500 text-sm font-bold animate-in zoom-in duration-300">
                    <AlertCircle size={20} />
                    {error}
                </div>
            )}

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black tracking-tighter text-foreground bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                        {isEmployeeView ? `Activities: ${getUserName(parseInt(employeeId as string))}` : 'Daily Activities'}
                    </h1>
                    <p className="text-muted font-bold text-sm uppercase tracking-widest mt-1">
                        {isEmployeeView ? 'Administrative Activity Oversight' : 'Employee Productivity & Timeline Tracking'}
                    </p>
                </div>
                {!isEmployeeView && hasPermission('add_employeedailyactivity') && (
                    <button onClick={() => navigate('/activities/new')} className="flex items-center gap-2 px-6 py-3 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/30 hover:shadow-primary/50 transition-all hover:scale-[1.02] active:scale-95">
                        <Plus size={20} strokeWidth={3} />
                        <span>New Activity</span>
                    </button>
                )}
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-card border border-border p-6 rounded-[2.5rem] shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 text-primary/5 group-hover:text-primary/10 transition-colors"><Clock size={80} /></div>
                    <p className="text-[10px] font-black uppercase text-muted tracking-[0.2em]">Total Hours Tracked</p>
                    <h2 className="text-4xl font-black mt-2 text-primary">{totalHours}h</h2>
                    <p className="text-xs text-muted font-bold mt-1">In current view</p>
                </div>
                <div className="bg-card border border-border p-6 rounded-[2.5rem] shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 text-emerald-500/5 group-hover:text-emerald-500/10 transition-colors"><TrendingUp size={80} /></div>
                    <p className="text-[10px] font-black uppercase text-muted tracking-[0.2em]">Avg. Progress</p>
                    <h2 className="text-4xl font-black mt-2 text-emerald-500">{avgCompletion}%</h2>
                    <p className="text-xs text-muted font-bold mt-1">Task completion</p>
                </div>
                <div className="bg-card border border-border p-6 rounded-[2.5rem] shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 text-rose-500/5 group-hover:text-rose-500/10 transition-colors"><AlertCircle size={80} /></div>
                    <p className="text-[10px] font-black uppercase text-muted tracking-[0.2em]">Delayed Items</p>
                    <h2 className="text-4xl font-black mt-2 text-rose-500">{delayedCount}</h2>
                    <p className="text-xs text-rose-500 font-bold mt-1 uppercase tracking-wider">Requires attention</p>
                </div>
            </div>

            {/* Filters & Content */}
            <div className="bg-card border border-border rounded-[3rem] shadow-sm overflow-hidden min-h-[400px]">
                <div className="p-8 border-b border-border bg-muted/5 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
                        <input
                            type="text"
                            placeholder="Search descriptions, projects..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-background border border-border rounded-2xl focus:ring-2 focus:ring-primary/20 transition-all font-medium text-sm"
                        />
                    </div>

                    <div className="flex flex-wrap items-center gap-4">
                        {!isEmployeeView && (
                            <div className="flex items-center gap-2 bg-background border border-border rounded-2xl px-4 py-2">
                                <Users size={16} className="text-muted" />
                                <select 
                                    value={selectedEmployeeId || ''} 
                                    onChange={(e) => setSelectedEmployeeId(e.target.value ? parseInt(e.target.value) : null)}
                                    className="bg-transparent border-none focus:ring-0 text-xs font-bold text-foreground outline-none cursor-pointer max-w-[150px]"
                                >
                                    <option value="">All Employees</option>
                                    {users.map(u => (
                                        <option key={u.id} value={u.id}>{u.username}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <div className="flex items-center gap-2 bg-background border border-border rounded-2xl px-4 py-2">
                            <Calendar size={16} className="text-muted" />
                            <input 
                                type="date" 
                                value={startDate} 
                                onChange={(e) => setStartDate(e.target.value)}
                                className="bg-transparent border-none focus:ring-0 text-xs font-bold text-foreground outline-none"
                            />
                            <span className="text-muted text-xs font-black uppercase">to</span>
                            <input 
                                type="date" 
                                value={endDate} 
                                onChange={(e) => setEndDate(e.target.value)}
                                className="bg-transparent border-none focus:ring-0 text-xs font-bold text-foreground outline-none"
                            />
                        </div>

                        <button 
                            onClick={handleExportPDF}
                            className="flex items-center gap-2 px-6 py-2.5 bg-indigo-500/10 text-indigo-500 font-black rounded-2xl border border-indigo-500/20 hover:bg-indigo-500 hover:text-white transition-all shadow-lg shadow-indigo-500/10"
                        >
                            <TrendingUp size={16} className="rotate-90" />
                            <span>Export PDF</span>
                        </button>

                        <button 
                            onClick={handleExportWord}
                            className="flex items-center gap-2 px-6 py-2.5 bg-blue-500/10 text-blue-500 font-black rounded-2xl border border-blue-500/20 hover:bg-blue-500 hover:text-white transition-all shadow-lg shadow-blue-500/10"
                        >
                            <FilePlus size={16} />
                            <span>Export Word</span>
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-muted/5 border-b border-border">
                                <th className="px-4 py-5 text-[10px] font-black uppercase text-muted tracking-widest whitespace-nowrap">Date</th>
                                <th className="px-4 py-5 text-[10px] font-black uppercase text-muted tracking-widest whitespace-nowrap">Employee</th>
                                <th className="px-4 py-5 text-[10px] font-black uppercase text-muted tracking-widest whitespace-nowrap">Project</th>
                                <th className="px-4 py-5 text-[10px] font-black uppercase text-muted tracking-widest whitespace-nowrap">Team</th>
                                <th className="px-4 py-5 text-[10px] font-black uppercase text-muted tracking-widest whitespace-nowrap">Service</th>
                                <th className="px-4 py-5 text-[10px] font-black uppercase text-muted tracking-widest">Description</th>
                                <th className="px-4 py-5 text-[10px] font-black uppercase text-muted tracking-widest">Stats</th>
                                <th className="px-4 py-5 text-[10px] font-black uppercase text-muted tracking-widest text-center">Status</th>
                                <th className="px-4 py-5 text-[10px] font-black uppercase text-muted tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                            {activities.map((activity) => (
                                <tr key={activity.id} className="hover:bg-muted/5 transition-colors group">
                                    <td className="px-4 py-6">
                                        <div className="flex items-center gap-2">
                                            <div className="p-2 bg-primary/10 text-primary rounded-lg shadow-sm"><Calendar size={14} /></div>
                                            <p className="text-xs font-black text-foreground whitespace-nowrap">{activity.date}</p>
                                        </div>
                                    </td>
                                    <td className="px-4 py-6">
                                        <p className="text-xs font-bold text-muted uppercase tracking-tight whitespace-nowrap">
                                            {activity.employee_name || getUserName(activity.employee)}
                                        </p>
                                    </td>
                                    <td className="px-4 py-6">
                                        <p className="text-xs font-black text-foreground uppercase tracking-tight whitespace-nowrap">
                                            {activity.project_name || getProjectName(activity.project)}
                                        </p>
                                    </td>
                                    <td className="px-4 py-6 italic text-muted text-[10px]">
                                        <p className="uppercase tracking-widest whitespace-nowrap">
                                            {activity.team_name || getTeamName(activity.team)}
                                        </p>
                                    </td>
                                    <td className="px-4 py-6">
                                        {activity.project_service_name ? (
                                            <p className="text-[10px] text-primary font-black uppercase tracking-widest flex items-center gap-1 whitespace-nowrap">
                                                <TrendingUp size={10} /> {activity.project_service_name}
                                            </p>
                                        ) : (
                                            <span className="text-muted">—</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-6">
                                        <p className="text-[11px] text-foreground/70 line-clamp-2 max-w-[150px] font-medium leading-relaxed">{activity.description}</p>
                                    </td>
                                    <td className="px-4 py-6">
                                        <div className="flex flex-col gap-1 min-w-[100px]">
                                            <div className="flex items-center justify-between gap-4">
                                                <div className="flex flex-col">
                                                    <p className="text-xs font-black text-foreground leading-none">{activity.hours_spent}h</p>
                                                </div>
                                                <div className="flex flex-col text-right">
                                                    <p className="text-xs font-black text-indigo-500 leading-none">{activity.target_work_percentage}%</p>
                                                </div>
                                            </div>
                                            <div className="mt-1">
                                                <div className="h-1 bg-muted rounded-full overflow-hidden w-full">
                                                    <div className={`h-full rounded-full ${activity.pending_work_percentage > 50 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${100 - activity.pending_work_percentage}%` }}></div>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-6 text-center">
                                        {activity.is_timeline_exceeded ? (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-rose-500/10 text-rose-500 text-[9px] font-black rounded-md border border-rose-500/20 uppercase" title={activity.delay_reason}>
                                                Lag
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-500/10 text-emerald-500 text-[9px] font-black rounded-md border border-emerald-500/20 uppercase">
                                                OK
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-4 py-6 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                                            {hasPermission('change_employeedailyactivity') && (
                                                <button onClick={() => navigate(`/activities/edit/${activity.id}`)} className="p-2 hover:bg-primary/10 text-primary rounded-xl transition-colors border border-transparent hover:border-primary/20"><Edit2 size={16} /></button>
                                            )}
                                            {hasPermission('delete_employeedailyactivity') && (
                                                <button onClick={() => handleDelete(activity.id)} className="p-2 hover:bg-rose-500/10 text-rose-500 rounded-xl transition-colors border border-transparent hover:border-rose-500/20"><Trash2 size={16} /></button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {activities.length === 0 && (
                    <div className="py-20 text-center">
                        <div className="inline-flex p-6 bg-muted/20 rounded-[2rem] text-muted mb-4"><Calendar size={48} /></div>
                        <h3 className="text-lg font-bold text-foreground">No activities found</h3>
                        <p className="text-muted text-sm max-w-xs mx-auto">Try adjusting your search term or add a new activity report.</p>
                        {!isEmployeeView && hasPermission('add_employeedailyactivity') && (
                            <button 
                                onClick={() => navigate('/activities/new')} 
                                className="mt-6 px-6 py-2.5 bg-primary text-white font-black rounded-2xl shadow-lg shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all"
                            >
                                New Activity
                            </button>
                        )}
                    </div>
                )}

                {/* Pagination */}
                {totalCount > ITEMS_PER_PAGE && (
                    <div className="px-8 py-6 bg-muted/5 border-t border-border flex items-center justify-between">
                        <p className="text-xs text-muted font-bold uppercase tracking-widest">Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, totalCount)} of {totalCount} reports</p>
                        <div className="flex items-center gap-2">
                            <button
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage(p => p - 1)}
                                className="p-2 hover:bg-primary/10 text-primary rounded-xl disabled:opacity-30 transition-all border border-border hover:border-primary/20"
                            >
                                <ChevronLeft size={20} />
                            </button>
                            <span className="px-4 py-2 bg-primary/5 text-primary text-sm font-black rounded-xl border border-primary/20">{currentPage} / {totalPages}</span>
                            <button
                                disabled={currentPage === totalPages}
                                onClick={() => setCurrentPage(p => p + 1)}
                                className="p-2 hover:bg-primary/10 text-primary rounded-xl disabled:opacity-30 transition-all border border-border hover:border-primary/20"
                            >
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ActivityList;

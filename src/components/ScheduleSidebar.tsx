import React, { useState, useEffect } from 'react';
import { api } from '../api/api';
import { format, isToday, parseISO } from 'date-fns';
import { Calendar, Clock, ChevronRight, Plus, X, Save, Loader2, CheckCircle, Circle, Shield, User, Search } from 'lucide-react';

import SearchableUserSelect from './SearchableUserSelect';
import SearchableRoleSelect from './SearchableRoleSelect';

interface Schedule {
    id: number;
    title: string;
    description: string;
    schedule_date: string;
    schedule_time: string;
    assigned_to: number | null;
    assigned_to_name: string;
    assigned_role: number | null;
    assigned_role_name: string;
    is_completed: boolean;
}

// FollowUp interface removed

const ScheduleSidebar: React.FC = () => {
    const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isAdding, setIsAdding] = useState(false);
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [assignmentType, setAssignmentType] = useState<'user' | 'role'>('user');
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const [search, setSearch] = useState('');
    const [filterDate, setFilterDate] = useState('');
    const [filterUser, setFilterUser] = useState<number | null>(null);
    const [filterRole, setFilterRole] = useState<number | null>(null);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        schedule_date: format(new Date(), 'yyyy-MM-dd'),
        schedule_time: format(new Date(), 'HH:mm'),
        assigned_to: null as number | null,
        assigned_role: null as number | null
    });

    const fetchSchedules = async (pageNum = 1, append = false) => {
        try {
            if (append) setLoadingMore(true);
            else setLoading(true);
            
            const params: any = { page: pageNum };
            if (search) params.search = search;
            if (filterDate) params.date = filterDate;
            if (filterUser) params.assigned_to = filterUser;
            if (filterRole) params.assigned_role = filterRole;
            
            const response = await api.get('/schedules/', { params });
            const data = response.data.results || response.data;
            
            if (append) {
                setSchedules(prev => [...prev, ...data]);
            } else {
                setSchedules(data);
            }
            
            setHasMore(!!response.data.next);
            setPage(pageNum);
        } catch (error) {
            console.error('Failed to fetch agenda', error);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchSchedules(1, false);
        }, 500);
        return () => clearTimeout(timer);
    }, [search, filterDate, filterUser, filterRole]);

    useEffect(() => {
        if (isOpen) {
            fetchSchedules();
        }
    }, [isOpen]);

    const todayCount = schedules.filter(s => isToday(parseISO(s.schedule_date)) && !s.is_completed).length;

    const [editingId, setEditingId] = useState<number | null>(null);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setSubmitting(true);
            const data = {
                ...formData,
                assigned_to: assignmentType === 'user' ? formData.assigned_to : null,
                assigned_role: assignmentType === 'role' ? formData.assigned_role : null,
            };
            
            if (editingId) {
                await api.put(`/schedules/${editingId}/`, data);
            } else {
                await api.post('/schedules/', data);
            }
            setIsAdding(false);
            setEditingId(null);
            setFormData({
                title: '',
                description: '',
                schedule_date: format(new Date(), 'yyyy-MM-dd'),
                schedule_time: format(new Date(), 'HH:mm'),
                assigned_to: null,
                assigned_role: null
            });
            fetchSchedules();
        } catch (error) {
            console.error('Failed to save schedule', error);
            alert('Failed to save schedule');
        } finally {
            setSubmitting(false);
        }
    };

    const handleEdit = (schedule: Schedule) => {
        setFormData({
            title: schedule.title,
            description: schedule.description || '',
            schedule_date: schedule.schedule_date,
            schedule_time: schedule.schedule_time.substring(0, 5),
            assigned_to: schedule.assigned_to,
            assigned_role: schedule.assigned_role
        });
        setAssignmentType(schedule.assigned_role ? 'role' : 'user');
        setEditingId(schedule.id);
        setIsAdding(true);
    };

    const cancelAdding = () => {
        setIsAdding(false);
        setEditingId(null);
        setFormData({
            title: '',
            description: '',
            schedule_date: format(new Date(), 'yyyy-MM-dd'),
            schedule_time: format(new Date(), 'HH:mm'),
            assigned_to: null,
            assigned_role: null
        });
    };

    const sortedSchedules = [...schedules].sort((a, b) => {
        const dateTimeA = new Date(`${a.schedule_date}T${a.schedule_time}`);
        const dateTimeB = new Date(`${b.schedule_date}T${b.schedule_time}`);
        const isAToday = isToday(dateTimeA);
        const isBToday = isToday(dateTimeB);
        if (isAToday && !isBToday) return -1;
        if (!isAToday && isBToday) return 1;
        return dateTimeA.getTime() - dateTimeB.getTime();
    });

    const handleToggleComplete = async (schedule: Schedule) => {
        if (!schedule.is_completed) {
            if (!window.confirm('Are you sure you have completed this task?')) return;
        }
        
        try {
            await api.patch(`/schedules/${schedule.id}/`, {
                is_completed: !schedule.is_completed
            });
            fetchSchedules();
        } catch (error) {
            console.error('Failed to update status', error);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Are you sure you want to delete this schedule?')) return;
        try {
            await api.delete(`/schedules/${id}/`);
            fetchSchedules();
        } catch (error) {
            console.error('Failed to delete schedule', error);
            alert('Failed to delete schedule');
        }
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`fixed right-0 top-1/2 -translate-y-1/2 bg-primary text-white p-2 rounded-l-2xl shadow-2xl z-50 transition-all hover:pr-4 group ${isOpen ? 'translate-x-full' : ''}`}
            >
                <div className="flex flex-col items-center gap-2 py-2 relative">
                    {todayCount > 0 && !isOpen && (
                        <div className="absolute -top-2 -left-2 w-5 h-5 bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center animate-bounce shadow-lg ring-2 ring-white">
                            {todayCount}
                        </div>
                    )}
                    <Calendar className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    <span className="writing-vertical-rl text-[10px] font-black tracking-[0.2em] uppercase" style={{ writingMode: 'vertical-rl' }}>Schedule</span>
                </div>
            </button>

            {isOpen && (
                <div 
                    className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[90] animate-in fade-in duration-300"
                    onClick={() => setIsOpen(false)}
                />
            )}

            <div 
                className={`fixed top-0 right-0 h-full w-96 bg-card border-l border-border shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] z-[100] transform transition-all duration-500 ease-out ${isOpen ? 'translate-x-0' : 'translate-x-full'} flex flex-col overflow-visible`}
            >

                <div className="p-6 border-b border-border flex justify-between items-center bg-muted/5">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-xl text-primary">
                            <Calendar className="w-5 h-5" />
                        </div>
                        <h2 className="text-lg font-black text-foreground uppercase tracking-tight">Schedule</h2>
                    </div>
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={() => isAdding ? cancelAdding() : setIsAdding(true)}
                            className={`p-2 rounded-xl transition-all ${isAdding ? 'bg-rose-500/10 text-rose-500' : 'bg-primary/10 text-primary hover:bg-primary hover:text-white'}`}
                        >
                            {isAdding ? <X size={20} /> : <Plus size={20} />}
                        </button>
                        <button 
                            onClick={() => setIsOpen(false)}
                            className="p-2 text-muted hover:text-foreground transition-colors"
                        >
                            <ChevronRight className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                <div className="px-6 py-4 border-b border-border bg-muted/5 space-y-3 relative z-[110]">
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-primary transition-colors" size={16} />
                        <input 
                            type="text"
                            placeholder="Search tasks..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-xl text-xs font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                        />
                        {search && (
                            <button 
                                onClick={() => setSearch('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-rose-500 transition-colors"
                            >
                                <X size={14} />
                            </button>
                        )}
                    </div>
                    
                    <div className="relative group">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-primary transition-colors" size={14} />
                        <input 
                            type="date"
                            value={filterDate}
                            onChange={(e) => setFilterDate(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-xl text-[10px] font-black uppercase tracking-widest focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                        />
                        {filterDate && (
                            <button 
                                onClick={() => setFilterDate('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-rose-500 transition-colors"
                            >
                                <X size={14} />
                            </button>
                        )}
                    </div>

                    <SearchableRoleSelect 
                        value={filterRole}
                        onChange={setFilterRole}
                        placeholder="Filter by Role..."
                    />

                    <SearchableUserSelect 
                        value={filterUser}
                        onChange={setFilterUser}
                        placeholder="Filter by Employee..."
                    />
                </div>




                <div className="flex-1 overflow-y-auto p-6 space-y-6">

                    {isAdding ? (
                        <form onSubmit={handleCreate} className="space-y-6 animate-in slide-in-from-top-4 duration-300">
                            <div className="space-y-4 bg-muted/5 p-6 rounded-[2rem] border border-border">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-muted uppercase tracking-widest ml-2">Task Title</label>
                                    <input 
                                        required
                                        value={formData.title}
                                        onChange={e => setFormData(p => ({ ...p, title: e.target.value }))}
                                        className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/20 outline-none font-bold text-sm"
                                        placeholder="What needs to be done?"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-muted uppercase tracking-widest ml-2 text-center block">Assign To</label>
                                    <div className="flex p-1 bg-background border border-border rounded-2xl">
                                        <button 
                                            type="button"
                                            onClick={() => setAssignmentType('user')}
                                            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${assignmentType === 'user' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-muted hover:text-foreground'}`}
                                        >
                                            <User size={14} /> Employee
                                        </button>
                                        <button 
                                            type="button"
                                            onClick={() => setAssignmentType('role')}
                                            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${assignmentType === 'role' ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'text-muted hover:text-foreground'}`}
                                        >
                                            <Shield size={14} /> Role
                                        </button>
                                    </div>
                                    
                                    {assignmentType === 'user' ? (
                                        <div className="animate-in fade-in duration-300">
                                            <SearchableUserSelect 
                                                value={formData.assigned_to}
                                                onChange={val => setFormData(p => ({ ...p, assigned_to: val }))}
                                            />
                                        </div>
                                    ) : (
                                        <div className="animate-in fade-in duration-300">
                                            <SearchableRoleSelect 
                                                value={formData.assigned_role}
                                                onChange={val => setFormData(p => ({ ...p, assigned_role: val }))}
                                            />
                                        </div>
                                    )}
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-muted uppercase tracking-widest ml-2">Date</label>
                                        <input 
                                            type="date"
                                            required
                                            value={formData.schedule_date}
                                            onChange={e => setFormData(p => ({ ...p, schedule_date: e.target.value }))}
                                            className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/20 outline-none font-bold text-sm"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-muted uppercase tracking-widest ml-2">Time</label>
                                        <input 
                                            type="time"
                                            required
                                            value={formData.schedule_time}
                                            onChange={e => setFormData(p => ({ ...p, schedule_time: e.target.value }))}
                                            className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/20 outline-none font-bold text-sm"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-muted uppercase tracking-widest ml-2">Notes</label>
                                    <textarea 
                                        value={formData.description}
                                        onChange={e => setFormData(p => ({ ...p, description: e.target.value }))}
                                        className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/20 outline-none font-medium text-sm resize-none"
                                        rows={3}
                                        placeholder="Add details..."
                                    />
                                </div>
                                <button 
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full py-4 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/30 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                                >
                                    {submitting ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                                    {editingId ? 'Update Schedule' : 'Commit Schedule'}
                                </button>
                            </div>
                        </form>
                    ) : (
                        <>
                            {loading ? (
                                <div className="flex flex-col items-center justify-center py-20 gap-4">
                                    <Loader2 className="animate-spin text-primary" size={40} />
                                    <p className="text-[10px] font-black text-muted uppercase tracking-[0.2em] animate-pulse">Syncing Agenda...</p>
                                </div>
                            ) : schedules.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                                    <div className="p-6 bg-muted/10 rounded-full">
                                        <Calendar className="w-12 h-12 text-muted/30" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="font-black text-foreground uppercase tracking-tight">Agenda Clear</p>
                                        <p className="text-xs text-muted font-medium">No upcoming schedules found.</p>
                                    </div>
                                    <button 
                                        onClick={() => setIsAdding(true)}
                                        className="px-6 py-2 bg-primary/10 text-primary text-xs font-black rounded-xl hover:bg-primary hover:text-white transition-all uppercase tracking-widest"
                                    >
                                        Create One
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-8">
                                    {/* General Schedules Section */}
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2 px-2">
                                            <h3 className="text-[10px] font-black text-muted uppercase tracking-[0.2em]">General Schedules</h3>
                                        </div>
                                        <div className="space-y-4">
                                            {sortedSchedules.map((schedule) => {
                                        const isCurrentToday = isToday(parseISO(schedule.schedule_date));
                                        
                                        return (
                                            <div 
                                                key={schedule.id}
                                                className={`group p-6 rounded-[2rem] border transition-all hover:shadow-xl hover:-translate-y-1 ${isCurrentToday ? 'bg-primary/[0.03] border-primary/20 shadow-lg shadow-primary/5' : 'bg-card border-border hover:border-primary/20'} ${schedule.is_completed ? 'opacity-60 grayscale-[0.5]' : ''}`}
                                            >
                                                <div className="flex justify-between items-start mb-4">
                                                    <div className="flex gap-3">
                                                        <button 
                                                            onClick={() => handleToggleComplete(schedule)}
                                                            className={`mt-1 transition-colors ${schedule.is_completed ? 'text-emerald-500' : 'text-muted group-hover:text-primary'}`}
                                                        >
                                                            {schedule.is_completed ? <CheckCircle size={20} /> : <Circle size={20} />}
                                                        </button>
                                                        <div className="space-y-1">
                                                            <h3 className={`font-black text-foreground group-hover:text-primary transition-colors uppercase tracking-tight leading-tight ${schedule.is_completed ? 'line-through' : ''}`}>
                                                                {schedule.title}
                                                            </h3>
                                                            <p className="text-[10px] font-bold text-muted uppercase tracking-widest flex items-center gap-2">
                                                                {schedule.assigned_role ? (
                                                                    <>
                                                                        <Shield size={10} className="text-indigo-500" />
                                                                        Role: {schedule.assigned_role_name}
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <User size={10} className="text-primary" />
                                                                        By {schedule.assigned_to_name || 'System'}
                                                                    </>
                                                                )}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        {isCurrentToday && !schedule.is_completed && (
                                                            <div className="flex items-center gap-1.5 px-3 py-1 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-primary/20">
                                                                <div className="w-1 h-1 rounded-full bg-white animate-pulse" />
                                                                Today
                                                            </div>
                                                        )}
                                                        <button 
                                                            onClick={() => handleEdit(schedule)}
                                                            className="p-2 text-muted hover:text-primary hover:bg-primary/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                                            title="Edit Task"
                                                        >
                                                            <Calendar size={16} />
                                                        </button>
                                                        <button 
                                                            onClick={() => handleDelete(schedule.id)}
                                                            className="p-2 text-muted hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                                            title="Delete Task"
                                                        >
                                                            <X size={16} />
                                                        </button>
                                                    </div>
                                                </div>
                                                
                                                {schedule.description && (
                                                    <p className={`text-xs text-muted font-medium mb-4 line-clamp-3 leading-relaxed ${schedule.is_completed ? 'line-through' : ''}`}>
                                                        {schedule.description}
                                                    </p>
                                                )}
                                                
                                                <div className="flex items-center gap-4 pt-4 border-t border-border/50">
                                                    <div className="flex items-center gap-2 text-[10px] font-black text-foreground uppercase tracking-tight">
                                                        <Calendar className="w-3.5 h-3.5 text-primary" />
                                                        {format(parseISO(schedule.schedule_date), 'MMM d, yyyy')}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-[10px] font-black text-foreground uppercase tracking-tight">
                                                        <Clock className="w-3.5 h-3.5 text-primary" />
                                                        {schedule.schedule_time.substring(0, 5)}
                                                    </div>
                                                </div>
                                            </div>
                                                );
                                            })}
                                        </div>

                                        {hasMore && (
                                            <div className="pt-4 pb-8 flex justify-center">
                                                <button 
                                                    onClick={() => fetchSchedules(page + 1, true)}
                                                    disabled={loadingMore}
                                                    className="px-6 py-2 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.2em] rounded-xl hover:bg-primary hover:text-white transition-all disabled:opacity-50 flex items-center gap-2"
                                                >
                                                    {loadingMore ? (
                                                        <>
                                                            <Loader2 size={14} className="animate-spin" />
                                                            Syncing...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <ChevronRight size={14} className="rotate-90" />
                                                            Load More
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </>
    );
};

export default ScheduleSidebar;

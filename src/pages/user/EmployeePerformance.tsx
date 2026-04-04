import React, { useState, useEffect } from 'react';
import { 
    FolderKanban, 
    Layers, 
    CheckCircle2, 
    AlertCircle, 
    ListTodo, 
    Loader2,
    Clock,
    TrendingUp
} from 'lucide-react';
import { motion, type Variants } from 'framer-motion';
import { Doughnut } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale
} from 'chart.js';
import { 
    getUserWorkDetails, 
    getEmployeePerformance, 
    type UserWorkDetails, 
    type EmployeePerformance as EmployeePerformanceData 
} from './userService';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale);

const EmployeePerformance: React.FC = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const [performance, setPerformance] = useState<EmployeePerformanceData | null>(null);
    const [workDetails, setWorkDetails] = useState<UserWorkDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeFilter, setActiveFilter] = useState<{ status?: string[]; type?: string } | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            if (!user.id) {
                setLoading(false);
                setError("User session not found. Please log in again.");
                return;
            }
            
            try {
                const [perfData, detailsData] = await Promise.all([
                    getEmployeePerformance(),
                    getUserWorkDetails(user.id)
                ]);
                setPerformance(perfData);
                setWorkDetails(detailsData);
            } catch (err) {
                console.error('Failed to fetch performance data:', err);
                setError("Failed to load performance metrics. Our team is looking into it.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user.id]);

    const allAssignmentsRaw = performance ? [
        ...performance.total_committed_project_team.map(p => ({ ...p, type: 'Project', name: p.project_name, role: 'Member' })),
        ...performance.total_committed_service_team.map(s => ({ ...s, type: 'Service', name: s.service_name, role: 'Member' }))
    ] : [];

    const allAssignments = allAssignmentsRaw.filter(a => {
        if (!activeFilter) return true;
        if (activeFilter.status && !activeFilter.status.includes(a.status)) return false;
        if (activeFilter.type && a.type !== activeFilter.type) return false;
        return true;
    });

    const toggleFilter = (type: string, value: any) => {
        setActiveFilter(prev => {
            if (!prev) return { [type]: value };
            if (JSON.stringify(prev[type as keyof typeof prev]) === JSON.stringify(value)) {
                const next = { ...prev };
                delete next[type as keyof typeof next];
                return Object.keys(next).length > 0 ? next : null;
            }
            return { ...prev, [type]: value };
        });
    };

    const chartData = performance ? {
        labels: ['On Track', 'Completed', 'Pending'],
        datasets: [{
            data: [
                performance.progressing_total,
                performance.completed_total,
                performance.pending_total,
            ],
            backgroundColor: [
                'rgba(16, 185, 129, 0.8)',  // Emerald
                'rgba(59, 130, 246, 0.8)',   // Blue
                'rgba(99, 102, 241, 0.8)',  // Indigo
            ],
            borderColor: [
                'rgba(16, 185, 129, 1)',
                'rgba(59, 130, 246, 1)',
                'rgba(99, 102, 241, 1)',
            ],
            borderWidth: 2,
            hoverOffset: 15,
        }]
    } : null;

    const chartOptions = {
        cutout: '75%',
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: 'rgba(15, 23, 42, 0.9)',
                padding: 12,
                cornerRadius: 12,
            }
        },
        maintainAspectRatio: false
    };

    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <Loader2 className="animate-spin text-primary" size={48} />
                <p className="text-muted font-black uppercase tracking-widest text-sm animate-pulse">Calculating Performance...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 text-center px-4">
                <div className="w-20 h-20 rounded-3xl bg-rose-500/10 flex items-center justify-center text-rose-500 shadow-inner">
                    <AlertCircle size={40} />
                </div>
                <div className="space-y-2">
                    <h2 className="text-2xl font-black italic text-foreground tracking-tight">System Hiccup</h2>
                    <p className="text-muted font-medium max-w-md mx-auto italic">{error}</p>
                </div>
                <button 
                    onClick={() => window.location.reload()}
                    className="px-8 py-3 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.05] active:scale-[0.95] transition-all flex items-center gap-2"
                >
                    <Clock size={18} />
                    RETRY SYNC
                </button>
            </div>
        );
    }

    if (!performance) return null;

    return (
        <div className="max-w-7xl mx-auto py-8 px-4 lg:px-8 space-y-8">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-foreground tracking-tight italic flex items-center gap-3">
                        <TrendingUp size={36} className="text-primary" />
                        Assignment Dashboard
                    </h1>
                    <p className="text-muted font-medium mt-1 text-lg italic">Welcome back, <span className="text-foreground font-black">{performance.employee_name}</span>. Here's your current workload.</p>
                </div>
            </div>

            {/* Top Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Pending Tasks', value: performance.pending_total, sub: 'To Start', icon: ListTodo, color: 'text-indigo-500', bg: 'bg-indigo-500/10', filter: { status: ['Pending'] } },
                    { label: 'In Progress', value: performance.progressing_total, sub: 'Active', icon: Clock, color: 'text-amber-500', bg: 'bg-amber-500/10', filter: { status: ['Progressing', 'Active'] } },
                    { label: 'Completed', value: performance.completed_total, sub: 'Finished', icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/10', filter: { status: ['Completed'] } },
                    { label: 'Total Items', value: performance.total_committed_project_count + performance.total_committed_service_count, sub: 'Commited', icon: FolderKanban, color: 'text-blue-500', bg: 'bg-blue-500/10', filter: null },
                ].map((stat, i) => {
                    const isActive = stat.filter 
                        ? (activeFilter?.status?.join(',') === stat.filter.status.join(','))
                        : (!activeFilter?.status && !activeFilter?.type);
                    
                    return (
                        <motion.div 
                            key={i}
                            variants={itemVariants}
                            initial="hidden"
                            animate="visible"
                            onClick={() => stat.filter ? toggleFilter('status', stat.filter.status) : setActiveFilter(null)}
                            className={`bg-card border ${isActive ? 'border-primary ring-2 ring-primary/20 scale-[1.02]' : 'border-border'} rounded-3xl p-6 shadow-xl hover:scale-[1.02] transition-all group cursor-pointer relative overflow-hidden`}
                        >
                            {isActive && <div className="absolute top-0 right-0 w-12 h-12 bg-primary/5 rounded-bl-[2rem] flex items-center justify-center text-primary"><CheckCircle2 size={16} /></div>}
                            <div className={`w-12 h-12 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center mb-4 group-hover:rotate-12 transition-transform`}>
                                <stat.icon size={24} />
                            </div>
                            <h3 className="text-muted text-[10px] font-black uppercase tracking-widest mb-1">{stat.label}</h3>
                            <div className="flex items-baseline gap-1">
                                <span className="text-3xl font-black text-foreground italic">{stat.value}</span>
                                <span className="text-xs font-bold text-muted uppercase italic">{stat.sub}</span>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Work Distribution Chart */}
                <div className="lg:col-span-1 bg-card border border-border rounded-3xl p-8 shadow-xl">
                    <h3 className="text-xl font-black italic mb-6">Workload Balance</h3>
                    <div className="h-64 relative">
                        {chartData && <Doughnut data={chartData} options={chartOptions} />}
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-3xl font-black text-foreground italic">{allAssignments.length}</span>
                            <span className="text-[10px] font-black text-muted uppercase tracking-widest">Total Items</span>
                        </div>
                    </div>
                    <div className="mt-8 space-y-3">
                        <button 
                            onClick={() => toggleFilter('type', 'Project')}
                            className={`w-full flex items-center justify-between p-4 ${activeFilter?.type === 'Project' ? 'bg-indigo-500/20 border-indigo-500 shadow-lg scale-[1.02]' : 'bg-indigo-500/5 border-indigo-500/10 hover:bg-indigo-500/10'} rounded-2xl border transition-all group`}
                        >
                            <div className="flex items-center gap-3">
                                <FolderKanban size={18} className="text-indigo-500 group-hover:rotate-12 transition-transform" />
                                <span className="text-[10px] font-black text-muted uppercase tracking-widest">Projects</span>
                            </div>
                            <span className="text-lg font-black text-indigo-500 italic">{performance.total_committed_project_count}</span>
                        </button>
                        <button 
                            onClick={() => toggleFilter('type', 'Service')}
                            className={`w-full flex items-center justify-between p-4 ${activeFilter?.type === 'Service' ? 'bg-blue-500/20 border-blue-500 shadow-lg scale-[1.02]' : 'bg-blue-500/5 border-blue-500/10 hover:bg-blue-500/10'} rounded-2xl border transition-all group`}
                        >
                            <div className="flex items-center gap-3">
                                <Layers size={18} className="text-blue-500 group-hover:rotate-12 transition-transform" />
                                <span className="text-[10px] font-black text-muted uppercase tracking-widest">Services</span>
                            </div>
                            <span className="text-lg font-black text-blue-500 italic">{performance.total_committed_service_count}</span>
                        </button>
                    </div>
                </div>

                {/* Active Workload List */}
                <div className="lg:col-span-2 bg-card border border-border rounded-3xl shadow-xl overflow-hidden">
                    <div className="p-8 border-b border-border bg-muted/5 flex items-center justify-between">
                        <h3 className="text-xl font-black italic flex items-center gap-3">
                            <ListTodo className="text-primary" size={24} />
                            Committed Assignments
                        </h3>
                        <div className="px-4 py-1.5 bg-primary/10 text-primary text-[10px] font-black rounded-xl uppercase tracking-widest">
                            {allAssignments.length} ITEMS
                        </div>
                    </div>
                    <div className="p-6">
                        <div className="grid grid-cols-1 gap-4 overflow-y-auto max-h-[480px] custom-scrollbar">
                            {allAssignments.map((item: any, idx: number) => {
                                return (
                                    <div key={idx} className="p-5 bg-background border border-border rounded-3xl hover:border-primary/30 transition-all group relative overflow-hidden">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                                                    item.type === 'Project' ? 'bg-indigo-500/10 text-indigo-500' : 'bg-amber-500/10 text-amber-500'
                                                }`}>
                                                    {item.type === 'Project' ? <FolderKanban size={22} /> : <Layers size={22} />}
                                                </div>
                                                <div>
                                                    <h4 className="font-black text-foreground italic group-hover:text-primary transition-colors pr-4">{item.name}</h4>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${
                                                            item.type === 'Project' ? 'bg-indigo-500/10 text-indigo-500' : 'bg-amber-500/10 text-amber-500'
                                                        }`}>{item.type || 'Task'}</span>
                                                        <span className="text-[9px] font-bold text-muted/40">•</span>
                                                        <span className="text-[9px] font-black text-primary uppercase tracking-wider">Allocation: {item.allocated_days} days</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end gap-2">
                                                <div className="flex items-center gap-2">
                                                    {item.is_over_allocated && (
                                                        <div className="flex items-center gap-1.5 px-2 py-1 bg-rose-500/10 text-rose-500 rounded-lg text-[9px] font-black uppercase border border-rose-500/20 animate-pulse">
                                                            <AlertCircle size={12} />
                                                            OVER-ALLOCATED
                                                        </div>
                                                    )}
                                                    <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-tight bg-emerald-500/10 text-emerald-600 border border-emerald-500/20" title="Target Score">
                                                        <TrendingUp size={12} />
                                                        {item.target_score} PTS
                                                    </div>
                                                    <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-tight bg-muted/10 text-muted border border-current/10" title="Timeline">
                                                        <Clock size={12} />
                                                        {item.start_date} &rarr; {item.end_date}
                                                    </div>
                                                    <div className={`px-2.5 py-1 text-[10px] font-black rounded-lg uppercase tracking-wider border ${
                                                        item.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                                                        (item.status === 'Progressing' || item.status === 'Active') ? 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20' :
                                                        'bg-muted/10 text-muted border-border'
                                                    }`}>
                                                        {item.status || 'PENDING'}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            {allAssignments.length === 0 && (
                                <div className="text-center py-10">
                                    <ListTodo className="mx-auto text-muted/30 mb-2" size={32} />
                                    <p className="text-muted font-black text-xs uppercase italic">No active assignments</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Activity Log */}
            {workDetails?.recent_activities && workDetails.recent_activities.length > 0 && (
                <div className="bg-card border border-border rounded-3xl shadow-xl overflow-hidden">
                    <div className="p-8 border-b border-border bg-muted/5">
                        <h3 className="text-xl font-black italic flex items-center gap-3">
                            <Clock className="text-indigo-500" size={24} />
                            Recent Impact Log
                        </h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-muted/5 text-muted uppercase text-[10px] font-black tracking-widest border-b border-border">
                                <tr>
                                    <th className="px-8 py-5">Date</th>
                                    <th className="px-8 py-5">Assignment</th>
                                    <th className="px-8 py-5">Description</th>
                                    <th className="px-8 py-5 text-center">Hours</th>
                                    <th className="px-8 py-5 text-center">Impact</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {workDetails.recent_activities.map((act) => (
                                    <tr key={act.id} className="hover:bg-muted/5 transition-colors group">
                                        <td className="px-8 py-6 font-black text-foreground italic">{act.date || 'N/A'}</td>
                                        <td className="px-8 py-6">
                                            <div className="font-black text-foreground italic group-hover:text-primary transition-colors">
                                                {act.project_service_name ? `${act.project_name} → ${act.project_service_name}` : (act.project_name || 'N/A')}
                                            </div>
                                            <div className="text-[10px] font-black text-muted uppercase tracking-wider mt-1">
                                                {act.project_service_name ? 'Service' : 'Project'}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 truncate max-w-sm text-muted font-medium" title={act.description}>
                                            {act.description}
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <div className="inline-flex items-center justify-center px-4 py-1.5 bg-emerald-500/10 text-emerald-600 rounded-xl text-[10px] font-black italic">
                                                {act.hours_spent} HRS
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-3 justify-center">
                                                <div className="flex flex-col items-center">
                                                    <span className="text-[9px] font-black text-indigo-500 uppercase">Target</span>
                                                    <span className="font-black italic">{act.target_work_percentage}%</span>
                                                </div>
                                                <div className="w-px h-8 bg-border" />
                                                <div className="flex flex-col items-center">
                                                    <span className="text-[9px] font-black text-rose-500 uppercase">Pending</span>
                                                    <span className="font-black italic">{act.pending_work_percentage}%</span>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EmployeePerformance;

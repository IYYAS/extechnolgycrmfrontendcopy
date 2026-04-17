import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

import {
    ArrowRight, Banknote, Briefcase, CheckCircle2,
    Circle, Clock, Globe, Layout, LayoutDashboard, LayoutGrid, Server,
    Users, X, Zap, MousePointer2, Plus
} from 'lucide-react';
import { getAnalyticalProjects, getServerAnalytics, getDomainAnalytics } from './dashboardService';
import type { AnalyticalProjectsResponse, AnalyticalFilter, ServerAnalyticsResponse, DomainAnalyticsResponse } from './dashboardService';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import ServerAnalytical from './ServerAnalytical';
import DomainAnalytical from './DomainAnalytical';
import { usePermission } from '../../hooks/usePermission';


ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
    }).format(val);
};

// ─── Pill Badge ────────────────────────────────────────────────────────────────
const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
    const map: Record<string, { label: string; cls: string }> = {
        completed: { label: 'Completed', cls: 'bg-emerald-500/15 text-emerald-400 ring-emerald-500/25' },
        done: { label: 'Done', cls: 'bg-emerald-500/15 text-emerald-400 ring-emerald-500/25' },
        progressing: { label: 'Progressing', cls: 'bg-blue-500/15 text-blue-400 ring-blue-500/25' },
        pending: { label: 'Pending', cls: 'bg-amber-500/15 text-amber-400 ring-amber-500/25' },
        overdue: { label: 'Overdue', cls: 'bg-rose-500/15 text-rose-400 ring-rose-500/25' },
    };
    const cfg = map[status.toLowerCase()] ?? { label: status, cls: 'bg-slate-500/15 text-slate-400 ring-slate-500/25' };
    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ring-1 ${cfg.cls}`}>
            {cfg.label}
        </span>
    );
};

// ─── Service Drawer (slide-in panel replacing accordion) ──────────────────────
const ServiceDrawer: React.FC<{ project: any; onClose: () => void }> = ({ project, onClose }) => {
    const services = project?.services || [];
    const navigate = useNavigate();

    return (
        <div className="fixed inset-0 z-50 flex">
            <div className="flex-1 bg-background/50 backdrop-blur-sm" onClick={onClose} />
            <div className="w-full max-w-md bg-card border-l border-border flex flex-col shadow-2xl animate-slide-in">
                <div className="px-6 py-5 border-b border-border flex items-start justify-between gap-3">
                    <div className="flex-1 pr-4">
                        <p className="text-[11px] font-semibold text-indigo-400 tracking-widest uppercase mb-1">Project Services</p>
                        <h3 className="text-lg font-bold text-foreground leading-snug">{project.project_name || project.project?.name}</h3>
                        <div className="flex items-center justify-between mt-3">
                            <div className="flex items-center gap-2">
                                <StatusBadge status={project.status || project.project?.status || 'Pending'} />
                                <span className="text-xs text-slate-500">{project.services?.length || project.progress?.total_services || 0} services</span>
                            </div>
                            <button
                                onClick={() => {
                                    onClose();
                                    navigate(`/projects/${project.project_id || project.project?.id}`);
                                }}
                                className="group text-indigo-500 text-[11px] font-black uppercase hover:text-indigo-400 flex items-center gap-1 transition-colors px-3 py-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20"
                            >
                                View Details <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted text-slate-500 hover:text-foreground">
                        <X size={18} />
                    </button>
                </div>

                <div className="grid grid-cols-2 divide-x divide-border border-b border-border bg-muted/5">
                    <div className="px-5 py-4">
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5">
                            <Banknote size={12} className="text-emerald-400" /> Financial
                        </p>
                        <div className="space-y-1.5">
                            <div className="flex justify-between text-xs">
                                <span className="text-slate-400">Paid Status</span>
                                <span className="text-foreground font-semibold uppercase">{project.paid_status || 'N/A'}</span>
                            </div>
                        </div>
                    </div>
                    <div className="px-5 py-4">
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5">
                            <Users size={12} className="text-indigo-400" /> Team
                        </p>
                        <div className="space-y-1.5">
                            <div className="flex justify-between text-xs">
                                <span className="text-slate-400">Main Team</span>
                                <span className="text-foreground font-semibold truncate max-w-[80px]">{project.project_team_name || 'None'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {services.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-40 text-slate-500">
                            <Briefcase size={28} className="mb-2 opacity-40" />
                            <p className="text-sm">No services attached</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-border">
                            {services.map((svc: any) => (
                                <div key={svc.id} className="px-6 py-4 hover:bg-muted/30 transition-colors">
                                    <div className="flex items-start gap-3">
                                        <div className="mt-1 flex-shrink-0">
                                            {svc.status === 'completed' ? <CheckCircle2 size={16} className="text-emerald-400" /> : <Circle size={16} className="text-slate-600" />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-foreground">{svc.service_team_name || svc.name}</p>
                                            <div className="flex items-center gap-2 mt-1.5">
                                                <StatusBadge status={svc.status} />
                                                <span className="text-[10px] font-bold text-slate-500 border border-border px-1.5 py-0.5 rounded uppercase">{svc.paid_status || 'UNPAID'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const AnalyticalDashboard: React.FC = () => {
    const [data, setData] = useState<AnalyticalProjectsResponse | null>(null);
    const [serverData, setServerData] = useState<ServerAnalyticsResponse | null>(null);
    const [domainData, setDomainData] = useState<DomainAnalyticsResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const [error, setError] = useState<string | null>(null);
    const [selectedProject, setSelectedProject] = useState<any>(null);
    const [filter, setFilter] = useState<AnalyticalFilter>({ page: 1, page_size: 10, filter_type: 'this_year' });
    const { hasPermission } = usePermission();

    const availableTabs = [
        { id: 'projects', label: 'Projects', permission: 'view_projectstats' },
        { id: 'servers', label: 'Servers', permission: 'view_server_stats' },
        { id: 'domains', label: 'Domains', permission: 'view_domain_stats' },
    ].filter(tab => hasPermission(tab.permission));

    const [activeTab, setActiveTab] = useState<'projects' | 'servers' | 'domains' | string>(availableTabs[0]?.id || 'projects');
    const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());


    const toggleProject = (projectName: string) => {
        const next = new Set(expandedProjects);
        if (next.has(projectName)) next.delete(projectName);
        else next.add(projectName);
        setExpandedProjects(next);
    };

    useEffect(() => { fetchData(); }, [filter]);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);
            const [projRes, serverRes, domainRes] = await Promise.all([
                getAnalyticalProjects(filter),
                getServerAnalytics(),
                getDomainAnalytics()
            ]);
            setData(projRes);
            setServerData(serverRes);
            setDomainData(domainRes);
        } catch (e) {
            console.error(e);
            setError("Failed to sync dashboard data.");
        } finally {
            setLoading(false);
        }
    };

    const overview = data?.overview;
    const [activePulse, setActivePulse] = useState<string | null>(null);
    const togglePulseFilter = (status: string) => setActivePulse(activePulse === status ? null : status);

    const [activePayment, setActivePayment] = useState<string | null>(null);
    const togglePaymentFilter = (status: string) => setActivePayment(activePayment === status ? null : status);

    const [activeTeam, setActiveTeam] = useState<string | null>(null);
    const toggleTeamFilter = (status: string) => setActiveTeam(activeTeam === status ? null : status);


    return (
        <div className="space-y-6">
            <style>{`
                @keyframes slide-in { from { transform: translateX(100%) } to { transform: translateX(0) } }
                .animate-slide-in { animation: slide-in 0.25s cubic-bezier(0.32,0.72,0,1) }
            `}</style>

            {selectedProject && <ServiceDrawer project={selectedProject} onClose={() => setSelectedProject(null)} />}

            <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                        <LayoutDashboard size={16} className="text-indigo-400" />
                    </div>
                    <h1 className="text-xl font-black text-foreground tracking-tight">Analytics</h1>
                </div>
            </div>

            <div className="flex items-center gap-1 p-1 bg-card border border-border rounded-xl w-fit">
                {availableTabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === tab.id ? 'bg-indigo-500 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {loading && !data ? (
                <div className="flex justify-center py-32"><div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>
            ) : error ? (
                <div className="bg-card border border-rose-500/10 rounded-2xl p-10 flex flex-col items-center gap-4 shadow-xl">
                    <p className="text-rose-500 font-black uppercase tracking-widest text-[10px]">Sync Failure</p>
                    <p className="text-slate-400 text-sm">{error}</p>
                    <button
                        onClick={() => fetchData()}
                        className="px-6 py-2 bg-indigo-500 text-white text-xs font-black uppercase rounded-xl hover:bg-indigo-600 transition-all"
                    >
                        Try Again
                    </button>
                </div>
            ) : (
                <>
                    {activeTab === 'projects' && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                                {/* Card 1: Pipeline Overview */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: 0.1 }}
                                    className="bg-card border border-border/50 rounded-2xl p-5 shadow-xl relative overflow-hidden group"
                                >
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-3xl" />
                                    <div className="flex items-center justify-between mb-5">
                                        <h2 className="text-[10px] font-black text-foreground uppercase tracking-widest flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" /> Pipeline Overview
                                        </h2>
                                        <button onClick={() => togglePulseFilter('')} className="text-[10px] font-bold text-indigo-400 hover:underline px-2">Reset</button>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <div className="flex-1 grid grid-cols-1 gap-3">
                                            <button
                                                onClick={() => togglePulseFilter('')}
                                                className={`px-4 py-3 border rounded-xl text-left transition-all ${!activePulse ? 'bg-indigo-500/20 border-indigo-500/50' : 'bg-muted/30 border-border/40 hover:bg-muted'}`}
                                            >
                                                <p className="text-[10px] font-bold text-slate-500 uppercase">Total Active</p>
                                                <p className="text-3xl font-black text-foreground leading-none mt-1">{data?.overview?.projects.total || 0}</p>
                                            </button>
                                            <div className="grid grid-cols-2 gap-2">
                                                <button
                                                    onClick={() => togglePulseFilter('progressing')}
                                                    className={`px-3 py-2 border rounded-xl text-left transition-all ${activePulse === 'progressing' ? 'bg-blue-500/20 border-blue-500/50' : 'bg-muted/30 border-border/40 hover:bg-muted'}`}
                                                >
                                                    <p className="text-lg font-black text-blue-500 leading-none">{overview?.projects?.progressing || 0}</p>
                                                    <p className="text-[9px] font-bold text-slate-500 uppercase mt-1">On Track</p>
                                                </button>
                                                <button
                                                    onClick={() => togglePulseFilter('pending')}
                                                    className={`px-3 py-2 border rounded-xl text-left transition-all ${activePulse === 'pending' ? 'bg-amber-500/20 border-amber-500/50' : 'bg-muted/30 border-border/40 hover:bg-muted'}`}
                                                >
                                                    <p className="text-lg font-black text-amber-500 leading-none">{overview?.projects?.pending || 0}</p>
                                                    <p className="text-[9px] font-bold text-slate-500 uppercase mt-1">Waiting</p>
                                                </button>
                                            </div>
                                        </div>
                                        <div className="w-24 h-24 flex-shrink-0 relative">
                                            <Doughnut
                                                data={{
                                                    labels: ['On Track', 'Waiting'],
                                                    datasets: [{
                                                        data: [overview?.projects?.progressing || 0, overview?.projects?.pending || 0],
                                                        backgroundColor: ['#3b82f6', '#f59e0b'],
                                                        borderWidth: 0,
                                                        hoverOffset: 4,
                                                    }]
                                                }}
                                                options={{
                                                    cutout: '75%',
                                                    plugins: { legend: { display: false }, tooltip: { enabled: true } },
                                                    maintainAspectRatio: false,
                                                    animation: { animateRotate: true, animateScale: true }
                                                }}
                                            />
                                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                                <p className="text-lg font-black text-foreground leading-none">{data?.overview?.projects.total || 0}</p>
                                                <p className="text-[7px] font-bold text-slate-500 uppercase tracking-tighter mt-0.5">Projects</p>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                                {/* Card 2: Financial Health */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: 0.2 }}
                                    className="bg-card border border-border/50 rounded-2xl p-5 shadow-xl relative overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 blur-3xl" />
                                    <div className="flex items-center justify-between mb-5">
                                        <h2 className="text-[10px] font-black text-foreground uppercase tracking-widest flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-rose-500" /> Financial Health
                                        </h2>
                                        <p className="text-[9px] font-bold text-slate-500 uppercase">Outstanding</p>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <div className="flex-1 space-y-4">
                                            <div className="bg-rose-500/5 border border-rose-500/10 p-4 rounded-xl">
                                                <p className="text-[10px] font-bold text-rose-500 uppercase mb-1">Total Balance Due</p>
                                                <p className="text-3xl font-black text-foreground tracking-tight">
                                                    {formatCurrency(data?.overview?.payment?.total_remaining_amount || 0)}
                                                </p>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2">
                                                <button
                                                    onClick={() => togglePaymentFilter('unpaid')}
                                                    className={`px-3 py-2.5 rounded-xl border transition-all text-left ${activePayment === 'unpaid' ? 'bg-rose-500/20 border-rose-500/50' : 'bg-muted/30 border-border/40'}`}
                                                >
                                                    <p className="text-lg font-black text-rose-500 leading-none">{overview?.payment?.unpaid_projects || 0}</p>
                                                    <p className="text-[9px] font-bold text-slate-500 uppercase mt-1">Pending Fees</p>
                                                </button>
                                                <button
                                                    onClick={() => togglePaymentFilter('paid')}
                                                    className={`px-3 py-2.5 rounded-xl border transition-all text-left ${activePayment === 'paid' ? 'bg-emerald-500/20 border-emerald-500/50' : 'bg-muted/30 border-border/40'}`}
                                                >
                                                    <p className="text-lg font-black text-emerald-500 leading-none">{overview?.payment?.paid_projects || 0}</p>
                                                    <p className="text-[9px] font-bold text-slate-500 uppercase mt-1">Settled</p>
                                                </button>
                                            </div>
                                        </div>
                                        <div className="w-24 h-24 flex-shrink-0 relative">
                                            <Doughnut
                                                data={{
                                                    labels: ['Settled', 'Pending'],
                                                    datasets: [{
                                                        data: [overview?.payment?.paid_projects || 0, overview?.payment?.unpaid_projects || 0],
                                                        backgroundColor: ['#10b981', '#ef4444'],
                                                        borderWidth: 0,
                                                        hoverOffset: 4,
                                                    }]
                                                }}
                                                options={{
                                                    cutout: '75%',
                                                    plugins: { legend: { display: false } },
                                                    maintainAspectRatio: false,
                                                    animation: { animateRotate: true, animateScale: true }
                                                }}
                                            />
                                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                                <Banknote size={14} className="text-rose-500 mb-0.5" />
                                                <p className="text-[7px] font-bold text-slate-500 uppercase tracking-tighter">Budget</p>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                                {/* Card 3: Execution Alerts */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: 0.3 }}
                                    className="bg-card border border-border/50 rounded-2xl p-5 shadow-xl relative overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 blur-3xl" />
                                    <h2 className="text-[10px] font-black text-foreground uppercase tracking-widest mb-5 flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.5)]" /> Execution Alerts
                                    </h2>
                                    <div className="space-y-3">
                                        <button
                                            onClick={() => toggleTeamFilter('unfinished')}
                                            className={`w-full p-4 rounded-xl border transition-all text-left flex justify-between items-center ${activeTeam === 'unfinished' ? 'bg-orange-500/20 border-orange-500/50' : 'bg-muted/30 border-border/40 hover:bg-muted'}`}
                                        >
                                            <div className="flex flex-col">
                                                <p className="text-2xl font-black text-orange-500 leading-none">{data?.overview?.work?.unfinished_teams || 0}</p>
                                                <p className="text-[9px] text-slate-500 font-bold uppercase mt-1 tracking-tight">
                                                    {(data?.overview?.work?.total_teams || 0) - (data?.overview?.work?.unfinished_teams || 0)} / {data?.overview?.work?.total_teams || 0} Unified Teams Done
                                                </p>
                                            </div>
                                            <div className="w-14 h-14 flex-shrink-0 relative">
                                                <Doughnut
                                                    data={{
                                                        datasets: [{
                                                            data: [(data?.overview?.work?.total_teams || 0) - (data?.overview?.work?.unfinished_teams || 0), data?.overview?.work?.unfinished_teams || 0],
                                                            backgroundColor: ['#f97316', 'rgba(249,115,22,0.1)'],
                                                            borderWidth: 0,
                                                        }]
                                                    }}
                                                    options={{
                                                        cutout: '70%',
                                                        plugins: { legend: { display: false } },
                                                        maintainAspectRatio: false,
                                                        animation: { animateRotate: true, animateScale: true }
                                                    }}
                                                />
                                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                                    <p className="text-[10px] font-black text-orange-500">{data?.overview?.work?.unfinished_teams || 0}</p>
                                                </div>
                                            </div>
                                        </button>
                                        <div className="grid grid-cols-1 gap-2">
                                            <button
                                                onClick={() => toggleTeamFilter('overdue')}
                                                className={`px-4 py-3 border rounded-xl flex items-center justify-between transition-all ${activeTeam === 'overdue' ? 'bg-rose-500/20 border-rose-500/50' : 'bg-rose-500/5 border-rose-500/10 hover:bg-rose-500/10'}`}
                                            >
                                                <p className="text-[10px] font-bold text-rose-500 uppercase">Overdue Criticals</p>
                                                <div className="flex items-center gap-1.5 font-black text-rose-500 text-sm">
                                                    <span>{data?.overview?.work?.overdue_teams || 0}</span>
                                                    <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                                                </div>
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            </div>

                            {(() => {
                                let results = data?.results || [];
                                const today = new Date(); today.setHours(0, 0, 0, 0);

                                if (activePulse) {
                                    results = results.filter(p => (p.project_status || p.status || '').toLowerCase() === activePulse.toLowerCase());
                                }
                                if (activePayment) {
                                    if (activePayment === 'unpaid') results = results.filter(p => (p.balance_due || 0) > 0);
                                    if (activePayment === 'paid') results = results.filter(p => (p.balance_due || 0) === 0);
                                }
                                if (activeTeam) {
                                    if (activeTeam === 'unfinished') {
                                        results = results.filter(p => {
                                            const allT: string[] = [];
                                            if (p.project_team_status && p.project_team_status !== 'No Team') allT.push(p.project_team_status);
                                            p.services?.forEach(s => { if (s.service_team_status) allT.push(s.service_team_status); });
                                            return allT.some(s => !['completed', 'done'].includes(s.toLowerCase()));
                                        });
                                    }
                                    if (activeTeam === 'overdue') {
                                        results = results.filter(p => {
                                            const teamDLs: { date: Date, isDone: boolean }[] = [];
                                            if (p.project_team_deadline) teamDLs.push({ date: new Date(p.project_team_deadline), isDone: ['completed', 'done'].includes(p.project_team_status?.toLowerCase() || '') });
                                            p.services?.forEach(s => { if (s.service_team_deadline) teamDLs.push({ date: new Date(s.service_team_deadline), isDone: ['completed', 'done'].includes(s.service_team_status?.toLowerCase() || '') }); });
                                            return teamDLs.some(d => !d.isDone && d.date.getTime() < today.getTime());
                                        });
                                    }
                                }

                                if (data?.total_project_count === 0) {
                                    return (
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="max-w-4xl mx-auto py-12 px-6"
                                        >
                                            <div className="bg-card border border-border rounded-[2.5rem] p-12 shadow-2xl relative overflow-hidden text-center">
                                                {/* Decorative Background Elements */}
                                                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-3xl rounded-full -mr-20 -mt-20" />
                                                <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/10 blur-3xl rounded-full -ml-20 -mb-20" />

                                                <div className="relative z-10 flex flex-col items-center">
                                                    <div className="w-24 h-24 rounded-3xl bg-primary/10 flex items-center justify-center mb-8 border border-primary/20 shadow-inner group">
                                                        <Briefcase size={48} className="text-primary group-hover:scale-110 transition-transform duration-500" />
                                                    </div>

                                                    <h2 className="text-3xl font-black text-foreground tracking-tight mb-4 uppercase">
                                                        No Projects Detected
                                                    </h2>
                                                    
                                                    <p className="text-slate-500 text-lg max-w-xl mx-auto mb-10 font-medium">
                                                        Your project pipeline is currently empty. To see detailed analytics and financial health, you need to create your first project.
                                                    </p>

                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-3xl mb-12">
                                                        {[
                                                            { icon: <MousePointer2 size={18} />, title: "Step 1", desc: "Go to Projects section" },
                                                            { icon: <Plus size={18} />, title: "Step 2", desc: "Click Create Project" },
                                                            { icon: <Zap size={18} />, title: "Step 3", desc: "Track Financial Health" }
                                                        ].map((step, idx) => (
                                                            <motion.div 
                                                                key={idx}
                                                                initial={{ opacity: 0, y: 10 }}
                                                                animate={{ opacity: 1, y: 0 }}
                                                                transition={{ delay: 0.2 + (idx * 0.1) }}
                                                                className="relative group p-6 rounded-3xl border border-border/50 transition-all duration-300 bg-muted/20 hover:border-primary/40 hover:bg-muted/40"
                                                            >
                                                                <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                                                                    {step.icon}
                                                                </div>
                                                                <p className="text-[10px] font-black uppercase tracking-widest mb-1 text-primary opacity-80">{step.title}</p>
                                                                <p className="text-xs font-bold text-foreground/70 uppercase tracking-tight leading-relaxed">{step.desc}</p>
                                                            </motion.div>
                                                        ))}
                                                    </div>

                                                    <button
                                                        onClick={() => navigate('/projects/new')}
                                                        className="group relative px-10 py-5 bg-primary hover:bg-primary-hover text-white font-black uppercase text-sm rounded-[2rem] transition-all shadow-xl shadow-primary/25 flex items-center gap-3 active:scale-95"
                                                    >
                                                        <Plus size={20} className="group-hover:scale-110 transition-transform" />
                                                        <span>Create First Project</span>
                                                        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                                    </button>

                                                    <p className="mt-8 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] opacity-40">
                                                        Analytics will sync automatically after creation
                                                    </p>
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                }

                                if (results.length === 0) return (
                                    <div className="bg-card border border-border rounded-2xl py-20 flex flex-col items-center justify-center text-slate-500 shadow-xl">
                                        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4"><LayoutGrid size={24} className="opacity-20" /></div>
                                        <p className="text-sm font-black uppercase tracking-widest mb-1 text-foreground">No Projects Found</p>
                                        <p className="text-xs text-slate-500 max-w-xs text-center">There are no projects that match the current filters. Try adjusting your search or clearing the status filter.</p>
                                        <button onClick={() => { setActivePulse(null); setActivePayment(null); setActiveTeam(null); }} className="mt-6 text-[10px] font-black text-indigo-400 uppercase tracking-widest hover:underline">Clear all filters</button>
                                    </div>
                                );

                                return (
                                    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-xl">
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left">
                                                <thead>
                                                    <tr className="bg-muted/5 border-b border-border text-[9px] font-black text-slate-500 uppercase tracking-wider">
                                                        <th className="px-5 py-4 w-10 text-center">#</th>
                                                        <th className="px-5 py-4 w-10"></th>
                                                        <th className="px-5 py-4">Project</th>
                                                        <th className="px-5 py-4 flex items-center gap-1.5 min-w-[120px]">
                                                            Team Status
                                                            <span className="text-[8px] font-black bg-indigo-500/10 text-indigo-400 px-1.5 py-0.5 rounded-full border border-indigo-500/20 shadow-sm">
                                                                {data?.overview?.work?.total_teams || 0}
                                                            </span>
                                                        </th>
                                                        {hasPermission('view_server_stats') && <th className="px-5 py-4 text-center">Server</th>}
                                                        {hasPermission('view_domain_stats') && <th className="px-5 py-4 text-center">Domain</th>}
                                                        <th className="px-5 py-4 text-center">Services</th>
                                                        <th className="px-5 py-4 text-center pr-10">Payment Progress</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-border">
                                                    {results.map((p, idx) => {
                                                        const isExpanded = expandedProjects.has(p.project_id?.toString() || p.project_name);
                                                        const pageOffset = ((filter.page || 1) - 1) * (filter.page_size || 10);
                                                        const rowNumber = pageOffset + idx + 1;

                                                        return (
                                                            <React.Fragment key={p.project_id || idx}>
                                                                <motion.tr
                                                                    onClick={() => toggleProject(p.project_id?.toString() || p.project_name)}
                                                                    whileHover={{ x: 4, backgroundColor: "rgba(99, 102, 241, 0.03)" }}
                                                                    className="group transition-colors border-b border-border/50 last:border-0 cursor-pointer"
                                                                >
                                                                    <td className="px-5 py-4 text-center font-bold text-slate-500 text-xs">{rowNumber}</td>
                                                                    <td className="px-5 py-4 w-10">
                                                                        <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                                                                            <Briefcase size={14} />
                                                                        </div>
                                                                    </td>
                                                                    <td className="px-5 py-4">
                                                                        <div className="flex flex-col">
                                                                            <span className="text-[11px] font-black text-foreground uppercase truncate max-w-[140px]" title={p.project_name}>
                                                                                {p.project_name}
                                                                            </span>
                                                                            <div className="flex items-center gap-1.5 mt-1">
                                                                                <div className={`w-1 h-1 rounded-full ${p.status?.toLowerCase() === 'completed' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                                                                                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-tight">{p.status}</span>
                                                                            </div>
                                                                        </div>
                                                                    </td>
                                                                    <td className="px-5 py-4">
                                                                        <div className="flex flex-col">
                                                                            <div className="flex items-center gap-1.5">
                                                                                <span className={`text-[11px] font-black ${(p.completed_teams_count === p.total_teams_count) && (p.total_teams_count ?? 0) > 0 ? 'text-emerald-500' : 'text-foreground'}`}>
                                                                                    {p.completed_teams_count ?? 0}/{p.total_teams_count ?? 0}
                                                                                </span>
                                                                                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-tight">Complete</span>
                                                                            </div>
                                                                            <div className="w-full h-1 rounded-full bg-border/50 overflow-hidden mt-1.5">
                                                                                <div
                                                                                    className={`h-full rounded-full transition-all duration-700 ${(p.completed_teams_count === p.total_teams_count) && (p.total_teams_count ?? 0) > 0 ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                                                                                    style={{ width: `${(p.total_teams_count ?? 0) > 0 ? ((p.completed_teams_count ?? 0) / (p.total_teams_count || 1)) * 100 : 0}%` }}
                                                                                />
                                                                            </div>
                                                                        </div>
                                                                    </td>
                                                                    {hasPermission('view_server_stats') && (
                                                                        <td className="px-5 py-4 text-center">
                                                                            <div className="flex flex-col items-center">
                                                                                <span className="text-[8px] font-bold text-slate-400 uppercase truncate max-w-[60px] mb-1" title={p.server_name}>
                                                                                    {p.server_name || 'N/A'}
                                                                                </span>
                                                                                <div className={`p-1 w-6 h-6 rounded flex items-center justify-center mx-auto ${p.category_status?.server === 'Paid' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-500/10 text-slate-400'}`} title="Server">
                                                                                    <Server size={12} />
                                                                                </div>
                                                                                {(p.server_count ?? 0) > 0 && (
                                                                                    <span className="text-[10px] font-black block mt-1">
                                                                                        <span className={p.paid_server_count === p.server_count ? "text-emerald-500" : "text-slate-500"}>
                                                                                            {p.paid_server_count || 0}
                                                                                        </span>
                                                                                        <span className="text-slate-400 font-medium mx-0.5">/</span>
                                                                                        <span className="text-slate-500">{p.server_count}</span>
                                                                                    </span>
                                                                                )}
                                                                            </div>
                                                                        </td>
                                                                    )}
                                                                    {hasPermission('view_domain_stats') && (
                                                                        <td className="px-5 py-4 text-center">
                                                                            <div className="flex flex-col items-center">
                                                                                <span className="text-[8px] font-bold text-slate-400 uppercase truncate max-w-[60px] mb-1" title={p.domain_name}>
                                                                                    {p.domain_name || 'N/A'}
                                                                                </span>
                                                                                <div className={`p-1 w-6 h-6 rounded flex items-center justify-center mx-auto ${(p.category_status as any)?.domain === 'Paid' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-slate-500/10 text-slate-400'}`} title="Domain">
                                                                                    <Globe size={12} />
                                                                                </div>
                                                                                {(p.domain_count ?? 0) > 0 && (
                                                                                    <span className="text-[10px] font-black block mt-1">
                                                                                        <span className={p.paid_domain_count === p.domain_count ? "text-emerald-500" : "text-slate-500"}>
                                                                                            {p.paid_domain_count || 0}
                                                                                        </span>
                                                                                        <span className="text-slate-400 font-medium mx-0.5">/</span>
                                                                                        <span className="text-slate-500">{p.domain_count}</span>
                                                                                    </span>
                                                                                )}
                                                                            </div>
                                                                        </td>
                                                                    )}
                                                                    <td className="px-5 py-4 text-center">
                                                                        <span className="text-[10px] font-black text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-500/10">
                                                                            {p.serviceteam_count ?? p.services?.length ?? 0}
                                                                        </span>
                                                                    </td>
                                                                    <td className="px-5 py-4">
                                                                        <div className="flex flex-col">
                                                                            <div className="flex items-baseline gap-1">
                                                                                <span className="text-[11px] font-black text-foreground">
                                                                                    {formatCurrency(p.total_paid || 0)}
                                                                                </span>
                                                                                {(p.total_project_cost || 0) > 0 && (
                                                                                    <span className="text-[8px] font-bold text-slate-400/80 tracking-tighter">
                                                                                        / {formatCurrency(p.total_project_cost || 0)}
                                                                                    </span>
                                                                                )}
                                                                            </div>
                                                                            {(p.balance_due || 0) > 0 && (
                                                                                <span className="text-[9px] font-bold text-rose-500 mt-0.5">
                                                                                    DUE: {formatCurrency(p.balance_due || 0)}
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                        {(() => {
                                                                            const cats = ['project', 'domain', 'server', 'service'];
                                                                            const activeCats = cats.filter(c => (p.category_status as any)?.[c] && (p.category_status as any)?.[c] !== 'NA');
                                                                            if (activeCats.length === 0) return null;
                                                                            const paidCount = activeCats.filter(c => (p.category_status as any)?.[c] === 'Paid').length;
                                                                            const pct = Math.round((paidCount / activeCats.length) * 100);
                                                                            const allPaid = paidCount === activeCats.length;
                                                                            return (
                                                                                <div className="w-full mt-2">
                                                                                    <div className="flex justify-between items-center mb-1">
                                                                                        <span className={`text-[8px] font-black uppercase ${allPaid ? 'text-emerald-500' : 'text-rose-500'}`}>
                                                                                            {allPaid ? '✓ All Paid' : `${paidCount}/${activeCats.length} Paid`}
                                                                                        </span>
                                                                                        <span className={`text-[8px] font-black ${allPaid ? 'text-emerald-500' : 'text-rose-500'}`}>{pct}%</span>
                                                                                    </div>
                                                                                    <div className="w-full h-1 rounded-full bg-border/50 overflow-hidden">
                                                                                        <div
                                                                                            className={`h-full rounded-full transition-all duration-700 ${allPaid ? 'bg-emerald-500' : 'bg-rose-500'}`}
                                                                                            style={{ width: `${pct}%` }}
                                                                                        />
                                                                                    </div>
                                                                                </div>
                                                                            );
                                                                        })()}
                                                                    </td>
                                                                </motion.tr>
                                                                <AnimatePresence>
                                                                    {isExpanded && (
                                                                        <motion.tr
                                                                            initial={{ opacity: 0 }}
                                                                            animate={{ opacity: 1 }}
                                                                            exit={{ opacity: 0 }}
                                                                            className="bg-muted/5"
                                                                        >
                                                                            <td colSpan={6 + (hasPermission('view_server_stats') ? 1 : 0) + (hasPermission('view_domain_stats') ? 1 : 0)} className="p-0">
                                                                                <motion.div
                                                                                    initial={{ height: 0, opacity: 0 }}
                                                                                    animate={{ height: "auto", opacity: 1 }}
                                                                                    exit={{ height: 0, opacity: 0 }}
                                                                                    transition={{ duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] }}
                                                                                    style={{ overflow: 'hidden' }}
                                                                                >
                                                                                    <div className="px-10 py-8 relative pl-16 space-y-4">
                                                                                        <div className="absolute left-8 top-0 bottom-0 w-px bg-gradient-to-b from-indigo-500/50 via-purple-500/50 to-transparent" />

                                                                                        {/* Headers */}
                                                                                        <div className="flex items-center gap-6 px-6 pb-2 border-b border-border/50">
                                                                                            <div className="w-[200px]">
                                                                                                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.15em] flex items-center gap-2">
                                                                                                    <Layout size={12} /> ENTITY DETAILS
                                                                                                </p>
                                                                                            </div>
                                                                                            <div className="flex-1">
                                                                                                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.15em]">TIMELINE & DEADLINES</p>
                                                                                            </div>
                                                                                            <div className="w-32">
                                                                                                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.15em]">FINANCIALS</p>
                                                                                            </div>
                                                                                            <div className="w-36 text-right">
                                                                                                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.15em]">WORK STATUS</p>
                                                                                            </div>
                                                                                        </div>

                                                                                        <div className="space-y-1.5 mt-3">
                                                                                            {(() => {
                                                                                                const today = new Date(); today.setHours(0, 0, 0, 0);

                                                                                                const renderExpandedRow = (
                                                                                                    label: string,
                                                                                                    subLabel: string | null,
                                                                                                    cost: number,
                                                                                                    paidStatus: string | null,
                                                                                                    deadline: string | null,
                                                                                                    status: string | null,
                                                                                                    type: 'project' | 'service' | 'infra' = 'service'
                                                                                                ) => {
                                                                                                    const dl = deadline ? new Date(deadline) : null;
                                                                                                    if (dl) dl.setHours(0, 0, 0, 0);
                                                                                                    const isDone = ['completed', 'done'].includes(status?.toLowerCase() || '');
                                                                                                    const diff = dl && !isDone ? Math.round((dl.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)) : null;
                                                                                                    const overdue = diff !== null && diff < 0;
                                                                                                    const onTime = diff === 0;

                                                                                                    // Select Icon/Color based on type
                                                                                                    const iconCfg = {
                                                                                                        project: { icon: <Briefcase size={12} />, bg: 'bg-indigo-500/10 text-indigo-400', labelCls: 'text-indigo-400' },
                                                                                                        service: { icon: <Zap size={12} />, bg: 'bg-indigo-500/10 text-indigo-400', labelCls: 'text-indigo-400' },
                                                                                                        infra: { icon: label.includes('Server') ? <><Server size={12} /> {(p.server_count ?? 0) > 0 && <span className="text-[10px] font-black ml-1 text-slate-500 opacity-80">{p.server_count}</span>}</> : label.includes('Domain') ? <Globe size={12} /> : <Zap size={12} />, bg: 'bg-slate-500/10 text-slate-400', labelCls: 'text-slate-400' }
                                                                                                    }[type];

                                                                                                    return (
                                                                                                        <div className={`bg-card/20 hover:bg-muted/40 transition-all flex items-center gap-6 px-6 py-2.5 rounded-xl border border-transparent hover:border-indigo-500/15 group/row`}>
                                                                                                            {/* 1. Category & Name */}
                                                                                                            <div className="w-[200px] flex items-center gap-3">
                                                                                                                <div className={`p-1.5 rounded-lg ${iconCfg.bg} flex-shrink-0`}>
                                                                                                                    {iconCfg.icon}
                                                                                                                </div>
                                                                                                                <div className="min-w-0">
                                                                                                                    <p className={`text-[8px] font-black uppercase tracking-wider ${iconCfg.labelCls}`}>{label}</p>
                                                                                                                    <p className="text-[11px] font-black text-foreground uppercase truncate -mt-0.5" title={subLabel || ''}>{subLabel}</p>
                                                                                                                </div>
                                                                                                            </div>

                                                                                                            {/* 2. Timeline Information */}
                                                                                                            <div className="flex-1 flex items-center gap-4">
                                                                                                                {deadline ? (
                                                                                                                    <>
                                                                                                                        <div className="flex flex-col">
                                                                                                                            <span className="text-[7.5px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1">
                                                                                                                                <Clock size={8} /> {type === 'infra' ? 'Expiry Date' : 'Target Date'}
                                                                                                                            </span>
                                                                                                                            <span className="text-[10px] font-bold text-foreground/80">{dl?.toLocaleDateString()}</span>
                                                                                                                        </div>
                                                                                                                        <span className={`text-[8px] font-black px-2 py-0.5 rounded-md border shadow-sm ${isDone ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : overdue ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' :
                                                                                                                            diff !== null && diff <= 7 ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                                                                                                                                'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                                                                                                                            }`}>
                                                                                                                            {isDone ? 'COMPLETED' : overdue ? (type === 'infra' ? `${Math.abs(diff!)}D EXPIRED` : `${Math.abs(diff!)}D OVERDUE`) : onTime ? 'DUE TODAY' : `${diff}D REMAINING`}
                                                                                                                        </span>
                                                                                                                    </>
                                                                                                                ) : (
                                                                                                                    <span className="text-[9px] font-bold text-slate-500/40 tracking-wider">NO TIMELINE LOGGED</span>
                                                                                                                )}
                                                                                                            </div>

                                                                                                            {/* 3. Financial Information */}
                                                                                                            <div className="w-32 flex flex-col items-start gap-0.5">
                                                                                                                <span className="text-[11px] font-black text-foreground drop-shadow-sm">{formatCurrency(cost)}</span>
                                                                                                                <span className={`text-[8px] font-black px-1.5 py-0.5 rounded border leading-none ${paidStatus?.toLowerCase() === 'paid' ? 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' : 'text-rose-500 bg-rose-500/10 border-rose-500/20'}`}>
                                                                                                                    {paidStatus?.toUpperCase() || 'UNPAID'}
                                                                                                                </span>
                                                                                                            </div>

                                                                                                            {/* 4. Status Information */}
                                                                                                            <div className="w-36 text-right flex flex-col items-end gap-1">
                                                                                                                {type !== 'infra' && (status ? (
                                                                                                                    <>
                                                                                                                        <StatusBadge status={status} />
                                                                                                                        <div className="w-16 h-1 rounded-full bg-border/40 overflow-hidden mt-0.5">
                                                                                                                            <div className={`h-full transition-all duration-1000 shadow-sm ${status.toLowerCase() === 'completed' || status.toLowerCase() === 'done' ? 'w-full bg-emerald-500' : 'w-1/2 bg-indigo-500'}`} />
                                                                                                                        </div>
                                                                                                                    </>
                                                                                                                ) : (
                                                                                                                    <span className="text-[9px] font-bold text-slate-500/40 tracking-widest uppercase">Ongoing</span>
                                                                                                                ))}
                                                                                                            </div>
                                                                                                        </div>
                                                                                                    );
                                                                                                };

                                                                                                return (
                                                                                                    <>
                                                                                                        {/* Project Team */}
                                                                                                        {p.project_team_name && p.project_team_name !== 'No Team' && (
                                                                                                            renderExpandedRow(
                                                                                                                'Project Team',
                                                                                                                p.project_team_name,
                                                                                                                p.project_cost || 0,
                                                                                                                p.category_status?.project || null,
                                                                                                                p.project_team_deadline || null,
                                                                                                                p.project_team_status || null,
                                                                                                                'project'
                                                                                                            )
                                                                                                        )}

                                                                                                        {/* Service Teams */}
                                                                                                        {(p.services || []).map((svc: any) => (
                                                                                                            renderExpandedRow(
                                                                                                                'Service Team',
                                                                                                                svc.service_team_name || svc.name,
                                                                                                                svc.service_cost || 0,
                                                                                                                svc.paid_status,
                                                                                                                svc.service_team_deadline,
                                                                                                                svc.service_team_status && svc.service_team_status.toLowerCase() !== 'completed' && svc.service_team_status !== 'No Team'
                                                                                                                    ? svc.service_team_status
                                                                                                                    : svc.status,
                                                                                                                'service'
                                                                                                            )
                                                                                                        ))}

                                                                                                        {/* Infrastructure (Server/Domain) */}
                                                                                                        {hasPermission('view_server_stats') && (
                                                                                                            <>
                                                                                                                {p.category_status?.server_items?.map((item: any) => (
                                                                                                                    renderExpandedRow(
                                                                                                                        'Server',
                                                                                                                        item.name || 'Server Hosting',
                                                                                                                        item.cost || 0,
                                                                                                                        item.payment_status || null,
                                                                                                                        item.deadline || null,
                                                                                                                        null,
                                                                                                                        'infra'
                                                                                                                    )
                                                                                                                ))}
                                                                                                                {(!p.category_status?.server_items || p.category_status.server_items.length === 0) && p.category_status?.server !== 'NA' && (
                                                                                                                    renderExpandedRow('Server', 'Server Hosting', p.server_cost || 0, p.category_status?.server || null, p.server_deadline || null, null, 'infra')
                                                                                                                )}
                                                                                                            </>
                                                                                                        )}
                                                                                                        {hasPermission('view_domain_stats') && (
                                                                                                            <>
                                                                                                                {p.category_status?.domain_items?.map((item: any) => (
                                                                                                                    renderExpandedRow(
                                                                                                                        'Domain',
                                                                                                                        item.name || 'Web Domain',
                                                                                                                        item.cost || 0,
                                                                                                                        item.payment_status || null,
                                                                                                                        item.deadline || null,
                                                                                                                        null,
                                                                                                                        'infra'
                                                                                                                    )
                                                                                                                ))}
                                                                                                                {(!p.category_status?.domain_items || p.category_status.domain_items.length === 0) && p.category_status?.domain !== 'NA' && (
                                                                                                                    renderExpandedRow('Infrastructure', 'Web Domain', p.domain_cost || 0, p.category_status?.domain || null, p.domain_deadline || null, null, 'infra')
                                                                                                                )}
                                                                                                            </>
                                                                                                        )}
                                                                                                    </>
                                                                                                );
                                                                                            })()}
                                                                                        </div>

                                                                                        {(p.services?.length ?? 0) === 0 && (
                                                                                            <div className="px-4 py-8 text-center bg-muted/5 rounded-xl border border-dashed border-border/50">
                                                                                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">No service teams assigned</p>
                                                                                            </div>
                                                                                        )}
                                                                                    </div>
                                                                                </motion.div>
                                                                            </td>
                                                                        </motion.tr>
                                                                    )}
                                                                </AnimatePresence>
                                                            </React.Fragment>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                        <div className="flex justify-between items-center px-6 py-4 bg-muted/5 border-t border-border">
                                            <button
                                                disabled={!data?.previous || loading}
                                                onClick={() => setFilter(prev => ({ ...prev, page: (prev.page || 1) - 1 }))}
                                                className="px-4 py-2 bg-slate-500/10 text-slate-400 text-[10px] font-black uppercase rounded-lg hover:bg-slate-500/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                            >
                                                Prev
                                            </button>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Page {filter.page}</span>
                                            </div>
                                            <button
                                                disabled={!data?.next || loading}
                                                onClick={() => setFilter(prev => ({ ...prev, page: (prev.page || 1) + 1 }))}
                                                className="px-4 py-2 bg-slate-500/10 text-slate-400 text-[10px] font-black uppercase rounded-lg hover:bg-slate-500/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                            >
                                                Next
                                            </button>
                                        </div>
                                    </div>
                                );
                            })()}
                        </div>
                    )}

                    {activeTab === 'servers' && serverData && (
                        <ServerAnalytical serverData={serverData} />
                    )}

                    {activeTab === 'domains' && domainData && (
                        <DomainAnalytical domainData={domainData} />
                    )}
                </>
            )}
        </div>
    );
};

export default AnalyticalDashboard;
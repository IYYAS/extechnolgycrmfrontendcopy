import React, { useState, useEffect } from 'react';
import { 
    Users, 
    Briefcase, 
    CheckCircle2, 
    TrendingUp, 
    Loader2,
    Clock,
    Search,
    ChevronDown,
    ChevronUp,
    ListTodo,
    Layers3,
    AlertTriangle,
    Calendar,
    ArrowRight
} from 'lucide-react';
import { motion, type Variants } from 'framer-motion';
import { getTeamPerformance, type TeamPerformance as TeamPerformanceData, type TeamPerformanceResponse, type PerformanceItem } from './userService';

const containerVariants: Variants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const itemVariants: Variants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } } };

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
    const s = (status || '').toLowerCase();
    let bg = 'bg-muted/30';
    let text = 'text-muted';
    
    if (s.includes('completed')) { bg = 'bg-emerald-500/10'; text = 'text-emerald-500'; }
    else if (s.includes('progress') || s.includes('active')) { bg = 'bg-indigo-500/10'; text = 'text-indigo-500'; }
    else if (s.includes('pending')) { bg = 'bg-amber-500/10'; text = 'text-amber-500'; }
    
    return (
        <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${bg} ${text}`}>
            {status}
        </span>
    );
};

// ── Single‑team panel (List-based Assignment Oversight) ──
const SingleTeamPanel: React.FC<{ data: TeamPerformanceData; showTitle?: boolean }> = ({ data, showTitle = true }) => {
    const [searchTerm, setSearchTerm] = useState('');
    
    const filteredMembers = (data.member_names || []).filter(name => 
        name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8">
            {showTitle && (
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-black italic text-foreground">{data.team_name}</h2>
                        <p className="text-muted text-sm font-medium">{data.member_count} members · {data.team_projects_count} projects</p>
                    </div>
                </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                    { label: 'Members', value: data.member_count, color: 'text-blue-500', bg: 'bg-blue-500/10', icon: Users, items: data.member_names.map(name => ({ name })) },
                    { label: 'Projects', value: data.team_projects_count, color: 'text-indigo-500', bg: 'bg-indigo-500/10', icon: Briefcase, items: data.projects },
                    { label: 'Services', value: data.team_service_count, color: 'text-purple-500', bg: 'bg-purple-500/10', icon: Layers3, items: data.services },
                ].map((s, i) => (
                    <div key={i} className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4">
                        <div className="flex items-center justify-between">
                            <div className={`w-10 h-10 rounded-xl ${s.bg} ${s.color} flex items-center justify-center`}><s.icon size={20} /></div>
                            <p className="text-2xl font-black italic text-foreground">{s.value}</p>
                        </div>
                        <div>
                            <p className="text-muted text-[10px] font-black uppercase tracking-widest mb-2">{s.label}</p>
                            <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto no-scrollbar">
                                {s.items.length > 0 ? s.items.map((item: any, idx) => (
                                    <div key={idx} className="flex items-center gap-1.5 px-2 py-1 bg-muted/30 border border-border rounded-lg">
                                        <span className="text-[10px] font-bold text-foreground">
                                            {item.name}
                                        </span>
                                        {'status' in item && <StatusBadge status={item.status} />}
                                    </div>
                                )) : (
                                    <span className="text-[10px] text-muted font-bold italic">No {s.label.toLowerCase()} linked</span>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Detailed Lists */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Projects Detail */}
                <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-border bg-muted/5 flex items-center gap-3">
                        <Briefcase size={18} className="text-indigo-500" />
                        <h3 className="font-black italic text-sm">Project Assignments</h3>
                    </div>
                    <div className="divide-y divide-border">
                        {data.projects.length > 0 ? (data.projects as PerformanceItem[]).map((p, i) => (
                            <div key={i} className={`p-4 hover:bg-muted/5 transition-colors ${p.overused ? 'border-l-4 border-l-red-500' : ''}`}>
                                <div className="flex items-center justify-between mb-2">
                                    <h4 className="font-black italic text-foreground">{p.name}</h4>
                                    <StatusBadge status={p.status} />
                                </div>
                                <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-[10px] font-medium text-muted mt-3">
                                    <div className="flex items-center gap-1.5">
                                        <Calendar size={12} className="text-blue-500" />
                                        <span>Start: {p.start_date}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Clock size={12} className="text-amber-500" />
                                        <span>Deadline: {p.deadline}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <ArrowRight size={12} className="text-indigo-500" />
                                        <span>End: {p.end_date}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 font-bold text-emerald-500">
                                        <CheckCircle2 size={12} />
                                        <span>Actual: {p.actual_end_date}</span>
                                    </div>
                                </div>
                                {p.overused ? (
                                    <div className="mt-3 flex items-center gap-2 px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 font-black italic text-[11px] animate-pulse">
                                        <AlertTriangle size={14} />
                                        <span>OVER CAPACITY: {p.over_days} DAYS EXCEEDED</span>
                                    </div>
                                ) : (
                                    p.remain_days > 0 && (
                                        <div className="mt-3 flex items-center gap-2 px-3 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-500 font-black italic text-[11px]">
                                            <CheckCircle2 size={14} />
                                            <span>ON TRACK: {p.remain_days} DAYS REMAINING</span>
                                        </div>
                                    )
                                )}
                            </div>
                        )) : (
                            <div className="p-8 text-center text-muted italic text-xs">No project assignments</div>
                        )}
                    </div>
                </div>

                {/* Services Detail */}
                <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-border bg-muted/5 flex items-center gap-3">
                        <Layers3 size={18} className="text-purple-500" />
                        <h3 className="font-black italic text-sm">Service Assignments</h3>
                    </div>
                    <div className="divide-y divide-border">
                        {data.services.length > 0 ? (data.services as PerformanceItem[]).map((s, i) => (
                            <div key={i} className={`p-4 hover:bg-muted/5 transition-colors ${s.overused ? 'border-l-4 border-l-red-500' : ''}`}>
                                <div className="flex items-center justify-between mb-2">
                                    <h4 className="font-black italic text-foreground text-xs leading-tight">{s.name}</h4>
                                    <StatusBadge status={s.status} />
                                </div>
                                <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-[10px] font-medium text-muted mt-3">
                                    <div className="flex items-center gap-1.5">
                                        <Calendar size={12} className="text-blue-500" />
                                        <span>Start: {s.start_date}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Clock size={12} className="text-amber-500" />
                                        <span>Deadline: {s.deadline}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <ArrowRight size={12} className="text-indigo-500" />
                                        <span>End: {s.end_date}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 font-bold text-emerald-500">
                                        <CheckCircle2 size={12} />
                                        <span>Actual: {s.actual_end_date}</span>
                                    </div>
                                </div>
                                {s.overused ? (
                                    <div className="mt-3 flex items-center gap-2 px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 font-black italic text-[11px] animate-pulse">
                                        <AlertTriangle size={14} />
                                        <span>OVER CAPACITY: {s.over_days} DAYS EXCEEDED</span>
                                    </div>
                                ) : (
                                    s.remain_days > 0 && (
                                        <div className="mt-3 flex items-center gap-2 px-3 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-500 font-black italic text-[11px]">
                                            <CheckCircle2 size={14} />
                                            <span>ON TRACK: {s.remain_days} DAYS REMAINING</span>
                                        </div>
                                    )
                                )}
                            </div>
                        )) : (
                            <div className="p-8 text-center text-muted italic text-xs">No service assignments</div>
                        )}
                    </div>
                </div>
            </div>

            {/* Member search/list */}
            <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
                <div className="p-6 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <h3 className="font-black italic text-lg">Team Roster</h3>
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={16} />
                        <input type="text" placeholder="Find member..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2.5 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/20 outline-none text-sm w-full sm:w-56 font-medium" />
                    </div>
                </div>
                <div className="p-6">
                    <div className="flex flex-wrap gap-3">
                        {filteredMembers.map((name, i) => (
                            <div key={i} className="flex items-center gap-3 p-3 bg-muted/10 border border-border rounded-2xl min-w-[140px]">
                                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black italic text-sm">
                                    {name.charAt(0).toUpperCase()}
                                </div>
                                <span className="font-black italic text-foreground text-sm">{name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

// ── Expandable team card for admin overview ──
const TeamCard: React.FC<{ data: TeamPerformanceData; rank: number }> = ({ data, rank }) => {
    const [expanded, setExpanded] = useState(false);
    return (
        <motion.div variants={itemVariants} className="bg-card border border-border rounded-3xl shadow-xl overflow-hidden">
            <button onClick={() => setExpanded(v => !v)} className="w-full p-6 flex items-center justify-between gap-4 hover:bg-muted/5 transition-colors text-left">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-black italic text-xl">
                        {rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`}
                    </div>
                    <div>
                        <h3 className="text-xl font-black italic text-foreground">{data.team_name}</h3>
                        <p className="text-muted text-sm font-medium">{data.member_count} members · {data.team_projects_count} projects</p>
                    </div>
                </div>
                <div className="flex items-center gap-6">
                    <div className="hidden sm:flex flex-col items-end">
                        <span className="text-[9px] font-black text-muted uppercase tracking-widest">Active Services</span>
                        <span className="text-sm font-black italic text-foreground">{data.team_service_count}</span>
                    </div>
                    <span className="text-muted">{expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}</span>
                </div>
            </button>
            {expanded && (
                <div className="border-t border-border p-6 bg-muted/5">
                    <SingleTeamPanel data={data} showTitle={false} />
                </div>
            )}
        </motion.div>
    );
};

// ── Main Component ──
const TeamPerformance: React.FC = () => {
    const [rawData, setRawData] = useState<TeamPerformanceResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await getTeamPerformance();
                setRawData(data);
                setError(null);
            } catch (err) {
                console.error('Failed to fetch team performance:', err);
                setError("Unable to sync team performance data. Please ensure you have the required permissions.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <Loader2 className="animate-spin text-primary" size={48} />
                <p className="text-muted font-bold animate-pulse uppercase tracking-widest text-sm">Syncing Team Data...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 text-center px-4">
                <div className="w-20 h-20 rounded-3xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                    <Users size={40} />
                </div>
                <div>
                    <h2 className="text-2xl font-black italic text-foreground">Team Sync Issue</h2>
                    <p className="text-muted font-medium max-w-md mx-auto mt-2">{error}</p>
                </div>
                <button onClick={() => window.location.reload()} className="px-8 py-3 bg-primary text-white font-black rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2">
                    <Clock size={18} /> RETRY SYNC
                </button>
            </div>
        );
    }

    if (!rawData) return null;

    return (
        <div className="max-w-7xl mx-auto py-8 px-4 lg:px-8 space-y-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary"><Users size={28} /></div>
                        <h1 className="text-4xl font-black italic text-foreground tracking-tight">Team Overview</h1>
                    </div>
                    <p className="text-muted font-medium text-lg">
                        Tracking <span className="text-foreground font-black italic">{rawData.total_teams} teams</span> and their current assignment status.
                    </p>
                </div>
            </div>

            {/* Global Stats Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Total Teams', value: rawData.total_teams, icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
                    { label: 'Pending', value: rawData.total_pending, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-500/10' },
                    { label: 'In Progress', value: rawData.total_inprogress, icon: TrendingUp, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
                    { label: 'Completed', value: rawData.total_completed, icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                ].map((stat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-card border border-border rounded-3xl p-6 shadow-sm border-b-4"
                        style={{ borderBottomColor: `var(--${stat.color.split('-')[1]}-500)` }}
                    >
                        <div className={`w-10 h-10 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center mb-4`}>
                            <stat.icon size={20} />
                        </div>
                        <p className="text-muted text-[10px] font-black uppercase tracking-[0.2em] mb-1">{stat.label}</p>
                        <p className="text-3xl font-black italic text-foreground">{stat.value}</p>
                    </motion.div>
                ))}
            </div>

            {/* Individual team cards */}
            <div className="space-y-6">
                <h3 className="text-xl font-black italic flex items-center gap-3">
                    <ListTodo className="text-primary" size={24} />
                    Active Teams
                </h3>
                <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
                    {(rawData.teams || []).map((team, i) => (
                        <TeamCard key={team.team_id} data={team} rank={i + 1} />
                    ))}
                </motion.div>
                
                {(!rawData.teams || rawData.teams.length === 0) && (
                    <div className="text-center py-20 bg-muted/5 border border-dashed border-border rounded-[3rem]">
                        <Users className="mx-auto text-muted/20 mb-4" size={64} />
                        <h3 className="text-xl font-black italic text-muted">No teams found</h3>
                        <p className="text-muted text-sm font-medium">Your current view doesn't have any teams assigned.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TeamPerformance;

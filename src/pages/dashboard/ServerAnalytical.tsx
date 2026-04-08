import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Server, Layout, FilterX, Users, AlertTriangle, Calendar } from 'lucide-react';
import { Doughnut } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
} from 'chart.js';
import type { ServerAnalyticsResponse } from './dashboardService';

ChartJS.register(ArcElement, Tooltip, Legend);

interface ServerAnalyticalProps {
    serverData: ServerAnalyticsResponse;
}

type ServerFilterType = 'all' | 'active' | 'expired' | 'paid' | 'unpaid';

const CHART_COLORS = ['#818cf8', '#34d399', '#fb7185', '#60a5fa', '#f59e0b', '#a78bfa'];

const ServerAnalytical: React.FC<ServerAnalyticalProps> = ({ serverData }) => {
    const [activeFilter, setActiveFilter] = useState<ServerFilterType>('all');

    const filteredServers = serverData.servers_list?.filter(server => {
        if (activeFilter === 'all') return true;
        if (activeFilter === 'active') return server.status?.toLowerCase() === 'active';
        if (activeFilter === 'expired') return server.status?.toLowerCase() !== 'active';
        if (activeFilter === 'paid') return server.payment_status?.toLowerCase() === 'paid';
        if (activeFilter === 'unpaid') return server.payment_status?.toLowerCase() !== 'paid';
        return true;
    });

    // Donut chart for server type
    const serverTypeChart = {
        labels: serverData.by_server_type.map(t => t.server_type),
        datasets: [{ data: serverData.by_server_type.map(t => t.count), backgroundColor: CHART_COLORS, borderColor: 'transparent', borderWidth: 0, hoverOffset: 8 }],
    };

    // Donut chart for active vs expired
    const activeExpiredChart = {
        labels: ['Active', 'Expired'],
        datasets: [{ data: [serverData.overview.active_servers, serverData.overview.expired_servers], backgroundColor: ['#34d399', '#fb7185'], borderColor: 'transparent', borderWidth: 0, hoverOffset: 6 }],
    };

    // Donut chart for paid vs unpaid
    const paidUnpaidChart = {
        labels: ['Paid', 'Unpaid'],
        datasets: [{ data: [serverData.overview.paid_servers, serverData.overview.unpaid_servers], backgroundColor: ['#818cf8', '#fb7185'], borderColor: 'transparent', borderWidth: 0, hoverOffset: 6 }],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '72%',
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: 'hsl(var(--card))',
                titleColor: 'hsl(var(--foreground))',
                bodyColor: 'hsl(var(--muted-foreground))',
                borderColor: 'hsl(var(--border))',
                borderWidth: 1,
                padding: 10,
                cornerRadius: 12,
            },
        },
        animation: { animateRotate: true, duration: 900 },
    };

    return (
        <div className="space-y-6">

            {/* ── Row 1: Three Stat Cards with Charts ── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                {/* Total Assets + Mini Donut */}
                <motion.div
                    whileHover={{ y: -2 }}
                    onClick={() => setActiveFilter('all')}
                    className={`bg-card border rounded-2xl p-5 shadow-lg cursor-pointer transition-all select-none flex items-center gap-4 ${activeFilter === 'all' ? 'border-indigo-500/60 ring-1 ring-indigo-500/30' : 'border-border/50 hover:border-border'}`}
                >
                    <div className="relative w-20 h-20 flex-shrink-0">
                        <Doughnut data={activeExpiredChart} options={chartOptions as never} />
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <p className="text-xl font-black text-foreground leading-none">{serverData.overview.total_servers}</p>
                        </div>
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Total Assets</p>
                        <button
                            onClick={e => { e.stopPropagation(); setActiveFilter('active'); }}
                            className={`block w-full text-left text-[10px] font-bold px-2 py-0.5 rounded-md border mb-1 transition-all ${activeFilter === 'active' ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20'}`}
                        >
                            {serverData.overview.active_servers} Active
                        </button>
                        <button
                            onClick={e => { e.stopPropagation(); setActiveFilter('expired'); }}
                            className={`block w-full text-left text-[10px] font-bold px-2 py-0.5 rounded-md border transition-all ${activeFilter === 'expired' ? 'bg-rose-500 text-white border-rose-500' : 'bg-rose-500/10 text-rose-500 border-rose-500/20 hover:bg-rose-500/20'}`}
                        >
                            {serverData.overview.expired_servers} Expired
                        </button>
                    </div>
                </motion.div>

                {/* Total Cost + Mini Donut */}
                <motion.div whileHover={{ y: -2 }} className="bg-card border border-border/50 rounded-2xl p-5 shadow-lg transition-all flex items-center gap-4">
                    <div className="relative w-20 h-20 flex-shrink-0">
                        <Doughnut data={paidUnpaidChart} options={chartOptions as never} />
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest leading-none">Cost</p>
                        </div>
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Cost</p>
                        <p className="text-lg font-black text-foreground truncate">
                            {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(serverData.overview.total_cost)}
                        </p>
                        <div className="mt-2 flex gap-1.5 flex-wrap">
                            <button
                                onClick={() => setActiveFilter('paid')}
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-md border transition-all ${activeFilter === 'paid' ? 'bg-indigo-500 text-white border-indigo-500' : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20 hover:bg-indigo-500/20'}`}
                            >
                                {serverData.overview.paid_servers} Paid
                            </button>
                            <button
                                onClick={() => setActiveFilter('unpaid')}
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-md border transition-all ${activeFilter === 'unpaid' ? 'bg-rose-500 text-white border-rose-500' : 'bg-rose-500/10 text-rose-500 border-rose-500/20 hover:bg-rose-500/20'}`}
                            >
                                {serverData.overview.unpaid_servers} Unpaid
                            </button>
                        </div>
                    </div>
                </motion.div>

                {/* Server Type Donut Chart */}
                <motion.div whileHover={{ y: -2 }} className="bg-card border border-border/50 rounded-2xl p-5 shadow-lg flex items-center gap-4">
                    <div className="relative w-28 h-28 flex-shrink-0">
                        <Doughnut data={serverTypeChart} options={chartOptions as never} />
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <Server size={16} className="text-indigo-400 mb-0.5" />
                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Types</span>
                        </div>
                    </div>
                    <div className="flex-1 space-y-2">
                        <p className="text-[10px] font-black text-foreground uppercase tracking-widest mb-3">Server Type</p>
                        {serverData.by_server_type.map((type, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: CHART_COLORS[idx % CHART_COLORS.length] }} />
                                <span className="text-[10px] font-bold text-foreground uppercase flex-1 truncate">{type.server_type}</span>
                                <span className="text-[10px] font-black text-slate-500">{type.count}</span>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* ── Row 2: Accrued By + Expiring Soon ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Accrued By */}
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-2xl p-6 shadow-lg">
                    <h2 className="text-[10px] font-black text-foreground uppercase tracking-widest mb-5 flex items-center gap-2 border-b border-border pb-4">
                        <Users size={13} className="text-indigo-400" /> Accrued By
                    </h2>
                    <div className="space-y-3">
                        {serverData.by_accrued_by.length === 0 && (
                            <p className="text-[10px] text-slate-500 uppercase tracking-widest text-center py-6">No data</p>
                        )}
                        {serverData.by_accrued_by.map((acc, idx) => {
                            const pct = serverData.overview.total_servers > 0
                                ? Math.round((acc.count / serverData.overview.total_servers) * 100)
                                : 0;
                            return (
                                <div key={idx} className="space-y-1.5">
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                            <div className="w-7 h-7 rounded-lg bg-indigo-500/5 border border-indigo-500/10 flex items-center justify-center">
                                                <span className="text-[10px] font-black text-indigo-400 uppercase">{acc.accrued_by.charAt(0)}</span>
                                            </div>
                                            <p className="text-xs font-black text-foreground uppercase">{acc.accrued_by}</p>
                                        </div>
                                        <span className="text-xs font-black text-foreground">{acc.count} <span className="text-[9px] text-slate-500 font-bold">instances</span></span>
                                    </div>
                                    {/* Animated progress bar */}
                                    <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${pct}%` }}
                                            transition={{ duration: 0.8, delay: idx * 0.1, ease: 'easeOut' }}
                                            className="h-full rounded-full"
                                            style={{ backgroundColor: CHART_COLORS[idx % CHART_COLORS.length] }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </motion.div>

                {/* Expiring Soon */}
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card border border-border rounded-2xl overflow-hidden shadow-lg flex flex-col">
                    <h2 className="px-6 py-4 text-[10px] font-black text-foreground uppercase tracking-widest border-b border-border flex items-center gap-2">
                        <AlertTriangle size={13} className="text-rose-400" /> Server Expiry Soon
                    </h2>
                    <div className="divide-y divide-border/50 overflow-y-auto max-h-56 flex-1">
                        {serverData.expiring_soon.length === 0 && (
                            <div className="p-10 flex flex-col items-center text-center">
                                <Calendar size={28} className="text-slate-500/20 mb-2" />
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">No expiries soon</p>
                            </div>
                        )}
                        {serverData.expiring_soon.map((s, idx) => (
                            <motion.div
                                key={s.id}
                                initial={{ opacity: 0, x: -8 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.06 }}
                                className="px-6 py-4 flex items-center justify-between hover:bg-muted/20 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-xl bg-rose-500/5 border border-rose-500/10 flex items-center justify-center">
                                        <Server size={14} className="text-rose-400" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-black text-foreground uppercase tracking-tight">{s.name}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-slate-500/10 border border-slate-500/20 px-2 py-0.5 rounded">
                                                {s.server_type}
                                            </span>
                                            {s.project && (
                                                <span className="text-[9px] font-bold text-indigo-400 uppercase flex items-center gap-1">
                                                    <Layout size={10} /> {s.project}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-black text-rose-500 tabular-nums">{new Date(s.expiration_date).toLocaleDateString()}</p>
                                    <p className={`text-[9px] font-bold uppercase tracking-widest mt-0.5 ${s.days_until_expiry != null && s.days_until_expiry < 0 ? 'text-rose-600' : 'text-slate-500'}`}>
                                        {s.days_until_expiry != null
                                            ? (s.days_until_expiry < 0 
                                                ? `Overdue by ${Math.abs(s.days_until_expiry)} days` 
                                                : `${s.days_until_expiry} days left`)
                                            : 'Expires'}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* ── Row 3: Detailed Server Cards ── */}
            {serverData.servers_list && serverData.servers_list.length > 0 && (
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h2 className="text-[11px] font-black text-foreground uppercase tracking-widest flex items-center gap-2">
                            <Server size={13} className="text-indigo-400" />
                            {activeFilter !== 'all' ? `${activeFilter} Servers` : 'All Servers'}
                            <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[9px] font-black px-2 py-0.5 rounded-full">{filteredServers?.length ?? 0}</span>
                        </h2>
                        {activeFilter !== 'all' && (
                            <button
                                onClick={() => setActiveFilter('all')}
                                className="flex items-center gap-1.5 text-[9px] font-bold text-slate-400 hover:text-foreground uppercase tracking-widest transition-colors"
                            >
                                <FilterX size={11} /> Clear Filter
                            </button>
                        )}
                    </div>

                    <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <AnimatePresence mode="popLayout">
                            {filteredServers?.map((server, idx) => (
                                <motion.div
                                    layout
                                    key={server.id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ type: 'spring', stiffness: 300, damping: 28, delay: idx * 0.05 }}
                                    className="bg-card border border-border/50 rounded-2xl p-5 shadow-md hover:shadow-xl hover:border-border transition-all group"
                                >
                                    <div className="flex justify-between items-start mb-5">
                                        <div className="min-w-0">
                                            <p className="text-base font-black text-foreground uppercase tracking-tight truncate">{server.name}</p>
                                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-slate-500/10 border border-slate-500/20 px-2 py-0.5 rounded mt-2 inline-block">
                                                {server.server_type}
                                            </span>
                                        </div>
                                        <div className="w-10 h-10 rounded-xl bg-indigo-500/5 border border-indigo-500/10 flex items-center justify-center group-hover:bg-indigo-500/10 transition-colors flex-shrink-0">
                                            <Server size={18} className="text-indigo-400" />
                                        </div>
                                    </div>

                                    <div className="space-y-2.5 text-[11px]">
                                        <div className="flex justify-between">
                                            <span className="text-slate-500 font-bold uppercase tracking-widest text-[9px]">Project</span>
                                            {server.project ? (
                                                <span className="font-black text-indigo-400 uppercase flex items-center gap-1"><Layout size={9} />{server.project}</span>
                                            ) : (
                                                <span className="text-slate-400 italic">—</span>
                                            )}
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-500 font-bold uppercase tracking-widest text-[9px]">Purchase / Expiry</span>
                                            <div className="text-right">
                                                <p className="font-black text-foreground">
                                                    {server.purchase_date ? new Date(server.purchase_date).toLocaleDateString() : '—'} / {new Date(server.expiration_date).toLocaleDateString()}
                                                </p>
                                                {server.days_until_expiry != null && (
                                                    <p className={`text-[9px] font-bold uppercase tracking-widest mt-0.5 ${server.days_until_expiry < 0 ? 'text-rose-600' : 'text-slate-500'}`}>
                                                        {server.days_until_expiry < 0 
                                                            ? `Overdue: ${Math.abs(server.days_until_expiry)} days` 
                                                            : `${server.days_until_expiry} days left`}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        {server.purchased_from && (
                                            <div className="flex justify-between">
                                                <span className="text-slate-500 font-bold uppercase tracking-widest text-[9px]">Purchased From</span>
                                                <span className="font-black text-foreground uppercase">{server.purchased_from}</span>
                                            </div>
                                        )}
                                        {server.accrued_by && (
                                            <div className="flex justify-between">
                                                <span className="text-slate-500 font-bold uppercase tracking-widest text-[9px]">Accrued By</span>
                                                <span className="font-black text-foreground uppercase">{server.accrued_by}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-center justify-between mt-5 pt-4 border-t border-border/50">
                                        <div className="flex gap-2">
                                            <span className={`text-[9px] font-black px-2 py-0.5 rounded-md border shadow-sm transition-colors ${
                                                (server.effective_status || server.status)?.toLowerCase() === 'active' 
                                                    ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                                                    : 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                                            }`}>
                                                {(server.effective_status || server.status).toUpperCase()}
                                            </span>
                                            <span className={`text-[9px] font-black px-2 py-0.5 rounded-md border shadow-sm transition-colors ${
                                                server.payment_status?.toLowerCase() === 'paid' 
                                                    ? 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20' 
                                                    : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                                            }`}>
                                                {server.payment_status?.toUpperCase() || 'UNPAID'}
                                            </span>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-sm font-black text-foreground tabular-nums">
                                                {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(server.cost || 0)}
                                            </span>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </motion.div>

                    {filteredServers?.length === 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="border border-dashed border-border/50 rounded-2xl p-12 flex flex-col items-center text-center"
                        >
                            <Server size={32} className="text-slate-500/20 mb-3" />
                            <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest">No servers match</p>
                            <p className="text-[9px] font-bold text-slate-500/40 mt-1 uppercase tracking-widest">Try a different filter</p>
                        </motion.div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ServerAnalytical;

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Globe, Layout, FilterX, Users, AlertTriangle, Calendar, ShieldCheck, ArrowRight, MousePointer2 } from 'lucide-react';
import { Doughnut } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
} from 'chart.js';
import type { DomainAnalyticsResponse } from './dashboardService';

ChartJS.register(ArcElement, Tooltip, Legend);

interface DomainAnalyticalProps {
    domainData: DomainAnalyticsResponse;
}

type DomainFilterType = 'all' | 'active' | 'expired' | 'paid' | 'unpaid';

const CHART_COLORS = ['#818cf8', '#34d399', '#fb7185', '#60a5fa', '#f59e0b', '#a78bfa'];

const DomainAnalytical: React.FC<DomainAnalyticalProps> = ({ domainData }) => {
    const [activeFilter, setActiveFilter] = useState<DomainFilterType>('all');
    const navigate = useNavigate();

    if (domainData.overview.total_domains === 0) {
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
                            <Globe size={48} className="text-primary group-hover:scale-110 transition-transform duration-500" />
                        </div>

                        <h2 className="text-3xl font-black text-foreground tracking-tight mb-4 uppercase">
                            No Domains Detected
                        </h2>

                        <p className="text-slate-500 text-lg max-w-xl mx-auto mb-10 font-medium">
                            Your domain ecosystem is currently empty. To see detailed analytics and tracking, you need to register your project domains first.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-3xl mb-12">
                            {[
                                { icon: <MousePointer2 size={18} />, title: "Step 1", desc: "Go to Projects section" },
                                { icon: <Layout size={18} />, title: "Step 2", desc: "Select the target Project" },
                                { icon: <Globe size={18} />, title: "Step 3", desc: "Add Domain in Infrastructure" }
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
                            onClick={() => navigate('/projects')}
                            className="group relative px-10 py-5 bg-primary hover:bg-primary-hover text-white font-black uppercase text-sm rounded-[2rem] transition-all shadow-xl shadow-primary/25 flex items-center gap-3 active:scale-95"
                        >
                            <Layout size={20} className="group-hover:scale-110 transition-transform" />
                            <span>Navigate to Projects</span>
                            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                        </button>

                        <p className="mt-8 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] opacity-40">
                            Analytics will sync automatically after registration
                        </p>
                    </div>
                </div>
            </motion.div>
        );
    }

    const filteredDomains = domainData.domains_list?.filter(domain => {
        if (activeFilter === 'all') return true;
        if (activeFilter === 'active') return domain.status?.toLowerCase() === 'active';
        if (activeFilter === 'expired') return domain.status?.toLowerCase() !== 'active';
        if (activeFilter === 'paid') return domain.payment_status?.toLowerCase() === 'paid';
        if (activeFilter === 'unpaid') return domain.payment_status?.toLowerCase() !== 'paid';
        return true;
    });

    // Donut chart for accrued by distribution (since domains don't have 'types' like servers)
    const accruedByChart = {
        labels: domainData.by_accrued_by.map(a => a.accrued_by),
        datasets: [{
            data: domainData.by_accrued_by.map(a => a.count),
            backgroundColor: CHART_COLORS,
            borderColor: 'transparent',
            borderWidth: 0,
            hoverOffset: 8,
        }],
    };

    // Donut chart for active vs expired
    const activeExpiredChart = {
        labels: ['Active', 'Expired'],
        datasets: [{
            data: [domainData.overview.active_domains, domainData.overview.expired_domains],
            backgroundColor: ['#34d399', '#fb7185'],
            borderColor: 'transparent',
            borderWidth: 0,
            hoverOffset: 6,
        }],
    };

    // Donut chart for paid vs unpaid
    const paidUnpaidChart = {
        labels: ['Paid', 'Unpaid'],
        datasets: [{
            data: [domainData.overview.paid_domains, domainData.overview.unpaid_domains],
            backgroundColor: ['#818cf8', '#fb7185'],
            borderColor: 'transparent',
            borderWidth: 0,
            hoverOffset: 6,
        }],
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
                            <p className="text-xl font-black text-foreground leading-none">{domainData.overview.total_domains}</p>
                        </div>
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Total Domains</p>
                        <button
                            onClick={e => { e.stopPropagation(); setActiveFilter('active'); }}
                            className={`block w-full text-left text-[10px] font-bold px-2 py-0.5 rounded-md border mb-1 transition-all ${activeFilter === 'active' ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20'}`}
                        >
                            {domainData.overview.active_domains} Active
                        </button>
                        <button
                            onClick={e => { e.stopPropagation(); setActiveFilter('expired'); }}
                            className={`block w-full text-left text-[10px] font-bold px-2 py-0.5 rounded-md border transition-all ${activeFilter === 'expired' ? 'bg-rose-500 text-white border-rose-500' : 'bg-rose-500/10 text-rose-500 border-rose-500/20 hover:bg-rose-500/20'}`}
                        >
                            {domainData.overview.expired_domains} Expired
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
                            {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(domainData.overview.total_cost)}
                        </p>
                        <div className="mt-2 flex gap-1.5 flex-wrap">
                            <button
                                onClick={() => setActiveFilter('paid')}
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-md border transition-all ${activeFilter === 'paid' ? 'bg-indigo-500 text-white border-indigo-500' : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20 hover:bg-indigo-500/20'}`}
                            >
                                {domainData.overview.paid_domains} Paid
                            </button>
                            <button
                                onClick={() => setActiveFilter('unpaid')}
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-md border transition-all ${activeFilter === 'unpaid' ? 'bg-rose-500 text-white border-rose-500' : 'bg-rose-500/10 text-rose-500 border-rose-500/20 hover:bg-rose-500/20'}`}
                            >
                                {domainData.overview.unpaid_domains} Unpaid
                            </button>
                        </div>
                    </div>
                </motion.div>

                {/* Accrued By Donut Chart */}
                <motion.div whileHover={{ y: -2 }} className="bg-card border border-border/50 rounded-2xl p-5 shadow-lg flex items-center gap-4">
                    <div className="relative w-28 h-28 flex-shrink-0">
                        <Doughnut data={accruedByChart} options={chartOptions as never} />
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <ShieldCheck size={16} className="text-indigo-400 mb-0.5" />
                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Ownership</span>
                        </div>
                    </div>
                    <div className="flex-1 space-y-2">
                        <p className="text-[10px] font-black text-foreground uppercase tracking-widest mb-3">Accrued By</p>
                        {domainData.by_accrued_by.map((acc, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: CHART_COLORS[idx % CHART_COLORS.length] }} />
                                <span className="text-[10px] font-bold text-foreground uppercase flex-1 truncate">{acc.accrued_by}</span>
                                <span className="text-[10px] font-black text-slate-500">{acc.count}</span>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* ── Row 2: Accrued By Progress + Expiring Soon ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Accrued By Detailed List */}
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-2xl p-6 shadow-lg">
                    <h2 className="text-[10px] font-black text-foreground uppercase tracking-widest mb-5 flex items-center gap-2 border-b border-border pb-4">
                        <Users size={13} className="text-indigo-400" /> Ownership Distribution
                    </h2>
                    <div className="space-y-3">
                        {domainData.by_accrued_by.length === 0 && (
                            <p className="text-[10px] text-slate-500 uppercase tracking-widest text-center py-6">No data</p>
                        )}
                        {domainData.by_accrued_by.map((acc, idx) => {
                            const pct = domainData.overview.total_domains > 0
                                ? Math.round((acc.count / domainData.overview.total_domains) * 100)
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
                                        <span className="text-xs font-black text-foreground">{acc.count} <span className="text-[9px] text-slate-500 font-bold">domains</span></span>
                                    </div>
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

                {/* Domain Expiry Soon */}
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card border border-border rounded-2xl overflow-hidden shadow-lg flex flex-col">
                    <h2 className="px-6 py-4 text-[10px] font-black text-foreground uppercase tracking-widest border-b border-border flex items-center gap-2">
                        <AlertTriangle size={13} className="text-rose-400" /> Domain Expiry Soon
                    </h2>
                    <div className="divide-y divide-border/50 overflow-y-auto max-h-56 flex-1">
                        {domainData.expiring_soon.length === 0 && (
                            <div className="p-10 flex flex-col items-center text-center">
                                <Calendar size={28} className="text-slate-500/20 mb-2" />
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Perfect! No expiries soon</p>
                            </div>
                        )}
                        {domainData.expiring_soon.map((d, idx) => (
                            <motion.div
                                key={d.id}
                                initial={{ opacity: 0, x: -8 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.06 }}
                                className="px-6 py-4 flex items-center justify-between hover:bg-muted/20 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-xl bg-rose-500/5 border border-rose-500/10 flex items-center justify-center">
                                        <Globe size={14} className="text-rose-400" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-xs font-black text-foreground uppercase tracking-tight truncate">{d.domain}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            {d.project && (
                                                <span className="text-[9px] font-bold text-indigo-400 uppercase flex items-center gap-1">
                                                    <Layout size={10} /> {d.project}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-black text-rose-500 tabular-nums">{new Date(d.expiration_date).toLocaleDateString()}</p>
                                    <p className={`text-[9px] font-bold uppercase tracking-widest mt-0.5 ${d.days_until_expiry != null && d.days_until_expiry < 0 ? 'text-rose-600' : 'text-slate-500'}`}>
                                        {d.days_until_expiry != null
                                            ? (d.days_until_expiry < 0
                                                ? `Overdue: ${Math.abs(d.days_until_expiry)} days`
                                                : `${d.days_until_expiry} days left`)
                                            : 'Expires'}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* ── Row 3: Detailed Domain Cards ── */}
            {domainData.domains_list && domainData.domains_list.length > 0 && (
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h2 className="text-[11px] font-black text-foreground uppercase tracking-widest flex items-center gap-2">
                            <Globe size={13} className="text-indigo-400" />
                            {activeFilter !== 'all' ? `${activeFilter} Domains` : 'All Domain Assets'}
                            <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[9px] font-black px-2 py-0.5 rounded-full">{filteredDomains?.length ?? 0}</span>
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
                            {filteredDomains?.map((domain, idx) => (
                                <motion.div
                                    layout
                                    key={domain.id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ type: 'spring', stiffness: 300, damping: 28, delay: idx * 0.05 }}
                                    className="bg-card border border-border/50 rounded-2xl p-5 shadow-md hover:shadow-xl hover:border-border transition-all group"
                                >
                                    <div className="flex justify-between items-start mb-5">
                                        <div className="min-w-0">
                                            <p className="text-base font-black text-foreground uppercase tracking-tight truncate">{domain.domain}</p>
                                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-slate-500/10 border border-slate-500/20 px-2 py-0.5 rounded mt-2 inline-block">
                                                Domain Asset
                                            </span>
                                        </div>
                                        <div className="w-10 h-10 rounded-xl bg-indigo-500/5 border border-indigo-500/10 flex items-center justify-center group-hover:bg-indigo-500/10 transition-colors flex-shrink-0">
                                            <Globe size={18} className="text-indigo-400" />
                                        </div>
                                    </div>

                                    <div className="space-y-2.5 text-[11px]">
                                        <div className="flex justify-between">
                                            <span className="text-slate-500 font-bold uppercase tracking-widest text-[9px]">Project</span>
                                            {domain.project ? (
                                                <span className="font-black text-indigo-400 uppercase flex items-center gap-1"><Layout size={9} />{domain.project}</span>
                                            ) : (
                                                <span className="text-slate-400 italic">—</span>
                                            )}
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-500 font-bold uppercase tracking-widest text-[9px]">Purchase / Expiry</span>
                                            <div className="text-right">
                                                <p className="font-black text-foreground">
                                                    {domain.purchase_date ? new Date(domain.purchase_date).toLocaleDateString() : '—'} / {new Date(domain.expiration_date).toLocaleDateString()}
                                                </p>
                                                {domain.days_until_expiry != null && (
                                                    <p className={`text-[9px] font-bold uppercase tracking-widest mt-0.5 ${domain.days_until_expiry < 0 ? 'text-rose-600' : 'text-slate-500'}`}>
                                                        {domain.days_until_expiry < 0
                                                            ? `Overdue: ${Math.abs(domain.days_until_expiry)} days`
                                                            : `${domain.days_until_expiry} days left`}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        {domain.purchased_from && (
                                            <div className="flex justify-between">
                                                <span className="text-slate-500 font-bold uppercase tracking-widest text-[9px]">Registrar</span>
                                                <span className="font-black text-foreground uppercase">{domain.purchased_from}</span>
                                            </div>
                                        )}
                                        {domain.accrued_by && (
                                            <div className="flex justify-between">
                                                <span className="text-slate-500 font-bold uppercase tracking-widest text-[9px]">Ownership</span>
                                                <span className="font-black text-foreground uppercase">{domain.accrued_by}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-center justify-between mt-5 pt-4 border-t border-border/50">
                                        <div className="flex gap-2">
                                            <span className={`text-[9px] font-black px-2 py-0.5 rounded-md border shadow-sm transition-colors ${(domain.effective_status || domain.status)?.toLowerCase() === 'active'
                                                    ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                                                    : 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                                                }`}>
                                                {(domain.effective_status || domain.status || 'Active').toUpperCase()}
                                            </span>
                                            <span className={`text-[9px] font-black px-2 py-0.5 rounded-md border shadow-sm transition-colors ${domain.payment_status?.toLowerCase() === 'paid'
                                                    ? 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20'
                                                    : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                                                }`}>
                                                {domain.payment_status?.toUpperCase() || 'UNPAID'}
                                            </span>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-sm font-black text-foreground tabular-nums">
                                                {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(domain.cost || 0)}
                                            </span>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </motion.div>

                    {filteredDomains?.length === 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="border border-dashed border-border/50 rounded-2xl p-12 flex flex-col items-center text-center"
                        >
                            <Globe size={32} className="text-slate-500/20 mb-3" />
                            <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest">No domains found</p>
                            <p className="text-[9px] font-bold text-slate-500/40 mt-1 uppercase tracking-widest">Try clearing the search filter</p>
                        </motion.div>
                    )}
                </div>
            )}
        </div>
    );
};

export default DomainAnalytical;

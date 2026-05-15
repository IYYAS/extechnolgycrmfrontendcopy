import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
    Users, 
    Target, 
    Calendar, 
    Clock, 
    AlertCircle, 
    Plus, 
    TrendingUp, 
    PieChart as PieChartIcon, 
    BarChart3,
    ArrowRight,
    Loader2
} from 'lucide-react';
import { leadService } from './leadService';
import type { LeadDashboardStats } from './lead';
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
import { Doughnut, Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

const LeadDashboard: React.FC = () => {
    const [stats, setStats] = useState<LeadDashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await leadService.getDashboardStats();
                setStats(data);
            } catch (error) {
                console.error('Failed to fetch lead stats:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);


    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
                <Loader2 className="animate-spin text-primary" size={48} />
                <p className="text-muted font-bold animate-pulse">Loading Lead Analytics...</p>
            </div>
        );
    }

    const interestChartData = {
        labels: ['HOT', 'WARM', 'COLD'],
        datasets: [{
            data: [
                stats?.interest_stats?.hot || 0,
                stats?.interest_stats?.warm || 0,
                stats?.interest_stats?.cold || 0,
            ],
            backgroundColor: ['#ef4444', '#f59e0b', '#3b82f6'], // Red, Amber, Blue
            borderWidth: 0,
            hoverOffset: 10
        }]
    };

    const funnelLabels = ['NEW', 'CONTACTED', 'PROPOSAL_SENT', 'NEGOTIATION', 'APPROVED', 'CLOSED', 'DENIED'];
    const statusChartData = {
        labels: funnelLabels.map(l => l.replace('_', ' ')),
        datasets: [{
            label: 'Leads Count',
            data: funnelLabels.map(l => stats?.status_stats?.[l.toLowerCase()] || 0),
            backgroundColor: 'rgba(99, 102, 241, 0.5)',
            borderColor: '#6366f1',
            borderWidth: 2,
            borderRadius: 8,
        }]
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700 pb-10">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-4">
                    <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
                        <Target size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black tracking-tight text-foreground uppercase">
                            Lead Dashboard
                        </h1>
                        <p className="text-muted text-xs font-medium italic">Marketing pipeline & sales metrics.</p>
                    </div>
                </div>
                <button
                    onClick={() => navigate('/leads/new')}
                    className="flex items-center space-x-2 px-6 py-2.5 bg-primary hover:bg-primary-hover text-white font-black rounded-xl transition-all shadow-lg text-sm"
                >
                    <Plus size={16} />
                    <span>Create Lead</span>
                </button>
            </div>

            {/* Top Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <motion.div 
                    whileHover={{ y: -3 }}
                    className="p-5 bg-card border border-border rounded-2xl shadow-lg relative overflow-hidden group"
                >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 blur-2xl group-hover:bg-primary/10 transition-colors" />
                    <div className="flex items-center justify-between mb-3">
                        <div className="p-2 bg-primary/10 rounded-lg text-primary">
                            <Users size={20} />
                        </div>
                        <TrendingUp size={16} className="text-emerald-500 opacity-50" />
                    </div>
                    <p className="text-muted text-[10px] font-black uppercase tracking-widest leading-none">Total Leads</p>
                    <p className="text-2xl font-black text-foreground mt-1">{stats?.total_leads || 0}</p>
                </motion.div>

                <motion.div 
                    whileHover={{ y: -3 }}
                    onClick={() => navigate('/leads/list?upcoming=true')}
                    className="p-5 bg-card border border-border rounded-2xl shadow-lg relative overflow-hidden group cursor-pointer hover:border-blue-500/40 transition-all"
                >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 blur-2xl" />
                    <div className="flex items-center justify-between mb-3">
                        <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
                            <Calendar size={20} />
                        </div>
                        <Clock size={16} className="text-blue-500 opacity-50" />
                    </div>
                    <p className="text-muted text-[10px] font-black uppercase tracking-widest leading-none">Upcoming Follow-ups</p>
                    <p className="text-2xl font-black text-foreground mt-1">{stats?.upcoming_followups || 0}</p>
                    <p className="text-[10px] text-blue-500 font-bold mt-1 opacity-0 group-hover:opacity-100 transition-opacity">Click to view list →</p>
                </motion.div>

                <motion.div 
                    whileHover={{ y: -3 }}
                    onClick={() => navigate('/leads/list?overdue=true')}
                    className="p-5 bg-card border border-border rounded-2xl shadow-lg relative overflow-hidden group cursor-pointer hover:border-rose-500/40 transition-all"
                >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 blur-2xl" />
                    <div className="flex items-center justify-between mb-3">
                        <div className="p-2 bg-rose-500/10 rounded-lg text-rose-500">
                            <AlertCircle size={20} />
                        </div>
                        <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                    </div>
                    <p className="text-rose-500 text-[10px] font-black uppercase tracking-widest leading-none">Overdue Follow-ups</p>
                    <p className="text-2xl font-black text-foreground mt-1">{stats?.overdue_followups || 0}</p>
                    <p className="text-[10px] text-rose-500 font-bold mt-1 opacity-0 group-hover:opacity-100 transition-opacity">Click to view list →</p>
                </motion.div>

                <motion.div 
                    onClick={() => navigate('/leads/list')}
                    whileHover={{ y: -3 }}
                    className="p-5 bg-primary text-white rounded-2xl shadow-lg flex flex-col justify-between cursor-pointer group"
                >
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80 mb-1">Management</p>
                        <h3 className="text-xl font-black tracking-tight">View All Leads</h3>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                        <p className="text-[10px] font-bold opacity-70">Track progress</p>
                        <ArrowRight size={18} className="group-hover:translate-x-1.5 transition-transform" />
                    </div>
                </motion.div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Interest Distribution */}
                <div className="p-6 bg-card border border-border rounded-3xl shadow-xl flex flex-col items-center">
                    <div className="w-full flex items-center justify-between mb-6">
                        <h3 className="text-sm font-black text-foreground uppercase tracking-widest flex items-center gap-2">
                            <PieChartIcon className="text-primary" size={16} />
                            Interest Distribution
                        </h3>
                    </div>
                    <div className="w-full max-w-[240px] aspect-square relative cursor-pointer">
                        <Doughnut 
                            data={interestChartData}
                            options={{
                                cutout: '70%',
                                plugins: {
                                    legend: { position: 'bottom', labels: { font: { weight: 'bold', size: 10 }, padding: 10 } }
                                },
                                maintainAspectRatio: false,
                                onClick: (_, elements) => {
                                    if (elements.length > 0) {
                                        const index = elements[0].index;
                                        const label = interestChartData.labels[index].toLowerCase();
                                        navigate(`/leads/list?interest_level=${label}`);
                                    }
                                }
                            }}
                        />
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <p className="text-2xl font-black text-foreground">{stats?.total_leads || 0}</p>
                            <p className="text-[8px] font-bold text-muted uppercase">Total</p>
                        </div>
                    </div>
                </div>

                {/* Status Breakdown */}
                <div className="p-6 bg-card border border-border rounded-3xl shadow-xl">
                    <div className="w-full flex items-center justify-between mb-6">
                        <h3 className="text-sm font-black text-foreground uppercase tracking-widest flex items-center gap-2">
                            <BarChart3 className="text-indigo-500" size={16} />
                            Conversion Funnel
                        </h3>
                    </div>
                    <div className="h-[250px] cursor-pointer">
                        <Bar 
                            data={statusChartData}
                            options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: { legend: { display: false } },
                                scales: {
                                    y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { font: { weight: 'bold', size: 10 } } },
                                    x: { grid: { display: false }, ticks: { font: { weight: 'bold', size: 10 } } }
                                },
                                onClick: (_, elements) => {
                                    if (elements.length > 0) {
                                        const index = elements[0].index;
                                        const label = funnelLabels[index].toLowerCase();
                                        navigate(`/leads/list?conversion_status=${label}`);
                                    }
                                }
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="p-6 bg-muted/20 border border-border rounded-[2rem] text-center">
                <p className="text-muted text-xs font-bold uppercase tracking-[0.2em]">
                    Data synchronized with Lead Management CRM Backend • Last update: {new Date().toLocaleTimeString()}
                </p>
            </div>

        </div>
    );
};

export default LeadDashboard;

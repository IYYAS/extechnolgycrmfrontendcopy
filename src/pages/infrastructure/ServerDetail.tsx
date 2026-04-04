import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProjectServer, deleteProjectServer } from './serverService';
import type { ProjectServer } from './serverService';
import {
    ArrowLeft,
    Edit2,
    Trash2,
    Loader2,
    HardDrive,
    CreditCard,
    Calendar,
    Briefcase,
    Shield,
    Clock,
    Activity,
    ExternalLink,
    Building2,
    ChevronRight,
    Layers
} from 'lucide-react';

const ServerDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [server, setServer] = useState<ProjectServer | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (id) {
            fetchServer(parseInt(id));
        }
    }, [id]);

    const fetchServer = async (serverId: number) => {
        try {
            const data = await getProjectServer(serverId);
            setServer(data);
        } catch (err) {
            console.error('Failed to fetch server:', err);
            setError('Failed to load server details.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!server) return;
        if (!window.confirm(`Are you sure you want to delete server "${server.name}"?`)) return;

        try {
            await deleteProjectServer(server.id);
            navigate('/infrastructure/servers');
        } catch (err) {
            console.error('Failed to delete server:', err);
            alert('Failed to delete server.');
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <Loader2 className="animate-spin text-primary" size={48} />
                <p className="text-muted font-medium">Retrieving server information...</p>
            </div>
        );
    }

    if (error || !server) {
        return (
            <div className="max-w-4xl mx-auto py-12 text-center space-y-4">
                <div className="w-20 h-20 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto">
                    <Shield className="text-rose-500" size={40} />
                </div>
                <h2 className="text-2xl font-bold text-foreground">{error || 'Server not found'}</h2>
                <button onClick={() => navigate(-1)} className="px-6 py-2 bg-primary text-white rounded-xl">Go Back</button>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-500 mb-24">
            {/* Header / Actions */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="flex items-center gap-5">
                    <button onClick={() => navigate('/infrastructure/servers')} className="p-3 hover:bg-muted/10 rounded-2xl text-muted border border-border transition-all">
                        <ArrowLeft size={22} />
                    </button>
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border ${server.status.toLowerCase() === 'active' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border-rose-500/20'}`}>
                                {server.status}
                            </span>
                            <span className="text-muted text-xs font-bold opacity-60 uppercase tracking-widest">Server Record #{server.id}</span>
                        </div>
                        <h1 className="text-4xl font-black tracking-tight text-foreground uppercase">{server.name}</h1>
                    </div>
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <button onClick={() => navigate(`/infrastructure/servers/edit/${server.id}`)} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-muted/10 hover:bg-muted/20 text-foreground font-bold rounded-2xl transition-all border border-border">
                        <Edit2 size={18} /> Edit
                    </button>
                    <button onClick={handleDelete} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 font-bold rounded-2xl transition-all border border-rose-500/20">
                        <Trash2 size={18} /> Delete
                    </button>
                </div>
            </div>

            {/* Quick Stats Banner */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Type', value: server.server_type, icon: <HardDrive size={18}/>, color: 'text-blue-500' },
                    { label: 'Cost', value: `₹${server.cost}`, icon: <CreditCard size={18}/>, color: 'text-emerald-500' },
                    { label: 'Accrued By', value: server.accrued_by, icon: <Building2 size={18}/>, color: 'text-indigo-500' },
                    { label: 'Expires', value: new Date(server.expiration_date).toLocaleDateString(), icon: <Clock size={18}/>, color: 'text-rose-500' }
                ].map((stat, i) => (
                    <div key={i} className="bg-card border border-border rounded-3xl p-5 shadow-sm">
                        <div className="flex items-center gap-3 mb-3 text-muted">
                            {stat.icon}
                            <span className="text-[10px] font-black uppercase tracking-widest">{stat.label}</span>
                        </div>
                        <p className={`text-lg font-black ${stat.color} truncate uppercase tracking-tight`}>{stat.value}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Identity */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-card border border-border rounded-3xl p-8 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none" />
                        
                        <div className="flex items-center gap-3 mb-8">
                            <Activity size={20} className="text-primary" />
                            <h3 className="text-xl font-bold text-foreground">Technical Specification</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <div>
                                    <p className="text-[10px] font-black text-muted uppercase tracking-widest mb-1.5">Managed By</p>
                                    <p className="text-base font-bold text-foreground">{server.accrued_by}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-muted uppercase tracking-widest mb-1.5">Purchase Entity</p>
                                    <p className="text-base font-bold text-foreground">{server.purchased_from}</p>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-[10px] font-black text-muted uppercase tracking-widest mb-1.5">Infrastructure Tier</p>
                                    <p className="text-base font-bold text-foreground">{server.server_type}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-muted uppercase tracking-widest mb-1.5">Current Status</p>
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${server.status.toLowerCase() === 'active' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                                        <p className="text-base font-bold text-foreground">{server.status}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Timeline */}
                    <div className="bg-card border border-border rounded-3xl p-8 shadow-sm">
                        <div className="flex items-center gap-3 mb-8">
                            <Calendar size={20} className="text-indigo-500" />
                            <h3 className="text-xl font-bold text-foreground">Lifecycle Timeline</h3>
                        </div>

                        <div className="flex flex-col md:flex-row items-center gap-12">
                            <div className="flex-1 text-center md:text-left">
                                <p className="text-[10px] font-black text-muted uppercase tracking-widest mb-2">Provisioned On</p>
                                <p className="text-2xl font-black text-foreground">{new Date(server.purchase_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                            </div>
                            <div className="hidden md:block flex-shrink-0 w-12 h-[2px] bg-border relative">
                                <ChevronRight className="absolute -right-2 -top-2 text-border" size={16} />
                            </div>
                            <div className="flex-1 text-center md:text-right">
                                <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-2">Service Deadline</p>
                                <p className="text-2xl font-black text-rose-500">{new Date(server.expiration_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar Info */}
                <div className="space-y-6">
                    {/* Finance Card */}
                    <div className="bg-[#0f1014] border border-emerald-500/20 rounded-3xl p-6 shadow-xl relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent pointer-events-none" />
                        <div className="flex items-center justify-between mb-6">
                            <CreditCard className="text-emerald-500" size={24} />
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${server.payment_status.toUpperCase() === 'PAID' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border-rose-500/20'}`}>
                                {server.payment_status}
                            </span>
                        </div>
                        <p className="text-[11px] font-black text-emerald-500/60 uppercase tracking-widest mb-1">Estimated Annual Cost</p>
                        <h4 className="text-4xl font-black text-white tracking-tighter mb-4">₹{server.cost}</h4>
                        <button className="w-full py-3 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 text-xs font-black uppercase tracking-widest rounded-2xl transition-all border border-emerald-500/20">
                            Download Ledger
                        </button>
                    </div>

                    {/* Project Association */}
                    <div className="bg-card border border-border rounded-3xl p-6 shadow-sm">
                        <div className="flex items-center gap-3 mb-6">
                            <Briefcase className="text-indigo-500" size={20} />
                            <h3 className="text-sm font-bold text-foreground">Project Association</h3>
                        </div>
                        
                        {server.project ? (
                            <div className="space-y-4">
                                <div className="p-4 bg-muted/5 border border-border rounded-2xl">
                                    <p className="text-[10px] font-black text-muted uppercase tracking-widest mb-1">Connected Project ID</p>
                                    <p className="text-base font-bold text-primary flex items-center gap-2">
                                        #{server.project}
                                        <ExternalLink size={14} className="opacity-60 cursor-pointer" onClick={() => navigate(`/projects/${server.project}`)}/>
                                    </p>
                                </div>
                                <p className="text-[10px] text-muted italic">This server is dedicated to the infrastructure of the associated project timeline.</p>
                            </div>
                        ) : (
                            <div className="py-6 text-center space-y-3">
                                <div className="w-12 h-12 bg-muted/10 rounded-full flex items-center justify-center mx-auto text-muted/40">
                                    <Layers size={24} />
                                </div>
                                <p className="text-xs font-bold text-muted uppercase tracking-widest">Shared Server</p>
                                <p className="text-[10px] text-muted px-4">This asset is currently part of the shared organizational resources.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ServerDetail;

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProject, deleteProject, type Project } from './projectService';
import {
    ArrowLeft,
    Calendar,
    Briefcase,
    User,
    Clock,
    DollarSign,
    Shield,
    Server,
    Globe,
    Users,
    Edit2,
    Loader2,
    ChevronRight,
    ChevronDown,
    Layers,
    TrendingUp,
    Trash2,
    FileText,
    Receipt,
    ClipboardList
} from 'lucide-react';

const ProjectDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [project, setProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [headerOpen, setHeaderOpen] = useState(true);

    const handleDelete = async () => {
        if (!project || !window.confirm(`Are you sure you want to delete this project? This action cannot be undone.`)) return;
        try {
            await deleteProject(project.id);
            navigate('/projects');
        } catch (err: any) {
            alert(err.response?.data?.detail || 'Failed to delete project.');
        }
    };

    useEffect(() => {
        const fetchProject = async () => {
            if (!id) return;
            setLoading(true);
            try {
                const data = await getProject(parseInt(id));
                setProject(data);
            } catch (err: any) {
                setError(err.response?.data?.detail || 'Failed to load project details.');
            } finally {
                setLoading(false);
            }
        };
        fetchProject();
    }, [id]);

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
            <Loader2 className="animate-spin text-primary" size={48} />
            <p className="text-muted font-medium">Loading project details...</p>
        </div>
    );

    if (error || !project) return (
        <div className="p-8 bg-card border border-border rounded-2xl text-center space-y-4">
            <div className="text-rose-500 text-4xl">⚠️</div>
            <h2 className="text-xl font-bold text-foreground">Error Loading Project</h2>
            <p className="text-muted">{error || 'Project not found.'}</p>
            <button onClick={() => navigate('/projects')} className="px-6 py-2 bg-primary text-white rounded-xl font-semibold">Back to Projects</button>
        </div>
    );

    // ── Shorthand accessors (using new plural field names) ──
    const baseInfo = project.project_base_informations?.[0];

    const getStatusStyles = (status: string) => {
        switch ((status || '').toLowerCase()) {
            case 'in progress': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
            case 'completed': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
            case 'pending': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
            default: return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
        }
    };

    const handleBillItem = (type: string, name: string, cost: string | number, purchaseDate: string = '', expiryDate: string = '') => {
        const busAddr = project.project_business_addresses?.[0]?.id || '';
        const params = new URLSearchParams({
            type,
            name,
            rate: cost.toString(),
            purchase_date: purchaseDate,
            expiry_date: expiryDate
        });
        const url = busAddr
            ? `/invoices/client/${busAddr}/new?${params.toString()}`
            : `/invoices/new?${params.toString()}`;
        window.open(url, '_blank');
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-500">
            {/* Action Bar */}
            <div className="flex items-center justify-between">
                <button onClick={() => navigate('/projects')} className="flex items-center space-x-2 text-muted hover:text-primary transition-colors font-medium">
                    <ArrowLeft size={18} />
                    <span>Back to Projects</span>
                </button>
                <div className="flex items-center space-x-3">
                    <button onClick={handleDelete} className="flex items-center space-x-2 px-4 py-2 bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 rounded-xl transition-all font-semibold border border-rose-500/20">
                        <Trash2 size={18} />
                        <span>Delete</span>
                    </button>
                    <button onClick={() => navigate(`/activities/new?project=${project.id}`)} className="flex items-center space-x-2 px-4 py-2 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 rounded-xl transition-all font-semibold border border-emerald-500/20">
                        <ClipboardList size={18} />
                        <span>Add Activity</span>
                    </button>
                    <button onClick={() => navigate(`/projects/edit/${project.id}`)} className="flex items-center space-x-2 px-4 py-2 bg-primary/10 text-primary hover:bg-primary/20 rounded-xl transition-all font-semibold border border-primary/20">
                        <Edit2 size={18} />
                        <span>Edit Project</span>
                    </button>
                </div>
            </div>

            {/* Header Card */}
            <div className="bg-card border border-border rounded-3xl relative overflow-hidden shadow-sm">
                <div className="p-8 pb-6 flex flex-col md:flex-row md:items-center gap-6 relative">
                    <div className="absolute top-6 right-6 flex items-center gap-3">
                        <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase border ${getStatusStyles(project.status)}`}>{project.status}</span>
                        <button onClick={() => setHeaderOpen(o => !o)} className="p-2 rounded-xl hover:bg-muted/10 transition-colors text-muted">
                            <ChevronDown size={20} className={`transition-transform duration-300 ${headerOpen ? 'rotate-180' : ''}`} />
                        </button>
                    </div>
                    <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                        <Briefcase size={40} />
                    </div>
                    <div className="space-y-1 pr-24">
                        <h1 className="text-4xl font-black tracking-tight text-foreground">{baseInfo?.name || 'Untitled Project'}</h1>
                        <div className="flex flex-wrap items-center gap-4 text-muted">
                            <div className="flex items-center gap-1.5"><User size={16} /><span className="text-sm font-medium">{baseInfo?.creator_name || 'System'}</span></div>
                            <div className="flex items-center gap-1.5"><Calendar size={16} /><span className="text-sm font-medium">Created {new Date(project.created_at).toLocaleDateString()}</span></div>
                            <div className="flex items-center gap-1.5"><Clock size={16} /><span className="text-sm font-medium">Updated {new Date(project.updated_at).toLocaleDateString()}</span></div>
                            <div className="flex items-center gap-1.5"><Globe size={16} /><span className="text-sm font-medium">{project.project_nature_detail?.name || 'Standard'}</span></div>
                        </div>
                    </div>
                </div>
                <div className={`transition-all duration-500 ease-in-out overflow-hidden ${headerOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0 pointer-events-none'}`}>
                    <div className="px-8 pb-8 grid grid-cols-1 md:grid-cols-3 gap-8 border-t border-border pt-8">
                        {project.project_base_informations?.map((base, idx) => (
                            <div key={idx} className="space-y-4">
                                <div className="space-y-2">
                                    <p className="text-[10px] uppercase font-bold text-muted tracking-widest">Base Info #{idx + 1}</p>
                                    <p className="text-foreground font-medium text-sm">{base.name}</p>
                                    <p className="text-foreground/80 leading-relaxed text-sm italic">"{base.description}"</p>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-[10px] uppercase font-bold text-muted tracking-widest">Ownership</p>
                                    <p className="text-foreground font-medium text-sm">{base.creator_name}</p>
                                    <p className="text-muted text-xs">{base.creator_designation}</p>
                                    <p className="text-muted text-xs">Approached on: {base.project_approach_date}</p>
                                </div>
                            </div>
                        ))}
                        <div className="space-y-4">
                            <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-[10px] font-bold text-muted uppercase tracking-wider">Timeline</span>
                                    <TrendingUp size={14} className="text-primary" />
                                </div>
                                <div className="flex items-center gap-2 mt-2">
                                    <div className="flex-1">
                                        <p className="text-xs text-muted">Start Date</p>
                                        <p className="text-sm font-bold text-foreground">{project.project_excutions?.[0]?.start_date || 'TBD'}</p>
                                    </div>
                                    <ChevronRight size={16} className="text-muted/30" />
                                    <div className="flex-1 text-right">
                                        <p className="text-xs text-muted">Deadline</p>
                                        <p className="text-sm font-bold text-foreground">{project.project_excutions?.[0]?.assigned_delivery_date || 'TBD'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Financials */}
            <CollapsibleSection title="Financial Overview" icon={<DollarSign size={20} />} iconColor="text-emerald-500" bgColor="bg-emerald-500/10" fullWidth>
                <div className="space-y-6">
                    {project.project_finances?.map((fin, idx) => (
                        <div key={idx} className={`grid grid-cols-2 md:grid-cols-5 gap-4 ${idx > 0 ? 'pt-6 border-t border-border/50' : ''}`}>
                            <div className="md:col-span-1 flex flex-col justify-center">
                                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Ph #{idx + 1}</span>
                            </div>
                            <div><p className="text-[10px] uppercase font-bold text-muted tracking-wider">Total Cost</p><p className="text-lg font-black text-foreground">₹{fin.project_cost || '0.00'}</p></div>
                            <div><p className="text-[10px] uppercase font-bold text-muted tracking-wider">Paid Amount</p><p className="text-lg font-black text-emerald-500">₹{fin.total_paid || '0.00'}</p></div>
                            <div><p className="text-[10px] uppercase font-bold text-muted tracking-wider">Balance Due</p><p className="text-lg font-black text-rose-500">₹{fin.total_balance_due || '0.00'}</p></div>
                            <div><p className="text-[10px] uppercase font-bold text-muted tracking-wider">Manpower</p><p className="text-lg font-black text-primary">₹{fin.manpower_cost || '0.00'}</p></div>
                        </div>
                    ))}
                    {project.project_finances?.length === 0 && <p className="text-muted text-sm text-center">No financial data available.</p>}
                </div>
            </CollapsibleSection>

            {/* Execution */}
            <CollapsibleSection title="Execution Status" icon={<Clock size={20} />} iconColor="text-blue-500" bgColor="bg-blue-500/10" fullWidth>
                <div className="space-y-8">
                    {project.project_excutions?.map((exec, idx) => (
                        <div key={idx} className={`space-y-4 ${idx > 0 ? 'pt-6 border-t border-border/50' : ''}`}>
                            <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Execution Phase #{idx + 1}</p>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                                <div><p className="text-[10px] uppercase font-bold text-muted tracking-widest">Assigned</p><p className="text-sm font-bold text-foreground mt-1">{exec.work_assigned_date || '—'}</p></div>
                                <div><p className="text-[10px] uppercase font-bold text-muted tracking-widest">Delivery</p><p className="text-sm font-bold text-foreground mt-1">{exec.assigned_delivery_date || '—'}</p></div>
                                <div><p className="text-[10px] uppercase font-bold text-muted tracking-widest">Start</p><p className="text-sm font-bold text-foreground mt-1">{exec.start_date || '—'}</p></div>
                                <div><p className="text-[10px] uppercase font-bold text-muted tracking-widest">Confirmed</p><p className="text-sm font-bold text-foreground mt-1">{exec.confirmed_end_date || '—'}</p></div>
                                <div><p className="text-[10px] uppercase font-bold text-muted tracking-widest">Actual</p><p className="text-sm font-bold text-foreground mt-1">{exec.end_date || 'Ongoing'}</p></div>
                            </div>
                        </div>
                    ))}
                    {project.project_excutions?.length === 0 && <p className="text-muted text-sm text-center">No execution phases recorded.</p>}
                </div>
            </CollapsibleSection>

            {/* Project Teams (team-based) */}
            <CollapsibleSection title="Project Teams" icon={<Users size={20} />} iconColor="text-violet-500" bgColor="bg-violet-500/10" fullWidth>
                <div className="divide-y divide-border">
                    {project.project_teams?.length === 0 && <p className="text-muted text-sm text-center py-4">No teams assigned.</p>}
                    {project.project_teams?.map((teamGroup) => (
                        <div key={teamGroup.id} className="py-6 first:pt-0 last:pb-0">
                            <div className="flex items-center justify-between mb-4">
                                <h4 className="text-sm font-bold text-foreground uppercase tracking-wider">{teamGroup.team_detail?.name} Team</h4>
                                <div className="flex items-center gap-3">
                                    <span className="text-xs text-muted">{teamGroup.allocated_time}h allocated</span>
                                    <button
                                        onClick={() => navigate(`/activities/new?project=${project.id}&team=${teamGroup.team_detail?.id || teamGroup.id}`)}
                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 rounded-xl text-xs font-bold border border-emerald-500/20 transition-all"
                                    >
                                        <ClipboardList size={13} />
                                        <span>Add Activity</span>
                                    </button>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {teamGroup.members?.map((member) => (
                                    <div key={member.id} className="p-4 bg-muted/5 rounded-2xl border border-border group hover:border-primary/30 transition-all">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <p className="font-bold text-foreground">{member.role}</p>
                                                <p className="text-xs text-muted mt-1">{member.notes}</p>
                                            </div>
                                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase border ${member.status === 'Active' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-muted/10 text-muted border-border'}`}>{member.status}</span>
                                        </div>
                                        <div className="mt-4 flex items-center justify-between text-[10px] uppercase font-bold tracking-widest text-muted">
                                            <span>{member.actual_days_spent} / {member.allocated_days} days</span>
                                            <span>₹{member.cost}</span>
                                        </div>
                                        <div className="mt-2 w-full bg-muted/20 h-1.5 rounded-full overflow-hidden">
                                            <div className="h-full bg-primary" style={{ width: `${member.allocated_days > 0 ? Math.min((member.actual_days_spent / member.allocated_days) * 100, 100) : 0}%` }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </CollapsibleSection>

            {/* Direct Project Team Members */}
            {project.project_team_members && project.project_team_members.length > 0 && (
                <CollapsibleSection title="Direct Team Members" icon={<User size={20} />} iconColor="text-primary" bgColor="bg-primary/10" fullWidth>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {project.project_team_members.map((member) => (
                            <div key={member.id} className="p-4 bg-muted/5 rounded-2xl border border-border hover:border-primary/30 transition-all">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="font-bold text-foreground">{member.role}</p>
                                        <p className="text-xs text-muted mt-1">{member.notes}</p>
                                    </div>
                                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase border ${member.status === 'Active' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-muted/10 text-muted border-border'}`}>{member.status}</span>
                                </div>
                                <div className="mt-4 flex justify-between text-[10px] uppercase font-bold text-muted">
                                    <span>{member.actual_days_spent} / {member.allocated_days} days</span>
                                    <span>₹{member.cost}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </CollapsibleSection>
            )}

            {/* Client Info */}
            <CollapsibleSection title="Client Information" icon={<Shield size={20} />} iconColor="text-primary" bgColor="bg-primary/10" fullWidth>
                <div className="space-y-8">
                    {project.project_clients?.map((cl, idx) => (
                        <div key={idx} className={`space-y-4 ${idx > 0 ? 'pt-6 border-t border-border/50' : ''}`}>
                            <p className="text-[10px] font-black text-primary uppercase tracking-widest">Client Entry #{idx + 1}</p>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                <div><p className="text-[10px] uppercase font-bold text-muted tracking-widest">Company</p><p className="text-sm font-black text-foreground mt-1">{cl.company_name || '—'}</p></div>
                                <div><p className="text-[10px] uppercase font-bold text-muted tracking-widest">Contact</p><p className="text-sm font-bold text-foreground mt-1">{cl.contact_person || '—'}</p></div>
                                <div><p className="text-[10px] uppercase font-bold text-muted tracking-widest">Email</p><p className="text-xs font-bold text-foreground mt-1 truncate">{cl.email || '—'}</p></div>
                                <div><p className="text-[10px] uppercase font-bold text-muted tracking-widest">Phone</p><p className="text-sm font-bold text-foreground mt-1">{cl.phone || '—'}</p></div>
                            </div>
                        </div>
                    ))}
                </div>
                {project.project_business_addresses && project.project_business_addresses.length > 0 && (
                    <div className="mt-6 pt-6 border-t border-border">
                        <p className="text-[10px] uppercase font-bold text-muted tracking-widest mb-4">Business Addresses</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {project.project_business_addresses.map((addr) => (
                                <div key={addr.id} className="p-4 bg-muted/5 rounded-2xl border border-border space-y-3 text-sm">
                                    <div className="flex justify-between items-start gap-3">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <p className="font-black text-foreground">{addr.attention_name}</p>
                                                <span className="px-1.5 py-0.5 bg-primary/10 text-primary text-[10px] font-black rounded border border-primary/20">ID: {addr.id}</span>
                                            </div>
                                            {addr.legal_name && <p className="text-xs text-primary font-bold">{addr.legal_name}</p>}
                                        </div>
                                        {addr.logo && (
                                            <a href={addr.logo} target="_blank" rel="noopener noreferrer" className="hover:scale-105 transition-transform">
                                                <img src={addr.logo} alt="Company Logo" className="w-12 h-12 object-contain rounded-lg bg-white p-1 border border-border shadow-sm" />
                                            </a>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                                        {addr.email && <p className="text-muted flex items-center gap-1.5 font-medium">📧 {addr.email}</p>}
                                        {addr.phone && <p className="text-muted flex items-center gap-1.5 font-medium">📞 {addr.phone}</p>}
                                    </div>
                                    <div className="text-muted leading-relaxed">
                                        <p>{addr.unit_or_floor}, {addr.building_name}, Plot {addr.plot_number}</p>
                                        <p>{addr.street_name}{addr.landmark ? `, Near ${addr.landmark}` : ''}</p>
                                        <p>{addr.locality}, {addr.city}{addr.district ? `, ${addr.district}` : ''}</p>
                                        <p className="font-bold text-foreground mt-1">{addr.state} — {addr.pin_code}, {addr.country}</p>
                                    </div>
                                    {(addr.gst_number || addr.pan_number) && (
                                        <div className="pt-2 border-t border-border/50 flex flex-wrap gap-4 text-[10px] font-black uppercase tracking-widest text-muted">
                                            {addr.gst_number && <span className="bg-muted/10 px-2 py-1 rounded">GST: {addr.gst_number}</span>}
                                            {addr.pan_number && <span className="bg-muted/10 px-2 py-1 rounded">PAN: {addr.pan_number}</span>}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </CollapsibleSection>

            {/* Project Documents */}
            {project.project_documents && project.project_documents.length > 0 && (
                <CollapsibleSection title="Project Documents" icon={<FileText size={20} />} iconColor="text-orange-500" bgColor="bg-orange-500/10" fullWidth>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {project.project_documents.map((doc) => (
                            <div key={doc.id} className="p-5 bg-muted/5 rounded-2xl border border-border group hover:border-orange-500/30 transition-all">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-orange-500/10 text-orange-500 rounded-xl group-hover:scale-110 transition-transform">
                                        <FileText size={24} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-bold text-foreground truncate">{doc.name}</h4>
                                        <p className="text-xs text-muted mt-1 line-clamp-2">{doc.description}</p>
                                        <div className="mt-4 flex items-center justify-between">
                                            <span className="text-[10px] font-medium text-muted">{doc.uploaded_at ? new Date(doc.uploaded_at).toLocaleDateString() : '—'}</span>
                                            <a
                                                href={doc.document}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-[10px] font-black uppercase tracking-widest text-orange-500 hover:text-orange-600 transition-colors"
                                            >
                                                View Document
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CollapsibleSection>
            )}

            {/* Servers */}
            <CollapsibleSection title="Servers" icon={<Server size={20} />} iconColor="text-indigo-500" bgColor="bg-indigo-500/10" fullWidth>
                {project.project_servers && project.project_servers.length > 0 ? (
                    <div className="space-y-6">
                        {project.project_servers.map((server) => (
                            <div key={server.id} className="p-5 bg-indigo-500/5 rounded-2xl border border-indigo-500/20 space-y-4">
                                <div className="flex items-center justify-between">
                                    <p className="text-base font-black text-foreground">{server.name}</p>
                                    <span className="text-[10px] px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-500 font-bold border border-indigo-500/20 uppercase">{server.server_type}</span>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    <div><p className="text-[10px] uppercase font-bold text-muted tracking-widest">Accrued By</p><p className="text-sm font-bold text-foreground mt-0.5">{server.accrued_by || '—'}</p></div>
                                    <div><p className="text-[10px] uppercase font-bold text-muted tracking-widest">Purchased From</p><p className="text-sm font-bold text-foreground mt-0.5">{server.purchased_from || '—'}</p></div>
                                    <div><p className="text-[10px] uppercase font-bold text-muted tracking-widest">Cost</p><p className="text-sm font-black text-emerald-500 mt-0.5">₹{server.cost}</p></div>
                                    <div><p className="text-[10px] uppercase font-bold text-muted tracking-widest">Purchase Date</p><p className="text-sm font-bold text-foreground mt-0.5">{server.purchase_date || '—'}</p></div>
                                    <div><p className="text-[10px] uppercase font-bold text-muted tracking-widest">Expiration</p><p className="text-sm font-bold text-foreground mt-0.5">{server.expiration_date || '—'}</p></div>
                                    <div><p className="text-[10px] uppercase font-bold text-muted tracking-widest">Status</p><p className={`text-sm font-black mt-0.5 ${server.status === 'Active' ? 'text-emerald-500' : 'text-rose-500'}`}>{server.status}</p></div>
                                    <div className="flex flex-col gap-1">
                                        <p className="text-[10px] uppercase font-bold text-emerald-500 tracking-widest">Payment</p>
                                        <div className="flex items-center gap-2">
                                            <p className="text-sm font-black text-emerald-500">{server.payment_status || 'UNPAID'}</p>
                                            <button
                                                onClick={() => handleBillItem('server', server.name || 'Server', server.cost || 0, server.purchase_date, server.expiration_date)}
                                                className="p-1.5 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 rounded-lg transition-all border border-emerald-500/20"
                                                title="Generate Invoice"
                                            >
                                                <Receipt size={14} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                {server.provider && server.provider.length > 0 && (
                                    <div className="pt-3 border-t border-border/30">
                                        <p className="text-[10px] uppercase font-bold text-muted tracking-widest mb-2">Provider</p>
                                        <p className="text-sm font-bold text-foreground">{server.provider?.[0]?.company_name}</p>
                                        <p className="text-xs text-muted">{server.provider?.[0]?.email} · {server.provider?.[0]?.phone}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : <p className="text-muted text-sm text-center py-4">No servers configured.</p>}
            </CollapsibleSection>

            {/* Domains */}
            <CollapsibleSection title="Domains" icon={<Globe size={20} />} iconColor="text-blue-500" bgColor="bg-blue-500/10" fullWidth>
                {project.project_domains && project.project_domains.length > 0 ? (
                    <div className="space-y-6">
                        {project.project_domains.map((domain) => (
                            <div key={domain.id} className="p-5 bg-blue-500/5 rounded-2xl border border-blue-500/20 space-y-4">
                                <div className="flex items-center justify-between">
                                    <p className="text-base font-black text-foreground underline decoration-blue-500/40 decoration-2">{domain.name}</p>
                                    <span className={`text-[10px] font-black uppercase ${domain.status === 'Active' ? 'text-emerald-500' : 'text-rose-500'}`}>{domain.status}</span>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    <div><p className="text-[10px] uppercase font-bold text-muted tracking-widest">Accrued By</p><p className="text-sm font-bold text-foreground mt-0.5">{domain.accrued_by || '—'}</p></div>
                                    <div><p className="text-[10px] uppercase font-bold text-muted tracking-widest">Purchased From</p><p className="text-sm font-bold text-foreground mt-0.5">{domain.purchased_from || '—'}</p></div>
                                    <div><p className="text-[10px] uppercase font-bold text-muted tracking-widest">Cost</p><p className="text-sm font-black text-emerald-500 mt-0.5">₹{domain.cost}</p></div>
                                    <div><p className="text-[10px] uppercase font-bold text-muted tracking-widest">Purchase Date</p><p className="text-sm font-bold text-foreground mt-0.5">{domain.purchase_date || '—'}</p></div>
                                    <div><p className="text-[10px] uppercase font-bold text-muted tracking-widest">Expiration</p><p className="text-sm font-bold text-foreground mt-0.5">{domain.expiration_date || '—'}</p></div>
                                    <div className="flex flex-col gap-1">
                                        <p className="text-[10px] uppercase font-bold text-emerald-500 tracking-widest">Payment</p>
                                        <div className="flex items-center gap-2">
                                            <p className="text-sm font-black text-emerald-500">{domain.payment_status || 'UNPAID'}</p>
                                            <button
                                                onClick={() => handleBillItem('domain', domain.name || 'Domain', domain.cost || 0, domain.purchase_date, domain.expiration_date)}
                                                className="p-1.5 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 rounded-lg transition-all border border-emerald-500/20"
                                                title="Generate Invoice"
                                            >
                                                <Receipt size={14} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                {domain.provider && domain.provider.length > 0 && (
                                    <div className="pt-3 border-t border-border/30">
                                        <p className="text-[10px] uppercase font-bold text-muted tracking-widest mb-2">Provider</p>
                                        <p className="text-sm font-bold text-foreground">{domain.provider?.[0]?.company_name}</p>
                                        <p className="text-xs text-muted">{domain.provider?.[0]?.email} · {domain.provider?.[0]?.phone}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : <p className="text-muted text-sm text-center py-4">No domains configured.</p>}
            </CollapsibleSection>

            {/* Services */}
            <CollapsibleSection title="Associated Services" icon={<Layers size={20} />} iconColor="text-purple-500" bgColor="bg-purple-500/10" fullWidth>
                <div className="space-y-4">
                    {project.services?.length === 0 && <p className="text-muted text-sm text-center py-4">No services added yet.</p>}
                    {project.services?.map((service) => (
                        <ServiceCard key={service.id} service={service} projectId={project.id} getStatusStyles={getStatusStyles} onBill={handleBillItem}
                            onAddActivity={() => {
                                const teamId = service.teams?.[0]?.team;
                                navigate(`/activities/new?project=${project.id}&service=${service.id}${teamId ? `&team=${teamId}` : ''}`);
                            }}
                        />
                    ))}
                </div>
            </CollapsibleSection>
        </div>
    );
};

// ── Reusable Components ───────────────────────────────────────────────────

const CollapsibleSection: React.FC<{
    title: string, icon: React.ReactNode, iconColor: string, bgColor: string, children: React.ReactNode, fullWidth?: boolean
}> = ({ title, icon, iconColor, bgColor, children }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className={`bg-card border border-border rounded-3xl overflow-hidden shadow-sm transition-all duration-300 ${isOpen ? 'ring-1 ring-primary/20' : ''}`}>
            <div onClick={() => setIsOpen(!isOpen)} className="p-6 flex items-center justify-between cursor-pointer hover:bg-muted/5 transition-colors">
                <div className="flex items-center gap-3">
                    <div className={`p-2 ${bgColor} ${iconColor} rounded-xl`}>{icon}</div>
                    <h3 className="font-bold text-foreground">{title}</h3>
                </div>
                <ChevronRight size={20} className={`text-muted transition-transform duration-300 ${isOpen ? 'rotate-90 text-primary' : ''}`} />
            </div>
            <div className={`px-6 pb-6 transition-all duration-500 ease-in-out ${isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0 pointer-events-none overflow-hidden'}`}>
                <div className="pt-4 border-t border-border">{children}</div>
            </div>
        </div>
    );
};

const ServiceCard: React.FC<{ service: any, projectId?: number, getStatusStyles: (s: string) => string, onBill?: (type: string, name: string, cost: string | number) => void, onAddActivity?: () => void }> = ({ service, projectId, getStatusStyles, onBill, onAddActivity }) => {
    const navigate = useNavigate();
    const [expanded, setExpanded] = useState(false);
    return (
        <div className={`border border-border rounded-[2.5rem] transition-all overflow-hidden ${expanded ? 'bg-background shadow-xl scale-[1.01]' : 'bg-muted/5 hover:bg-primary/5 hover:border-primary/20 shadow-sm'}`}>
            <div className="p-8 cursor-pointer flex items-center justify-between" onClick={() => setExpanded(!expanded)}>
                <div className="flex-1 min-w-0">
                    <p className="text-xl font-black text-foreground tracking-tight">{service.name || service.description}</p>
                    <p className="text-sm text-muted mt-1">{service.description}</p>
                    <div className="flex items-center gap-4 mt-3 flex-wrap">
                        <span className={`text-[11px] px-3 py-1 rounded-full font-bold uppercase border ${getStatusStyles(service.status)}`}>{service.status}</span>
                        <div className="flex items-center gap-1.5">
                            <span className="text-[11px] px-3 py-1 rounded-full font-bold uppercase border bg-emerald-500/10 text-emerald-500 border-emerald-500/20">{service.payment_status || 'UNPAID'}</span>
                            <button
                                onClick={(e) => { e.stopPropagation(); onBill?.('service', service.name || 'Service', service.project_finances?.[0]?.project_cost || 0); }}
                                className="p-1 px-2.5 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 rounded-lg transition-all border border-emerald-500/20 flex items-center gap-1.5"
                                title="Generate Invoice"
                            >
                                <Receipt size={12} />
                                <span className="text-[10px] font-black uppercase tracking-tight">Bill</span>
                            </button>
                        </div>
                        {service.start_date && <span className="text-xs text-muted flex items-center gap-1"><Calendar size={12} /> {service.start_date}</span>}
                        {service.deadline && <span className="text-xs text-rose-500 flex items-center gap-1">⏰ Due: {service.deadline}</span>}
                        <span className="text-xs text-muted">{service.members?.length || 0} member{(service.members?.length || 0) !== 1 ? 's' : ''}</span>
                        {onAddActivity && (
                            <button
                                onClick={(e) => { e.stopPropagation(); onAddActivity(); }}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 rounded-xl text-xs font-bold border border-emerald-500/20 transition-all"
                                title="Add Activity for this service"
                            >
                                <ClipboardList size={13} />
                                <span>Add Activity</span>
                            </button>
                        )}
                    </div>
                </div>
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${expanded ? 'bg-primary/10 text-primary rotate-90' : 'bg-muted/10 text-muted'}`}>
                    <ChevronRight size={24} />
                </div>
            </div>

            <div className={`transition-all duration-500 ease-in-out overflow-hidden ${expanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0 pointer-events-none'}`}>
                <div className="p-8 pt-0 border-t border-border/50">
                    <div className="pt-6 space-y-6">
                        {/* Service Members */}
                        {service.members && service.members.length > 0 && (
                            <div>
                                <p className="text-[11px] uppercase font-bold text-muted tracking-widest mb-4">Service Members</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {service.members.map((member: any) => (
                                        <div key={member.id} className="p-4 bg-background rounded-2xl border border-border hover:border-primary/30 transition-all">
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-bold text-foreground text-sm truncate">
                                                        {member.employee_detail
                                                            ? `${member.employee_detail.first_name} ${member.employee_detail.last_name}`.trim() || member.employee_detail.username
                                                            : `Employee #${member.employee}`}
                                                    </p>
                                                    <p className="text-[10px] text-primary font-bold mt-0.5 truncate">{member.role}</p>
                                                    {member.employee_detail?.designation && (
                                                        <p className="text-[10px] text-muted">{member.employee_detail.designation}</p>
                                                    )}
                                                </div>
                                                <div className="flex flex-col items-end gap-2">
                                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                                                        <User size={14} />
                                                    </div>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); navigate(`/activities/new?project=${projectId}&service=${service.id}&employee=${member.employee}`); }}
                                                        className="p-1.5 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 rounded-lg transition-all border border-emerald-500/20"
                                                        title="Add Activity for this member"
                                                    >
                                                        <ClipboardList size={11} />
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="mt-3 pt-3 border-t border-border/30 flex justify-between text-[10px] font-black uppercase text-muted">
                                                <span>₹{member.cost}</span>
                                                <span>{member.actual_days}d / {member.allocated_days}d</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Service Teams */}
                        {service.teams && service.teams.length > 0 && (
                            <div>
                                <p className="text-[11px] uppercase font-bold text-muted tracking-widest mb-4">Service Teams</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {service.teams.map((team: any) => (
                                        <div key={team.id} className="p-4 bg-muted/5 rounded-2xl border border-border">
                                            <div className="flex items-center justify-between mb-2">
                                                <p className="font-bold text-foreground text-sm">{team.team_detail?.name || `Team #${team.team}`}</p>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); navigate(`/activities/new?project=${projectId}&service=${service.id}&team=${team.team}`); }}
                                                    className="p-1 px-2 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 rounded-lg transition-all border border-emerald-500/20 flex items-center gap-1.5"
                                                >
                                                    <ClipboardList size={11} />
                                                    <span className="text-[9px] font-black uppercase">Activity</span>
                                                </button>
                                            </div>
                                            <div className="flex justify-between text-[10px] text-muted uppercase font-bold">
                                                <span>Allocated: {team.allocated_days}d</span>
                                                <span>Actual: {team.actual_days}d</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProjectDetail;

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
    Target, 
    Edit2, 
    Trash2, 
    ArrowLeft, 
    Plus, 
    Calendar, 
    MessageSquare, 
    Clock, 
    User as UserIcon,
    Phone,
    Mail,
    Globe,
    MapPin,
    History,
    Loader2,
    Save,
    MoreHorizontal,
    Paperclip,
    FileText,
    PhoneCall,
    Users,
    MessageCircle,
    Flame,
    Rocket,
    CheckCircle,
    X
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { leadService } from './leadService';
import { api } from '../../api/api';
import SearchableUserSelect from '../../components/SearchableUserSelect';
import SearchableRoleSelect from '../../components/SearchableRoleSelect';
import type { Lead, FollowUp } from './lead';
import { usePermission } from '../../hooks/usePermission';

const LeadDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { hasPermission } = usePermission();
    
    const [lead, setLead] = useState<Lead | null>(null);
    const [followups, setFollowups] = useState<FollowUp[]>([]);
    const [loading, setLoading] = useState(true);
    const [addingFollowUp, setAddingFollowUp] = useState(false);
    const [editingFollowUpId, setEditingFollowUpId] = useState<number | null>(null);
    const [newFollowUp, setNewFollowUp] = useState<Partial<FollowUp>>({
        note: '',
        followup_date: '',
        interaction_date: new Date().toISOString().split('T')[0],
        interaction_type: 'call',
        is_project_created: false
    });
    const [scheduleNext, setScheduleNext] = useState(false);
    const [editingData, setEditingData] = useState<Partial<FollowUp>>({});
    
    // Quick Set Modal States
    const [showQuickSetModal, setShowQuickSetModal] = useState(false);
    const [quickSetData, setQuickSetData] = useState({
        title: '',
        description: '',
        schedule_date: format(new Date(), 'yyyy-MM-dd'),
        schedule_time: '10:00',
        assigned_to: null as number | null,
        assigned_role: null as number | null
    });
    const [assignmentMode, setAssignmentMode] = useState<'user' | 'role'>('user');

    const fetchData = async () => {
        if (!id) return;
        setLoading(true);
        try {
            const [leadData, followUpData] = await Promise.all([
                leadService.getLead(parseInt(id)),
                leadService.getFollowUps(parseInt(id))
            ]);
            setLead(leadData);
            setFollowups(followUpData);
        } catch (error) {
            console.error('Failed to fetch lead details:', error);
            navigate('/leads/list');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [id]);

    const handleDeleteFollowUp = async (fuId: number) => {
        if (window.confirm('Are you sure you want to delete this interaction log?')) {
            try {
                await leadService.deleteFollowUp(fuId);
                setFollowups(prev => prev.filter(f => f.id !== fuId));
            } catch (error) {
                console.error('Failed to delete follow-up:', error);
            }
        }
    };

    const handleUpdateFollowUp = async (fuId: number) => {
        try {
            await leadService.updateFollowUp(fuId, editingData);
            
            // Open Quick Set modal if project was just marked as created
            if (editingData.is_project_created) {
                setQuickSetData({
                    title: `Quick Set: ${lead?.company_name}`,
                    description: `Automated task from interaction on ${editingData.interaction_date}. Follow up on project setup.`,
                    schedule_date: format(new Date(), 'yyyy-MM-dd'),
                    schedule_time: '10:00',
                    assigned_to: lead?.assigned_to || null,
                    assigned_role: null
                });
                setAssignmentMode('user');
                setShowQuickSetModal(true);
            }
            
            setEditingFollowUpId(null);
            fetchData();
        } catch (error) {
            console.error('Failed to update follow-up:', error);
        }
    };

    const handleAddFollowUp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!id || !lead) return;
        try {
            const finalFollowUp = {
                ...newFollowUp,
                followup_date: scheduleNext ? (newFollowUp.followup_date || null) : null,
                lead: parseInt(id),
                interest_level: newFollowUp.interest_level || lead.interest_level,
                conversion_status: newFollowUp.is_project_created ? 'closed' : (newFollowUp.conversion_status || lead.conversion_status),
                interaction_type: newFollowUp.interaction_type || 'call',
                is_project_created: newFollowUp.is_project_created
            };
            
            await leadService.createFollowUp(finalFollowUp);

            // Open Quick Set modal if project created
            if (finalFollowUp.is_project_created) {
                setQuickSetData({
                    title: `Quick Set: ${lead.company_name}`,
                    description: `Project created. Immediate onboarding setup required for ${lead.company_name}.`,
                    schedule_date: format(new Date(), 'yyyy-MM-dd'),
                    schedule_time: '10:00',
                    assigned_to: lead.assigned_to || null,
                    assigned_role: null
                });
                setAssignmentMode('user');
                setShowQuickSetModal(true);
            }
            
            if (finalFollowUp.interest_level !== lead.interest_level || finalFollowUp.conversion_status !== lead.conversion_status) {
                await leadService.updateLead(parseInt(id), {
                    ...lead,
                    write_interest_level: finalFollowUp.interest_level,
                    write_conversion_status: finalFollowUp.conversion_status
                } as any);
            }
            
            setAddingFollowUp(false);
            setScheduleNext(false);
            setNewFollowUp({ 
                note: '', 
                followup_date: '', 
                interaction_date: new Date().toISOString().split('T')[0],
                interest_level: undefined, 
                conversion_status: undefined, 
                interaction_type: 'call' 
            });
            fetchData();
        } catch (error) {
            console.error('Failed to add follow-up:', error);
        }
    };

    const handleDelete = async () => {
        if (!id || !window.confirm('Delete this strategic lead permanently?')) return;
        try {
            await leadService.deleteLead(parseInt(id));
            navigate('/leads/list');
        } catch (error) {
            console.error('Failed to delete lead:', error);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
                <Loader2 className="animate-spin text-primary" size={48} />
                <p className="text-muted font-bold animate-pulse">Analyzing Lead Intelligence...</p>
            </div>
        );
    }

    if (!lead) return null;

    const getInterestStyle = (level: string) => {
        switch (level.toLowerCase()) {
            case 'hot': return 'bg-rose-500 text-white shadow-lg shadow-rose-500/20';
            case 'warm': return 'bg-amber-500 text-white shadow-lg shadow-amber-500/20';
            default: return 'bg-blue-500 text-white shadow-lg shadow-blue-500/20';
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-500 pb-10">
            {/* Header / Actions */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => navigate('/leads/list')}
                        className="p-2.5 bg-card border border-border rounded-xl text-muted hover:text-foreground transition-all"
                    >
                        <ArrowLeft size={18} />
                    </button>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-black text-foreground tracking-tight uppercase">{lead.company_name}</h1>
                            <span className={`px-3 py-0.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] ${getInterestStyle(lead.interest_level)}`}>
                                {lead.interest_level} Potential
                            </span>
                        </div>
                        <p className="text-muted text-xs font-medium italic mt-0.5">
                            Lead ID: #{lead.id} • Assigned to {lead.assigned_to_name || lead.assigned_role_name || 'Unassigned'}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {hasPermission('change_lead') && (
                        <button 
                            onClick={() => navigate(`/leads/edit/${lead.id}`)}
                            className="flex items-center gap-2 px-5 py-2.5 bg-card border border-border rounded-xl text-foreground font-bold hover:bg-muted/10 transition-all shadow-sm text-sm"
                        >
                            <Edit2 size={16} className="text-primary" />
                            Edit Strategy
                        </button>
                    )}
                    {hasPermission('delete_lead') && (
                        <button 
                            onClick={handleDelete}
                            className="p-2.5 bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded-xl hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                        >
                            <Trash2 size={18} />
                        </button>
                    )}
                </div>
            </div>            {/* Top Strategic Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-card border border-border rounded-2xl p-4 shadow-lg flex items-center gap-3 group hover:border-primary/50 transition-all">
                    <div className="p-3 bg-primary/10 rounded-xl text-primary group-hover:scale-110 transition-transform"><Target size={22} /></div>
                    <div>
                        <p className="text-[10px] font-black text-muted uppercase tracking-widest leading-none mb-1">Status</p>
                        <p className="text-base font-black text-foreground uppercase tracking-tight leading-tight">{lead.conversion_status.replace('_', ' ')}</p>
                    </div>
                </div>

                <div className="bg-card border border-border rounded-2xl p-4 shadow-lg flex items-center gap-3 group hover:opacity-80 transition-all">
                    <div className={`p-3 rounded-xl group-hover:scale-110 transition-transform ${
                        lead.interest_level === 'hot' ? 'bg-rose-500/10 text-rose-500' : 
                        lead.interest_level === 'warm' ? 'bg-amber-500/10 text-amber-500' : 
                        'bg-blue-500/10 text-blue-500'
                    }`}>
                        <Flame size={22} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-muted uppercase tracking-widest leading-none mb-1">Interest</p>
                        <p className="text-base font-black text-foreground uppercase tracking-tight leading-tight">{lead.interest_level} Potential</p>
                    </div>
                </div>

                <div className="bg-card border border-border rounded-2xl p-4 shadow-lg flex items-center gap-3 group hover:border-amber-500/50 transition-all">
                    <div className="p-3 bg-amber-500/10 rounded-xl text-amber-500 group-hover:scale-110 transition-transform"><Calendar size={22} /></div>
                    <div>
                        <p className="text-[10px] font-black text-muted uppercase tracking-widest leading-none mb-1">Next Action</p>
                        <p className="text-base font-black text-foreground uppercase tracking-tight leading-tight">
                            {lead.next_followup_date ? format(parseISO(lead.next_followup_date), 'MMM d, yyyy') : 'PENDING'}
                        </p>
                    </div>
                </div>

                <div className="bg-primary border border-primary/20 rounded-2xl p-4 shadow-lg flex items-center gap-3 group hover:bg-primary-hover transition-all text-white relative overflow-hidden">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-lg font-black group-hover:rotate-6 transition-transform relative z-10">
                        {lead.assigned_to_name?.charAt(0) || lead.assigned_role_name?.charAt(0) || '?'}
                    </div>
                    <div className="relative z-10">
                        <p className="text-[10px] font-black opacity-70 uppercase tracking-widest leading-none mb-1">
                            {lead.assigned_role ? 'Department' : 'Executive'}
                        </p>
                        <p className="text-base font-black tracking-tight leading-tight">
                            {lead.assigned_to_name || lead.assigned_role_name || 'Unassigned'}
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Details */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Service & Assets Card */}
                    <div className="bg-card border border-border rounded-[1.5rem] p-6 shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-3xl -mr-32 -mt-32" />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                                    <FileText size={12} /> Service Required
                                </h3>
                                <div className="p-4 bg-indigo-500/5 rounded-xl border border-indigo-500/10 text-foreground font-bold italic text-base">
                                    {(!lead.service_required || lead.service_required === '[]') ? 'No specific services listed.' : lead.service_required}
                                </div>
                            </div>
                            {lead.attachment && (
                                <div>
                                    <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                                        <Paperclip size={12} /> Attachment
                                    </h3>
                                    <a 
                                        href={lead.attachment} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-3 p-4 bg-primary/5 rounded-xl border border-primary/10 text-primary font-black hover:bg-primary/10 transition-all group"
                                    >
                                        <div className="p-2 bg-primary/10 rounded-lg group-hover:scale-110 transition-transform">
                                            <Paperclip size={20} />
                                        </div>
                                        <div>
                                            <p className="text-xs font-black uppercase tracking-tight">View Attached Asset</p>
                                            <p className="text-[9px] font-bold opacity-60 uppercase tracking-widest mt-0.5">Reference Document</p>
                                        </div>
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Detailed Info Card */}
                    <div className="bg-card border border-border rounded-[1.5rem] p-6 shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-3xl -mr-32 -mt-32" />
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                                        <UserIcon size={12} /> Contact Details
                                    </h3>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2.5 p-2 bg-muted/5 rounded-xl border border-border group/item hover:border-primary transition-all">
                                            <div className="p-1.5 bg-background rounded-lg shadow-sm group-hover/item:text-primary transition-colors"><UserIcon size={14} /></div>
                                            <p className="font-bold text-sm tracking-tight">{lead.contact_person}</p>
                                        </div>
                                        <div className="flex items-center gap-2.5 p-2 bg-muted/5 rounded-xl border border-border group/item hover:border-primary transition-all">
                                            <div className="p-1.5 bg-background rounded-lg shadow-sm group-hover/item:text-primary transition-colors"><Phone size={14} /></div>
                                            <p className="font-bold text-sm tracking-tight">{lead.contact_number}</p>
                                        </div>
                                        <div className="flex items-center gap-2.5 p-2 bg-muted/5 rounded-xl border border-border group/item hover:border-primary transition-all">
                                            <div className="p-1.5 bg-background rounded-lg shadow-sm group-hover/item:text-primary transition-colors"><Mail size={14} /></div>
                                            <p className="font-bold text-sm tracking-tight">{lead.email}</p>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                                        <Globe size={12} /> Digital Presence
                                    </h3>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2.5 p-2 bg-muted/5 rounded-xl border border-border">
                                            <div className="p-1.5 bg-background rounded-lg shadow-sm"><Globe size={14} /></div>
                                            <p className="font-bold text-sm truncate">{lead.website || 'No website'}</p>
                                        </div>
                                        <div className="flex items-center gap-2.5 p-2 bg-muted/5 rounded-xl border border-border">
                                            <div className="p-1.5 bg-background rounded-lg shadow-sm"><Target size={14} /></div>
                                            <p className="font-bold text-sm">Source: {lead.lead_source || 'Unknown'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-[10px] font-black text-amber-500 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                                        <MapPin size={12} /> Geographic Location
                                    </h3>
                                    <p className="text-sm font-bold leading-relaxed bg-muted/5 p-3 rounded-xl border border-border min-h-[60px]">
                                        {lead.address || 'Address not listed.'}
                                    </p>
                                </div>

                                <div>
                                    <h3 className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                                        <MessageSquare size={12} /> Strategic Notes
                                    </h3>
                                    <p className="text-xs font-medium italic leading-relaxed bg-primary/5 p-3 rounded-xl border border-primary/10">
                                        {lead.description || 'No notes registered.'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Follow-up History */}
                    <div className="bg-card border border-border rounded-[1.5rem] p-6 shadow-xl">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-black text-foreground uppercase tracking-tight flex items-center gap-3">
                                <History className="text-primary" size={20} />
                                Interaction Timeline
                            </h2>
                            <button 
                                onClick={() => setAddingFollowUp(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-primary text-white font-black rounded-xl hover:scale-105 transition-all shadow-lg shadow-primary/20 text-sm"
                            >
                                <Plus size={16} />
                                Log Interaction
                            </button>
                        </div>

                        {addingFollowUp && (
                            <motion.div 
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                className="mb-8 p-6 bg-muted/5 border border-primary/20 rounded-[2rem] overflow-hidden"
                            >
                                <form onSubmit={handleAddFollowUp} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-muted uppercase tracking-widest ml-1">Interaction Date</label>
                                            <input 
                                                type="date"
                                                required
                                                value={newFollowUp.interaction_date || ''}
                                                onChange={(e) => setNewFollowUp(prev => ({ ...prev, interaction_date: e.target.value }))}
                                                className="w-full px-5 py-4 bg-background border border-border rounded-2xl font-bold focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-muted uppercase tracking-widest ml-1">Next Follow-up</label>
                                            <div className="flex items-center gap-3">
                                                {!scheduleNext ? (
                                                    <button 
                                                        type="button"
                                                        onClick={() => setScheduleNext(true)}
                                                        className="w-full h-[58px] px-6 bg-primary/10 border border-primary/20 text-primary rounded-2xl font-black hover:bg-primary/20 transition-all text-xs flex items-center justify-center gap-2"
                                                    >
                                                        <Plus size={16} />
                                                        SCHEDULE NEXT
                                                    </button>
                                                ) : (
                                                    <div className="relative w-full">
                                                        <input 
                                                            type="date"
                                                            required
                                                            value={newFollowUp.followup_date || ''}
                                                            onChange={(e) => setNewFollowUp(prev => ({ ...prev, followup_date: e.target.value }))}
                                                            className="w-full px-5 py-4 bg-background border border-primary/50 rounded-2xl font-bold focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                                                        />
                                                        <button 
                                                            type="button"
                                                            onClick={() => {
                                                                setScheduleNext(false);
                                                                setNewFollowUp(prev => ({ ...prev, followup_date: '' }));
                                                            }}
                                                            className="absolute -top-2 -right-2 p-1.5 bg-rose-500 text-white rounded-full shadow-lg hover:bg-rose-600 transition-colors"
                                                        >
                                                            <Trash2 size={12} />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-muted uppercase tracking-widest ml-1">Update Interest</label>
                                            <select 
                                                value={newFollowUp.interest_level || lead.interest_level}
                                                onChange={(e) => setNewFollowUp(prev => ({...prev, interest_level: e.target.value as any}))}
                                                className="w-full px-5 py-4 bg-background border border-border rounded-2xl font-bold focus:ring-2 focus:ring-primary/50 outline-none appearance-none cursor-pointer transition-all"
                                            >
                                                <option value="hot">HOT (Ready to Close)</option>
                                                <option value="warm">WARM (Interested)</option>
                                                <option value="cold">COLD (No current need)</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-muted uppercase tracking-widest ml-1">Conversion Status</label>
                                            <select 
                                                value={newFollowUp.conversion_status || lead.conversion_status}
                                                onChange={(e) => setNewFollowUp(prev => ({...prev, conversion_status: e.target.value as any}))}
                                                className="w-full px-5 py-4 bg-background border border-border rounded-2xl font-bold focus:ring-2 focus:ring-primary/50 outline-none appearance-none cursor-pointer transition-all"
                                            >
                                                <option value="new">New Opportunity</option>
                                                <option value="contacted">Contacted / Meeting</option>
                                                <option value="proposal_sent">Proposal Sent</option>
                                                <option value="negotiation">In Negotiation</option>
                                                <option value="approved">Approved</option>
                                                <option value="closed">Closed (Converted)</option>
                                                <option value="denied">Denied / Lost</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* Project Created Toggle */}
                                    <div className="pt-2">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const newValue = !newFollowUp.is_project_created;
                                                setNewFollowUp(prev => ({ 
                                                    ...prev, 
                                                    is_project_created: newValue,
                                                    // If project created is true, set status to closed
                                                    conversion_status: newValue ? 'closed' : prev.conversion_status
                                                }));
                                            }}
                                            className={`w-full p-4 rounded-2xl border transition-all flex items-center justify-between group ${
                                                newFollowUp.is_project_created 
                                                    ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-600' 
                                                    : 'bg-muted/5 border-border text-muted hover:border-emerald-500/30'
                                            }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-xl transition-colors ${
                                                    newFollowUp.is_project_created ? 'bg-emerald-500 text-white' : 'bg-muted/10 group-hover:bg-emerald-500/20 group-hover:text-emerald-500'
                                                }`}>
                                                    <Rocket size={18} />
                                                </div>
                                                <div className="text-left">
                                                    <p className="text-xs font-black uppercase tracking-widest">Project Created?</p>
                                                    <p className="text-[10px] font-medium opacity-70">Mark if this interaction resulted in a new project</p>
                                                </div>
                                            </div>
                                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                                                newFollowUp.is_project_created ? 'bg-emerald-500 border-emerald-500 scale-110' : 'border-muted/30 group-hover:border-emerald-500/50'
                                            }`}>
                                                {newFollowUp.is_project_created && <CheckCircle size={14} className="text-white" />}
                                            </div>
                                        </button>
                                    </div>


                                    <div className="space-y-4 pt-4">
                                        <label className="text-[10px] font-black text-muted uppercase tracking-widest ml-4">Type</label>
                                        <div className="grid grid-cols-5 gap-2">
                                            {[
                                                { id: 'call', label: 'Call', icon: PhoneCall, color: 'text-blue-500', bg: 'bg-blue-500/10' },
                                                { id: 'meeting', label: 'Meet', icon: Users, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                                                { id: 'whatsapp', label: 'WA', icon: MessageCircle, color: 'text-green-500', bg: 'bg-green-500/10' },
                                                { id: 'email', label: 'Email', icon: Mail, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
                                                { id: 'other', label: 'Other', icon: MoreHorizontal, color: 'text-slate-500', bg: 'bg-slate-500/10' },
                                            ].map((type) => {
                                                const isActive = newFollowUp.interaction_type === type.id;
                                                const Icon = type.icon;
                                                return (
                                                    <button
                                                        key={type.id}
                                                        type="button"
                                                        onClick={() => setNewFollowUp(prev => ({ ...prev, interaction_type: type.id as any }))}
                                                        className={`flex flex-col items-center gap-1.5 p-2 rounded-xl border-2 transition-all group ${isActive ? 'border-primary bg-primary/5' : 'border-border bg-background hover:border-primary/30'}`}
                                                    >
                                                        <div className={`p-1.5 rounded-lg transition-all ${isActive ? 'bg-primary text-white' : `${type.bg} ${type.color}`}`}>
                                                            <Icon size={16} />
                                                        </div>
                                                        <span className={`text-[8px] font-black uppercase tracking-tight ${isActive ? 'text-primary' : 'text-muted'}`}>{type.label}</span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-muted uppercase tracking-widest ml-4">Summary</label>
                                        <textarea 
                                            required
                                            value={newFollowUp.note}
                                            onChange={(e) => setNewFollowUp(prev => ({ ...prev, note: e.target.value }))}
                                            rows={2}
                                            className="w-full px-4 py-3 bg-background border border-border rounded-xl font-bold focus:ring-2 focus:ring-primary/50 outline-none resize-none text-sm"
                                            placeholder="Report details..."
                                        />
                                    </div>
                                    <div className="flex justify-end gap-3">
                                        <button 
                                            type="button" 
                                            onClick={() => setAddingFollowUp(false)}
                                            className="px-4 py-2 font-black text-muted hover:text-foreground transition-all text-sm"
                                        >
                                            Cancel
                                        </button>
                                        <button 
                                            type="submit"
                                            className="flex items-center gap-2 px-6 py-2 bg-primary text-white font-black rounded-lg shadow-lg active:scale-95 transition-all text-sm"
                                        >
                                            <Save size={16} />
                                            Save Report
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        )}

                        <div className="space-y-6 relative">
                            {followups.length > 0 && (
                                <div className="absolute left-6 top-4 bottom-4 w-px bg-border" />
                            )}
                            
                            {followups.length > 0 ? (
                                followups.map((fu) => (
                                    <div key={fu.id} className="relative pl-16 group">
                                        <div className="absolute left-4 top-1.5 w-4 h-4 rounded-full bg-background border-2 border-primary z-10 group-hover:scale-125 transition-transform" />
                                        <div className="p-6 bg-muted/5 border border-border rounded-[2rem] group-hover:bg-primary/[0.02] group-hover:border-primary/20 transition-all">
                                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 mb-4">
                                                <div className="flex flex-col gap-2">
                                                    <span className="text-muted text-xs font-bold italic">
                                                        Interaction on {fu.interaction_date ? format(parseISO(fu.interaction_date), 'MMM d, yyyy') : format(parseISO(fu.created_at || ''), 'MMM d, yyyy')}
                                                    </span>
                                                    {(fu.conversion_status || fu.interest_level) && (
                                                        <div className="flex gap-2">
                                                            {fu.conversion_status && (
                                                                <span className="text-[10px] px-2 py-1 bg-primary/10 text-primary rounded-lg font-black uppercase tracking-widest border border-primary/20">
                                                                    {fu.conversion_status.replace('_', ' ')}
                                                                </span>
                                                            )}
                                                            {fu.interest_level && (
                                                                <span className="text-[10px] px-2 py-1 bg-amber-500/10 text-amber-500 rounded-lg font-black uppercase tracking-widest border border-amber-500/20">
                                                                    {fu.interest_level}
                                                                </span>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <div className="flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full">
                                                        <Clock size={12} className="text-amber-500" />
                                                        <span className="text-[10px] font-black text-amber-500 uppercase tracking-tight">Next: {fu.followup_date ? format(parseISO(fu.followup_date), 'MMM d, yyyy') : 'TBD'}</span>
                                                    </div>
                                                    {fu.interaction_type && (
                                                        <div className="flex items-center gap-2 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full">
                                                            <div className="flex items-center gap-2">
                                                                {fu.is_project_created && (
                                                                    <div className="flex items-center gap-1 px-2 py-0.5 bg-emerald-500 text-white rounded-full text-[8px] font-black uppercase tracking-widest animate-pulse shadow-lg shadow-emerald-500/20">
                                                                        <Rocket size={10} />
                                                                        Project Created
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <span className="text-[10px] font-black text-indigo-500 uppercase tracking-tight flex items-center gap-1.5">
                                                                {fu.interaction_type === 'call' && <PhoneCall size={10} />}
                                                                {fu.interaction_type === 'meeting' && <Users size={10} />}
                                                                {fu.interaction_type === 'whatsapp' && <MessageCircle size={10} />}
                                                                {fu.interaction_type === 'email' && <Mail size={10} />}
                                                                {fu.interaction_type === 'other' && <MoreHorizontal size={10} />}
                                                                {fu.interaction_type}
                                                                </span>
                                                        </div>
                                                    )}
                                                    <div className="flex items-center gap-2 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button 
                                                            onClick={() => {
                                                                setEditingFollowUpId(fu.id);
                                                                setEditingData(fu);
                                                            }}
                                                            className="p-1.5 text-muted hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
                                                            title="Edit Log"
                                                        >
                                                            <Edit2 size={14} />
                                                        </button>
                                                        <button 
                                                            onClick={() => handleDeleteFollowUp(fu.id)}
                                                            className="p-1.5 text-muted hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all"
                                                            title="Delete Log"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                            {editingFollowUpId === fu.id ? (
                                                <div className="space-y-4 animate-in fade-in duration-300">
                                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                                                        <div className="space-y-1">
                                                            <label className="text-[10px] font-black text-muted uppercase">Type</label>
                                                            <select 
                                                                value={editingData.interaction_type || ''}
                                                                onChange={(e) => setEditingData({...editingData, interaction_type: e.target.value as import('./lead').InteractionType})}
                                                                className="w-full px-3 py-1.5 bg-background border border-border rounded-lg text-xs font-bold"
                                                            >
                                                                <option value="call">📞 CALL</option>
                                                                <option value="meeting">🤝 MEET</option>
                                                                <option value="whatsapp">📱 WA</option>
                                                                <option value="email">📧 EMAIL</option>
                                                                <option value="other">💬 OTHER</option>
                                                            </select>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <label className="text-[10px] font-black text-muted uppercase">Next Date</label>
                                                            <input 
                                                                type="date"
                                                                value={editingData.followup_date || ''}
                                                                onChange={(e) => setEditingData({...editingData, followup_date: e.target.value})}
                                                                className="w-full px-3 py-1.5 bg-background border border-border rounded-lg text-xs font-bold"
                                                            />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <label className="text-[10px] font-black text-muted uppercase">Interest</label>
                                                            <select 
                                                                value={editingData.interest_level || ''}
                                                                onChange={(e) => setEditingData({...editingData, interest_level: e.target.value as import('./lead').InterestLevel})}
                                                                className="w-full px-3 py-1.5 bg-background border border-border rounded-lg text-xs font-bold"
                                                            >
                                                                <option value="cold">COLD</option>
                                                                <option value="warm">WARM</option>
                                                                <option value="hot">HOT</option>
                                                            </select>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <label className="text-[10px] font-black text-muted uppercase">Status</label>
                                                            <select 
                                                                value={editingData.conversion_status || ''}
                                                                onChange={(e) => setEditingData({...editingData, conversion_status: e.target.value as import('./lead').ConversionStatus})}
                                                                className="w-full px-3 py-1.5 bg-background border border-border rounded-lg text-xs font-bold"
                                                            >
                                                                <option value="new">NEW</option>
                                                                <option value="contacted">CONTACTED</option>
                                                                <option value="proposal_sent">PROPOSAL SENT</option>
                                                                <option value="negotiation">NEGOTIATION</option>
                                                                <option value="approved">APPROVED</option>
                                                                <option value="closed">CLOSED</option>
                                                                <option value="denied">DENIED</option>
                                                            </select>
                                                        </div>
                                                        <div className="md:col-span-4 pt-2">
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    const newValue = !editingData.is_project_created;
                                                                    setEditingData({
                                                                        ...editingData, 
                                                                        is_project_created: newValue,
                                                                        conversion_status: newValue ? 'closed' : editingData.conversion_status
                                                                    });
                                                                }}
                                                                className={`w-full p-2 rounded-xl border transition-all flex items-center justify-between group ${
                                                                    editingData.is_project_created 
                                                                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600' 
                                                                        : 'bg-muted/5 border-border text-muted hover:border-emerald-500/30'
                                                                }`}
                                                            >
                                                                <div className="flex items-center gap-2">
                                                                    <div className={`p-1.5 rounded-lg transition-colors ${
                                                                        editingData.is_project_created ? 'bg-emerald-500 text-white' : 'bg-muted/10 group-hover:bg-emerald-500/20'
                                                                    }`}>
                                                                        <Rocket size={14} />
                                                                    </div>
                                                                    <span className="text-[10px] font-black uppercase tracking-widest">Project Created?</span>
                                                                </div>
                                                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                                                                    editingData.is_project_created ? 'bg-emerald-500 border-emerald-500' : 'border-muted/30 group-hover:border-emerald-500/50'
                                                                }`}>
                                                                    {editingData.is_project_created && <CheckCircle size={12} className="text-white" />}
                                                                </div>
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <textarea 
                                                        value={editingData.note || ''}
                                                        onChange={(e) => setEditingData({...editingData, note: e.target.value})}
                                                        className="w-full p-3 bg-background border border-border rounded-xl text-sm font-bold resize-none"
                                                        rows={2}
                                                    />
                                                    <div className="flex justify-end gap-2">
                                                        <button 
                                                            onClick={() => setEditingFollowUpId(null)}
                                                            className="px-4 py-1.5 text-xs font-black text-muted hover:text-foreground"
                                                        >
                                                            Cancel
                                                        </button>
                                                        <button 
                                                            onClick={() => handleUpdateFollowUp(fu.id)}
                                                            className="px-6 py-1.5 bg-primary text-white text-xs font-black rounded-lg shadow-md"
                                                        >
                                                            Save Changes
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <p className="text-foreground font-bold leading-relaxed">{fu.note}</p>
                                            )}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-12 text-muted">
                                    <MessageSquare size={48} className="mx-auto mb-4 opacity-20" />
                                    <p className="font-bold italic">No interaction history found for this lead.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: Timeline / Meta */}
                <div className="space-y-8">
                    {/* Interaction Timeline summary or other small widgets can go here if needed */}
                </div>
            </div>

            {/* Quick Set Confirmation Modal */}
            {showQuickSetModal && (
                <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/40 backdrop-blur-md">
                    <div className="bg-card text-foreground border border-border w-full max-w-md rounded-[2rem] shadow-2xl overflow-hidden relative">



                        <div className="p-6 border-b border-border bg-emerald-500/5 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-emerald-500 rounded-xl text-white shadow-lg shadow-emerald-500/30">
                                    <Rocket size={20} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-foreground uppercase tracking-tight">Confirm Quick Set</h2>
                                    <p className="text-xs font-bold text-muted uppercase tracking-widest">Schedule onboarding task</p>
                                </div>
                            </div>
                            <button onClick={() => setShowQuickSetModal(false)} className="p-2 text-muted hover:text-rose-500 transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-muted uppercase tracking-widest ml-4">Task Title</label>
                                <input 
                                    value={quickSetData.title}
                                    onChange={e => setQuickSetData(prev => ({ ...prev, title: e.target.value }))}
                                    className="w-full px-5 py-3 bg-background border border-border rounded-xl font-bold focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-sm"
                                    placeholder="Enter task title..."
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-muted uppercase tracking-widest ml-4">Schedule Date</label>
                                    <input 
                                        type="date"
                                        value={quickSetData.schedule_date}
                                        onChange={e => setQuickSetData(prev => ({ ...prev, schedule_date: e.target.value }))}
                                        className="w-full px-5 py-3 bg-background border border-border rounded-xl font-bold focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-sm"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-muted uppercase tracking-widest ml-4">Schedule Time</label>
                                    <input 
                                        type="time"
                                        value={quickSetData.schedule_time}
                                        onChange={e => setQuickSetData(prev => ({ ...prev, schedule_time: e.target.value }))}
                                        className="w-full px-6 py-4 bg-background border border-border rounded-2xl font-bold focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between px-4">
                                    <label className="text-[10px] font-black text-muted uppercase tracking-widest">Assign To</label>
                                    <div className="flex bg-muted/10 p-1 rounded-xl border border-border/50">
                                        <button 
                                            type="button"
                                            onClick={() => {
                                                setAssignmentMode('user');
                                                setQuickSetData(prev => ({ ...prev, assigned_role: null }));
                                            }}
                                            className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${assignmentMode === 'user' ? 'bg-background text-primary shadow-sm' : 'text-muted hover:text-foreground'}`}
                                        >
                                            Employee
                                        </button>
                                        <button 
                                            type="button"
                                            onClick={() => {
                                                setAssignmentMode('role');
                                                setQuickSetData(prev => ({ ...prev, assigned_to: null }));
                                            }}
                                            className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${assignmentMode === 'role' ? 'bg-background text-primary shadow-sm' : 'text-muted hover:text-foreground'}`}
                                        >
                                            Role
                                        </button>
                                    </div>
                                </div>
                                
                                {assignmentMode === 'user' ? (
                                    <SearchableUserSelect 
                                        value={quickSetData.assigned_to}
                                        onChange={val => setQuickSetData(prev => ({ ...prev, assigned_to: val }))}
                                        placeholder="Select employee..."
                                    />
                                ) : (
                                    <SearchableRoleSelect 
                                        value={quickSetData.assigned_role}
                                        onChange={val => setQuickSetData(prev => ({ ...prev, assigned_role: val }))}
                                        placeholder="Select role..."
                                    />
                                )}
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-muted uppercase tracking-widest ml-4">Description</label>
                                <textarea 
                                    value={quickSetData.description}
                                    onChange={e => setQuickSetData(prev => ({ ...prev, description: e.target.value }))}
                                    rows={2}
                                    className="w-full px-5 py-3 bg-background border border-border rounded-xl font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all resize-none text-sm"
                                    placeholder="Add any specific instructions..."
                                />
                            </div>
                        </div>

                        <div className="p-6 bg-muted/5 flex gap-3 border-t border-border">
                            <button 
                                type="button"
                                onClick={() => setShowQuickSetModal(false)}
                                className="flex-1 py-3 font-black text-muted hover:text-foreground uppercase tracking-widest transition-all text-xs"
                            >
                                Skip Task
                            </button>
                            <button 
                                type="button"
                                onClick={async () => {
                                    try {
                                        await api.post('/schedules/', quickSetData);
                                        setShowQuickSetModal(false);
                                    } catch (err) {
                                        console.error("Failed to create quick set schedule", err);
                                        alert("Failed to create task");
                                    }
                                }}
                                className="flex-1 py-3 bg-emerald-500 text-white font-black rounded-xl shadow-xl shadow-emerald-500/30 uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all text-xs"
                            >
                                Confirm & Set
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default LeadDetail;

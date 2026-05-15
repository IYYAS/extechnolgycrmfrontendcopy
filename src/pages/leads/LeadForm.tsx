import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
    Target, 
    Save, 
    X, 
    Building2, 
    User as UserIcon, 
    Phone, 
    Mail, 
    Globe, 
    MapPin, 
    ArrowLeft,
    Loader2,
    Paperclip,
    FileText,
    Tag
} from 'lucide-react';
import { leadService } from './leadService';
import SearchableUserSelect from '../../components/SearchableUserSelect';
import SearchableRoleSelect from '../../components/SearchableRoleSelect';
import type { InterestLevel, ConversionStatus, FollowUpStatus } from './lead';


const LeadForm: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const isEdit = !!id;

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(isEdit);
    const [formData, setFormData] = useState({
        company_name: '',
        contact_person: '',
        contact_number: '',
        email: '',
        website: '',
        address: '',
        interest_level: 'warm' as InterestLevel,
        conversion_status: 'new' as ConversionStatus,
        lead_source: '',
        description: '',
        follow_up: 'no' as FollowUpStatus,
        next_followup_date: '',
        remark: '',
        assigned_to: null as number | null,
        assigned_role: null as number | null,
        service_required: '',
        attachment: null as File | null
    });

    const [assignmentMode, setAssignmentMode] = useState<'user' | 'role'>('user');



    useEffect(() => {
        if (isEdit) {
            const fetchLead = async () => {
                try {
                    const data = await leadService.getLead(parseInt(id));
                    setFormData({
                        company_name: data.company_name,
                        contact_person: data.contact_person,
                        contact_number: data.contact_number,
                        email: data.email || '',
                        website: data.website || '',
                        address: data.address || '',
                        interest_level: data.interest_level,
                        conversion_status: data.conversion_status,
                        lead_source: data.lead_source || '',
                        description: data.description || '',
                        follow_up: data.follow_up || 'no',
                        next_followup_date: data.next_followup_date || '',
                        remark: data.remark || '',
                        assigned_to: data.assigned_to ?? null,
                        assigned_role: data.assigned_role ?? null,
                        service_required: (data.service_required === '[]' ? '' : data.service_required) || '',
                        attachment: null
                    });
                    if (data.assigned_role) {
                        setAssignmentMode('role');
                    }
                } catch (error) {
                    console.error('Failed to fetch lead:', error);
                    navigate('/leads/list');
                } finally {
                    setFetching(false);
                }
            };
            fetchLead();
        }
    }, [id, isEdit, navigate]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target as HTMLInputElement;
        if (type === 'file') {
            const files = (e.target as HTMLInputElement).files;
            if (files && files.length > 0) {
                setFormData(prev => ({ ...prev, [name]: files[0] }));
            }
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const formatUrl = (url: string) => {
                if (!url) return url;
                if (!url.startsWith('http://') && !url.startsWith('https://')) {
                    return `https://${url}`;
                }
                return url;
            };

            const submitData = new FormData();
            
            // Define fields that are handled via "write_" prefixes for the serializer
            const writeFields = ['interest_level', 'conversion_status', 'remark', 'next_followup_date'];
            
            Object.keys(formData).forEach(key => {
                const value = formData[key as keyof typeof formData];
                if (value === null || value === undefined) return;

                if (key === 'attachment') {
                    if (value instanceof File) {
                        submitData.append('attachment', value);
                    }
                } else if (key === 'website') {
                    submitData.append('website', formatUrl(value as string));
                } else if (!writeFields.includes(key)) {
                    // Append everything else that isn't a write field
                    submitData.append(key, String(value));
                }
            });

            // Add the "write_" fields specifically for the serializer logic
            submitData.append('write_interest_level', formData.interest_level);
            submitData.append('write_conversion_status', formData.conversion_status);
            submitData.append('write_remark', formData.remark);
            if (formData.next_followup_date) {
                submitData.append('write_followup_date', formData.next_followup_date);
            }

            if (isEdit) {
                await leadService.updateLead(parseInt(id), submitData as any);
            } else {
                await leadService.createLead(submitData as any);
            }
            navigate('/leads/list');
        } catch (error) {
            console.error('Failed to save lead:', error);
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
                <Loader2 className="animate-spin text-primary" size={48} />
                <p className="text-muted font-bold animate-pulse">Fetching Lead data...</p>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-500 pb-10">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => navigate(-1)}
                        className="p-2.5 bg-card border border-border rounded-xl text-muted hover:text-foreground transition-all active:scale-95 shadow-sm"
                    >
                        <ArrowLeft size={18} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-black text-foreground tracking-tight uppercase">
                            {isEdit ? 'Edit Lead' : 'Initialize New Lead'}
                        </h1>
                        <p className="text-muted text-[10px] font-medium italic">Define the future of this opportunity.</p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 pb-20">
                <div className="space-y-6">
                    <div className="bg-card border border-border rounded-[1.5rem] p-6 shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-3xl -mr-32 -mt-32" />
                        
                        <h2 className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                            <Building2 size={16} />
                            Primary Information
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-muted uppercase tracking-widest ml-4">Company Name</label>
                                <div className="relative group">
                                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-primary transition-colors" size={16} />
                                    <input 
                                        required
                                        name="company_name"
                                        value={formData.company_name}
                                        onChange={handleChange}
                                        className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/50 outline-none transition-all font-bold text-sm"
                                        placeholder="e.g. Acme Corp"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-muted uppercase tracking-widest ml-4">Contact Person</label>
                                <div className="relative group">
                                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-primary transition-colors" size={16} />
                                    <input 
                                        required
                                        name="contact_person"
                                        value={formData.contact_person}
                                        onChange={handleChange}
                                        className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/50 outline-none transition-all font-bold text-sm"
                                        placeholder="Full Name"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-muted uppercase tracking-widest ml-4">Contact Number</label>
                                <div className="relative group">
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-primary transition-colors" size={16} />
                                    <input 
                                        required
                                        name="contact_number"
                                        value={formData.contact_number}
                                        onChange={handleChange}
                                        className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/50 outline-none transition-all font-bold text-sm"
                                        placeholder="+1 234 567 890"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-muted uppercase tracking-widest ml-4">Email Address</label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-primary transition-colors" size={16} />
                                    <input 
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/50 outline-none transition-all font-bold text-sm"
                                        placeholder="contact@acme.com"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 space-y-1.5">
                            <label className="text-[10px] font-black text-muted uppercase tracking-widest ml-4">Address</label>
                            <div className="relative group">
                                <MapPin className="absolute left-4 top-3.5 text-muted group-focus-within:text-primary transition-colors" size={16} />
                                <textarea 
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    rows={2}
                                    className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/50 outline-none transition-all font-bold resize-none text-sm"
                                    placeholder="Company HQ address..."
                                />
                            </div>
                        </div>
                        {/* Additional Metadata Section */}
                        <div className="mt-8 pt-8 border-t border-border/50">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 mb-8 flex items-center gap-2">
                                <Tag size={14} />
                                Additional Metadata
                            </h3>

                            <div className="space-y-6 animate-in slide-in-from-top-4 duration-300">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-muted uppercase tracking-widest ml-4">Website</label>
                                        <div className="relative group">
                                            <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-indigo-400 transition-colors" size={16} />
                                            <input 
                                                name="website"
                                                value={formData.website}
                                                onChange={handleChange}
                                                className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-xl focus:ring-2 focus:ring-indigo-400/50 outline-none transition-all font-bold text-sm"
                                                placeholder="www.company.com"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-muted uppercase tracking-widest ml-4">Lead Source</label>
                                        <div className="relative group">
                                            <Target className="absolute left-4 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-indigo-400 transition-colors" size={16} />
                                            <input 
                                                name="lead_source"
                                                value={formData.lead_source}
                                                onChange={handleChange}
                                                className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-xl focus:ring-2 focus:ring-indigo-400/50 outline-none transition-all font-bold text-sm"
                                                placeholder="Referral, Social Media, etc."
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between px-4">
                                            <label className="text-[10px] font-black text-muted uppercase tracking-widest leading-none">Assignment Target</label>
                                            <div className="flex bg-muted/10 p-1 rounded-xl border border-border/50">
                                                <button 
                                                    type="button"
                                                    onClick={() => {
                                                        setAssignmentMode('user');
                                                        setFormData(prev => ({ ...prev, assigned_role: null }));
                                                    }}
                                                    className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${assignmentMode === 'user' ? 'bg-background text-primary shadow-sm' : 'text-muted hover:text-foreground'}`}
                                                >
                                                    Employee
                                                </button>
                                                <button 
                                                    type="button"
                                                    onClick={() => {
                                                        setAssignmentMode('role');
                                                        setFormData(prev => ({ ...prev, assigned_to: null }));
                                                    }}
                                                    className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${assignmentMode === 'role' ? 'bg-background text-primary shadow-sm' : 'text-muted hover:text-foreground'}`}
                                                >
                                                    Role
                                                </button>
                                            </div>
                                        </div>
                                        
                                        {assignmentMode === 'user' ? (
                                            <SearchableUserSelect 
                                                value={formData.assigned_to}
                                                onChange={val => setFormData(prev => ({ ...prev, assigned_to: val }))}
                                                placeholder="Select strategist..."
                                            />
                                        ) : (
                                            <SearchableRoleSelect 
                                                value={formData.assigned_role}
                                                onChange={val => setFormData(prev => ({ ...prev, assigned_role: val }))}
                                                placeholder="Select department/role..."
                                            />
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-muted uppercase tracking-widest ml-4">Service Required</label>
                                        <div className="relative group">
                                            <FileText className="absolute left-4 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-indigo-400 transition-colors" size={16} />
                                            <input 
                                                name="service_required"
                                                value={formData.service_required}
                                                onChange={handleChange}
                                                className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-xl focus:ring-2 focus:ring-indigo-400/50 outline-none transition-all font-bold text-sm"
                                                placeholder="e.g. Website Design, CRM Setup"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-muted uppercase tracking-widest ml-4">Attachment</label>
                                        <div className="relative group">
                                            <Paperclip className="absolute left-4 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-indigo-400 transition-colors" size={18} />
                                            <input 
                                                type="file"
                                                name="attachment"
                                                onChange={handleChange}
                                                className="w-full pl-12 pr-4 py-4 bg-background border border-border rounded-2xl focus:ring-2 focus:ring-indigo-400/50 outline-none transition-all font-bold file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-black file:bg-indigo-400/10 file:text-indigo-400 hover:file:bg-indigo-400/20"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-muted uppercase tracking-widest ml-4">Strategic Notes</label>
                                    <textarea 
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        rows={4}
                                        className="w-full px-6 py-4 bg-background border border-border rounded-2xl focus:ring-2 focus:ring-indigo-400/50 outline-none transition-all font-bold resize-none"
                                        placeholder="Internal briefing and opportunity analysis..."
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Sticky Bottom Actions */}
                <div className="sticky bottom-0 -mx-8 px-8 bg-background/80 backdrop-blur-md border-t border-border z-50 py-6">
                    <div className="flex items-center justify-end gap-6">
                        <button 
                            type="button"
                            onClick={() => navigate('/leads/list')}
                            className="px-8 py-3.5 bg-muted/10 text-muted font-bold rounded-2xl border border-transparent hover:border-border hover:bg-muted/20 transition-all flex items-center gap-2 active:scale-95"
                        >
                            <X size={20} />
                            Discard
                        </button>
                        <button 
                            type="submit"
                            disabled={loading}
                            className="px-12 py-3.5 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/30 flex items-center gap-3 active:scale-95 disabled:opacity-50 hover:shadow-primary/50 transition-all uppercase tracking-wider italic"
                        >
                            {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                            {isEdit ? 'Update Strategic Lead' : 'Commit New Lead'}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default LeadForm;

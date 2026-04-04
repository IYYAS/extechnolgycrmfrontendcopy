import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    getCompanyProfiles,
    getCompanyProfile,
    deleteCompanyProfile,
    type CompanyProfile
} from './companyProfileService';
import {
    Building2,
    Edit2,
    Loader2,
    Mail,
    Phone,
    MapPin,
    Clock,
    Plus,
    Briefcase,
    Trash2
} from 'lucide-react';

const CompanyProfilePage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const [profiles, setProfiles] = useState<CompanyProfile[]>([]);
    const [selectedProfile, setSelectedProfile] = useState<CompanyProfile | null>(null);

    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Parse ?id=X from URL
    const queryParams = new URLSearchParams(location.search);
    const preselectedId = queryParams.get('id');

    useEffect(() => {
        fetchProfiles();
    }, []);

    const fetchProfiles = async () => {
        setLoading(true);
        try {
            const data = await getCompanyProfiles();
            setProfiles(data);

            if (data.length > 0) {
                // Check for preselected ID from URL
                if (preselectedId) {
                    const match = data.find(p => p.id === parseInt(preselectedId));
                    if (match) {
                        setSelectedProfile(match);
                        setLoading(false);
                        return;
                    }
                }
                setSelectedProfile(data[0]);
            }
        } catch (err: any) {
            setError('Failed to load company profiles.');
        } finally {
            setLoading(false);
        }
    };

    const handleSelectProfile = async (id: number) => {
        try {
            const data = await getCompanyProfile(id);
            setSelectedProfile(data);
            // Update URL without reloading to reflect current profile
            navigate(`/company-profile?id=${id}`, { replace: true });
        } catch {
            setError('Failed to load profile.');
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Are you sure you want to delete this company profile?')) return;

        setDeleting(true);
        try {
            await deleteCompanyProfile(id);
            await fetchProfiles();
        } catch (err: any) {
            setError('Failed to delete profile.');
        } finally {
            setDeleting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <Loader2 className="animate-spin text-primary" size={48} />
                <p className="text-muted font-medium">Loading company profiles...</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-500">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-black tracking-tight text-foreground">Company Profiles</h1>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate('/company-profile/new')}
                        className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-2xl font-bold text-sm hover:shadow-lg hover:shadow-primary/20 transition-all"
                    >
                        <Plus size={18} />
                        New Profile
                    </button>
                </div>
            </div>

            {error && (
                <div className="p-5 bg-rose-500/10 border border-rose-500/20 rounded-3xl text-rose-500 text-sm font-bold">
                    {error}
                </div>
            )}

            {/* Profile Tabs */}
            {profiles.length > 1 && (
                <div className="flex gap-3 flex-wrap">
                    {profiles.map((p) => (
                        <button
                            key={p.id}
                            onClick={() => handleSelectProfile(p.id)}
                            className={`px-5 py-2.5 rounded-2xl font-bold text-sm transition-all border ${selectedProfile?.id === p.id
                                ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20'
                                : 'bg-card text-muted border-border hover:border-primary/30 hover:text-primary'
                                }`}
                        >
                            {p.company_name}
                        </button>
                    ))}
                </div>
            )}

            {profiles.length === 0 && (
                <div className="py-16 bg-card border border-border rounded-[2.5rem] text-center space-y-4">
                    <Building2 size={64} className="mx-auto text-muted/20" />
                    <h2 className="text-xl font-bold text-foreground">No Company Profile Yet</h2>
                    <p className="text-muted">Create your first company profile to get started.</p>
                    <button
                        onClick={() => navigate('/company-profile/new')}
                        className="px-6 py-3 bg-primary text-white font-bold rounded-2xl shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all"
                    >
                        Create Profile
                    </button>
                </div>
            )}

            {/* Selected Profile Section */}
            {selectedProfile && (
                <div className="space-y-6">
                    {/* Basic Info Card */}
                    <div className="bg-card border border-border rounded-[2.5rem] overflow-hidden shadow-sm">
                        <div className="p-8 pb-6 flex flex-col md:flex-row md:items-center gap-6 relative border-b border-border">
                            <div className="absolute top-6 right-6 flex items-center gap-3">
                                <button
                                    onClick={() => handleDelete(selectedProfile.id)}
                                    disabled={deleting}
                                    className="flex items-center gap-2 px-4 py-2.5 bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded-2xl font-bold text-sm hover:bg-rose-500/20 transition-all disabled:opacity-50"
                                >
                                    {deleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                                    Delete
                                </button>
                                <button
                                    onClick={() => navigate(`/company-profile/edit/${selectedProfile.id}`)}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-primary/10 text-primary border border-primary/20 rounded-2xl font-bold text-sm hover:bg-primary/20 transition-all"
                                >
                                    <Edit2 size={16} />
                                    Edit
                                </button>
                            </div>
                            <div className="flex items-center gap-6">
                                {selectedProfile.logo ? (
                                    <a href={selectedProfile.logo} target="_blank" rel="noopener noreferrer" className="hover:scale-105 transition-transform">
                                        <img
                                            src={selectedProfile.logo}
                                            alt="Company Logo"
                                            className="w-24 h-24 object-contain rounded-2xl bg-white p-2 border border-border shadow-lg"
                                        />
                                    </a>
                                ) : (
                                    <div className="w-24 h-24 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                                        <Building2 size={40} />
                                    </div>
                                )}
                                <div>
                                    <h2 className="text-3xl font-black tracking-tight text-foreground">{selectedProfile.company_name}</h2>
                                    {selectedProfile.company_type && (
                                        <div className="flex items-center gap-2 mt-2">
                                            <span className="px-3 py-1 bg-primary/10 text-primary rounded-lg text-xs font-bold border border-primary/20">
                                                <Briefcase size={12} className="inline mr-1.5 -mt-0.5" />
                                                {selectedProfile.company_type}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl flex-shrink-0">
                                        <Mail size={20} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-muted uppercase tracking-widest mb-1">Email</p>
                                        <p className="text-foreground font-bold font-mono text-sm">{selectedProfile.email || '—'}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl flex-shrink-0">
                                        <Phone size={20} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-muted uppercase tracking-widest mb-1">Phone</p>
                                        <p className="text-foreground font-bold">{selectedProfile.phone || '—'}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-6">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-violet-500/10 text-violet-500 rounded-xl flex-shrink-0">
                                        <MapPin size={20} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-muted uppercase tracking-widest mb-1">Address</p>
                                        <p className="text-foreground font-medium leading-relaxed text-sm">{selectedProfile.address || '—'}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl flex-shrink-0">
                                        <Clock size={20} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-muted uppercase tracking-widest mb-1">Last Updated</p>
                                        <p className="text-foreground font-medium text-sm">
                                            {selectedProfile.updated_at ? new Date(selectedProfile.updated_at).toLocaleString() : '—'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CompanyProfilePage;

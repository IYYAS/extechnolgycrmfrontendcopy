import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    getCompanyProfile,
    createCompanyProfile,
    updateCompanyProfile
} from './companyProfileService';
import {
    Building2,
    Save,
    Loader2,
    ArrowLeft,
    X
} from 'lucide-react';

const CompanyProfileForm: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const isEdit = !!id;

    const [loading, setLoading] = useState(isEdit);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        company_name: '',
        company_type: '',
        email: '',
        phone: '',
        address: '',
    });
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);

    useEffect(() => {
        if (isEdit && id) {
            const fetchProfile = async () => {
                try {
                    const data = await getCompanyProfile(parseInt(id));
                    setFormData({
                        company_name: data.company_name,
                        company_type: data.company_type,
                        email: data.email,
                        phone: data.phone,
                        address: data.address,
                    });
                    setLogoPreview(data.logo);
                } catch (err: any) {
                    setError('Failed to load company profile.');
                } finally {
                    setLoading(false);
                }
            };
            fetchProfile();
        }
    }, [id, isEdit]);

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setLogoFile(file);
            setLogoPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError(null);
        try {
            const fd = new FormData();
            fd.append('company_name', formData.company_name);
            fd.append('company_type', formData.company_type);
            fd.append('email', formData.email);
            fd.append('phone', formData.phone);
            fd.append('address', formData.address);
            if (logoFile) {
                fd.append('logo', logoFile);
            }

            if (isEdit && id) {
                await updateCompanyProfile(parseInt(id), fd);
            } else {
                await createCompanyProfile(fd);
            }
            navigate('/company-profile');
        } catch (err: any) {
            setError(err.response?.data?.detail || JSON.stringify(err.response?.data) || 'Failed to save profile.');
        } finally {
            setSaving(false);
        }
    };

    const inputCls = "w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all";
    const labelCls = "text-[11px] font-bold text-muted uppercase tracking-widest mb-1.5 block";

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <Loader2 className="animate-spin text-primary" size={48} />
                <p className="text-muted font-medium">Loading profile...</p>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-500">
            <div className="flex items-center justify-between">
                <button onClick={() => navigate('/company-profile')} className="flex items-center gap-2 text-muted hover:text-primary font-bold transition-all">
                    <ArrowLeft size={18} />
                    <span>Back</span>
                </button>
                <h1 className="text-2xl font-black text-foreground tracking-tight">
                    {isEdit ? 'Edit Company Profile' : 'New Company Profile'}
                </h1>
            </div>

            {error && (
                <div className="p-5 bg-rose-500/10 border border-rose-500/20 rounded-3xl text-rose-500 text-sm font-bold">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="bg-card border border-border rounded-[2.5rem] p-8 shadow-sm space-y-6">
                {/* Logo Upload */}
                <div className="flex flex-col items-center gap-4 pb-6 border-b border-border">
                    <div className="relative group">
                        {logoPreview ? (
                            <div className="relative">
                                <img
                                    src={logoPreview}
                                    alt="Company Logo"
                                    className="w-28 h-28 object-contain rounded-2xl bg-white p-2 border border-border shadow-lg"
                                />
                                <button
                                    type="button"
                                    onClick={() => { setLogoFile(null); setLogoPreview(null); }}
                                    className="absolute -top-2 -right-2 bg-rose-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                >
                                    <X size={12} />
                                </button>
                            </div>
                        ) : (
                            <div className="w-28 h-28 rounded-2xl bg-primary/10 border-2 border-dashed border-primary/30 flex items-center justify-center">
                                <Building2 size={40} className="text-primary/40" />
                            </div>
                        )}
                    </div>
                    <div>
                        <input type="file" accept="image/*" onChange={handleLogoChange} className="hidden" id="logo-upload" />
                        <label
                            htmlFor="logo-upload"
                            className="px-5 py-2 bg-primary/10 text-primary rounded-xl font-bold text-xs cursor-pointer hover:bg-primary/20 transition-all"
                        >
                            {logoPreview ? 'Change Logo' : 'Upload Logo'}
                        </label>
                    </div>
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className={labelCls}>Company Name</label>
                        <input
                            type="text"
                            required
                            placeholder="e.g. EX Technology Solutions Pvt Ltd"
                            value={formData.company_name}
                            onChange={e => setFormData({ ...formData, company_name: e.target.value })}
                            className={inputCls}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className={labelCls}>Company Type</label>
                        <input
                            type="text"
                            placeholder="e.g. IT Services"
                            value={formData.company_type}
                            onChange={e => setFormData({ ...formData, company_type: e.target.value })}
                            className={inputCls}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className={labelCls}>Email</label>
                        <input
                            type="email"
                            placeholder="contact@company.com"
                            value={formData.email}
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                            className={inputCls}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className={labelCls}>Phone</label>
                        <input
                            type="text"
                            placeholder="+91 98765 43210"
                            value={formData.phone}
                            onChange={e => setFormData({ ...formData, phone: e.target.value })}
                            className={inputCls}
                        />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                        <label className={labelCls}>Address</label>
                        <textarea
                            rows={3}
                            placeholder="Full company address..."
                            value={formData.address}
                            onChange={e => setFormData({ ...formData, address: e.target.value })}
                            className={inputCls}
                        />
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-4 pt-4 border-t border-border">
                    <button
                        type="button"
                        onClick={() => navigate('/company-profile')}
                        className="px-6 py-3 bg-muted/10 text-muted font-bold rounded-2xl border border-transparent hover:border-border hover:bg-muted/20 transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={saving}
                        className="flex items-center gap-2 px-8 py-3 bg-primary text-white font-bold rounded-2xl shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                    >
                        {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                        {isEdit ? 'Save Changes' : 'Create Profile'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CompanyProfileForm;

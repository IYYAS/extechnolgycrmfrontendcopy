import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProjectServer, createProjectServer, updateProjectServer } from './serverService';
import { getAllBusinessAddresses, type ProjectBusinessAddress } from '../projects/projectService';
import type { ProjectServer } from './serverService';
import {
    ArrowLeft,
    Save,
    Loader2,
    Server,
    HardDrive,
    CreditCard,
    Calendar,
    Briefcase
} from 'lucide-react';
import ProviderSelect from '../../components/ProviderSelect';

const inputCls = "w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all";
const labelCls = "text-[11px] font-bold text-muted uppercase tracking-widest mb-1.5 block";

const ServerForm: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const isEdit = !!id;

    const [loading, setLoading] = useState(isEdit);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState<Partial<ProjectServer>>({
        name: '',
        server_type: 'VPS',
        accrued_by: 'Extechnology',
        purchased_from: '',
        purchase_date: new Date().toISOString().split('T')[0],
        expiration_date: '',
        status: 'Active',
        cost: '0.00',
        payment_status: 'UNPAID',
        project: null,
        client_address: null
    });
    const [businessAddresses, setBusinessAddresses] = useState<ProjectBusinessAddress[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const addrs = await getAllBusinessAddresses(1, '');
                setBusinessAddresses(addrs.results);

                if (isEdit && id) {
                    const data = await getProjectServer(parseInt(id));
                    setFormData(data);
                }
            } catch (err) {
                console.error('Failed to fetch data:', err);
                setError('Failed to load form data.');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [isEdit, id]);

    const handleInput = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ 
            ...prev, 
            [name]: (name === 'project' || name === 'client_address') ? (value ? parseInt(value) : null) : value 
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError(null);
        try {
            if (isEdit && id) {
                await updateProjectServer(parseInt(id), formData);
            } else {
                await createProjectServer(formData);
            }
            navigate('/infrastructure/servers');
        } catch (err: any) {
            console.error('Failed to save server:', err);
            setError(err.response?.data?.detail || 'Failed to save server. Please check your input.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <Loader2 className="animate-spin text-primary" size={48} />
                <p className="text-muted font-medium">Loading server parameters...</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-500 mb-24">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="p-2.5 hover:bg-muted/10 rounded-2xl text-muted border border-transparent hover:border-border transition-all">
                        <ArrowLeft size={22} />
                    </button>
                    <div>
                        <h1 className="text-3xl font-black tracking-tight text-foreground">{isEdit ? 'Edit Server' : 'Add New Server'}</h1>
                        <p className="text-muted text-sm font-medium mt-0.5">{isEdit ? 'Modify infrastructure configuration' : 'Provision a new server record'}</p>
                    </div>
                </div>
            </div>

            {error && (
                <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-500 font-bold text-sm">
                    ⚠️ {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Configuration */}
                <div className="bg-card border border-border rounded-[2.5rem] p-8 shadow-sm">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="p-2.5 bg-primary/10 text-primary rounded-2xl">
                            <Server size={22} />
                        </div>
                        <h3 className="text-lg font-black text-foreground tracking-tight">Basic Configuration</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2 space-y-2">
                            <label className={labelCls}>Server Name</label>
                            <input
                                type="text"
                                name="name"
                                required
                                value={formData.name}
                                onChange={handleInput}
                                placeholder="e.g. Production Cluster A"
                                className={inputCls}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className={labelCls}>Server Type</label>
                            <div className="relative">
                                <HardDrive size={16} className="absolute z-10 left-4 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
                                <ProviderSelect
                                    value={formData.server_type ?? 'VPS'}
                                    onChange={(val) => setFormData(prev => ({ ...prev, server_type: val }))}
                                    options={['VPS', 'Shared', 'Dedicated', 'Cloud']}
                                    placeholder="e.g. VPS, Cloud..."
                                    className={`${inputCls} pl-11`}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className={labelCls}>Status</label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleInput}
                                className={inputCls}
                            >
                                <option value="Active">Active</option>
                                <option value="Pending">Pending</option>
                                <option value="Expired">Expired</option>
                                <option value="Inactive">Inactive</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Procurement & Finance */}
                <div className="bg-card border border-border rounded-[2.5rem] p-8 shadow-sm">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="p-2.5 bg-emerald-500/10 text-emerald-500 rounded-2xl">
                            <CreditCard size={22} />
                        </div>
                        <h3 className="text-lg font-black text-foreground tracking-tight">Procurement & Finance</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className={labelCls}>Purchased From</label>
                            <ProviderSelect
                                value={formData.purchased_from || ''}
                                onChange={(val) => setFormData(prev => ({ ...prev, purchased_from: val }))}
                                options={['AWS', 'DigitalOcean', 'Google Cloud', 'Microsoft Azure', 'Linode', 'Vultr', 'Hostinger', 'Hetzner', 'OVHCloud', 'Contabo']}
                                placeholder="e.g. AWS, DigitalOcean"
                                className={inputCls}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className={labelCls}>Accrued By</label>
                            <input
                                type="text"
                                name="accrued_by"
                                value={formData.accrued_by}
                                onChange={handleInput}
                                className={inputCls}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className={labelCls}>Cost (₹)</label>
                            <input
                                type="number"
                                step="0.01"
                                name="cost"
                                required
                                value={formData.cost}
                                onChange={handleInput}
                                className={`${inputCls} font-bold text-emerald-500`}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className={labelCls}>Payment Status</label>
                            <select
                                name="payment_status"
                                value={formData.payment_status}
                                onChange={handleInput}
                                className={`${inputCls} font-bold ${formData.payment_status?.toUpperCase() === 'PAID' ? 'text-emerald-500' : 'text-rose-500'}`}
                            >
                                <option value="UNPAID">UNPAID</option>
                                <option value="PARTIAL">PARTIAL</option>
                                <option value="PAID">PAID</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Lifecycle & Project Mapping */}
                <div className="bg-card border border-border rounded-[2.5rem] p-8 shadow-sm">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="p-2.5 bg-indigo-500/10 text-indigo-500 rounded-2xl">
                            <Calendar size={22} />
                        </div>
                        <h3 className="text-lg font-black text-foreground tracking-tight">Lifecycle & Assignment</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className={labelCls}>Purchase Date</label>
                            <input
                                type="date"
                                name="purchase_date"
                                value={formData.purchase_date}
                                onChange={handleInput}
                                className={inputCls}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className={labelCls}>Expiration Date</label>
                            <input
                                type="date"
                                name="expiration_date"
                                required
                                value={formData.expiration_date}
                                onChange={handleInput}
                                className={`${inputCls} font-bold text-rose-500`}
                            />
                        </div>

                        <div className="md:col-span-2 space-y-2">
                            <label className={labelCls}>Assigned Project ID</label>
                            <div className="relative">
                                <Briefcase size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
                                <input
                                    type="number"
                                    name="project"
                                    value={formData.project || ''}
                                    onChange={handleInput}
                                    placeholder="Enter Project ID (optional)"
                                    className={`${inputCls} pl-11`}
                                />
                            </div>
                            <p className="text-[10px] text-muted font-medium mt-1 px-1 italic">Leave empty if this is a shared server.</p>
                        </div>

                        <div className="md:col-span-2 space-y-2">
                            <label className={labelCls}>Client / Business Address</label>
                            <div className="relative">
                                <Briefcase size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
                                <select
                                    name="client_address"
                                    value={formData.client_address || ''}
                                    onChange={handleInput}
                                    className={`${inputCls} pl-11`}
                                >
                                    <option value="">Select Client (Optional)</option>
                                    {businessAddresses.map(addr => (
                                        <option key={addr.id} value={addr.id}>
                                            {addr.legal_name || addr.attention_name}{addr.city ? ` (${addr.city})` : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <p className="text-[10px] text-muted font-medium mt-1 px-1 italic">Link this server to a client for automated billing.</p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4">
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="px-8 py-3 bg-muted/10 hover:bg-muted/20 text-foreground font-bold rounded-2xl transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={saving}
                        className="px-10 py-3 bg-primary hover:bg-primary-hover text-white font-black rounded-2xl transition-all shadow-xl shadow-primary/25 flex items-center gap-2 group disabled:opacity-50"
                    >
                        {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} className="group-hover:scale-110 transition-transform" />}
                        <span>{isEdit ? 'Update Server' : 'Provision Server'}</span>
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ServerForm;

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProjectServer, createProjectServer, updateProjectServer } from './serverService';
import type { ProjectServer } from './serverService';
import {
    ArrowLeft,
    Save,
    Loader2,
    Server,
    HardDrive,
    CreditCard,
    Calendar,
    Layout
} from 'lucide-react';
import ProviderSelect from '../../components/ProviderSelect';
import SearchableProjectSelect from '../../components/SearchableProjectSelect';
import SearchableBusinessAddressSelect from '../../components/SearchableBusinessAddressSelect';
import { getProject } from '../projects/projectService';

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
    const [noClientWarning, setNoClientWarning] = useState<{ projectId: number } | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
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

    // Auto-select client address when project changes
    const lastAutoProject = React.useRef<number | null>(null);
    useEffect(() => {
        const syncClient = async () => {
            const projId = formData.project ? Number(formData.project) : null;
            if (!projId) {
                setNoClientWarning(null);
                return;
            }
            if (!formData.client_address || lastAutoProject.current !== projId) {
                try {
                    const project = await getProject(projId);
                    if (project.project_business_addresses && project.project_business_addresses.length > 0) {
                        lastAutoProject.current = projId;
                        setNoClientWarning(null);
                        setFormData(prev => ({
                            ...prev,
                            client_address: project.project_business_addresses[0].id || null
                        }));
                    } else {
                        // Project has no business address linked
                        lastAutoProject.current = projId;
                        setNoClientWarning({ projectId: projId });
                        setFormData(prev => ({ ...prev, client_address: null }));
                    }
                } catch (err) {
                    console.error("Auto-client selection failed:", err);
                }
            }
        };
        syncClient();
    }, [formData.project]);

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
            let savedServer: ProjectServer;
            if (isEdit && id) {
                savedServer = await updateProjectServer(parseInt(id), formData);
            } else {
                savedServer = await createProjectServer(formData);
            }

            // Background Auto-Invoice Logic
            if (!isEdit && formData.client_address) {
                try {
                    const { createInvoice } = await import('../invoices/invoiceService');

                    const invoiceData = {
                        client_company: { id: formData.client_address },
                        invoice_date: new Date().toISOString().split('T')[0],
                        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days due
                        items: [{
                            service_type: 'Server',
                            description: `Server - ${(savedServer.name || '').toUpperCase()}`,
                            rate: savedServer.cost,
                            quantity: 1,
                            purchase_date: savedServer.purchase_date,
                            expairy_date: savedServer.expiration_date,
                            project_server: savedServer.id
                        }],
                        status: 'UNPAID',
                        tax_rate: 0,
                        discount_amount: 0
                    };

                    await createInvoice(formData.client_address, invoiceData);
                } catch (invoiceErr) {
                    console.error('Failed to create background invoice:', invoiceErr);
                    // We don't block the server creation if invoice fails, but we should log it
                }
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
                             <SearchableProjectSelect
                                label="Assigned Project ID"
                                value={formData.project || null}
                                onChange={(val) => setFormData(prev => ({ ...prev, project: val }))}
                                placeholder="Select Project (Optional)"
                                icon={<Layout size={16} />}
                            />
                            <p className="text-[10px] text-muted font-medium mt-1 px-1 italic">Leave empty if this is a shared server.</p>

                            {/* No client warning */}
                            {noClientWarning && (
                                <div className="flex items-start gap-3 p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl mt-2">
                                    <span className="text-amber-500 text-lg">⚠️</span>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-black text-amber-600 dark:text-amber-400">
                                            No Client Address linked to this project.
                                        </p>
                                        <p className="text-[11px] text-amber-500/80 mt-0.5">
                                            Add a Business Address to your project for automated billing.
                                        </p>
                                        <button
                                            type="button"
                                            onClick={() => navigate(`/projects/edit/${noClientWarning.projectId}#section-client-address`)}
                                            className="mt-2 text-[11px] font-black text-amber-600 dark:text-amber-400 underline underline-offset-2 hover:text-amber-700 transition-colors"
                                        >
                                            → Go to Project & Add Client Address
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="md:col-span-2 space-y-2">
                            <label className={labelCls}>Client / Business Address</label>
                            <SearchableBusinessAddressSelect
                                value={formData.client_address ?? null}
                                onChange={(val) => setFormData(prev => ({ ...prev, client_address: val }))}
                            />
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

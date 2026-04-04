import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { getInvoice, createInvoice, updateInvoice } from './invoiceService';
import { getAllBusinessAddresses, type ProjectBusinessAddress } from '../projects/projectService';
import {
    ArrowLeft,
    Save,
    Plus,
    Loader2,
    X,
    FileText,
    Calculator
} from 'lucide-react';

const InvoiceForm: React.FC = () => {
    const { clientId: clientIdParam, id } = useParams<{ clientId: string, id: string }>();
    const clientId = clientIdParam ? parseInt(clientIdParam) : undefined;
    const navigate = useNavigate();
    const { search } = useLocation();
    const isEdit = !!id;

    // Parse query params for auto-fill
    const queryParams = useMemo(() => new URLSearchParams(search), [search]);

    const [loading, setLoading] = useState(isEdit);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [businessAddresses, setBusinessAddresses] = useState<ProjectBusinessAddress[]>([]);

    const [formData, setFormData] = useState<any>({
        client_company: '',
        invoice_date: new Date().toISOString().split('T')[0],
        due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        tax_rate: 0,
        discount_amount: 0,
        status: 'UNPAID',
        items: []
    });

    useEffect(() => {
        if (isEdit && id && clientId) {
            const fetchInvoice = async () => {
                try {
                    const data = await getInvoice(clientId, parseInt(id));
                    setFormData(data);
                } catch (err) {
                    setError('Failed to load invoice data.');
                } finally {
                    setLoading(false);
                }
            };
            fetchInvoice();
        }
        
        const fetchAddresses = async () => {
            try {
                const addrs = await getAllBusinessAddresses(1, '');
                setBusinessAddresses(addrs.results);
            } catch (err) {
                console.error('Failed to fetch addresses:', err);
            }
        };
        fetchAddresses();

        if (!isEdit) {
            // Handle auto-fill for new invoice
            const type = queryParams.get('type');
            const name = queryParams.get('name');
            const rate = queryParams.get('rate');
            const bizAddr = queryParams.get('business_address') || clientId?.toString();
            const purchaseDate = queryParams.get('purchase_date') || '';
            const expiryDate = queryParams.get('expiry_date') || '';
            const serverId = queryParams.get('server_id');
            const domainId = queryParams.get('domain_id');
            const serviceId = queryParams.get('service_id');
            const teamId = queryParams.get('team_id');

            if (type || name || rate || bizAddr) {
                setFormData((prev: any) => {
                    const updated = { ...prev };

                    if (bizAddr) {
                        const parsedId = parseInt(bizAddr);
                        if (!isNaN(parsedId)) {
                            updated.client_company = parsedId;
                        }
                    }

                    if (type || name || rate) {
                        updated.items = [{
                            service_type: type === 'domain' ? 'domain' : (type === 'server' ? 'server' : (type || '')),
                            description: name || '',
                            rate: Number(rate) || 0,
                            quantity: 1,
                            purchase_date: purchaseDate,
                            expairy_date: expiryDate,
                            project_server: serverId ? parseInt(serverId) : null,
                            project_domain: domainId ? parseInt(domainId) : null,
                            project_service: serviceId ? parseInt(serviceId) : null,
                            project_team: teamId ? parseInt(teamId) : null
                        }];
                    }

                    return updated;
                });
            }
            setLoading(false);
        }
    }, [id, isEdit, clientId, queryParams]);

    // ─── Calculations ────────────────────────────────────────────────────────
    const totals = useMemo(() => {
        const subtotal = formData.items.reduce((acc: number, item: any) => acc + (Number(item.rate) * (item.quantity || 0)), 0);
        const taxAmount = (subtotal * Number(formData.tax_rate)) / 100;
        const totalAmount = subtotal + taxAmount - Number(formData.discount_amount);
        const totalPaid = (formData.payments || []).reduce((acc: number, p: any) => acc + Number(p.amount), 0);
        const balanceDue = totalAmount - totalPaid;
        return { subtotal, taxAmount, totalAmount, totalPaid, balanceDue };
    }, [formData.items, formData.payments, formData.tax_rate, formData.discount_amount]);

    // ─── Handlers ────────────────────────────────────────────────────────────
    const addItem = () => setFormData((prev: any) => ({
        ...prev,
        items: [...prev.items, { service_type: '', description: '', rate: 0, quantity: 1, purchase_date: '', expairy_date: '' }]
    }));

    const removeItem = (idx: number) => setFormData((prev: any) => ({
        ...prev,
        items: prev.items.filter((_: any, i: number) => i !== idx)
    }));

    const setItemField = (idx: number, field: string, value: any) => {
        setFormData((prev: any) => {
            const newItems = [...prev.items];
            newItems[idx] = { ...newItems[idx], [field]: value };
            return { ...prev, items: newItems };
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError(null);
        try {
            // Transform client_company to expected dictionary format if it's a number/string
            const payload = { ...formData };
            if (payload.client_company && typeof payload.client_company !== 'object') {
                payload.client_company = { id: parseInt(payload.client_company) };
            }

            // Use clientId from URL or from selected company
            const targetClientId = clientId || (payload.client_company?.id ? parseInt(payload.client_company.id) : (payload.client_company ? parseInt(payload.client_company) : undefined));

            if (!targetClientId || isNaN(targetClientId)) {
                throw new Error('Please select a valid Client / Business Address');
            }

            if (isEdit && id) await updateInvoice(targetClientId, parseInt(id), payload);
            else await createInvoice(targetClientId, payload);
            navigate(`/invoices/client/${targetClientId}`);
        } catch (err: any) {
            setError(err.response?.data?.detail || JSON.stringify(err.response?.data) || 'Failed to save invoice.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
            <Loader2 className="animate-spin text-primary" size={48} />
            <p className="text-muted font-medium">Preparing invoice form...</p>
        </div>
    );

    const inputCls = "w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all";
    const labelCls = "text-[11px] font-bold text-muted uppercase tracking-widest mb-1.5 block";

    return (
        <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-500 max-w-5xl mx-auto pb-24">
            {/* Action Bar */}
            <div className="flex items-center justify-between gap-4">
                <button type="button" onClick={() => navigate(`/invoices/client/${clientId}`)} className="flex items-center gap-2 text-muted hover:text-primary font-bold transition-all">
                    <ArrowLeft size={18} />
                    <span>Back</span>
                </button>
                <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-2 px-8 py-3 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                >
                    {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                    <span>{isEdit ? 'Update Invoice' : 'Create Invoice'}</span>
                </button>
            </div>

            {/* Header Info */}
            <div className="bg-card border border-border rounded-[2.5rem] p-8 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-1">
                        <label className={labelCls}>Client / Business Address</label>
                        <select 
                            value={formData.client_company || ''} 
                            onChange={e => setFormData({ ...formData, client_company: e.target.value })} 
                            className={inputCls}
                            required
                        >
                            <option value="">Select Client</option>
                            {businessAddresses.map(addr => (
                                <option key={addr.id} value={addr.id}>
                                    {addr.legal_name || addr.attention_name}{addr.city ? ` (${addr.city})` : ''}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="space-y-1">
                        <label className={labelCls}>Invoice Date</label>
                        <input type="date" value={formData.invoice_date} onChange={e => setFormData({ ...formData, invoice_date: e.target.value })} className={inputCls} />
                    </div>
                    <div className="space-y-1">
                        <label className={labelCls}>Due Date</label>
                        <input type="date" value={formData.due_date} onChange={e => setFormData({ ...formData, due_date: e.target.value })} className={inputCls} />
                    </div>
                </div>
            </div>

            {/* Form Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Items & Payments */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Invoice Items */}
                    <div className="bg-card border border-border rounded-[2.5rem] overflow-hidden shadow-sm">
                        <div className="px-8 py-6 border-b border-border bg-muted/5 flex items-center justify-between">
                            <h3 className="text-lg font-black tracking-tight flex items-center gap-3">
                                <span className="p-2 bg-primary/10 text-primary rounded-xl"><FileText size={20} /></span>
                                Invoice Items
                            </h3>
                            <button type="button" onClick={addItem} className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-xl font-bold text-xs hover:bg-primary/20 transition-all">
                                <Plus size={16} />
                                <span>Add Item</span>
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            {formData.items.length === 0 && (
                                <div className="py-12 text-center text-muted border-2 border-dashed border-border rounded-3xl">
                                    <p className="font-bold">No items added yet.</p>
                                </div>
                            )}
                            {formData.items.map((item: any, idx: number) => (
                                <div key={idx} className="p-6 bg-muted/5 rounded-3xl border border-border space-y-4 relative group">
                                    <button type="button" onClick={() => removeItem(idx)} className="absolute top-4 right-4 p-2 text-rose-500 hover:bg-rose-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-all">
                                        <X size={18} />
                                    </button>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className={labelCls}>Service Type</label>
                                            <input
                                                list={`service-type-options-${idx}`}
                                                value={item.service_type}
                                                onChange={e => setItemField(idx, 'service_type', e.target.value)}
                                                className={inputCls}
                                                placeholder="e.g. domain, server, Web Development..."
                                            />
                                            <datalist id={`service-type-options-${idx}`}>
                                                <option value="domain" />
                                                <option value="server" />
                                                <option value="web_development" />
                                                <option value="mobile_development" />
                                                <option value="design" />
                                                <option value="consulting" />
                                                <option value="other" />
                                            </datalist>
                                        </div>
                                        <div className="space-y-1">
                                            <label className={labelCls}>Description</label>
                                            <input value={item.description} onChange={e => setItemField(idx, 'description', e.target.value)} className={inputCls} placeholder="Brief description..." />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <label className={labelCls}>Rate (₹)</label>
                                                <input type="number" value={item.rate} onChange={e => setItemField(idx, 'rate', e.target.value)} className={inputCls} />
                                            </div>
                                            <div className="space-y-1">
                                                <label className={labelCls}>Quantity</label>
                                                <input type="number" value={item.quantity} onChange={e => setItemField(idx, 'quantity', parseInt(e.target.value))} className={inputCls} />
                                            </div>
                                        </div>
                                        {(item.service_type?.toLowerCase().includes('domain') || item.service_type?.toLowerCase().includes('server')) && (
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-1">
                                                    <label className={labelCls}>Purchase Date</label>
                                                    <input type="date" value={item.purchase_date || ''} onChange={e => setItemField(idx, 'purchase_date', e.target.value)} className={inputCls} />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className={labelCls}>Expiry Date</label>
                                                    <input type="date" value={item.expairy_date || ''} onChange={e => setItemField(idx, 'expairy_date', e.target.value)} className={inputCls} />
                                                </div>
                                            </div>
                                        )}
                                        <div className="flex items-end justify-between pb-1 pr-2 w-full pt-4 md:col-span-2 border-t border-border/50">
                                            <div className="flex gap-4">
                                                {item.project_server && <span className="text-[10px] font-bold text-primary px-2 py-0.5 bg-primary/5 rounded-lg border border-primary/10">Server: {item.project_server}</span>}
                                                {item.project_domain && <span className="text-[10px] font-bold text-indigo-500 px-2 py-0.5 bg-indigo-500/5 rounded-lg border border-indigo-500/10">Domain: {item.project_domain}</span>}
                                                {item.project_service && <span className="text-[10px] font-bold text-emerald-500 px-2 py-0.5 bg-emerald-500/5 rounded-lg border border-emerald-500/10">Service: {item.project_service}</span>}
                                                {item.project_team && <span className="text-[10px] font-bold text-violet-500 px-2 py-0.5 bg-violet-500/5 rounded-lg border border-violet-500/10">Team: {item.project_team}</span>}
                                            </div>
                                            <p className="text-sm font-black text-foreground">
                                                Amount: <span className="text-lg text-primary">₹{(Number(item.rate) * (item.quantity || 0)).toFixed(2)}</span>
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>

                {/* Totals Summary Card */}
                <div className="space-y-6">
                    <div className="bg-foreground text-background rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden">
                        <Calculator className="absolute top-8 right-8 opacity-10" size={120} />
                        <h3 className="text-xl font-black uppercase tracking-widest opacity-40 mb-10">Estimation</h3>
                        <div className="space-y-6 relative z-10">
                            <div className="flex justify-between items-center font-bold opacity-60">
                                <span className="uppercase text-xs">Subtotal</span>
                                <span>₹{totals.subtotal.toFixed(2)}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-4 items-end">
                                <div className="space-y-1">
                                    <label className="text-[10px] uppercase font-black opacity-40">Tax (%)</label>
                                    <input type="number" value={formData.tax_rate} onChange={e => setFormData({ ...formData, tax_rate: e.target.value })} className="w-full bg-background/5 border border-background/10 rounded-xl px-3 py-2 text-background font-bold focus:outline-none" />
                                </div>
                                <div className="text-right font-bold">
                                    <span className="text-emerald-400">+ ₹{totals.taxAmount.toFixed(2)}</span>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 items-end pt-2">
                                <div className="space-y-1">
                                    <label className="text-[10px] uppercase font-black opacity-40">Discount (₹)</label>
                                    <input type="number" value={formData.discount_amount} onChange={e => setFormData({ ...formData, discount_amount: e.target.value })} className="w-full bg-background/5 border border-background/10 rounded-xl px-3 py-2 text-background font-bold focus:outline-none" />
                                </div>
                                <div className="text-right font-bold">
                                    <span className="text-rose-400">- ₹{Number(formData.discount_amount).toFixed(2)}</span>
                                </div>
                            </div>
                            <div className="pt-8 mt-4 border-t border-background/10 flex flex-col">
                                <span className="text-[10px] uppercase font-black opacity-40 tracking-widest mb-2">Total Payable</span>
                                <span className="text-4xl font-black antialiased tracking-tighter">
                                    ₹{totals.totalAmount.toFixed(2)}
                                </span>
                            </div>
                            <div className="pt-6 space-y-3">
                                <div className="flex justify-between items-center text-xs font-bold">
                                    <span className="opacity-40 uppercase">Amount Paid</span>
                                    <span className="text-emerald-400">₹{totals.totalPaid.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm font-black border-t border-background/10 pt-3">
                                    <span className="opacity-40 uppercase text-[10px]">Balance Due</span>
                                    <span className="text-rose-400 text-xl">₹{totals.balanceDue.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-card border border-border rounded-[2.5rem] p-8">
                        <label className={labelCls}>Invoice Status</label>
                        <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })} className={inputCls}>
                            <option value="UNPAID">UNPAID</option>
                            <option value="PARTIAL">PARTIAL</option>
                            <option value="PAID">PAID</option>
                            <option value="OVERDUE">OVERDUE</option>
                            <option value="CANCELLED">CANCELLED</option>
                        </select>
                    </div>

                    {error && (
                        <div className="p-5 bg-rose-500/10 border border-rose-500/20 rounded-3xl text-rose-500 text-xs font-bold">
                            {error}
                        </div>
                    )}
                </div>
            </div>
        </form>
    );
};

export default InvoiceForm;

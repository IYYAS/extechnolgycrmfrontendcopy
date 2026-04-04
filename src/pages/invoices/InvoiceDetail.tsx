import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getInvoice, deleteInvoice, getInvoicePdf, type Invoice, type ClientCompany, type CompanyProfile } from './invoiceService';
import {
    ArrowLeft, Calendar, FileText, CreditCard, Edit2, Loader2, Trash2,
    Receipt, User, Clock, CheckCircle2, AlertCircle, Download,
    Building2, Phone, MapPin,
    Info, Banknote, BadgeCheck
} from 'lucide-react';

// ─── Extended Invoice type (uses service interfaces) ─────────────────────────
type ExtendedInvoice = Invoice & {
    client_company?: ClientCompany;
    company_profile?: CompanyProfile;
};

// ─── Sub-components ──────────────────────────────────────────────────────────
const Field: React.FC<{
    label: string;
    value: string | number | null | undefined;
    prefix?: string;
}> = ({ label, value, prefix }) => (
    <div className="space-y-1">
        <label className="text-[10px] font-black uppercase tracking-wider text-muted">{label}</label>
        <p className="text-foreground font-semibold text-sm py-2 px-3 bg-muted/5 rounded-xl border border-border/30 min-h-[38px] flex items-center">
            {prefix}{value !== null && value !== undefined && value !== '' ? String(value) : <span className="text-muted italic text-xs">—</span>}
        </p>
    </div>
);

const SectionHeader: React.FC<{ icon: React.ReactNode; title: string; subtitle?: string }> = ({ icon, title, subtitle }) => (
    <div className="flex items-center gap-3 px-8 py-5 border-b border-border bg-muted/5">
        <div className="p-2 bg-primary/10 rounded-xl text-primary">{icon}</div>
        <div>
            <h3 className="text-base font-black text-foreground">{title}</h3>
            {subtitle && <p className="text-[10px] text-muted uppercase tracking-widest font-bold mt-0.5">{subtitle}</p>}
        </div>
    </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const InvoiceDetail: React.FC = () => {
    const { clientId: clientIdParam, id } = useParams<{ clientId: string; id: string }>();
    const clientId = clientIdParam ? parseInt(clientIdParam) : undefined;
    const navigate = useNavigate();

    const [invoice, setInvoice] = useState<ExtendedInvoice | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'overview' | 'client' | 'company' | 'items' | 'payments'>('overview');

    const fetchInvoice = useCallback(async () => {
        try {
            if (!clientId || !id) return;
            const data = await getInvoice(clientId, parseInt(id)) as ExtendedInvoice;
            setInvoice(data);
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Failed to load invoice details.');
        } finally {
            setLoading(false);
        }
    }, [clientId, id]);

    useEffect(() => { fetchInvoice(); }, [fetchInvoice]);

    // ── Helpers ──────────────────────────────────────────────────────────────
    const formatCurrency = (amount: string | number) =>
        new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(Number(amount));

    const formatDate = (ds: string | null | undefined) => {
        if (!ds) return '—';
        return new Date(ds).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    };

    const getStatusStyles = (status: string) => {
        switch (status?.toUpperCase()) {
            case 'PAID': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
            case 'PARTIAL': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
            case 'UNPAID': return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
            default: return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
        }
    };



    const handleDelete = async () => {
        if (!invoice || !window.confirm(`Delete invoice "${invoice.invoice_number || invoice.id}"? This cannot be undone.`)) return;
        try {
            if (!clientId) return;
            await deleteInvoice(clientId, invoice.id);
            navigate(-1);
        } catch (err: any) {
            alert(err.response?.data?.detail || 'Failed to delete invoice.');
        }
    };

    const handleDownloadPdf = async () => {
        if (!invoice || !clientId) return;
        try {
            const blob = await getInvoicePdf(clientId, invoice.id);
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Invoice-${invoice.invoice_number || invoice.id}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.parentNode?.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch {
            alert('Failed to download invoice PDF.');
        }
    };

    // ── Derived display data ──────────────────────────────────────────────────
    const display = invoice;

    // ── Loading / Error states ────────────────────────────────────────────────
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <Loader2 className="animate-spin text-primary" size={48} />
                <p className="text-muted font-medium">Loading invoice details...</p>
            </div>
        );
    }

    if (error || !display) {
        return (
            <div className="p-8 bg-card border border-border rounded-3xl text-center space-y-6 max-w-lg mx-auto mt-12">
                <AlertCircle size={64} className="text-rose-500 mx-auto opacity-20" />
                <div>
                    <h2 className="text-2xl font-bold text-foreground">Invoice Not Found</h2>
                    <p className="text-muted mt-2">{error || 'The requested invoice could not be located.'}</p>
                </div>
                <button onClick={() => navigate('/invoices/company-summary')} className="w-full py-3 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/20">
                    Back to Summaries
                </button>
            </div>
        );
    }

    const TABS = [
        { key: 'overview', label: 'Overview', icon: <Receipt size={14} /> },
        { key: 'client', label: 'Client', icon: <User size={14} /> },
        { key: 'company', label: 'Our Company', icon: <Building2 size={14} /> },
        { key: 'items', label: 'Line Items', icon: <FileText size={14} /> },
        { key: 'payments', label: 'Payments', icon: <CreditCard size={14} /> },
    ] as const;

    const paidPct = Math.min(100, (Number(display.total_paid) / (Number(display.total_amount) || 1)) * 100);

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-500 max-w-6xl mx-auto">

            {/* ── Top Bar ── */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-muted hover:text-primary font-bold transition-all">
                    <ArrowLeft size={18} /><span>Back</span>
                </button>
                <div className="flex items-center gap-3 flex-wrap">
                    <button onClick={handleDownloadPdf} className="flex items-center gap-2 px-4 py-2.5 bg-card border border-border rounded-2xl font-bold text-muted hover:text-foreground hover:border-primary/30 transition-all text-sm">
                        <Download size={16} /> Download PDF
                    </button>
                    <button onClick={handleDelete} className="p-2.5 text-rose-500 hover:bg-rose-500/10 rounded-2xl border border-rose-500/10 transition-all">
                        <Trash2 size={18} />
                    </button>
                    <button
                        onClick={() => navigate(`/invoices/client/${clientId}/edit/${invoice.id}`)}
                        className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-2xl font-bold hover:scale-[1.02] transition-all shadow-lg shadow-primary/20"
                    >
                        <Edit2 size={16} /> Edit Invoice
                    </button>
                </div>
            </div>

            {/* ── Invoice Hero Banner ── */}
            <div className="bg-card border border-border rounded-3xl p-8 shadow-sm relative overflow-hidden">
                {/* Decorative blob */}
                <div className="absolute -top-12 -right-12 w-48 h-48 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                        <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shrink-0">
                            <Receipt size={36} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black tracking-tight text-foreground">
                                {display.invoice_number || `INV-${display.id.toString().padStart(4, '0')}`}
                            </h1>
                            <p className="text-muted font-bold flex items-center gap-2 mt-1 text-sm">
                                <Calendar size={13} /> Issued on {formatDate(display.invoice_date)}
                            </p>
                            <p className="text-muted text-xs mt-0.5">ID: #{display.id}</p>
                        </div>
                    </div>
                    <div className="flex flex-col items-end gap-3">
                        <span className={`px-5 py-2 rounded-full text-xs font-black uppercase border ${getStatusStyles(display.status)}`}>
                            {display.status}
                        </span>
                        <p className="text-3xl font-black text-foreground">{formatCurrency(display.total_amount)}</p>
                        <div className="text-xs text-muted font-bold">
                            Balance Due: <span className="text-rose-500">{formatCurrency(display.balance_due)}</span>
                        </div>
                    </div>
                </div>

                {/* Progress bar */}
                <div className="mt-6 space-y-1.5">
                    <div className="flex justify-between text-[10px] font-black uppercase text-muted">
                        <span>Payment Progress</span>
                        <span>{paidPct.toFixed(0)}% paid</span>
                    </div>
                    <div className="h-2 w-full bg-muted/10 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-emerald-500 rounded-full transition-all duration-1000 ease-out"
                            style={{ width: `${paidPct}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* ── Tab Navigation ── */}
            <div className="flex items-center gap-1 bg-card border border-border rounded-2xl p-1 overflow-x-auto">
                {TABS.map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap transition-all ${activeTab === tab.key
                            ? 'bg-primary text-white shadow-sm'
                            : 'text-muted hover:text-foreground'}`}
                    >
                        {tab.icon}{tab.label}
                    </button>
                ))}
            </div>

            {/* ═══════════════════════════════════════════════════════════
                TAB: OVERVIEW
            ═══════════════════════════════════════════════════════════ */}
            {activeTab === 'overview' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                    {/* Invoice Meta */}
                    <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm">
                        <SectionHeader icon={<Info size={18} />} title="Invoice Details" subtitle="Core invoice information" />
                        <div className="p-6 grid grid-cols-2 gap-4">
                            <Field label="Invoice Number" value={display.invoice_number} />
                            <Field label="Status" value={display.status} />
                            <Field label="Invoice Date" value={display.invoice_date} />
                            <Field label="Due Date" value={display.due_date} />
                        </div>
                    </div>

                    {/* Financial Summary */}
                    <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm">
                        <SectionHeader icon={<Banknote size={18} />} title="Financial Summary" subtitle="Amounts & calculations" />
                        <div className="p-6 space-y-3">
                            <div className="grid grid-cols-2 gap-4">
                                <Field label="Tax Rate (%)" value={display.tax_rate} />
                                <Field label="Discount Amount" value={display.discount_amount} prefix="₹" />
                            </div>
                            <div className="pt-3 border-t border-border/50 space-y-2">
                                {[
                                    { label: 'Subtotal', value: display.subtotal, color: 'text-foreground' },
                                    { label: 'Tax Amount', value: display.tax_amount, color: 'text-amber-500' },
                                    { label: 'Total Amount', value: display.total_amount, color: 'text-foreground', bold: true },
                                    { label: 'Total Paid', value: display.total_paid, color: 'text-emerald-500' },
                                    { label: 'Balance Due', value: display.balance_due, color: 'text-rose-500', bold: true },
                                ].map(row => (
                                    <div key={row.label} className="flex justify-between items-center text-sm">
                                        <span className="text-muted font-bold uppercase text-[10px] tracking-wider">{row.label}</span>
                                        <span className={`font-${row.bold ? 'black text-base' : 'bold'} ${row.color}`}>
                                            {formatCurrency(row.value)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ═══════════════════════════════════════════════════════════
                TAB: CLIENT COMPANY
            ═══════════════════════════════════════════════════════════ */}
            {activeTab === 'client' && display.client_company && (
                <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm">
                    <SectionHeader icon={<User size={18} />} title="Client Company"
                        subtitle={display.client_company.legal_name} />
                    <div className="p-6 space-y-6">

                        {/* Identity */}
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-wider text-primary mb-3 flex items-center gap-2">
                                <BadgeCheck size={12} /> Legal Identity
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <Field label="Legal Name" value={display.client_company.legal_name} />
                                <Field label="Attention Name" value={display.client_company.attention_name} />
                                <Field label="GST Number" value={display.client_company.gst_number} />
                                <Field label="PAN Number" value={display.client_company.pan_number} />
                                <Field label="Advance Balance" value={display.client_company.advance_balance} prefix="₹" />
                            </div>
                        </div>

                        {/* Contact */}
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-wider text-primary mb-3 flex items-center gap-2">
                                <Phone size={12} /> Contact
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Field label="Email" value={display.client_company.email} />
                                <Field label="Phone" value={display.client_company.phone} />
                            </div>
                        </div>

                        {/* Address */}
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-wider text-primary mb-3 flex items-center gap-2">
                                <MapPin size={12} /> Address
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <Field label="Unit / Floor" value={display.client_company.unit_or_floor} />
                                <Field label="Building Name" value={display.client_company.building_name} />
                                <Field label="Plot Number" value={display.client_company.plot_number} />
                                <Field label="Street Name" value={display.client_company.street_name} />
                                <Field label="Landmark" value={display.client_company.landmark} />
                                <Field label="Locality" value={display.client_company.locality} />
                                <Field label="City" value={display.client_company.city} />
                                <Field label="District" value={display.client_company.district} />
                                <Field label="State" value={display.client_company.state} />
                                <Field label="PIN Code" value={display.client_company.pin_code} />
                                <Field label="Country" value={display.client_company.country} />
                            </div>
                        </div>


                    </div>
                </div>
            )}

            {/* ═══════════════════════════════════════════════════════════
                TAB: OUR COMPANY (company_profile)
            ═══════════════════════════════════════════════════════════ */}
            {activeTab === 'company' && display.company_profile && (
                <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm">
                    <SectionHeader icon={<Building2 size={18} />} title="Our Company Profile"
                        subtitle={display.company_profile.company_name} />
                    <div className="p-6 space-y-6">

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Field label="Company Name" value={display.company_profile.company_name} />
                            <Field label="Company Type" value={display.company_profile.company_type} />
                            <Field label="Email" value={display.company_profile.email} />
                            <Field label="Phone" value={display.company_profile.phone} />
                        </div>

                        <Field label="Address" value={display.company_profile.address} />

                        {display.company_profile.logo && (
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase tracking-wider text-muted">Company Logo</label>
                                <div className="p-4 bg-muted/5 rounded-2xl border border-border/30 inline-flex">
                                    <img
                                        src={`${import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || ''}${display.company_profile.logo}`}
                                        alt="Company Logo"
                                        className="h-16 object-contain"
                                        onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                    />
                                </div>
                            </div>
                        )}

                        <div className="p-3 bg-muted/10 border border-border/30 rounded-xl text-muted text-xs font-bold flex items-center gap-2">
                            <Info size={14} /> Company profile is read-only here. Update it from the Company Profile settings page.
                        </div>
                    </div>
                </div>
            )}

            {/* ═══════════════════════════════════════════════════════════
                TAB: LINE ITEMS
            ═══════════════════════════════════════════════════════════ */}
            {activeTab === 'items' && (
                <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm">
                    <div className="flex items-center justify-between px-8 py-5 border-b border-border bg-muted/5">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-xl text-primary"><FileText size={18} /></div>
                            <div>
                                <h3 className="text-base font-black text-foreground">Line Items</h3>
                                <p className="text-[10px] text-muted uppercase tracking-widest font-bold mt-0.5">
                                    {display.items?.length || 0} items
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="p-6 space-y-4">
                        {(display.items || []).length === 0 && (
                            <div className="text-center py-12 text-muted">
                                <FileText size={32} className="mx-auto opacity-20 mb-3" />
                                <p className="font-bold">No line items found.</p>
                            </div>
                        )}
                        {(display.items || []).map((item, idx) => (
                            <div key={item.id ?? idx} className="p-5 bg-background border border-border/50 rounded-2xl space-y-4 relative">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-[10px] font-black uppercase text-muted bg-muted/10 px-2 py-1 rounded-lg">
                                        Item #{idx + 1} {item.id ? `· ID: ${item.id}` : '· NEW'}
                                    </span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <Field label="Service Type" value={item.service_type} />
                                        <Field label="Rate" value={item.rate} prefix="₹" />
                                        <Field label="Quantity" value={item.quantity} />
                                    </div>
                                    <Field label="Description" value={item.description} />
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <Field label="Purchase Date" value={item.purchase_date ?? ''} />
                                        <Field label="Expiry Date" value={item.expairy_date ?? ''} />
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black uppercase tracking-wider text-muted">Total Price</label>
                                            <p className="text-foreground font-black text-base py-2 px-3 bg-primary/5 rounded-xl border border-primary/10">
                                                {formatCurrency(item.total_price || (Number(item.rate) * Number(item.quantity)))}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ═══════════════════════════════════════════════════════════
                TAB: PAYMENTS
            ═══════════════════════════════════════════════════════════ */}
            {activeTab === 'payments' && (
                <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm">
                    <div className="flex items-center justify-between px-8 py-5 border-b border-border bg-muted/5">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-500"><CreditCard size={18} /></div>
                            <div>
                                <h3 className="text-base font-black text-foreground">Payment History</h3>
                                <p className="text-[10px] text-muted uppercase tracking-widest font-bold mt-0.5">
                                    {display.payments?.length || 0} transactions
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => navigate(`/invoices/client/${clientId}/${id}/payments`)}
                            className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white border border-emerald-500/20 rounded-xl font-bold text-sm hover:scale-[1.02] transition-all"
                        >
                            <CreditCard size={16} /> Manage Payments
                        </button>
                    </div>
                    <div className="p-6 space-y-4">
                        {(display.payments || []).length === 0 && (
                            <div className="text-center py-12 text-muted">
                                <Clock size={32} className="mx-auto opacity-20 mb-3" />
                                <p className="font-bold">No payments recorded yet.</p>
                            </div>
                        )}
                        {(display.payments || []).map((payment, idx) => (
                            <div key={payment.id ?? idx} className="p-5 bg-background border border-border/50 rounded-2xl space-y-4 relative">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0">
                                        <CheckCircle2 size={20} />
                                    </div>
                                    <span className="text-[10px] font-black uppercase text-muted bg-muted/10 px-2 py-1 rounded-lg">
                                        Payment #{idx + 1} {payment.id ? `· ID: ${payment.id}` : '· NEW'}
                                    </span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Field label="Amount" value={payment.amount} prefix="₹" />
                                    <Field label="Payment Method" value={payment.payment_method} />
                                    <Field label="Transaction ID" value={payment.transaction_id} />
                                    <Field label="Payment Date" value={payment.payment_date ? payment.payment_date.split('T')[0] : ''} />
                                </div>
                                <Field label="Notes" value={payment.notes ?? ''} />
                            </div>
                        ))}

                        {/* Payment Totals summary */}
                        {(display.payments || []).length > 0 && (
                            <div className="mt-4 p-5 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl space-y-2">
                                <div className="flex justify-between text-sm font-bold">
                                    <span className="text-muted uppercase text-[10px] tracking-wider">Total Paid</span>
                                    <span className="text-emerald-500 font-black">{formatCurrency(display.total_paid)}</span>
                                </div>
                                <div className="flex justify-between text-sm font-bold">
                                    <span className="text-muted uppercase text-[10px] tracking-wider">Balance Due</span>
                                    <span className="text-rose-500 font-black">{formatCurrency(display.balance_due)}</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}


        </div>
    );
};

export default InvoiceDetail;

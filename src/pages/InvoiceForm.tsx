import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, Trash2, ArrowLeft, Save } from 'lucide-react';
import { getProject, getInvoice, createInvoiceDirect, updateInvoice } from '../api/services';
import type { Project, InvoiceItem, ServiceType, CreateInvoiceRequest } from '../types';

const InvoiceForm = () => {
    const { projectId, invoiceId } = useParams();
    const navigate = useNavigate();
    const [project, setProject] = useState<Project | null>(null);
    const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([]);
    const [taxRate, setTaxRate] = useState(5.0);
    const [discountAmount, setDiscountAmount] = useState(0);
    const [applyCredits, setApplyCredits] = useState(false);
    const [invoiceDate, setInvoiceDate] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [customDate, setCustomDate] = useState('');
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const serviceTypes: ServiceType[] = ['Domain', 'Server'];

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                if (projectId) {
                    const projectData = await getProject(Number(projectId));
                    setProject(projectData);

                    if (!invoiceId) {
                        // Default values for new invoice
                        const balanceDue = projectData.finance?.total_balance_due || projectData.budget || 0;
                        setInvoiceItems([{ service_type: 'Domain', description: '', rate: balanceDue, quantity: 1, total_price: balanceDue }]);

                        const today = new Date();
                        const todayStr = today.toISOString().split('T')[0];
                        setInvoiceDate(todayStr);
                        setCustomDate(todayStr);

                        const due = new Date();
                        due.setDate(due.getDate() + 14);
                        setDueDate(due.toISOString().split('T')[0]);
                    }
                }

                if (invoiceId) {
                    const invoiceData = await getInvoice(Number(invoiceId));
                    setInvoiceItems(invoiceData.items.map(item => ({
                        service_type: item.service_type,
                        description: item.description,
                        rate: item.rate,
                        quantity: item.quantity || 1,
                        total_price: item.total_price || (Number(item.rate) * (item.quantity || 1)),
                        purchase_date: item.purchase_date || null,
                        expiration_date: item.expiration_date || null
                    })));
                    setTaxRate(Number(invoiceData.tax_rate) || 0);
                    setDiscountAmount(Number(invoiceData.discount_amount) || 0);
                    setInvoiceDate(invoiceData.invoice_date || '');
                    setDueDate(invoiceData.due_date || '');
                    setCustomDate(invoiceData.custom_date || '');
                }
            } catch (error) {
                console.error("Failed to fetch data", error);
                alert("Error loading data");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [projectId, invoiceId]);

    const handleAddItem = () => {
        setInvoiceItems([...invoiceItems, { service_type: 'Domain', description: '', rate: 0, quantity: 1, total_price: 0, purchase_date: null, expiration_date: null }]);
    };

    const handleRemoveItem = (index: number) => {
        setInvoiceItems(invoiceItems.filter((_, i) => i !== index));
    };

    const handleUpdateItem = (index: number, field: keyof InvoiceItem, value: any) => {
        const newItems = [...invoiceItems];
        const item = { ...newItems[index], [field]: value };

        if (field === 'rate' || field === 'quantity') {
            const rate = field === 'rate' ? Number(value) : Number(item.rate);
            const qty = field === 'quantity' ? Number(value) : Number(item.quantity);
            item.total_price = rate * qty;
        }

        newItems[index] = item;
        setInvoiceItems(newItems);
    };

    const calculateSubtotal = () => {
        return invoiceItems.reduce((acc, item) => acc + (Number(item.rate) * (Number(item.quantity) || 1)), 0);
    };

    const calculateTax = () => (calculateSubtotal() * taxRate) / 100;
    const calculateTotal = () => calculateSubtotal() + calculateTax() - discountAmount;

    const formatCurrency = (amount: string | number | null | undefined) => {
        const val = typeof amount === 'string' ? parseFloat(amount) : (amount || 0);
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(val) || 0);
    };

    const handleSave = async () => {
        if (!projectId) return;
        setIsSaving(true);
        try {
            const data: CreateInvoiceRequest = {
                items: invoiceItems.map(item => ({
                    ...item,
                    rate: Number(item.rate) || 0,
                    quantity: Number(item.quantity) || 1,
                    total_price: (Number(item.rate) || 0) * (Number(item.quantity) || 1),
                    purchase_date: item.purchase_date || null,
                    expiration_date: item.expiration_date || null
                })),
                tax_rate: taxRate,
                discount_amount: discountAmount,
                invoice_date: invoiceDate || null,
                due_date: dueDate || null,
                custom_date: customDate || null,
                apply_credits: applyCredits
            };

            if (invoiceId) {
                await updateInvoice(Number(invoiceId), data);
            } else {
                await createInvoiceDirect({ ...data, project: Number(projectId) } as any);
            }
            navigate(`/billing/project/${projectId}/invoices`);
        } catch (error) {
            console.error("Failed to save invoice", error);
            alert("Failed to save invoice");
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) return <div className="p-8 text-center">Loading...</div>;

    return (
        <div className="stagger-in" style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
            <div className="page-header" style={{ marginBottom: '2rem' }}>
                <div>
                    <button
                        onClick={() => navigate(-1)}
                        style={{
                            background: 'none', border: 'none', color: 'var(--color-text-muted)',
                            display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer',
                            marginBottom: '1rem', padding: 0
                        }}
                    >
                        <ArrowLeft size={16} /> Back
                    </button>
                    <h1 className="page-title">
                        {invoiceId ? 'Edit Invoice' : 'Create New Invoice'}
                    </h1>
                    <p style={{ color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>
                        For project: <span style={{ color: 'var(--color-primary)', fontWeight: 600 }}>{project?.name}</span>
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button className="btn" onClick={() => navigate(-1)} style={{ background: 'var(--color-surface-hover)', border: '1px solid var(--color-border)' }}>
                        Cancel
                    </button>
                    <button
                        className="btn btn-primary"
                        onClick={handleSave}
                        disabled={isSaving}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: '160px' }}
                    >
                        <Save size={18} />
                        {isSaving ? 'Saving...' : (invoiceId ? 'Save Changes' : 'Generate Invoice')}
                    </button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem', alignItems: 'start' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    {/* Basic Info */}
                    <div className="glass-panel" style={{ padding: '2rem' }}>
                        <h3 style={{ margin: '0 0 2rem 0', fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-primary)' }}>Invoice Details</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '2rem' }}>
                            <div>
                                <label className="input-label">Invoice Date</label>
                                <input
                                    type="date" className="input-field" value={invoiceDate}
                                    onChange={(e) => setInvoiceDate(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="input-label">Due Date</label>
                                <input
                                    type="date" className="input-field" value={dueDate}
                                    onChange={(e) => setDueDate(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="input-label">Custom Date (Optional)</label>
                                <input
                                    type="date" className="input-field" value={customDate}
                                    onChange={(e) => setCustomDate(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Items Section */}
                    <div className="glass-panel" style={{ padding: '2rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>Service Items</h3>
                            <button
                                className="btn btn-primary"
                                onClick={handleAddItem}
                                style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                            >
                                <Plus size={16} /> Add Item
                            </button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {invoiceItems.map((item, index) => {
                                const showDates = item.service_type === 'Domain' || item.service_type === 'Server';
                                return (
                                    <div key={index} style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '1.5rem',
                                        background: 'var(--color-surface)',
                                        padding: '1.75rem',
                                        borderRadius: '1.25rem',
                                        border: '1px solid var(--color-border)',
                                        position: 'relative',
                                        boxShadow: 'var(--shadow-lg)'
                                    }}>
                                        {/* Row 1: Service Type & Dates (Top Group) */}
                                        <div style={{
                                            display: 'grid',
                                            gridTemplateColumns: showDates ? '1fr 1fr 1fr' : '1fr',
                                            gap: '1.25rem'
                                        }}>
                                            <div>
                                                <label className="input-label" style={{ fontSize: '0.75rem', color: 'var(--color-primary)', fontWeight: 700 }}>Service Type</label>
                                                <input
                                                    type="text" list="service-types" className="input-field"
                                                    value={item.service_type}
                                                    onChange={(e) => handleUpdateItem(index, 'service_type', e.target.value)}
                                                    style={{ marginBottom: 0 }}
                                                />
                                            </div>
                                            {showDates && (
                                                <>
                                                    <div>
                                                        <label className="input-label" style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Purchase Date</label>
                                                        <input
                                                            type="date" className="input-field"
                                                            value={item.purchase_date || ''}
                                                            onChange={(e) => handleUpdateItem(index, 'purchase_date', e.target.value)}
                                                            style={{ marginBottom: 0, fontSize: '0.85rem' }}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="input-label" style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Expiration Date</label>
                                                        <input
                                                            type="date" className="input-field"
                                                            value={item.expiration_date || ''}
                                                            onChange={(e) => handleUpdateItem(index, 'expiration_date', e.target.value)}
                                                            style={{ marginBottom: 0, fontSize: '0.85rem' }}
                                                        />
                                                    </div>
                                                </>
                                            )}
                                        </div>

                                        {/* Row 2: Description (Middle Group) */}
                                        <div>
                                            <label className="input-label" style={{ fontSize: '0.75rem', color: 'var(--color-primary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                Service Description
                                            </label>
                                            <input
                                                type="text" className="input-field" placeholder="Describe the service or work performed..."
                                                value={item.description}
                                                onChange={(e) => handleUpdateItem(index, 'description', e.target.value)}
                                                style={{
                                                    marginBottom: 0,
                                                    fontSize: '1.1rem',
                                                    fontWeight: 600,
                                                    background: 'var(--color-bg)',
                                                    padding: '0.875rem 1rem'
                                                }}
                                            />
                                        </div>

                                        {/* Row 3: Financial Info (Bottom Group) */}
                                        <div style={{
                                            display: 'grid',
                                            gridTemplateColumns: 'repeat(2, minmax(120px, 200px)) 1fr minmax(180px, 220px) 48px',
                                            gap: '1.5rem',
                                            alignItems: 'end',
                                            paddingTop: '1.5rem',
                                            borderTop: '1px solid var(--color-border-light)',
                                            maxWidth: '100%'
                                        }}>
                                            <div style={{ overflow: 'hidden' }}>
                                                <label className="input-label" style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-primary)' }}>Rate / Price ($)</label>
                                                <input
                                                    type="number" className="input-field"
                                                    value={item.rate}
                                                    onChange={(e) => handleUpdateItem(index, 'rate', e.target.value)}
                                                    style={{ marginBottom: 0, fontSize: '1.1rem', fontWeight: 600, width: '100%' }}
                                                />
                                            </div>
                                            <div style={{ overflow: 'hidden' }}>
                                                <label className="input-label" style={{ fontSize: '0.75rem', fontWeight: 700 }}>Quantity</label>
                                                <input
                                                    type="number" className="input-field"
                                                    value={item.quantity}
                                                    min="1"
                                                    onChange={(e) => handleUpdateItem(index, 'quantity', e.target.value)}
                                                    style={{ marginBottom: 0, fontSize: '1.1rem', width: '100%' }}
                                                />
                                            </div>
                                            <div /> {/* Spacer */}
                                            <div style={{ overflow: 'hidden' }}>
                                                <label className="input-label" style={{ fontSize: '0.75rem', fontWeight: 700, textAlign: 'right', display: 'block' }}>Line Total</label>
                                                <div
                                                    title={formatCurrency((Number(item.rate) * (Number(item.quantity) || 1)))}
                                                    style={{
                                                        padding: '0.75rem 1rem',
                                                        background: 'var(--color-primary-subtle)',
                                                        borderRadius: '0.75rem',
                                                        textAlign: 'right',
                                                        height: '48px',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
                                                        fontSize: '1.1rem', fontWeight: 800, color: 'var(--color-primary)',
                                                        whiteSpace: 'nowrap',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        width: '100%'
                                                    }}
                                                >
                                                    {formatCurrency((Number(item.rate) * (Number(item.quantity) || 1)))}
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleRemoveItem(index)}
                                                style={{
                                                    color: 'var(--color-danger)', background: 'var(--color-danger-subtle)',
                                                    border: '1px solid var(--color-border)',
                                                    padding: '0.5rem', borderRadius: '0.75rem',
                                                    cursor: 'pointer', height: '48px', width: '48px',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    transition: 'all 0.2s'
                                                }}
                                                onMouseOver={(e) => e.currentTarget.style.background = 'var(--color-danger)'}
                                                onMouseOut={(e) => e.currentTarget.style.background = 'var(--color-danger-subtle)'}
                                                disabled={invoiceItems.length === 1}
                                            >
                                                <Trash2 size={24} />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Sidebar Summary */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', position: 'sticky', top: '2rem' }}>
                    <div className="glass-panel" style={{ padding: '1.5rem' }}>
                        <h4 style={{ margin: '0 0 1.25rem 0', fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase' }}>Summary</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                                <span style={{ color: 'var(--color-text-muted)' }}>Subtotal</span>
                                <span style={{ fontWeight: 600 }}>{formatCurrency(calculateSubtotal())}</span>
                            </div>

                            <div>
                                <label className="input-label" style={{ fontSize: '0.7rem' }}>Tax Rate (%)</label>
                                <input
                                    type="number" className="input-field" value={taxRate}
                                    onChange={(e) => setTaxRate(Number(e.target.value))}
                                    style={{ marginBottom: '0.5rem' }}
                                />
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                                    <span style={{ color: 'var(--color-text-muted)' }}>Tax Amount</span>
                                    <span style={{ fontWeight: 600 }}>{formatCurrency(calculateTax())}</span>
                                </div>
                            </div>

                            <div>
                                <label className="input-label" style={{ fontSize: '0.7rem' }}>Discount ($)</label>
                                <input
                                    type="number" className="input-field" value={discountAmount}
                                    onChange={(e) => setDiscountAmount(Number(e.target.value))}
                                />
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '0.5rem 0' }}>
                                <input
                                    type="checkbox" id="applyCredits" checked={applyCredits}
                                    onChange={(e) => setApplyCredits(e.target.checked)}
                                />
                                <label htmlFor="applyCredits" style={{ fontSize: '0.8rem', cursor: 'pointer', color: applyCredits ? 'var(--color-primary)' : 'var(--color-text-muted)' }}>
                                    Apply Credits
                                </label>
                            </div>

                            <div style={{ marginTop: '1rem', paddingTop: '1.5rem', borderTop: '1px solid var(--color-border-light)' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <span style={{ fontWeight: 700, fontSize: '0.8rem', color: 'var(--color-text-dim)', textTransform: 'uppercase' }}>Grand Total</span>
                                    <span style={{
                                        fontWeight: 900, fontSize: '2.25rem',
                                        color: 'var(--color-primary-light)',
                                        letterSpacing: '-0.025em'
                                    }}>
                                        {formatCurrency(calculateTotal())}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <datalist id="service-types">
                {serviceTypes.map(type => <option key={type} value={type} />)}
            </datalist>
        </div>
    );
};

export default InvoiceForm;

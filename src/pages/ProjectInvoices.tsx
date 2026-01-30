import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { getProjectInvoices, deleteInvoice, recordPayment } from '../api/services';
import type { ProjectInvoiceSummary } from '../types';
import { Table, Thead, Tbody, Tr, Th, Td } from '../components/Table';
import { ArrowLeft, Eye, Plus, Pencil, Trash2, Receipt } from 'lucide-react';
// InvoiceMaker removed as we use InvoiceForm page now

const ProjectInvoices = () => {
    const { projectId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [invoices, setInvoices] = useState<ProjectInvoiceSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [projectName, setProjectName] = useState(location.state?.projectName || '');
    const [isSaving, setIsSaving] = useState(false);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [paymentInvoiceId, setPaymentInvoiceId] = useState<number | null>(null);
    const [paymentData, setPaymentData] = useState({
        amount: 0,
        payment_method: 'Bank Transfer',
        transaction_id: '',
        notes: ''
    });

    const fetchInvoices = async () => {
        if (!projectId) return;
        try {
            const data = await getProjectInvoices(Number(projectId));
            setInvoices(data);
            if (data.length > 0 && !projectName) {
                setProjectName(data[0].project_name);
            }
        } catch (error) {
            console.error("Failed to fetch project invoices", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInvoices();
    }, [projectId]);

    // handleCreateInvoice is now handled by InvoiceForm page navigate
    const handleCreateInvoiceNavigate = () => {
        navigate(`/billing/project/${projectId}/invoices/create`);
    };

    const handleEditInvoice = (invoiceId: number) => {
        navigate(`/billing/project/${projectId}/invoices/edit/${invoiceId}`);
    };

    const handleDeleteInvoice = async (invoiceId: number) => {
        if (!confirm("Are you sure you want to delete this invoice? This action cannot be undone.")) return;
        try {
            await deleteInvoice(invoiceId);
            fetchInvoices();
        } catch (error) {
            console.error("Failed to delete invoice", error);
            alert("Failed to delete invoice.");
        }
    };

    const handleOpenPaymentModal = (invoiceId: number, balanceDue: string) => {
        setPaymentInvoiceId(invoiceId);
        setPaymentData({
            amount: Number(balanceDue), // Default to full balance
            payment_method: 'Bank Transfer',
            transaction_id: '',
            notes: ''
        });
        setIsPaymentModalOpen(true);
    };

    const handleRecordPayment = async () => {
        if (!paymentInvoiceId) return;
        setIsSaving(true);
        try {
            await recordPayment(paymentInvoiceId, {
                amount: Number(paymentData.amount),
                payment_method: paymentData.payment_method,
                transaction_id: paymentData.transaction_id,
                notes: paymentData.notes
            });
            setIsPaymentModalOpen(false);
            setPaymentInvoiceId(null);
            fetchInvoices(); // Refresh list
        } catch (error) {
            console.error("Failed to record payment", error);
            alert("Failed to record payment.");
        } finally {
            setIsSaving(false);
        }
    };


    const formatCurrency = (amount: string | number | null | undefined) => {
        const val = typeof amount === 'string' ? parseFloat(amount) : (amount || 0);
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(Number(val) || 0);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PAID': return 'var(--color-success)';
            case 'PARTIAL': return 'var(--color-primary)';
            case 'UNPAID': return 'var(--color-text-muted)';
            case 'OVERDUE': return 'var(--color-danger)';
            default: return 'var(--color-text-muted)';
        }
    };

    return (
        <div className="stagger-in">
            <div className="page-header" style={{ marginBottom: '2rem' }}>
                <div>
                    <button
                        onClick={() => navigate('/billing')}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--color-text-muted)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            cursor: 'pointer',
                            marginBottom: '1rem',
                            padding: 0
                        }}
                    >
                        <ArrowLeft size={16} /> Back to Billing
                    </button>
                    <h1 className="page-title">
                        Invoices for <span style={{ color: 'var(--color-primary)' }}>{projectName || 'Project'}</span>
                    </h1>
                </div>
                <div>
                    <button
                        className="btn btn-primary"
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                        onClick={handleCreateInvoiceNavigate}
                    >
                        <Plus size={18} /> Create Invoice
                    </button>
                </div>
            </div>

            <div className="glass-panel" style={{ padding: '1.5rem' }}>
                {loading ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>Loading invoices...</div>
                ) : invoices.length === 0 ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>No invoices found for this project.</div>
                ) : (
                    <Table>
                        <Thead>
                            <Tr>
                                <Th>Invoice #</Th>
                                <Th>Date</Th>
                                <Th>Total Amount</Th>
                                <Th>Total Paid</Th>
                                <Th>Balance Due</Th>
                                <Th>Status</Th>
                                <Th>Actions</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {invoices.map((inv) => (
                                <Tr key={inv.id}>
                                    <Td style={{ fontWeight: 600 }}>{inv.invoice_number}</Td>
                                    <Td>{inv.invoice_date}</Td>
                                    <Td>{formatCurrency(inv.total_amount)}</Td>
                                    <Td
                                        style={{ color: 'var(--color-primary)', cursor: 'pointer', textDecoration: 'underline' }}
                                        onClick={() => navigate(`/billing/invoice/${inv.id}/payments`)}
                                    >
                                        {formatCurrency(inv.total_paid)}
                                    </Td>
                                    <Td style={{ fontWeight: 700, color: Number(inv.balance_due) > 0 ? 'var(--color-danger)' : 'var(--color-success)' }}>
                                        {formatCurrency(inv.balance_due)}
                                    </Td>
                                    <Td>
                                        <span style={{
                                            padding: '0.2rem 0.6rem',
                                            borderRadius: '50px',
                                            fontSize: '0.7rem',
                                            fontWeight: 700,
                                            background: `var(--color-${inv.status.toLowerCase()}-subtle)`,
                                            color: getStatusColor(inv.status),
                                            border: `1px solid var(--color-${inv.status.toLowerCase()})`,
                                            textTransform: 'uppercase'
                                        }}>
                                            {inv.status}
                                        </span>
                                    </Td>
                                    <Td>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button
                                                className="btn"
                                                style={{
                                                    padding: '0.4rem',
                                                    color: 'var(--color-text-muted)',
                                                    background: 'var(--color-bg)',
                                                    border: '1px solid var(--color-border)'
                                                }}
                                                title="View Invoice"
                                                onClick={() => navigate(`/billing/invoice/${projectId}?invoice_id=${inv.id}`)}
                                            >
                                                <Eye size={16} />
                                            </button>
                                            <button
                                                className="btn"
                                                style={{
                                                    padding: '0.4rem',
                                                    color: 'var(--color-primary)',
                                                    background: 'var(--color-primary-subtle)',
                                                    border: '1px solid var(--color-primary)'
                                                }}
                                                title="Edit Invoice"
                                                onClick={() => handleEditInvoice(inv.id)}
                                            >
                                                <Pencil size={16} />
                                            </button>
                                            {inv.status !== 'PAID' && (
                                                <button
                                                    className="btn"
                                                    style={{
                                                        padding: '0.4rem',
                                                        color: 'var(--color-success)',
                                                        background: 'var(--color-success-subtle)',
                                                        border: '1px solid var(--color-success)'
                                                    }}
                                                    title="Record Payment"
                                                    onClick={() => handleOpenPaymentModal(inv.id, inv.balance_due)}
                                                >
                                                    <Receipt size={16} />
                                                </button>
                                            )}
                                            <button
                                                className="btn"
                                                style={{
                                                    padding: '0.4rem',
                                                    color: 'var(--color-danger)',
                                                    background: 'var(--color-danger-subtle)',
                                                    border: '1px solid var(--color-danger)'
                                                }}
                                                title="Delete Invoice"
                                                onClick={() => handleDeleteInvoice(inv.id)}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </Td>
                                </Tr>
                            ))}
                        </Tbody>
                    </Table>
                )}
            </div>

            {/* InvoiceMaker removed */}

            {/* Record Payment Modal */}
            {isPaymentModalOpen && (
                <div style={{
                    background: 'var(--overlay-bg)', backdropFilter: 'blur(10px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }}>
                    <div className="glass-panel" style={{ width: '400px', padding: '2rem' }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.5rem' }}>Record Payment</h2>
                        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                            Record payment for Invoice <span style={{ color: 'var(--color-primary)', fontWeight: 600 }}>#{invoices.find(i => i.id === paymentInvoiceId)?.invoice_number}</span>
                        </p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '2rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>Amount ($)</label>
                                <input
                                    type="number" className="input-field"
                                    value={paymentData.amount}
                                    style={{ marginBottom: 0 }}
                                    onChange={(e) => setPaymentData({ ...paymentData, amount: Number(e.target.value) })}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>Method</label>
                                <select
                                    className="input-field" value={paymentData.payment_method}
                                    style={{ marginBottom: 0 }}
                                    onChange={(e) => setPaymentData({ ...paymentData, payment_method: e.target.value })}
                                >
                                    <option value="Bank Transfer">Bank Transfer</option>
                                    <option value="Cash">Cash</option>
                                    <option value="PayPal">PayPal</option>
                                    <option value="Strip">Stripe</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>Transaction ID (Optional)</label>
                                <input
                                    type="text" className="input-field" placeholder="TXN_..."
                                    value={paymentData.transaction_id}
                                    style={{ marginBottom: 0 }}
                                    onChange={(e) => setPaymentData({ ...paymentData, transaction_id: e.target.value })}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>Notes (Optional)</label>
                                <textarea
                                    className="input-field" placeholder="Additional notes..."
                                    value={paymentData.notes}
                                    style={{ marginBottom: 0, minHeight: '80px', resize: 'vertical' }}
                                    onChange={(e) => setPaymentData({ ...paymentData, notes: e.target.value })}
                                />
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button className="btn" style={{ flex: 1, background: 'var(--color-bg)' }} onClick={() => setIsPaymentModalOpen(false)}>Cancel</button>
                            <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleRecordPayment} disabled={isSaving || paymentData.amount <= 0}>
                                {isSaving ? 'Processing...' : 'Confirm Payment'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProjectInvoices;

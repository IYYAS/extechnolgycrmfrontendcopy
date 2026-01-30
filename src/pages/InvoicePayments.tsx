import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getInvoicePayments, recordPayment, getInvoice, updatePayment, deletePayment } from '../api/services';
import type { Payment, Invoice } from '../types';
import { Table, Thead, Tbody, Tr, Th, Td } from '../components/Table';
import { ArrowLeft, Plus, Pencil, Trash2 } from 'lucide-react';

const InvoicePayments = () => {
    const { invoiceId } = useParams();
    const navigate = useNavigate();
    const [payments, setPayments] = useState<Payment[]>([]);
    const [invoice, setInvoice] = useState<Invoice | null>(null);
    const [loading, setLoading] = useState(true);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [paymentData, setPaymentData] = useState({
        amount: 0,
        payment_method: 'Bank Transfer',
        transaction_id: '',
        notes: ''
    });

    const fetchData = async () => {
        if (!invoiceId) return;
        try {
            const [paymentsData, invoiceData] = await Promise.all([
                getInvoicePayments(Number(invoiceId)),
                getInvoice(Number(invoiceId))
            ]);
            setPayments(paymentsData);
            setInvoice(invoiceData);
        } catch (error) {
            console.error("Failed to fetch payments data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [invoiceId]);

    const handleSavePayment = async () => {
        if (!invoiceId) return;
        setIsSaving(true);
        try {
            if (selectedPayment) {
                await updatePayment(selectedPayment.id, {
                    amount: Number(paymentData.amount),
                    payment_method: paymentData.payment_method,
                    transaction_id: paymentData.transaction_id,
                    notes: paymentData.notes
                });
            } else {
                await recordPayment(Number(invoiceId), {
                    amount: Number(paymentData.amount),
                    payment_method: paymentData.payment_method,
                    transaction_id: paymentData.transaction_id,
                    notes: paymentData.notes
                });
            }
            setIsPaymentModalOpen(false);
            setPaymentData({ amount: 0, payment_method: 'Bank Transfer', transaction_id: '', notes: '' });
            setSelectedPayment(null);
            fetchData(); // Refresh list
        } catch (error) {
            console.error("Failed to save payment", error);
            alert("Failed to save payment.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleEditPayment = (payment: Payment) => {
        setSelectedPayment(payment);
        setPaymentData({
            amount: Number(payment.amount),
            payment_method: payment.payment_method,
            transaction_id: payment.transaction_id || '',
            notes: payment.notes || ''
        });
        setIsPaymentModalOpen(true);
    };

    const handleDeletePayment = async (paymentId: number) => {
        if (!confirm("Are you sure you want to delete this payment?")) return;
        try {
            await deletePayment(paymentId);
            fetchData();
        } catch (error) {
            console.error("Failed to delete payment", error);
            alert("Failed to delete payment.");
        }
    };

    const formatCurrency = (amount: string | number | null | undefined) => {
        const val = typeof amount === 'string' ? parseFloat(amount) : (amount || 0);
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(Number(val) || 0);
    };

    return (
        <div className="stagger-in">
            <div className="page-header" style={{ marginBottom: '2rem' }}>
                <div>
                    <button
                        onClick={() => navigate(-1)}
                        className="btn"
                        style={{
                            background: 'var(--color-bg)',
                            border: '1px solid var(--color-border)',
                            color: 'var(--color-text)',
                            display: 'flex', alignItems: 'center', gap: '0.5rem',
                            marginBottom: '1rem'
                        }}
                    >
                        <ArrowLeft size={18} />
                        Back
                    </button>
                    <h1 className="page-title">
                        Payments for Invoice <span style={{ color: 'var(--color-primary)' }}>{invoice?.invoice_number}</span>
                    </h1>
                </div>
                <div>
                    <button
                        className="btn btn-primary"
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                        onClick={() => { setSelectedPayment(null); setPaymentData({ amount: 0, payment_method: 'Bank Transfer', transaction_id: '', notes: '' }); setIsPaymentModalOpen(true); }}
                    >
                        <Plus size={18} /> Record Payment
                    </button>
                </div>
            </div>

            <div className="glass-panel" style={{ padding: '1.5rem' }}>
                {loading ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>Loading payments...</div>
                ) : payments.length === 0 ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>No payments found for this invoice.</div>
                ) : (
                    <Table>
                        <Thead>
                            <Tr>
                                <Th>ID</Th>
                                <Th>Date</Th>
                                <Th>Method</Th>
                                <Th>Transaction ID</Th>
                                <Th>Notes</Th>
                                <Th>Amount</Th>
                                <Th>Actions</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {payments.map((payment) => (
                                <Tr key={payment.id}>
                                    <Td style={{ fontWeight: 600 }}>#{payment.id}</Td>
                                    <Td>{new Date(payment.payment_date).toLocaleDateString()} {new Date(payment.payment_date).toLocaleTimeString()}</Td>
                                    <Td>{payment.payment_method}</Td>
                                    <Td style={{ fontFamily: 'monospace', color: 'var(--color-text-muted)' }}>{payment.transaction_id || '-'}</Td>
                                    <Td style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>{payment.notes || '-'}</Td>
                                    <Td style={{ fontWeight: 700, color: 'var(--color-success)' }}>{formatCurrency(payment.amount)}</Td>
                                    <Td>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button
                                                className="btn"
                                                style={{
                                                    padding: '0.4rem',
                                                    color: 'var(--color-primary)',
                                                    background: 'var(--color-primary-subtle)',
                                                    border: '1px solid var(--color-primary)'
                                                }}
                                                title="Edit Payment"
                                                onClick={() => handleEditPayment(payment)}
                                            >
                                                <Pencil size={16} />
                                            </button>
                                            <button
                                                className="btn"
                                                style={{
                                                    padding: '0.4rem',
                                                    color: 'var(--color-danger)',
                                                    background: 'var(--color-danger-subtle)',
                                                    border: '1px solid var(--color-danger)'
                                                }}
                                                title="Delete Payment"
                                                onClick={() => handleDeletePayment(payment.id)}
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

            {/* Record Payment Modal */}
            {isPaymentModalOpen && (
                <div style={{
                    background: 'var(--overlay-bg)', backdropFilter: 'blur(10px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }}>
                    <div className="glass-panel" style={{ width: '400px', padding: '2rem' }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.5rem' }}>{selectedPayment ? 'Edit Payment' : 'Record Payment'}</h2>
                        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                            {selectedPayment ? 'Update payment details for Invoice' : 'Record payment for Invoice'} <span style={{ color: 'var(--color-primary)', fontWeight: 600 }}>{invoice?.invoice_number}</span>
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
                                {invoice && (
                                    <p style={{ fontSize: '0.7rem', color: 'var(--color-primary)', marginTop: '0.5rem' }}>
                                        Balance Due: {formatCurrency(invoice.balance_due)}
                                    </p>
                                )}
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
                            <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleSavePayment} disabled={isSaving || paymentData.amount <= 0}>
                                {isSaving ? 'Processing...' : (selectedPayment ? 'Update Payment' : 'Confirm Payment')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InvoicePayments;

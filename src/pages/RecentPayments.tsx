import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRecentPayments } from '../api/services';
import type { RecentPayment, PaginatedResponse } from '../types';
import { Table, Thead, Tbody, Tr, Th, Td } from '../components/Table';
import { Search, ArrowLeft, Clock, ChevronLeft, ChevronRight } from 'lucide-react';

const RecentPayments = () => {
    const navigate = useNavigate();
    const [paymentsData, setPaymentsData] = useState<PaginatedResponse<RecentPayment> | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    const fetchPayments = async (page: number) => {
        setLoading(true);
        try {
            const data = await getRecentPayments(page);
            setPaymentsData(data);
        } catch (error) {
            console.error("Failed to fetch recent payments", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPayments(currentPage);
    }, [currentPage]);

    const handleNextPage = () => {
        if (paymentsData?.next) {
            setCurrentPage(prev => prev + 1);
        }
    };

    const handlePrevPage = () => {
        if (paymentsData?.previous) {
            setCurrentPage(prev => prev - 1);
        }
    };

    const filteredPayments = paymentsData?.results.filter(payment =>
        payment.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.project_name.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

    const formatCurrency = (amount: string | number | null | undefined) => {
        const val = typeof amount === 'string' ? parseFloat(amount) : (amount || 0);
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(Number(val) || 0);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <div className="stagger-in">
            <div className="page-header" style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button
                        className="btn"
                        onClick={() => navigate('/billing')}
                        style={{ padding: '0.5rem', borderRadius: 'var(--radius-md)', background: 'var(--color-bg)' }}
                    >
                        <ArrowLeft size={18} />
                    </button>
                    <div>
                        <h1 className="page-title">Recent Payments</h1>
                        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>Full history of recent transactions</p>
                    </div>
                </div>
            </div>

            <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <div style={{ position: 'relative', width: '300px' }}>
                        <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-dim)' }} />
                        <input
                            type="text"
                            placeholder="Search by invoice or project..."
                            className="input-field"
                            style={{ paddingLeft: '3rem', marginBottom: 0 }}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
                        <Clock size={16} />
                        Total: {paymentsData?.count || 0} payments
                    </div>
                </div>

                {loading ? (
                    <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                        <div className="loading-spinner" style={{ marginBottom: '1rem' }}></div>
                        Loading transaction history...
                    </div>
                ) : (
                    <>
                        <Table>
                            <Thead>
                                <Tr>
                                    <Th>Date</Th>
                                    <Th>Invoice Number</Th>
                                    <Th>Project Name</Th>
                                    <Th>Amount</Th>
                                    <Th>Payment Method</Th>
                                    <Th>Transaction ID</Th>
                                    <Th>Notes</Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                {filteredPayments.length > 0 ? (
                                    filteredPayments.map((payment) => (
                                        <Tr key={payment.id} onClick={() => navigate(`/billing/invoice/${payment.invoice}`)} style={{ cursor: 'pointer' }}>
                                            <Td>{formatDate(payment.payment_date)}</Td>
                                            <Td style={{ fontWeight: 600, color: 'var(--color-primary)' }}>{payment.invoice_number}</Td>
                                            <Td>{payment.project_name}</Td>
                                            <Td style={{ fontWeight: 700, color: 'var(--color-success)' }}>
                                                {formatCurrency(payment.amount)}
                                            </Td>
                                            <Td>{payment.payment_method}</Td>
                                            <Td style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>{payment.transaction_id || '-'}</Td>
                                            <Td style={{ fontSize: '0.8125rem', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={payment.notes}>
                                                {payment.notes || '-'}
                                            </Td>
                                        </Tr>
                                    ))
                                ) : (
                                    <Tr>
                                        <Td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
                                            No recent payments found.
                                        </Td>
                                    </Tr>
                                )}
                            </Tbody>
                        </Table>

                        {/* Pagination Controls */}
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '1.5rem' }}>
                            <button
                                className="btn"
                                onClick={handlePrevPage}
                                disabled={!paymentsData?.previous}
                                style={{
                                    opacity: !paymentsData?.previous ? 0.5 : 1,
                                    cursor: !paymentsData?.previous ? 'not-allowed' : 'pointer',
                                    padding: '0.5rem 1rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }}
                            >
                                <ChevronLeft size={18} />
                                Previous
                            </button>
                            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>
                                Page {currentPage}
                            </span>
                            <button
                                className="btn"
                                onClick={handleNextPage}
                                disabled={!paymentsData?.next}
                                style={{
                                    opacity: !paymentsData?.next ? 0.5 : 1,
                                    cursor: !paymentsData?.next ? 'not-allowed' : 'pointer',
                                    padding: '0.5rem 1rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }}
                            >
                                Next
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default RecentPayments;

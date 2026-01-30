import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProjectsFinancialSummary } from '../api/services';
import type { ProjectFinancialSummary } from '../types';
import { Table, Thead, Tbody, Tr, Th, Td } from '../components/Table';
import { Eye, Search, ChevronLeft, ChevronRight } from 'lucide-react';
// InvoiceMaker removed

const Billing = () => {
    const navigate = useNavigate();
    const [projects, setProjects] = useState<ProjectFinancialSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [hasNext, setHasNext] = useState(false);
    const [hasPrevious, setHasPrevious] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');


    const fetchBillingData = async (page: number, name?: string) => {
        setLoading(true);
        try {
            const data = await getProjectsFinancialSummary(page, name);
            setProjects(data.results);
            setHasNext(!!data.next);
            setHasPrevious(!!data.previous);
        } catch (error) {
            console.error("Failed to fetch billing data", error);
        } finally {
            setLoading(false);
        }
    };

    // Debounce search term
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setCurrentPage(1); // Reset to first page on search
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    useEffect(() => {
        fetchBillingData(currentPage, debouncedSearch);
    }, [currentPage, debouncedSearch]);

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
                    <h1 className="page-title">Billing & Invoices</h1>
                </div>
            </div>

            {/* Quick Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
                <div className="glass-panel" style={{ padding: '1.5rem' }}>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', fontWeight: 600, margin: 0 }}>Total Invoiced</p>
                    <h3 style={{ fontSize: '1.75rem', fontWeight: 800, margin: '0.5rem 0' }}>
                        {formatCurrency(projects.reduce((acc, p) => acc + parseFloat(p.total_invoice || '0'), 0))}
                    </h3>
                </div>
                <div className="glass-panel" style={{ padding: '1.5rem' }}>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', fontWeight: 600, margin: 0 }}>Total Collected</p>
                    <h3 style={{ fontSize: '1.75rem', fontWeight: 800, margin: '0.5rem 0' }}>
                        {formatCurrency(projects.reduce((acc, p) => acc + parseFloat(p.total_payment || '0'), 0))}
                    </h3>
                </div>
                <div className="glass-panel" style={{ padding: '1.5rem' }}>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', fontWeight: 600, margin: 0 }}>Total Balance Due</p>
                    <h3 style={{ fontSize: '1.75rem', fontWeight: 800, margin: '0.5rem 0' }}>
                        {formatCurrency(projects.reduce((acc, p) => acc + parseFloat(p.total_balance || '0'), 0))}
                    </h3>
                </div>
            </div>

            <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <div style={{ position: 'relative', width: '300px' }}>
                        <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-dim)' }} />
                        <input
                            type="text"
                            placeholder="Search projects..."
                            className="input-field"
                            style={{ paddingLeft: '3rem', marginBottom: 0 }}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {loading ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>Loading billing data...</div>
                ) : (
                    <>
                        <Table>
                            <Thead>
                                <Tr>
                                    <Th>Project Name</Th>
                                    <Th>Total Invoiced</Th>
                                    <Th>Total Paid</Th>
                                    <Th>Balance Due</Th>
                                    <Th>Actions</Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                {projects.map((proj) => (
                                    <Tr key={proj.id}>
                                        <Td style={{ fontWeight: 600 }}>
                                            <span
                                                onClick={() => navigate(`/billing/project/${proj.id}/invoices`, { state: { projectName: proj.name } })}
                                                style={{ cursor: 'pointer', color: 'var(--color-primary)' }}
                                            >
                                                {proj.name}
                                            </span>
                                        </Td>
                                        <Td>{formatCurrency(proj.total_invoice)}</Td>
                                        <Td>{formatCurrency(proj.total_payment)}</Td>
                                        <Td style={{ fontWeight: 700, color: parseFloat(proj.total_balance) > 0 ? 'var(--color-danger)' : 'var(--color-success)' }}>
                                            {formatCurrency(proj.total_balance)}
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
                                                    title="Project Details"
                                                    onClick={() => navigate(`/projects/edit/${proj.id}`)}
                                                >
                                                    <Eye size={16} />
                                                </button>
                                            </div>
                                        </Td>
                                    </Tr>
                                ))}
                            </Tbody>
                        </Table>

                        {/* Pagination Controls */}
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '2rem' }}>
                            <button
                                className="btn"
                                disabled={!hasPrevious}
                                onClick={() => setCurrentPage(prev => prev - 1)}
                                style={{
                                    opacity: !hasPrevious ? 0.5 : 1,
                                    cursor: !hasPrevious ? 'not-allowed' : 'pointer',
                                    display: 'flex', alignItems: 'center', gap: '0.5rem'
                                }}
                            >
                                <ChevronLeft size={16} /> Previous
                            </button>
                            <span style={{ color: 'var(--color-text-muted)', fontWeight: 500 }}>
                                Page {currentPage}
                            </span>
                            <button
                                className="btn"
                                disabled={!hasNext}
                                onClick={() => setCurrentPage(prev => prev + 1)}
                                style={{
                                    opacity: !hasNext ? 0.5 : 1,
                                    cursor: !hasNext ? 'not-allowed' : 'pointer',
                                    display: 'flex', alignItems: 'center', gap: '0.5rem'
                                }}
                            >
                                Next <ChevronRight size={16} />
                            </button>
                        </div>
                    </>
                )}
            </div>

            {/* InvoiceMaker removed */}
        </div >
    );
};

export default Billing;

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getServers } from '../api/services';
import type { Server, PaginatedResponse } from '../types';
import { Table, Thead, Tbody, Tr, Th, Td } from '../components/Table';
import { Search, ArrowLeft, Server as ServerIcon, ChevronLeft, ChevronRight, AlertCircle, CheckCircle, Filter, X } from 'lucide-react';

const Servers = () => {
    const navigate = useNavigate();
    const [serversData, setServersData] = useState<PaginatedResponse<Server> | null>(null);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);

    // Filter states
    const [filters, setFilters] = useState({
        search: '',
        name: '',
        project: '',
        server_type: '',
        accrued_by: ''
    });
    const [debouncedFilters, setDebouncedFilters] = useState(filters);
    const [showFilters, setShowFilters] = useState(false);

    const fetchServers = async (page: number, currentFilters: typeof filters) => {
        setLoading(true);
        try {
            const data = await getServers(page, currentFilters);
            setServersData(data);
        } catch (error) {
            console.error("Failed to fetch servers", error);
        } finally {
            setLoading(false);
        }
    };

    // Debounce filters
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedFilters(filters);
            setCurrentPage(1); // Reset to first page on filter change
        }, 500);
        return () => clearTimeout(timer);
    }, [filters]);

    useEffect(() => {
        fetchServers(currentPage, debouncedFilters);
    }, [currentPage, debouncedFilters]);

    const handleNextPage = () => {
        if (serversData?.next) {
            setCurrentPage(prev => prev + 1);
        }
    };

    const handlePrevPage = () => {
        if (serversData?.previous) {
            setCurrentPage(prev => prev - 1);
        }
    };

    const formatCurrency = (amount: string | number | null | undefined) => {
        const val = typeof amount === 'string' ? parseFloat(amount) : (amount || 0);
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(Number(val) || 0);
    };

    const formatDate = (dateString: string | null | undefined) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getStatusIcon = (label: string | null | undefined) => {
        const lowerLabel = (label || '').toLowerCase();
        if (lowerLabel.includes('expired') || lowerLabel.includes('critical')) {
            return <AlertCircle size={14} color="var(--color-danger)" />;
        }
        if (lowerLabel.includes('soon')) {
            return <AlertCircle size={14} color="var(--color-warning)" />;
        }
        return <CheckCircle size={14} color="var(--color-success)" />;
    };

    const servers = Array.isArray(serversData) ? serversData : (serversData?.results || []);
    const totalCount = Array.isArray(serversData) ? serversData.length : (serversData?.count || 0);
    const hasNext = !Array.isArray(serversData) && !!serversData?.next;
    const hasPrev = !Array.isArray(serversData) && !!serversData?.previous;

    return (
        <div className="stagger-in">
            <div className="page-header" style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button
                        className="btn"
                        onClick={() => navigate(-1)}
                        style={{ padding: '0.5rem', borderRadius: 'var(--radius-md)', background: 'var(--color-bg)' }}
                    >
                        <ArrowLeft size={18} />
                    </button>
                    <div>
                        <h1 className="page-title">Server Assets</h1>
                        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>Management and lifecycle tracking for project infrastructure</p>
                    </div>
                </div>
            </div>

            <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <button
                        className={`btn ${showFilters ? 'btn-primary' : ''}`}
                        onClick={() => setShowFilters(!showFilters)}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                        {showFilters ? <X size={18} /> : <Filter size={18} />}
                        {showFilters ? 'Hide Filters' : 'Filters'}
                    </button>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
                        <ServerIcon size={16} />
                        Total: {totalCount} servers
                    </div>
                </div>

                {showFilters && (
                    <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem', backgroundColor: 'var(--color-bg-subtle)' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                            <div>
                                <label className="label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Search size={14} /> Search
                                </label>
                                <input
                                    type="text"
                                    className="input-field"
                                    placeholder="Server, Project, Type..."
                                    value={filters.search}
                                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                                />
                            </div>
                            <div>
                                <label className="label">Project</label>
                                <input
                                    type="text"
                                    className="input-field"
                                    placeholder="Filter by Project"
                                    value={filters.project}
                                    onChange={(e) => setFilters(prev => ({ ...prev, project: e.target.value }))}
                                />
                            </div>
                            <div>
                                <label className="label">Server Type</label>
                                <input
                                    type="text"
                                    className="input-field"
                                    placeholder="VPS, Dedicated, etc."
                                    value={filters.server_type}
                                    onChange={(e) => setFilters(prev => ({ ...prev, server_type: e.target.value }))}
                                />
                            </div>
                            <div>
                                <label className="label">Accrued By</label>
                                <select
                                    className="input-field"
                                    value={filters.accrued_by}
                                    onChange={(e) => setFilters(prev => ({ ...prev, accrued_by: e.target.value }))}
                                >
                                    <option value="">All</option>
                                    <option value="Extechnology">Extechnology</option>
                                    <option value="Client">Client</option>
                                </select>
                            </div>
                        </div>
                        <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
                            <button
                                className="btn"
                                style={{ fontSize: '0.875rem', padding: '0.4rem 0.8rem' }}
                                onClick={() => setFilters({ search: '', name: '', project: '', server_type: '', accrued_by: '' })}
                            >
                                Reset Filters
                            </button>
                        </div>
                    </div>
                )}

                {loading ? (
                    <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                        <div className="loading-spinner" style={{ marginBottom: '1rem' }}></div>
                        Fetching server infrastructure...
                    </div>
                ) : (
                    <>
                        <Table>
                            <Thead>
                                <Tr>
                                    <Th>Server Name</Th>
                                    <Th>Type</Th>
                                    <Th>Project</Th>
                                    <Th>Accrued By</Th>
                                    <Th>Expiration</Th>
                                    <Th>Cost</Th>
                                    <Th style={{ textAlign: 'center' }}>Status</Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                {servers.length > 0 ? (
                                    servers.map((server) => (
                                        <Tr key={server.id} onClick={() => navigate(`/projects/view/${server.project}`)} style={{ cursor: 'pointer' }}>
                                            <Td style={{ fontWeight: 600, color: 'var(--color-primary)' }}>{server.name}</Td>
                                            <Td>
                                                <span style={{
                                                    padding: '0.2rem 0.5rem',
                                                    borderRadius: '4px',
                                                    fontSize: '0.75rem',
                                                    background: 'var(--color-bg)',
                                                    color: 'var(--color-text-muted)'
                                                }}>
                                                    {server.server_type}
                                                </span>
                                            </Td>
                                            <Td>{server.project_name}</Td>
                                            <Td>
                                                <span style={{
                                                    padding: '0.2rem 0.5rem',
                                                    borderRadius: '4px',
                                                    fontSize: '0.75rem',
                                                    background: server.accrued_by === 'Extechnology' ? 'var(--color-primary-subtle)' : 'var(--color-secondary-subtle)',
                                                    color: server.accrued_by === 'Extechnology' ? 'var(--color-primary)' : 'var(--color-secondary)'
                                                }}>
                                                    {server.accrued_by}
                                                </span>
                                            </Td>
                                            <Td>
                                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                    <span>{formatDate(server.expiration_date)}</span>
                                                    <span style={{
                                                        fontSize: '0.75rem',
                                                        color: server.days_until_expiration < 0 ? 'var(--color-danger)' : (server.days_until_expiration < 30 ? 'var(--color-warning)' : 'var(--color-text-muted)')
                                                    }}>
                                                        {server.days_until_expiration < 0
                                                            ? `${Math.abs(server.days_until_expiration)} days ago`
                                                            : `${server.days_until_expiration} days left`}
                                                    </span>
                                                </div>
                                            </Td>
                                            <Td style={{ fontWeight: 600 }}>{formatCurrency(server.cost)}</Td>
                                            <Td style={{ textAlign: 'center' }}>
                                                <span style={{
                                                    padding: '0.25rem 0.6rem',
                                                    borderRadius: '100px',
                                                    fontSize: '0.75rem',
                                                    backgroundColor: `${(server.status_color || '').toLowerCase() === 'red' ? 'var(--color-danger-subtle)' : ((server.status_color || '').toLowerCase() === 'blue' ? 'var(--color-primary-subtle)' : 'var(--color-success-subtle)')}`,
                                                    color: (server.status_color || '').toLowerCase() === 'red' ? 'var(--color-danger)' : ((server.status_color || '').toLowerCase() === 'blue' ? 'var(--color-primary)' : 'var(--color-success)'),
                                                    fontWeight: 600,
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: '0.3rem'
                                                }}>
                                                    {getStatusIcon(server.status_label)}
                                                    {server.status_label || '-'}
                                                </span>
                                            </Td>
                                        </Tr>
                                    ))
                                ) : (
                                    <Tr>
                                        <Td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
                                            No server assets found.
                                        </Td>
                                    </Tr>
                                )}
                            </Tbody>
                        </Table>

                        {/* Pagination */}
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '1.5rem' }}>
                            <button
                                className="btn"
                                onClick={handlePrevPage}
                                disabled={!hasPrev}
                                style={{
                                    opacity: !hasPrev ? 0.5 : 1,
                                    cursor: !hasPrev ? 'not-allowed' : 'pointer',
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
                                disabled={!hasNext}
                                style={{
                                    opacity: !hasNext ? 0.5 : 1,
                                    cursor: !hasNext ? 'not-allowed' : 'pointer',
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
        </div >
    );
};

export default Servers;
